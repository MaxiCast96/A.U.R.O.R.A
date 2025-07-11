import clientesModel from "../models/Clientes.js";
import empleadosModel from "../models/Empleados.js";
import optometristaModel from "../models/Optometrista.js";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";
import jsonwebtoken from "jsonwebtoken";
import { config } from "../config.js";

const clientesController = {};

// GET todos los clientes
clientesController.getClientes = async (req, res) => {
    try {
        const clientes = await clientesModel.find();
        res.status(200).json(clientes);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo clientes: " + error.message });
    }
};

// GET cliente por ID
clientesController.getClienteById = async (req, res) => {
    try {
        const cliente = await clientesModel.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json(cliente);
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error obteniendo cliente: " + error.message });
    }
};

// CREATE un nuevo cliente
clientesController.createClientes = async (req, res) => {
    let {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        calle, // Recibimos los campos de dirección de forma plana
        ciudad,
        departamento,
        password,
        estado
    } = req.body;
    correo = correo.trim().toLowerCase();

    // Validación básica
    if (!nombre || !apellido || !edad || !dui || !telefono || !correo || !calle || !ciudad || !departamento || !password || !estado) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        const existsClientes = await clientesModel.findOne({ correo });
        if (existsClientes) {
            return res.status(400).json({ message: "El correo ya está registrado" });
        }

        const existsDui = await clientesModel.findOne({ dui });
        if (existsDui) {
            return res.status(400).json({ message: "El DUI ya está registrado" });
        }

        const passwordHash = await bcryptjs.hash(password, 10);

        const newCliente = new clientesModel({
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            direccion: {
                calle,
                ciudad,
                departamento
            },
            password: passwordHash,
            estado
        });

        await newCliente.save();
        res.status(201).json({ message: "Cliente creado exitosamente" });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error creando cliente: " + error.message });
    }
};

// UPDATE un cliente existente
clientesController.updateClientes = async (req, res) => {
    const { id } = req.params;
    let {
        nombre,
        apellido,
        edad,
        dui,
        telefono,
        correo,
        calle,
        ciudad,
        departamento,
        password,
        estado
    } = req.body;
    correo = correo.trim().toLowerCase();

    // Validación básica
    if (!nombre || !apellido || !edad || !dui || !telefono || !correo || !calle || !ciudad || !departamento || !estado) {
        return res.status(400).json({ message: "Faltan campos obligatorios" });
    }

    try {
        const existsClienteCorreo = await clientesModel.findOne({ correo, _id: { $ne: id } });
        if (existsClienteCorreo) {
            return res.status(400).json({ message: "Otro cliente con este correo ya existe" });
        }

        const existsClienteDui = await clientesModel.findOne({ dui, _id: { $ne: id } });
        if (existsClienteDui) {
            return res.status(400).json({ message: "Otro cliente con este DUI ya existe" });
        }

        const updateData = {
            nombre,
            apellido,
            edad,
            dui,
            telefono,
            correo,
            direccion: {
                calle,
                ciudad,
                departamento
            },
            estado,
        };

        if (password) {
            updateData.password = await bcryptjs.hash(password, 10);
        }

        const updatedCliente = await clientesModel.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedCliente) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }

        res.status(200).json({ message: "Cliente actualizado exitosamente" });

    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error actualizando cliente: " + error.message });
    }
};

// DELETE un cliente
clientesController.deleteClientes = async (req, res) => {
    try {
        const deletedClientes = await clientesModel.findByIdAndDelete(req.params.id);
        if (!deletedClientes) {
            return res.status(404).json({ message: "Cliente no encontrado" });
        }
        res.status(200).json({ message: "Cliente eliminado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.status(500).json({ message: "Error eliminando Cliente: " + error.message });
    }
};

// LOGIN UNIFICADO
clientesController.loginUnificado = async (req, res) => {
    let { correo, password } = req.body;
    correo = correo.trim().toLowerCase();
    if (!correo || !password) {
        return res.status(400).json({ message: "Correo y contraseña son obligatorios" });
    }
    console.log('Intento de login:', correo);
    try {
        // 1. Buscar en clientes (correo insensible a mayúsculas y espacios)
        const cliente = await clientesModel.findOne({ correo });
        if (cliente) {
            const isMatch = await bcryptjs.compare(password, cliente.password);
            console.log('Cliente encontrado:', cliente.correo, 'Password match:', isMatch);
            if (!isMatch) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
            return res.status(200).json({
                id: cliente._id,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                correo: cliente.correo,
                telefono: cliente.telefono,
                rol: 'Cliente'
            });
        }
        // 2. Buscar en empleados (correo insensible a mayúsculas y espacios)
        const empleado = await empleadosModel.findOne({ correo });
        if (empleado) {
            const isMatch = await bcryptjs.compare(password, empleado.password);
            console.log('Empleado encontrado:', empleado.correo, 'Password match:', isMatch);
            if (!isMatch) return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
            // Si es optometrista, buscar datos extra
            if (empleado.cargo === 'Optometrista') {
                const optometrista = await optometristaModel.findOne({ empleadoId: empleado._id });
                return res.status(200).json({
                    id: empleado._id,
                    nombre: empleado.nombre,
                    apellido: empleado.apellido,
                    correo: empleado.correo,
                    telefono: empleado.telefono,
                    rol: 'Optometrista',
                    especialidad: optometrista?.especialidad,
                    licencia: optometrista?.licencia
                });
            }
            // Otros empleados
            return res.status(200).json({
                id: empleado._id,
                nombre: empleado.nombre,
                apellido: empleado.apellido,
                correo: empleado.correo,
                telefono: empleado.telefono,
                rol: empleado.cargo
            });
        }
        // No encontrado
        console.log('No se encontró usuario con ese correo');
        return res.status(401).json({ message: 'Correo o contraseña incorrectos' });
    } catch (error) {
        console.log('Error en login:', error);
        res.status(500).json({ message: 'Error en login: ' + error.message });
    }
};

// Recuperar contraseña - Solicitud
clientesController.forgotPassword = async (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ message: "Correo es requerido" });
    try {
        const cliente = await clientesModel.findOne({ correo });
        if (!cliente) return res.status(404).json({ message: "No existe usuario con ese correo" });
        // Generar código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Guardar código y expiración en el usuario
        cliente.resetPasswordToken = resetCode;
        cliente.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutos
        await cliente.save();
        // Enviar email
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: config.emailUser.user_email,
                pass: config.emailUser.user_pass
            }
        });
        const mailOptions = {
            from: config.emailUser.user_email,
            to: correo,
            subject: "Código de recuperación de contraseña",
            text: `Tu código de recuperación es: ${resetCode}. Válido por 30 minutos.`
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: "Código de recuperación enviado al correo" });
    } catch (error) {
        console.error("Error en forgotPassword:", error);
        res.status(500).json({ message: "Error enviando código de recuperación", error: error.message, stack: error.stack });
    }
};

// Recuperar contraseña - Restablecer
clientesController.resetPassword = async (req, res) => {
    const { correo, code, newPassword } = req.body;
    if (!correo || !code || !newPassword) return res.status(400).json({ message: "Correo, código y nueva contraseña requeridos" });
    try {
        const cliente = await clientesModel.findOne({
            correo,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!cliente) return res.status(400).json({ message: "Código inválido, expirado o correo incorrecto" });
        cliente.password = await bcryptjs.hash(newPassword, 10);
        cliente.resetPasswordToken = undefined;
        cliente.resetPasswordExpires = undefined;
        await cliente.save();
        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.log("Error en resetPassword:", error);
        res.status(500).json({ message: "Error al restablecer contraseña" });
    }
};


export default clientesController;