import "../models/Marcas.js";
import "../models/Categoria.js";
import { v2 as cloudinary } from "cloudinary";
import Aros from "../models/Aros.js";
import Promociones from '../models/Promociones.js';

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// SELECT - Obtiene todos los aros con sus relaciones pobladas (con paginación)
async function getAros(req, res) {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
        const skip = (page - 1) * limit;

        const total = await Aros.countDocuments();

        const aros = await Aros.find()
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId')
            .skip(skip)
            .limit(limit);

        return res.json({
            success: true,
            data: aros,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.log("Error: " + error);
        return res.status(500).json({ success: false, message: "Error obteniendo aros: " + error.message });
    }
}

// INSERT - Crea nuevos aros con imágenes y datos básicos
async function createAros(req, res) {
    let sucursales = req.body.sucursales;
    if (typeof sucursales === "string") {
        try { sucursales = JSON.parse(sucursales); } 
        catch (e) { return res.json({ message: "Error en el formato de sucursales" }); }
    }

    const {
        nombre, descripcion, categoriaId, marcaId, material, color, tipoLente,
        precioBase, precioActual, linea, medidas, enPromocion, promocionId, fechaCreacion,
    } = req.body;

    let imagenesURLs = [];

    try {
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "lentes", // mantener carpeta por compatibilidad
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
        } else if (req.body.imagenes) {
            imagenesURLs = Array.isArray(req.body.imagenes) ? req.body.imagenes : [req.body.imagenes];
        }

        const newAros = new Aros({
            nombre, descripcion, categoriaId, marcaId, material, color, tipoLente,
            precioBase, precioActual, linea, medidas,
            imagenes: imagenesURLs,
            enPromocion: enPromocion || false,
            promocionId: enPromocion ? promocionId : undefined,
            fechaCreacion,
            sucursales: sucursales || []
        });

        await newAros.save();
        res.json({ message: "Aros guardado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error creando aros: " + error.message });
    }
}

// DELETE - Elimina un aro por ID
async function deleteAros(req, res) {
    try {
        const deleted = await Aros.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.json({ message: "Aro no encontrado" });
        }
        res.json({ message: "Aro eliminado" });
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error eliminando aro: " + error.message });
    }
}

// UPDATE - Actualiza aros existentes
async function updateAros(req, res) {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   🔧 UPDATE AROS - BACKEND            ║');
    console.log('╚════════════════════════════════════════╝');
    
    console.log('\n📥 req.body recibido:', JSON.stringify(req.body, null, 2));
    console.log('📥 req.params.id:', req.params.id);
    console.log('📥 Content-Type:', req.headers['content-type']);
    
    // CRÍTICO: Validar que req.body existe
    if (!req.body || Object.keys(req.body).length === 0) {
        console.error('❌ req.body está vacío o undefined');
        return res.status(400).json({ 
            success: false, 
            message: 'No se recibieron datos en el body' 
        });
    }
    
    let sucursales = req.body.sucursales;
    console.log('🏪 sucursales raw (tipo):', typeof sucursales);
    console.log('🏪 sucursales raw (valor):', sucursales);
    
    // Parsear sucursales si viene como string (form-data)
    if (typeof sucursales === "string") {
        try {
            sucursales = JSON.parse(sucursales);
            console.log('✅ Sucursales parseadas:', sucursales);
        } catch (e) {
            console.error('❌ Error parseando sucursales:', e.message);
            return res.status(400).json({ 
                success: false,
                message: "Error en el formato de sucursales: " + e.message 
            });
        }
    }
    
    // Validar que sucursales existe después del parsing
    if (!sucursales) {
        console.error('❌ Sucursales es undefined después del parsing');
        return res.status(400).json({ 
            success: false, 
            message: 'El campo sucursales es requerido' 
        });
    }

    const {
        nombre, descripcion, categoriaId, marcaId, material, color, tipoLente,
        precioBase, precioActual, linea, medidas, enPromocion, promocionId, fechaCreacion,
    } = req.body;

    let imagenesURLs = req.body.imagenes || [];

    try {
        if (req.files && req.files.length > 0) {
            imagenesURLs = [];
            for (const file of req.files) {
                const result = await cloudinary.uploader.upload(file.path, {
                    folder: "lentes",
                    allowed_formats: ["png", "jpg", "jpeg", "webp"]
                });
                imagenesURLs.push(result.secure_url);
            }
        }

        const normalizeId = (val) => {
            try {
                const maybe = (val && typeof val === 'object' && val._id) ? val._id : val;
                const str = typeof maybe === 'string' ? maybe : '';
                return /^[a-fA-F0-9]{24}$/.test(str) ? str : undefined;
            } catch (_) { return undefined; }
        };

        const categoriaIdNorm = normalizeId(categoriaId);
        const marcaIdNorm = normalizeId(marcaId);
        const promocionIdNorm = normalizeId(promocionId);

        const currentDoc = await Aros.findById(req.params.id).select('categoriaId precioBase');
        if (!currentDoc) {
            return res.status(404).json({ success: false, message: "Aro no encontrado" });
        }

        let sucursalesLimpias = [];
        if (Array.isArray(sucursales)) {
            console.log('🔄 Procesando', sucursales.length, 'sucursales...');
            sucursalesLimpias = sucursales
                .map((s) => {
                    const id = (s && s.sucursalId && typeof s.sucursalId === 'object' && s.sucursalId._id)
                        ? s.sucursalId._id : s?.sucursalId;
                    const idStr = typeof id === 'string' ? id : '';
                    const valido = /^[a-fA-F0-9]{24}$/.test(idStr);
                    if (!valido) {
                        console.warn('⚠️ Sucursal con ID inválido:', s);
                        return null;
                    }
                    return {
                        sucursalId: idStr,
                        nombreSucursal: s?.nombreSucursal || '',
                        stock: Number.isFinite(Number(s?.stock)) && Number(s.stock) >= 0 ? Number(s.stock) : 0,
                    };
                })
                .filter(Boolean);
            console.log('✅ Sucursales procesadas:', sucursalesLimpias.length);
        } else {
            console.error('❌ sucursales no es un array:', typeof sucursales);
            return res.status(400).json({ 
                success: false, 
                message: 'Sucursales debe ser un array' 
            });
        }

        const setData = {
            nombre, descripcion,
            categoriaId: categoriaIdNorm,
            marcaId: marcaIdNorm,
            material, color, tipoLente,
            precioBase, precioActual,
            linea, medidas,
            imagenes: imagenesURLs,
            enPromocion: !!enPromocion,
            promocionId: promocionIdNorm,
            fechaCreacion,
            sucursales: sucursalesLimpias
        };
        Object.keys(setData).forEach((k) => {
            if (typeof setData[k] === 'undefined') delete setData[k];
        });

        let shouldUnsetPromo = false;
        if (enPromocion === false) {
            setData.enPromocion = false;
            shouldUnsetPromo = true;
        } else if (enPromocion === true) {
            setData.enPromocion = true;
            if (promocionIdNorm) setData.promocionId = promocionIdNorm;
        }

        const updateDoc = { $set: setData };
        if (shouldUnsetPromo) {
            updateDoc.$unset = { ...(updateDoc.$unset || {}), promocionId: "" };
            delete setData.promocionId;
        }

        console.log('📤 Actualizando documento con', Object.keys(setData).length, 'campos');
        
        const updated = await Aros.findByIdAndUpdate(
            req.params.id,
            updateDoc,
            { new: true, runValidators: true }
        );

        if (!updated) {
            return res.status(404).json({ success: false, message: "Aro no encontrado" });
        }

        console.log('✅ Aro actualizado exitosamente');
        res.json({ success: true, message: "Aro actualizado", data: updated });
    } catch (error) {
        console.error("❌ Error actualizando aros:", error);
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ success: false, message: "Error actualizando aros: " + error.message });
    }
}

// SELECT by ID
async function getArosById(req, res) {
    try {
        const aro = await Aros.findById(req.params.id)
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        if (!aro) return res.json({ message: "Aro no encontrado" });
        res.json(aro);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo aro: " + error.message });
    }
}

// SELECT by Marca
async function getArosByIdMarca(req, res) {
    try {
        const aros = await Aros.find({ marcaId: req.params.marcaId })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.json(aros);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo aros por marca: " + error.message });
    }
}

// SELECT by Promoción
async function getArosByPromocion(req, res) {
    try {
        const aros = await Aros.find({ enPromocion: true })
            .populate('categoriaId')
            .populate('marcaId')
            .populate('promocionId')
            .populate('sucursales.sucursalId');
        res.json(aros);
    } catch (error) {
        console.log("Error: " + error);
        res.json({ message: "Error obteniendo aros en promoción: " + error.message });
    }
}

// SELECT Populares (fallback primeros 5)
async function getArosPopulares(req, res) {
    try {
        let populares;
        if (Aros.schema.obj.popular) {
            populares = await Aros.find({ popular: true });
        } else {
            populares = await Aros.find().limit(5);
        }
        res.json(populares);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo aros populares: ' + error.message });
    }
}

const arosController = {
    getAros,
    getArosById,
    createAros,
    updateAros,
    deleteAros,
    getArosByIdMarca,
    getArosByPromocion,
    getArosPopulares,
};

export default arosController;
