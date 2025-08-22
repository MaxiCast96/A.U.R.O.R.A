import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientesModel from "../models/Clientes.js";
import { config } from "../config.js";

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

        // Configurar el transporter de nodemailer (Gmail SMTP)
        // Sugerencia: algunas contraseñas de app de Google se copian con espacios, los removemos
        const gmailPass = (config.email.pass || '').replace(/\s+/g, '');
        // Transport principal (465 SSL)
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: { user: config.email.user, pass: gmailPass },
            logger: true,
            debug: true
        });

        // Verificar conexión SMTP antes de enviar
        try {
            await transporter.verify();
            console.log("SMTP listo (Gmail 465 SSL)");
        } catch (smtpErr) {
            console.log("Fallo verificación SMTP 465, intentando 587 STARTTLS:", smtpErr?.message || smtpErr);
            // Fallback a 587 STARTTLS
            transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: { user: config.email.user, pass: gmailPass },
                logger: true,
                debug: true
            });
            try {
                await transporter.verify();
                console.log("SMTP listo (Gmail 587 STARTTLS)");
            } catch (smtpErr2) {
                console.log("Fallo verificación SMTP 587:", smtpErr2?.message || smtpErr2);
                return res.json({ message: "Error enviando email de verificación" });
            }
        }

        // Configurar las opciones del email de verificación
        const mailOptions = {
            from: `"Óptica Inteligente" <${config.email.user}>`,
            to: correoNorm,
            subject: "Verificación de cuenta - Cliente",
            text: `Hola ${nombre} ${apellido}, para verificar tu cuenta de cliente utiliza este código: ${verificationCode}. El código expira en dos horas.`,
            html: `<p>Hola <strong>${nombre} ${apellido}</strong>,</p>
                   <p>Para verificar tu cuenta de cliente utiliza este código:</p>
                   <p style="font-size:20px;font-weight:bold;letter-spacing:2px;">${verificationCode}</p>
                   <p>El código expira en <strong>2 horas</strong>.</p>`,
            // Mejoras de entregabilidad
            replyTo: config.email.user,
            priority: 'high',
            envelope: {
                from: config.email.user,
                to: correoNorm
            },
            headers: {
                'X-Auto-Response-Suppress': 'All'
            }
        };

        // Enviar email de verificación
        try {
            const info = await transporter.sendMail(mailOptions);
            console.log("Email enviado:", info.response || info.messageId, {
                accepted: info.accepted,
                rejected: info.rejected
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
            console.log("Error enviando email:", error?.message || error);
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