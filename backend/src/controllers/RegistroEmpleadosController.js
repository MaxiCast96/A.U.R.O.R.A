import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import empleadosModel from "../models/Empleados.js";
import { config } from "../config.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const registerEmpleadosController = {};

// INSERT - Registra un nuevo empleado con verificación por email
registerEmpleadosController.register = async (req, res) => {
    const {
        nombre,
        apellido,
        dui,
        telefono,
        correo,
        direccion,
        cargo,
        sucursalId,
        fechaContratacion,
        password,
        isVerified
    } = req.body;

    let fotoPerfilURL = ""; // Variable para URL de la foto de perfil

    try {
        // Sube imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "empleados", // Carpeta específica en Cloudinary
                allowed_formats: ["png", "jpg", "jpeg", "webp"] // Formatos permitidos
            });
            fotoPerfilURL = result.secure_url; // Obtiene URL segura
        } else if (req.body.fotoPerfil) {
            fotoPerfilURL = req.body.fotoPerfil; // Usa URL proporcionada directamente
        }

        // Verificar si ya existe un empleado con el mismo correo electrónico
        const existsEmpleado = await empleadosModel.findOne({ correo });
        if (existsEmpleado) {
            return res.json({ message: "Employee already exists" });
        }

        // Verificar si ya existe un empleado con el mismo DUI
        const existsDui = await empleadosModel.findOne({ dui });
        if (existsDui) {
            return res.json({ message: "DUI already registered" });
        }

        // Encriptar la contraseña usando bcrypt
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear nueva instancia del empleado con la contraseña encriptada
        const newEmpleado = new empleadosModel({
            nombre,
            apellido,
            dui,
            telefono,
            correo,
            direccion,
            cargo,
            sucursalId,
            fechaContratacion,
            password: passwordHash,
            isVerified: isVerified || false,
            fotoPerfil: fotoPerfilURL
        });

        await newEmpleado.save();

        // Generar código de verificación aleatorio de 6 caracteres
        const verificationCode = crypto.randomBytes(3).toString("hex");

        // Crear token JWT con el correo y código de verificación
        const tokenCode = jsonwebtoken.sign(
            { correo, verificationCode },
            config.JWT.secret,
            { expiresIn: "2h" } // Expira en 2 horas
        );

        // Establecer cookie con el token de verificación que expira en 2 horas
        res.cookie("verificationTokenEmpleado", tokenCode, { maxAge: 2 * 60 * 60 * 1000 });

        // Configurar el transporter de nodemailer para envío de emails
        const transporter = nodemailer.createTransporter({
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
            res.json({ message: "Empleado registrado, por favor revisa tu correo para verificar tu cuenta." });
        });

    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error registrando empleado: " + error.message });
    }
};

// UPDATE - Verifica el código de email para activar la cuenta
registerEmpleadosController.verifyCodeEmail = async (req, res) => {
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

        // Busca empleado en la base de datos por correo
        const empleado = await empleadosModel.findOne({ correo });
        if (!empleado) {
            return res.json({ message: "Empleado no encontrado" });
        }

        // Marcar el empleado como verificado
        empleado.isVerified = true;
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

export default registerEmpleadosController;