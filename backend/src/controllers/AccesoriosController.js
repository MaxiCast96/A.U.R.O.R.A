/*
Lo que falta es básicamente es que haga el GET de accesorios con promociones, pero para eso necesito el CRUD de Aleman.
*/
import "../models/Marcas.js";
import "../models/Sucursales.js";
import "../models/Promociones.js";
import accesoriosModel from "../models/Accesorios.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const accesoriosController = {};

// SELECT
accesoriosController.getAccesorios = async (req, res) => {
    try {
        const accesorios = await accesoriosModel.find()
            .populate('marcaId')
            .populate({
                path: 'promocionId',
                model: 'Promociones'
            })
            .populate('sucursales.sucursalId');
        res.json(accesorios);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorios: " + error.message });
    }
};

// INSERT
accesoriosController.createAccesorios = async (req, res) => {
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
        tipo,
        marcaId,
        material,
        color,
        precioBase,
        precioActual,
        enPromocion,
        promocionId
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

        const newAccesorio = new accesoriosModel({
            nombre,
            descripcion,
            tipo,
            marcaId,
            material,
            color,
            precioBase,
            precioActual,
            imagenes: imagenesURLs,
            enPromocion: enPromocion || false,
            promocionId: enPromocion ? promocionId : undefined,
            sucursales: sucursales || []
        });

        await newAccesorio.save();
        res.json({ message: "Accesorio guardado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando accesorio: " + error.message });
    }
};

// DELETE
accesoriosController.deleteAccesorios = async (req, res) => {
    try {
        const deleteAccesorio = await accesoriosModel.findByIdAndDelete(req.params.id);
        if (!deleteAccesorio) {
            return res.json({ message: "Accesorio no encontrado" });
        }
        res.json({ message: "Accesorio eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando accesorio: " + error.message });
    }
};

// UPDATE
accesoriosController.updateAccesorios = async (req, res) => {
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
        tipo,
        marcaId,
        material,
        color,
        precioBase,
        precioActual,
        enPromocion,
        promocionId
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
            tipo,
            marcaId,
            material,
            color,
            precioBase,
            precioActual,
            imagenes: imagenesURLs,
            enPromocion: enPromocion || false,
            sucursales: sucursales || []
        };

        if (enPromocion && promocionId) {
            updateData.promocionId = promocionId;
        } else {
            updateData.$unset = { promocionId: "" };
        }

        const updatedAccesorio = await accesoriosModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true }
        );

        if (!updatedAccesorio) {
            return res.json({ message: "Accesorio no encontrado" });
        }

        res.json({ message: "Accesorio actualizado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error actualizando accesorio: " + error.message });
    }
};

// SELECT by ID
accesoriosController.getAccesorioById = async (req, res) => {
    try {
        const accesorio = await accesoriosModel.findById(req.params.id)
            .populate('marcaId')
            .populate({
                path: 'promocionId',
                model: 'Promociones'
            })
            .populate('sucursales.sucursalId');
        if (!accesorio) {
            return res.json({ message: "Accesorio no encontrado" });
        }
        res.json(accesorio);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorio: " + error.message });
    }
};

// SELECT by Marca
accesoriosController.getAccesoriosByMarca = async (req, res) => {
    try {
        const accesorios = await accesoriosModel.find({ marcaId: req.params.marcaId })
            .populate('marcaId')
            .populate({
                path: 'promocionId',
                model: 'Promociones'
            })
            .populate('sucursales.sucursalId');
        res.json(accesorios);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorios por marca: " + error.message });
    }
};

// SELECT by Promoción
accesoriosController.getAccesoriosEnPromocion = async (req, res) => {
    try {
        const accesorios = await accesoriosModel.find({ enPromocion: true })
            .populate('marcaId')
            .populate({
                path: 'promocionId',
                model: 'Promociones'
            })
            .populate('sucursales.sucursalId');
        res.json(accesorios);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo accesorios en promoción: " + error.message });
    }
};

export default accesoriosController;