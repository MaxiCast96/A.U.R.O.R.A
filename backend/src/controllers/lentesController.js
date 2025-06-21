import "../models/Marcas.js";
import "../models/Categoria.js";
//import "../models/Promocion.js";
import lentesModel from "../models/Lentes.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const lentesController = {};
// SELECT
lentesController.getLentes = async (req, res) => {
    try {
        const lentes = await lentesModel.find()
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.json(lentes);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorios: " + error.message });
    }
};


// INSERT
lentesController.createLentes = async (req, res) => {
    // Parsear sucursales si viene como string (form-data)
    let sucursales = req.body.sucursales;
    if (typeof sucursales === "string") {
        try {
            sucursales = JSON.parse(sucursales);
        } catch (e) {
            return res.json({ message: "Error en el formato de sucursales" });
        }
    }

    const {
        nombre,
        descripcion,
        categoriaId,
        marcaId,
        material,
        color,
        tipoLente,
        precioBase,
        precioActual,
        linea,
        medidas,
        enPromocion,
        promocionId,
        fechaCreacion,
    } = req.body;

    let imagenesURLs = [];

    try {
        // Subir imágenes a Cloudinary si se enviaron archivos
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "accesorios",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
        } else if (req.body.imagenes) {
            // Si se enviaron URLs directamente
            imagenesURLs = Array.isArray(req.body.imagenes) ? req.body.imagenes : [req.body.imagenes];
        }

        const newLentes = new lentesModel({
            nombre,
            descripcion,
            categoriaId,
            marcaId,
            material,
            color,
            tipoLente,
            precioBase,
            precioActual,
            linea,
            medidas,
            imagenes: imagenesURLs,
            enPromocion: enPromocion || false,
            promocionId: enPromocion ? promocionId : undefined,
            fechaCreacion,
            sucursales: sucursales || []
        });

        await newLentes.save();
        res.json({ message: "Lentes guardado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando accesorio: " + error.message });
    }
};

// DELETE
lentesController.deleteLentes = async (req, res) => {
    try {
        // Buscar y eliminar el empleado por ID
        const deleteLentes = await lentesModel.findByIdAndDelete(req.params.id);

        // Verificar si el empleado existía
        if (!deleteLentes) {
            return res.json({ message: "Lentes no encontrado" });
        }

        res.json({ message: "Lentes eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando empleado: " + error.message });
    }
};

// UPDATE
lentesController.updateLentes = async (req, res) => {
    // Parsear sucursales si viene como string (form-data)
    let sucursales = req.body.sucursales;
    if (typeof sucursales === "string") {
        try {
            sucursales = JSON.parse(sucursales);
        } catch (e) {
            return res.json({ message: "Error en el formato de sucursales" });
        }
    }

    const {
        nombre,
        descripcion,
        categoriaId,
        marcaId,
        material,
        color,
        tipoLente,
        precioBase,
        precioActual,
        linea,
        medidas,
        enPromocion,
        promocionId,
        fechaCreacion,
    } = req.body;

    let imagenesURLs = req.body.imagenes || [];

    try {
        // Subir nuevas imágenes a Cloudinary si se enviaron archivos
        if (req.files && req.files.length > 0) {
            imagenesURLs = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "accesorios",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
        }

        const updateData = {
            nombre,
            descripcion,
            categoriaId,
            marcaId,
            material,
            color,
            tipoLente,
            precioBase,
            precioActual,
            linea,
            medidas,
            imagenes: imagenesURLs,
            enPromocion: enPromocion || false,
            promocionId: enPromocion ? promocionId : undefined,
            fechaCreacion,
            sucursales: sucursales || []
        };

        if (enPromocion && promocionId) {
            updateData.promocionId = promocionId;
        } else {
            updateData.$unset = { promocionId: "" };
        }

        const updatedLentes = await lentesModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedLentes) {
            return res.json({ message: "Lentes no encontrados" });
        }

        res.json({ message: "Lentes actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando lentes: " + error.message });
    }
};

// SELECT by ID
lentesController.getLentesById = async (req, res) => {
    try {
        const lentes = await accesoriosModel.findById(req.params.id)
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        if (!lentes) {
            return res.json({ message: "Lentes no encontrado" });
        }
        res.json(lentes);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo lentes: " + error.message });
    }
};

// SELECT by Marca
lentesController.getLentesByIdMarca = async (req, res) => {
    try {
        const lentes = await lentesModel.find({ marcaId: req.params.marcaId })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.json(lentes);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo Lentes por marca: " + error.message });
    }
};

// SELECT by Promoción
lentesController.getLentesByPromocion = async (req, res) => {
    try {
        const lentes = await lentesModel.find({ enPromocion: true })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.json(accesorios);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo Lentes en promoción: " + error.message });
    }
};

export default lentesController;