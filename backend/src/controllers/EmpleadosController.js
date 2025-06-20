import empleadosModel from "../models/Empleados.js";
import bcryptjs from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const empleadosController = {};

// SELECT
empleadosController.getEmpleados = async (req, res) => {
    try {
        // Buscar todos los empleados
        const empleados = await empleadosModel.find().populate('sucursalId');
        res.json(empleados);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo empleados: " + error.message });
    }
};

// INSERT
empleadosController.createEmpleados = async (req, res) => {
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

    let fotoPerfilURL = "";

    try {
        // Subir imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "empleados",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            fotoPerfilURL = result.secure_url;
        } else if (req.body.fotoPerfil) {
            fotoPerfilURL = req.body.fotoPerfil;
        }

        // Verificar si ya existe un empleado con el mismo correo
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
            fotoPerfil: fotoPerfilURL // Cambiado de foto a fotoPerfil
        });

        // Guardar el empleado en la base de datos
        await newEmpleado.save();

        res.json({ message: "Empleado creado exitosamente" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando empleado: " + error.message });
    }
};

// DELETE
empleadosController.deleteEmpleados = async (req, res) => {
    try {
        // Buscar y eliminar el empleado por ID
        const deleteEmpleado = await empleadosModel.findByIdAndDelete(req.params.id);

        // Verificar si el empleado existía
        if (!deleteEmpleado) {
            return res.json({ message: "Empleado no encontrado" });
        }

        res.json({ message: "Empleado eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando empleado: " + error.message });
    }
};

// UPDATE
empleadosController.updateEmpleados = async (req, res) => {
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

    let fotoPerfilURL = req.body.fotoPerfil;

    try {
        // Subir imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "empleados",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            fotoPerfilURL = result.secure_url;
        }

        // Verificar si existe otro empleado con el mismo correo
        const existsEmpleado = await empleadosModel.findOne({
            correo,
            _id: { $ne: req.params.id }
        });
        if (existsEmpleado) {
            return res.json({ message: "Otro empleado con este correo ya existe" });
        }

        // Verificar si existe otro empleado con el mismo DUI
        const existsDui = await empleadosModel.findOne({
            dui,
            _id: { $ne: req.params.id }
        });
        if (existsDui) {
            return res.json({ message: "Otro empleado con este DUI ya existe" });
        }

        let updateData = {
            nombre,
            apellido,
            dui,
            telefono,
            correo,
            direccion,
            cargo,
            sucursalId,
            fechaContratacion,
            isVerified,
            fotoPerfil: fotoPerfilURL // Cambiado de foto a fotoPerfil
        };

        // Si se proporciona una nueva contraseña, encriptarla
        if (password) {
            const passwordHash = await bcryptjs.hash(password, 10);
            updateData.password = passwordHash;
        }

        // Buscar y actualizar el empleado por ID
        const updatedEmpleado = await empleadosModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        // Verificar si el empleado existía
        if (!updatedEmpleado) {
            return res.json({ message: "Empleado no encontrado" });
        }

        res.json({ message: "Empleado actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando empleado: " + error.message });
    }
};

// GET by ID
empleadosController.getEmpleadoById = async (req, res) => {
    try {
        // Buscar empleado por ID y popular la referencia de sucursal
        const empleado = await empleadosModel.findById(req.params.id).populate('sucursalId');

        // Verificar si el empleado existe
        if (!empleado) {
            return res.json({ message: "Empleado no encontrado" });
        }

        res.json(empleado);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo empleado: " + error.message });
    }
};

export default empleadosController;