import "../models/Marcas.js";
import "../models/Categoria.js";
//import "../models/Promocion.js";
import lentesModel from "../models/Lentes.js";
import { v2 as cloudinary } from "cloudinary";
import Lentes from '../models/Lentes.js';

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// SELECT - Obtiene todos los lentes con sus relaciones pobladas (con paginación)
async function getLentes(req, res) {
    try {
        // Parámetros de paginación
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
        const skip = (page - 1) * limit;

        // Conteo total para paginación
        const total = await lentesModel.countDocuments();

        // Consulta con paginación y relaciones pobladas
        const lentes = await lentesModel.find()
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId')
            .skip(skip)
            .limit(limit);

        return res.json({
            success: true,
            data: lentes,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.log("Error: " + error);
        return res.status(500).json({ success: false, message: "Error obteniendo lentes: " + error.message });
    }
}

// INSERT - Crea nuevos lentes con imágenes y datos básicos
async function createLentes(req, res) {
    // Parsear sucursales si viene como string (form-data)
    let sucursales = req.body.sucursales;
    if (typeof sucursales === "string") {
        try {
            sucursales = JSON.parse(sucursales); // Convierte string a objeto
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
                // Sube cada archivo a la carpeta "lentes" en Cloudinary
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "lentes",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"] // Formatos permitidos
                });
                imagenesURLs.push(result.secure_url); // Guarda la URL segura
            }
        } else if (req.body.imagenes) {
            // Si se enviaron URLs directamente las convierte a array
            imagenesURLs = Array.isArray(req.body.imagenes) ? req.body.imagenes : [req.body.imagenes];
        }

        // Crea nueva instancia del modelo con todos los datos
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
        res.json({ message: "Error creando lentes: " + error.message });
    }
}

// DELETE - Elimina unos lentes por ID
async function deleteLentes(req, res) {
    try {
        // Busca y elimina los lentes por ID
        const deleteLentes = await lentesModel.findByIdAndDelete(req.params.id);

        // Verificar si los lentes existían
        if (!deleteLentes) {
            return res.json({ message: "Lentes no encontrado" });
        }

        res.json({ message: "Lentes eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando lentes: " + error.message });
    }
}

// UPDATE - Actualiza lentes existentes con nuevos datos e imágenes
async function updateLentes(req, res) {

    // Parsear sucursales si viene como string (form-data)
    let sucursales = req.body.sucursales;
    console.log('[updateLentes] params.id:', req.params.id);
    try {
        console.log('[updateLentes] raw sucursales (req.body.sucursales):', typeof req.body.sucursales, req.body.sucursales);
    } catch {}
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

    let imagenesURLs = req.body.imagenes || []; // Mantiene imágenes existentes por defecto

    try {
        // Sube nuevas imágenes a Cloudinary si se enviaron archivos
        if (req.files && req.files.length > 0) {
            imagenesURLs = []; // Limpia array para nuevas imágenes
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "lentes",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
        }

        // Sanitizar sucursales: solo entradas válidas con ObjectId y stock numérico >= 0
        let sucursalesLimpias = [];
        if (Array.isArray(sucursales)) {
            sucursalesLimpias = sucursales
                .map((s) => {
                    const id = (s && s.sucursalId && typeof s.sucursalId === 'object' && s.sucursalId._id)
                        ? s.sucursalId._id
                        : s?.sucursalId;
                    const idStr = typeof id === 'string' ? id : '';
                    const valido = /^[a-fA-F0-9]{24}$/.test(idStr);
                    if (!valido) return null;
                    return {
                        sucursalId: idStr,
                        nombreSucursal: s?.nombreSucursal || '',
                        stock: Number.isFinite(Number(s?.stock)) && Number(s.stock) >= 0 ? Number(s.stock) : 0,
                    };
                })
                .filter(Boolean);
            console.log('[updateLentes] sucursales parsed length:', sucursales?.length || 0, '=> sanitized length:', sucursalesLimpias.length);
            if (sucursalesLimpias.length > 0) {
                console.log('[updateLentes] first sanitized item sample:', sucursalesLimpias[0]);
            }
        }

        // Construir documento de actualización con operadores atómicos
        const setData = {
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
            enPromocion: !!enPromocion,
            fechaCreacion,
            sucursales: sucursalesLimpias
        };

        const updateDoc = (enPromocion && promocionId)
            ? { $set: { ...setData, promocionId } }
            : { $set: setData, $unset: { promocionId: "" } };

        try {
            console.log('[updateLentes] updateDoc.$set.sucursales length:', Array.isArray(updateDoc.$set.sucursales) ? updateDoc.$set.sucursales.length : 'N/A');
        } catch {}

        // Actualiza el documento y retorna la versión nueva, validando esquema
        const updatedLentes = await lentesModel.findByIdAndUpdate(
            req.params.id,
            updateDoc,
            { new: true, runValidators: true }
        );

        if (!updatedLentes) {
            return res.status(404).json({ success: false, message: "Lentes no encontrados" });
        }

        res.json({ success: true, message: "Lentes actualizado", data: updatedLentes });
    } catch (error) {
        console.log("Error actualizando lentes: ", error);
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ success: false, message: "Error actualizando lentes: " + error.message });
    }
}

// SELECT by ID - Obtiene lentes específicos por ID
async function getLentesById(req, res) {
    try {
        // Busca lentes por ID y puebla todas las referencias
        const lentes = await lentesModel.findById(req.params.id)
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
}

// SELECT by Marca - Obtiene lentes filtrados por marca específica
async function getLentesByIdMarca(req, res) {
    try {
        // Filtra lentes por ID de marca específica
        const lentes = await lentesModel.find({ marcaId: req.params.marcaId })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.json(lentes);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo lentes por marca: " + error.message });
    }
}

// SELECT by Promoción - Obtiene lentes que están en promoción
async function getLentesByPromocion(req, res) {
    try {
        // Filtra solo lentes marcados como en promoción
        const lentes = await lentesModel.find({ enPromocion: true })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.json(lentes);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo lentes en promoción: " + error.message });
    }
}

// SELECT Populares - Obtiene lentes marcados como populares o los primeros registros
async function getLentesPopulares(req, res) {
    try {
        // Si el campo popular no existe, devuelve los primeros 5
        let populares;
        if (Lentes.schema.obj.popular) {
            // Filtra lentes marcados como populares
            populares = await Lentes.find({ popular: true });
        } else {
            // Fallback: obtiene los primeros 5 lentes como populares
            populares = await Lentes.find().limit(5);
        }
        res.json(populares);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo lentes populares: ' + error.message });
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