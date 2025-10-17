import marcasModel from "../models/Marcas.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const marcasController = {};

// SELECT - Obtiene todas las marcas
marcasController.getMarcas = async (req, res) => {
    try {
        // Busca y retorna todas las marcas
        const marcas = await marcasModel.find();
        res.json(marcas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo marcas: " + error.message });
    }
};

// INSERT - Crear nueva marca con logo opcional
marcasController.createMarcas = async (req, res) => {
    const { nombre, descripcion, paisOrigen, lineas, estado } = req.body;

    let logoURL = ""; // Variable para URL del logo

    try {
        // Sube imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "marcas", // Carpeta específica en Cloudinary
                allowed_formats: ["png", "jpg", "jpeg", "webp"] // Formatos permitidos
            });
            logoURL = result.secure_url; // Obtiene URL segura
        } else if (req.body.logo) {
            logoURL = req.body.logo; // Usa URL proporcionada directamente
        }

        // Verificar si ya existe una marca con el mismo nombre
        const existsMarca = await marcasModel.findOne({ nombre });
        if (existsMarca) {
            return res.json({ message: "Ya existe una marca con este nombre" });
        }

        // Crear nueva instancia de la marca
        const newMarca = new marcasModel({
            nombre,
            descripcion,
            logo: logoURL,
            paisOrigen,
            lineas,
            estado: estado || 'Activa'
        });

        await newMarca.save();
        res.json({ message: "Marca guardada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando marca: " + error.message });
    }
};

// DELETE - Elimina una marca por ID
marcasController.deleteMarcas = async (req, res) => {
    try {
        // Busca y elimina marca por ID
        const deleteMarca = await marcasModel.findByIdAndDelete(req.params.id);
        if (!deleteMarca) {
            return res.json({ message: "Marca no encontrada" });
        }
        res.json({ message: "Marca eliminada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando marca: " + error.message });
    }
};

// UPDATE - Actualiza marca existente con nuevos datos
marcasController.updateMarcas = async (req, res) => {
    const { nombre, descripcion, paisOrigen, lineas, estado } = req.body;

    let logoURL = req.body.logo; // Mantiene logo existente por defecto

    try {
        // Sube nueva imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "marcas",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            logoURL = result.secure_url;
        }

        // Verificar que no exista otra marca con el mismo nombre
        const existsMarca = await marcasModel.findOne({
            nombre,
            _id: { $ne: req.params.id } // Excluye el documento actual
        });
        if (existsMarca) {
            return res.json({ message: "Ya existe otra marca con este nombre" });
        }

        // Actualiza marca y retorna versión nueva
        const updatedMarca = await marcasModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                descripcion,
                logo: logoURL,
                paisOrigen,
                lineas,
                estado: estado || 'Activa'
            },
            { new: true } // Retorna documento actualizado
        );

        if (!updatedMarca) {
            return res.json({ message: "Marca no encontrada" });
        }

        res.json({ message: "Marca actualizada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando marca: " + error.message });
    }
};

// GET by ID - Obtiene una marca específica por ID
marcasController.getMarcaById = async (req, res) => {
    try {
        // Busca marca por ID
        const marca = await marcasModel.findById(req.params.id);
        if (!marca) {
            return res.json({ message: "Marca no encontrada" });
        }
        res.json(marca);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo marca: " + error.message });
    }
};

export default marcasController;