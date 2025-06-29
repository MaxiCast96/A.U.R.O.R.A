import marcasModel from "../models/Marcas.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const marcasController = {};

// SELECT
marcasController.getMarcas = async (req, res) => {
    try {
        const marcas = await marcasModel.find();
        res.json(marcas);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo marcas: " + error.message });
    }
};

// INSERT
marcasController.createMarcas = async (req, res) => {
    const { nombre, descripcion, paisOrigen, lineas } = req.body;
    let logoURL = "";

    try {
        // Subir imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "marcas",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            logoURL = result.secure_url;
        } else if (req.body.logo) {
            logoURL = req.body.logo;
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
            lineas
        });

        await newMarca.save();
        res.json({ message: "Marca guardada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando marca: " + error.message });
    }
};

// DELETE
marcasController.deleteMarcas = async (req, res) => {
    try {
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

// UPDATE
marcasController.updateMarcas = async (req, res) => {
    const { nombre, descripcion, paisOrigen, lineas } = req.body;
    let logoURL = req.body.logo;

    try {
        // Subir imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "marcas",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            logoURL = result.secure_url;
        }

        // Verificar si existe otra marca con el mismo nombre
        const existsMarca = await marcasModel.findOne({
            nombre,
            _id: { $ne: req.params.id }
        });
        if (existsMarca) {
            return res.json({ message: "Ya existe otra marca con este nombre" });
        }

        const updatedMarca = await marcasModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                descripcion,
                logo: logoURL,
                paisOrigen,
                lineas
            },
            { new: true }
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

// GET by ID
marcasController.getMarcaById = async (req, res) => {
    try {
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