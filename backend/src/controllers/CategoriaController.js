import categoriaModel from "../models/Categoria.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const categoriaController = {};

// SELECT - Obtiene todas las categorías
categoriaController.getCategoria = async (req, res) => {
    try {
        // Busca y retorna todas las categorías
        const categoria = await categoriaModel.find();
        res.json(categoria);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo categoria: " + error.message });
    }
};

// INSERT - Crea nueva categoría con icono opcional
categoriaController.createCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    let iconoUrl = ""; // Variable para URL del icono

    try {
        // Sube imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "categoria", // Carpeta específica en Cloudinary
                allowed_formats: ["png", "jpg", "jpeg", "webp"] // Formatos permitidos
            });
            iconoUrl = result.secure_url; // Obtiene URL segura
        } else if (req.body.logo) {
            iconoUrl = req.body.logo; // Usa URL proporcionada directamente
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

// DELETE - Elimina una categoría por ID
categoriaController.deleteCategoria = async (req, res) => {
    try {
        // Busca y elimina categoría por ID
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

// UPDATE - Actualiza categoría existente con nuevos datos
categoriaController.updateCategoria = async (req, res) => {
    const { nombre, descripcion } = req.body;
    let iconoUrl = req.body.logo; // Mantiene logo existente por defecto

    try {
        // Sube nueva imagen a Cloudinary si se envió archivo
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "marcas", // Nota: debería ser "categoria" para consistencia
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            iconoUrl = result.secure_url;
        }


         // Verifica que no exista otra categoría con el mismo nombre
        const exitsCategoria = await categoriaModel.findOne({
            nombre,
            _id: { $ne: req.params.id } // Excluye el documento actual
        });
        if (exitsCategoria) {
            return res.json({ message: "Ya existe otra categoria con este nombre" });
        }

        // Actualiza categoría y retorna versión nueva
        const updateCategoria = await categoriaModel.findByIdAndUpdate(
            req.params.id,
            {
                nombre,
                descripcion,
                icono: iconoUrl,
            },
            { new: true } // Retorna documento actualizado
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

// GET by ID - Obtiene una categoría específica por ID
categoriaController.getCategoriaById = async (req, res) => {
    try {
        // Busca categoría por ID
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