import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import clientesModel from "../models/Clientes.js";
import { config } from "../config.js";

const registerClientesController = {};

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
        // Verificar si ya existe un empleado con el mismo correo electrónico
        const existsCliente = await clientesModel.findOne({ correo });
        if (existsCliente) {
            return res.json({ message: "Cliente already exists" });
        }

        // Verificar si ya existe un empleado con el mismo DUI
        const existsDui = await clientesModel.findOne({ dui });
        if (existsDui) {
            return res.json({ message: "DUI already registered" });
        }

        // Encriptar la contraseña usando bcrypt
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear una nueva instancia del empleado con la contraseña encriptada
        const newClientes = new clientesModel({
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            direccion,
            password: passwordHash,
        });

        // Guardar el empleado en la base de datos
        await newClientes.save();

        // Generar código de verificación aleatorio de 6 caracteres
        const verificationCode = crypto.randomBytes(3).toString("hex");

        // Crear token JWT con el correo y código de verificación
        const tokenCode = jsonwebtoken.sign(
            { correo, verificationCode },
            config.JWT.secret,
            { expiresIn: "2h" }
        );

        // Establecer cookie con el token de verificación que expira en 2 horas
        res.cookie("verificationTokenEmpleado", tokenCode, { maxAge: 2 * 60 * 60 * 1000 });

        // Configurar el transporter de nodemailer para envío de emails
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.emailUser.user_email,
                pass: config.emailUser.user_pass
            }
        });

        // Configurar las opciones del email de verificación
        const mailOptions = {
            from: config.emailUser.user_email,
            to: correo,
            subject: "Verificación de cuenta - Empleado",
            text: `Hola ${nombre} ${apellido}, para verificar tu cuenta de empleado utiliza este código: ${verificationCode}. El código expira en dos horas.`
        };

        // Enviar email de verificación
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log("Error enviando email: " + error);
                return res.json({ message: "Error enviando email de verificación" });
            }
            console.log("Email enviado: " + info.response);
            res.json({ message: "Cliente registrado, por favor revisa tu correo para verificar tu cuenta." });
        });

    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error: " + error.message });
    }
};

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
        const decoded = jsonwebtoken.verify(token, config.JWT.secret);
        const { correo, verificationCode: storedCode } = decoded;

        // Comparar el código enviado con el código almacenado en el token
        if (verificationCodeRequest !== storedCode) {
            return res.json({ message: "Código de verificación inválido" });
        }

        // Buscar el empleado en la base de datos por correo
        const cliente = await clientesModel.findOne({ correo });
        if (!cliente) {
            return res.json({ message: "Cliente no encontrado" });
        }

        // Marcar el empleado como verificado
        cliente.isVerified = true;
        await empleado.save();

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