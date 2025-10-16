import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientesModel from "../models/Clientes.js";
import { config } from "../config.js";
import { sendEmail } from "../services/mailer.js";

const registerClientesController = {};

// INSERT - Registra un nuevo cliente con verificación por email
registerClientesController.register = async (req, res) => {
    const {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        direccion,
        password
    } = req.body;

    try {
        // Normalizar correo (aceptar cualquier dominio): trim + lowercase
        const correoNorm = String(correo || '').trim().toLowerCase();

        // Verificar si ya existe un cliente con el mismo correo electrónico
        const existsCliente = await clientesModel.findOne({ correo: correoNorm });
        if (existsCliente) {
            return res.json({ message: "Cliente already exists" });
        }

        // Verificar si ya existe un cliente con el mismo DUI
        const existsDui = await clientesModel.findOne({ dui });
        if (existsDui) {
            return res.json({ message: "DUI already registered" });
        }

        // Encriptar la contraseña usando bcrypt
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nueva instancia del cliente con la contraseña encriptada
        const newClientes = new clientesModel({
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo: correoNorm,
            direccion,
            password: passwordHash,
        });

        await newClientes.save();

        // Generar código de verificación aleatorio de 6 caracteres
        const verificationCode = crypto.randomBytes(3).toString("hex");

        // Crear token JWT con el correo y código de verificación
        const tokenCode = jsonwebtoken.sign(
            { correo, verificationCode },
            config.jwt.secret,
            { expiresIn: "2h" } // Expira en 2 horas
        );

        // Establecer cookie con el token de verificación que expira en 2 horas
        res.cookie("verificationTokenEmpleado", tokenCode, { maxAge: 2 * 60 * 60 * 1000 });

        // Enviar email de verificación vía Resend API
        try {
            const subject = "Verificación de cuenta - Cliente";
            const html = `<p>Hola <strong>${nombre} ${apellido}</strong>,</p>
                   <p>Para verificar tu cuenta de cliente utiliza este código:</p>
                   <p style="font-size:20px;font-weight:bold;letter-spacing:2px;">${verificationCode}</p>
                   <p>El código expira en <strong>2 horas</strong>.</p>`;
            const text = `Hola ${nombre} ${apellido}, para verificar tu cuenta utiliza este código: ${verificationCode}. Expira en 2 horas.`;

            await sendEmail({
                to: correoNorm,
                subject,
                html,
                text,
                from: process.env.RESEND_FROM || `"Óptica Inteligente" <${config.email.user || 'onboarding@resend.dev'}>`
            });

            // En desarrollo, devolvemos también el código para facilitar pruebas
            if (config.server?.nodeEnv !== 'production') {
                return res.json({
                    message: "Cliente registrado. Código enviado por correo (modo desarrollo).",
                    devVerificationCode: verificationCode
                });
            }
            res.json({ message: "Cliente registrado, por favor revisa tu correo para verificar tu cuenta." });
        } catch (error) {
            console.log("Error enviando email (Resend):", error?.message || error);
            if (config.server?.nodeEnv !== 'production') {
                return res.json({
                    message: "No se pudo enviar el correo en desarrollo, usa el código mostrado para verificar.",
                    devVerificationCode: verificationCode
                });
            }
            return res.json({ message: "Error enviando email de verificación" });
        }

    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error: " + error.message });
    }
};

// UPDATE - Verifica el código de email para activar la cuenta
registerClientesController.verifyCodeEmail = async (req, res) => {
    const { verificationCodeRequest } = req.body;

    try {
        // Obtener el token de verificación desde las cookies
        const token = req.cookies.verificationTokenEmpleado;

        // Validar que el token exista
        if (!token) {
            return res.json({ message: "No se encontró el token de verificación" });
        }

        // Decodificar el token JWT para obtener el correo y código almacenado
        const decoded = jsonwebtoken.verify(token, config.jwt.secret);
        const { correo, verificationCode: storedCode } = decoded;

        // Comparar el código enviado con el código almacenado en el token
        if (verificationCodeRequest !== storedCode) {
            return res.json({ message: "Código de verificación inválido" });
        }

        // Busca cliente en la base de datos por correo
        const cliente = await clientesModel.findOne({ correo });
        if (!cliente) {
            return res.json({ message: "Cliente no encontrado" });
        }

        // Marcar el cliente como verificado
        cliente.isVerified = true;
        await cliente.save();

        // Eliminar la cookie del token de verificación
        res.clearCookie("verificationTokenEmpleado");

        res.json({ message: "Email verificado con éxito" });
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.json({ message: "Código de verificación expirado" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.json({ message: "Token de verificación inválido" });
        }
        console.log("Error: " + error);
        res.json({ message: "Error verificando email: " + error.message });
    }
};

export default registerClientesController;