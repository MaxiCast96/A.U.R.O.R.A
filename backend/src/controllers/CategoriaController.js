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
        const categoria = await categoriaModel.find();
        res.json(categoria);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo categoria: " + error.message });
    }
};

// INSERT - Crea nueva categoría con icono opcional
categoriaController.createCategoria = async (req, res) => {
    const { nombre, descripcion, icono } = req.body; // ✅ Ahora extrae 'icono'
    let iconoUrl = "";

    try {
        // Prioridad 1: Imagen subida a Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "categoria",
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            iconoUrl = result.secure_url;
        } 
        // Prioridad 2: Nombre de icono de Lucide React
        else if (icono) {
            iconoUrl = icono; // ✅ Guarda directamente el nombre del icono
        }
        // Prioridad 3: URL proporcionada directamente (compatibilidad)
        else if (req.body.logo) {
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

// DELETE - Elimina una categoría por ID
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

// UPDATE - Actualiza categoría existente con nuevos datos
categoriaController.updateCategoria = async (req, res) => {
    const { nombre, descripcion, icono } = req.body; // ✅ Ahora extrae 'icono'
    let iconoUrl = "";

    try {
        // Prioridad 1: Nueva imagen subida a Cloudinary
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "categoria", // ✅ Corregido: era "marcas"
                allowed_formats: ["png", "jpg", "jpeg", "webp"]
            });
            iconoUrl = result.secure_url;
        } 
        // Prioridad 2: Nombre de icono de Lucide React
        else if (icono) {
            iconoUrl = icono; // ✅ Guarda directamente el nombre del icono
        }
        // Prioridad 3: URL proporcionada directamente (compatibilidad)
        else if (req.body.logo) {
            iconoUrl = req.body.logo;
        }
        // Prioridad 4: Mantener el icono existente
        else {
            const existingCategoria = await categoriaModel.findById(req.params.id);
            iconoUrl = existingCategoria?.icono || "";
        }

        // Verifica que no exista otra categoría con el mismo nombre
        const exitsCategoria = await categoriaModel.findOne({
            nombre,
            _id: { $ne: req.params.id }
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

// GET by ID - Obtiene una categoría específica por ID
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