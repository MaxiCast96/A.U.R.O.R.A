import "../models/Marcas.js";
import "../models/Categoria.js";
import lentesModel from "../models/Lentes.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Obtener todos los lentes
async function getLentes(req, res) {
    try {
        const lentes = await lentesModel.find()
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.status(200).json({
            success: true,
            data: lentes
        });
    } catch (error) {
        console.error("Error obteniendo lentes:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo lentes",
            error: error.message 
        });
    }
}

// Crear nuevos lentes
async function createLentes(req, res) {
    try {
        let sucursales = req.body.sucursales;
        if (typeof sucursales === "string") {
            sucursales = JSON.parse(sucursales);
        }

        let imagenesURLs = [];
        
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "lentes",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
        } else if (req.body.imagenes) {
            imagenesURLs = Array.isArray(req.body.imagenes) ? req.body.imagenes : [req.body.imagenes];
        }

        const newLentes = new lentesModel({
            ...req.body,
            imagenes: imagenesURLs,
            sucursales: sucursales || [],
            promocionId: req.body.enPromocion ? req.body.promocionId : null
        });

        await newLentes.save();
        
        const populatedLente = await lentesModel.findById(newLentes._id)
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');

        res.status(201).json({
            success: true,
            data: populatedLente,
            message: "Lente creado exitosamente"
        });
    } catch (error) {
        console.error("Error creando lentes:", error);
        res.status(500).json({ 
            success: false,
            message: "Error creando lentes",
            error: error.message 
        });
    }
}

// Actualizar lentes existentes
async function updateLentes(req, res) {
    try {
        const { id } = req.params;
        let updateData = req.body;

        // Convertir datos si vienen como strings
        if (typeof updateData.sucursales === "string") {
            updateData.sucursales = JSON.parse(updateData.sucursales);
        }
        if (typeof updateData.medidas === "string") {
            updateData.medidas = JSON.parse(updateData.medidas);
        }

        // Manejar promoción
        if (!updateData.enPromocion) {
            updateData.promocionId = null;
        }

        // Subir nuevas imágenes si existen
        if (req.files && req.files.length > 0) {
            const imagenesURLs = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "lentes",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
            updateData.imagenes = imagenesURLs;
        }

        // Actualizar el documento
        const updatedLentes = await lentesModel.findByIdAndUpdate(
            id,
            updateData,
            { 
                new: true,
                runValidators: true 
            }
        )
        .populate('categoriaId')
        .populate('marcaId')
        .populate('promocionId')
        .populate('sucursales.sucursalId');

        if (!updatedLentes) {
            return res.status(404).json({ 
                success: false,
                message: 'Lente no encontrado' 
            });
        }

        res.status(200).json({
            success: true,
            data: updatedLentes,
            message: "Lente actualizado exitosamente"
        });
    } catch (error) {
        console.error('Error actualizando lente:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error actualizando lente',
            error: error.message 
        });
    }
}

// Eliminar lentes
async function deleteLentes(req, res) {
    try {
        const deleteLentes = await lentesModel.findByIdAndDelete(req.params.id);

        if (!deleteLentes) {
            return res.status(404).json({ 
                success: false,
                message: "Lente no encontrado" 
            });
        }

        res.status(200).json({
            success: true,
            message: "Lente eliminado exitosamente"
        });
    } catch (error) {
        console.error("Error eliminando lentes:", error);
        res.status(500).json({ 
            success: false,
            message: "Error eliminando lentes",
            error: error.message 
        });
    }
}

// Obtener lente por ID
async function getLentesById(req, res) {
    try {
        const lentes = await lentesModel.findById(req.params.id)
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
            
        if (!lentes) {
            return res.status(404).json({ 
                success: false,
                message: "Lente no encontrado" 
            });
        }
        
        res.status(200).json({
            success: true,
            data: lentes
        });
    } catch (error) {
        console.error("Error obteniendo lente:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo lente",
            error: error.message 
        });
    }
}

// Obtener lentes por marca
async function getLentesByIdMarca(req, res) {
    try {
        const lentes = await lentesModel.find({ marcaId: req.params.marcaId })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
            
        res.status(200).json({
            success: true,
            data: lentes
        });
    } catch (error) {
        console.error("Error obteniendo lentes por marca:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo lentes por marca",
            error: error.message 
        });
    }
}

// Obtener lentes en promoción
async function getLentesByPromocion(req, res) {
    try {
        const lentes = await lentesModel.find({ enPromocion: true })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
            
        res.status(200).json({
            success: true,
            data: lentes
        });
    } catch (error) {
        console.error("Error obteniendo lentes en promoción:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo lentes en promoción",
            error: error.message 
        });
    }
}

// Obtener lentes populares
async function getLentesPopulares(req, res) {
    try {
        let populares = await lentesModel.find().limit(5)
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
            
        res.status(200).json({
            success: true,
            data: populares
        });
    } catch (error) {
        console.error("Error obteniendo lentes populares:", error);
        res.status(500).json({ 
            success: false,
            message: "Error obteniendo lentes populares",
            error: error.message 
        });
    }
}

const lentesController = {
    getLentes,
    getLentesById,
    createLentes,
    updateLentes,
    deleteLentes,
    getLentesByIdMarca,
    getLentesByPromocion,
    getLentesPopulares,
};

export default lentesController;