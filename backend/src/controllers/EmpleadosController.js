import empleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";
import { config } from "../config.js";

// La configuración de Cloudinary ya debería estar en un archivo de inicialización
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const empleadosController = {};

// GET all
empleadosController.getEmpleados = async (req, res) => {
    try {
        const empleados = await empleadosModel.find().populate('sucursalId', 'nombre');
        res.status(200).json(empleados);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener empleados", error: error.message });
    }
};

// GET by ID
empleadosController.getEmpleadoById = async (req, res) => {
    try {
        const empleado = await empleadosModel.findById(req.params.id).populate('sucursalId');
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        res.status(200).json(empleado);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener el empleado", error: error.message });
    }
};

// CREATE
empleadosController.createEmpleados = async (req, res) => {
    const {
        nombre, apellido, dui, telefono, correo, cargo, sucursalId,
        fechaContratacion, password, salario, estado,
        departamento, municipio, direccionDetallada, fotoPerfil
    } = req.body;

    try {
        console.log("Datos recibidos:", req.body); // Debug log

        // Validaciones de unicidad
        if (await empleadosModel.findOne({ correo })) {
            return res.status(400).json({ message: "El correo electrónico ya está registrado." });
        }
        if (await empleadosModel.findOne({ dui })) {
            return res.status(400).json({ message: "El DUI ya está registrado." });
        }

        // Validaciones de campos requeridos
        if (!nombre || !apellido || !dui || !telefono || !correo || !cargo || !sucursalId || !fechaContratacion || !password || !salario) {
            return res.status(400).json({ message: "Todos los campos requeridos deben ser completados." });
        }

        // Hash de la contraseña
        const passwordHash = await bcryptjs.hash(password, 10);

        // Crear el nuevo empleado
        const newEmpleado = new empleadosModel({
            nombre,
            apellido,
            dui,
            telefono,
            correo,
            cargo,
            sucursalId,
            fechaContratacion,
            salario: parseFloat(salario),
            estado: estado || 'Activo',
            password: passwordHash,
            fotoPerfil: fotoPerfil || "", // URL de Cloudinary desde el frontend
            direccion: {
                departamento: departamento || "",
                municipio: municipio || "",
                direccionDetallada: direccionDetallada || ""
            },
        });

        await newEmpleado.save();
        
        // Populamos la respuesta para devolver los datos completos
        const empleadoCreado = await empleadosModel.findById(newEmpleado._id).populate('sucursalId', 'nombre');
        
        res.status(201).json({ 
            message: "Empleado creado exitosamente",
            empleado: empleadoCreado
        });

    } catch (error) {
        console.error("Error al crear empleado:", error); // Debug log
        res.status(500).json({ message: "Error al crear el empleado", error: error.message });
    }
};

// UPDATE
empleadosController.updateEmpleados = async (req, res) => {
    const { id } = req.params;
    const {
        nombre, apellido, dui, telefono, correo, cargo, sucursalId,
        fechaContratacion, password, salario, estado,
        departamento, municipio, direccionDetallada, fotoPerfil
    } = req.body;

    try {
        console.log("Datos recibidos para actualización:", req.body); // Debug log

        const empleado = await empleadosModel.findById(id);
        if (!empleado) {
            return res.status(404).json({ message: "Empleado no encontrado." });
        }

        // Validaciones de unicidad (excluyendo el empleado actual)
        if (correo && await empleadosModel.findOne({ correo, _id: { $ne: id } })) {
            return res.status(400).json({ message: "El correo electrónico ya pertenece a otro empleado." });
        }
        if (dui && await empleadosModel.findOne({ dui, _id: { $ne: id } })) {
            return res.status(400).json({ message: "El DUI ya pertenece a otro empleado." });
        }

        // Preparar los datos para actualización
        const updateData = {
            nombre: nombre || empleado.nombre,
            apellido: apellido || empleado.apellido,
            dui: dui || empleado.dui,
            telefono: telefono || empleado.telefono,
            correo: correo || empleado.correo,
            cargo: cargo || empleado.cargo,
            sucursalId: sucursalId || empleado.sucursalId,
            fechaContratacion: fechaContratacion || empleado.fechaContratacion,
            salario: salario ? parseFloat(salario) : empleado.salario,
            estado: estado || empleado.estado,
            fotoPerfil: fotoPerfil !== undefined ? fotoPerfil : empleado.fotoPerfil,
            direccion: {
                departamento: departamento !== undefined ? departamento : empleado.direccion?.departamento || "",
                municipio: municipio !== undefined ? municipio : empleado.direccion?.municipio || "",
                direccionDetallada: direccionDetallada !== undefined ? direccionDetallada : empleado.direccion?.direccionDetallada || ""
            }
        };

        // Si se proporciona una nueva contraseña, hashearla
        if (password && password.trim() !== "") {
            updateData.password = await bcryptjs.hash(password, 10);
        }

        await empleadosModel.findByIdAndUpdate(id, updateData);
        
        // Obtener el empleado actualizado con población
        const empleadoActualizado = await empleadosModel.findById(id).populate('sucursalId', 'nombre');
        
        res.status(200).json({ 
            message: "Empleado actualizado exitosamente",
            empleado: empleadoActualizado
        });

    } catch (error) {
        console.error("Error al actualizar empleado:", error); // Debug log
        res.status(500).json({ message: "Error al actualizar el empleado", error: error.message });
    }
};

// DELETE
empleadosController.deleteEmpleados = async (req, res) => {
    try {
        const deletedEmpleado = await empleadosModel.findByIdAndDelete(req.params.id);
        if (!deletedEmpleado) {
            return res.status(404).json({ message: "Empleado no encontrado" });
        }
        
        // Opcional: Eliminar la imagen de Cloudinary también
        if (deletedEmpleado.fotoPerfil) {
            try {
                // Extraer el public_id de la URL de Cloudinary
                const publicId = deletedEmpleado.fotoPerfil.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`empleados_perfil/${publicId}`);
            } catch (cloudinaryError) {
                console.log("Error al eliminar imagen de Cloudinary:", cloudinaryError.message);
            }
        }
        
        res.status(200).json({ message: "Empleado eliminado exitosamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el empleado", error: error.message });
    }
};

// Recuperar contraseña - Solicitud
empleadosController.forgotPassword = async (req, res) => {
    const { correo } = req.body;
    if (!correo) return res.status(400).json({ message: "Correo es requerido" });
    try {
        const empleado = await empleadosModel.findOne({ correo });
        if (!empleado) return res.status(404).json({ message: "No existe usuario con ese correo" });
        // Generar código de 6 dígitos
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Guardar código y expiración en el usuario
        empleado.resetPasswordToken = resetCode;
        empleado.resetPasswordExpires = Date.now() + 1000 * 60 * 30; // 30 minutos
        await empleado.save();
        // Enviar email
        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.default.createTransport({
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
empleadosController.resetPassword = async (req, res) => {
    const { correo, code, newPassword } = req.body;
    if (!correo || !code || !newPassword) return res.status(400).json({ message: "Correo, código y nueva contraseña requeridos" });
    try {
        const empleado = await empleadosModel.findOne({
            correo,
            resetPasswordToken: code,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!empleado) return res.status(400).json({ message: "Código inválido, expirado o correo incorrecto" });
        empleado.password = await bcryptjs.hash(newPassword, 10);
        empleado.resetPasswordToken = undefined;
        empleado.resetPasswordExpires = undefined;
        await empleado.save();
        res.json({ message: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.log("Error en resetPassword:", error);
        res.status(500).json({ message: "Error al restablecer contraseña" });
    }
};

export default empleadosController;