import categoriaModel from "../models/Categoria.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const categoriaController = {};

// SELECT
categoriaController.getCategoria = async (req, res) => {
    try {
        const categoria = await categoriaModel.find();
        res.json(categoria);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo categoria: " + error.message });
    }
};

// INSERT
categoriaController.createCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    let iconoUrl = "";

    try {
        // Subir imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "categoria",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            iconoUrl = result.secure_url;
        } else if (req.body.logo) {
            iconoUrl = req.body.logo;
        }

        // Verificar si ya existe una categoria con el mismo nombre
        const existsCategoria = await categoriaModel.findOne({ nombre });
        if (existsCategoria) {
            return res.json({ message: "Ya existe una categoria con este nombre" });
        }

        // Crear nueva instancia de la categoria
        const newCategoria = new categoriaModel({
            nombre,
            descripcion,
            icono: iconoUrl,
        });

        await newCategoria.save();
        res.json({ message: "categoria guardada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando categoria: " + error.message });
    }
};

// DELETE
categoriaController.deleteCategoria = async (req, res) => {
    try {
        const deleteCategoria = await categoriaModel.findByIdAndDelete(req.params.id);
        if (!deleteCategoria) {
            return res.json({ message: "Categoria no encontrada" });
        }
        res.json({ message: "Categoria eliminada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando categoria: " + error.message });
    }
};

// UPDATE
categoriaController.updateCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    let iconoUrl = req.body.logo;

    try {
        // Subir imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "marcas",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            iconoUrl = result.secure_url;
        }

        // Verificar si existe otra categoria con el mismo nombre
        const exitsCategoria = await categoriaModel.findOne({
            nombre,
            _id: { $ne: req.params.id }
        });
        if (exitsCategoria) {
            return res.json({ message: "Ya existe otra categoria con este nombre" });
        }

        const updateCategoria = await categoriaModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                descripcion,
                icono: iconoUrl,
            },
            { new: true }
        );

        if (!updateCategoria) {
            return res.json({ message: "Categoria no encontrada" });
        }

        res.json({ message: "Categoria actualizada" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando categoria: " + error.message });
    }
};

// GET by ID
categoriaController.getCategoriaById = async (req, res) => {
    try {
        const categoria = await categoriaModel.findById(req.params.id);
        if (!categoria) {
            return res.json({ message: "Categoria no encontrada" });
        }
        res.json(categoria);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo categoria: " + error.message });
    }
};

export default categoriaController;