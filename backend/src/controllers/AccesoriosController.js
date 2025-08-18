import "../models/Marcas.js";
import "../models/Sucursales.js";
import "../models/Promociones.js";
import "../models/Categoria.js";
import accesoriosModel from "../models/Accesorios.js";
import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const accesoriosController = {};

// ===== FUNCIÓN AUXILIAR PARA MANEJAR ERRORES =====
const handleError = (res, error, defaultMessage = "Error interno del servidor") => {
    console.error("Error:", error);
    
    // Manejar errores de validación de Mongoose
    if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => err.message);
        return res.status(400).json({ 
            success: false, 
            message: "Error de validación", 
            errors: errors
        });
    }
    
    // Manejar errores de cast (ID inválido)
    if (error.name === 'CastError') {
        return res.status(400).json({ 
            success: false, 
            message: "ID inválido proporcionado" 
        });
    }
    
    // Manejar errores de duplicación
    if (error.code === 11000) {
        const field = Object.keys(error.keyValue)[0];
        return res.status(400).json({ 
            success: false, 
            message: `Ya existe un accesorio con ese ${field}` 
        });
    }
    
    return res.status(500).json({ 
        success: false, 
        message: defaultMessage,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
};

// ===== FUNCIÓN AUXILIAR PARA VALIDAR DATOS =====
const validateAccesorioData = (data) => {
    const errors = [];
    
    if (!data.nombre?.trim()) errors.push("El nombre es requerido");
    if (!data.descripcion?.trim()) errors.push("La descripción es requerida");
    if (!data.tipo) errors.push("La categoría es requerida");
    if (!data.marcaId) errors.push("La marca es requerida");
    if (!data.linea) errors.push("La línea es requerida");
    if (!data.material) errors.push("El material es requerido");
    if (!data.color) errors.push("El color es requerido");
    if (!data.precioBase || parseFloat(data.precioBase) <= 0) {
        errors.push("El precio base debe ser mayor a 0");
    }
    
    // Validar sucursales
    let sucursales = data.sucursales;
    if (typeof sucursales === "string") {
        try {
            sucursales = JSON.parse(sucursales);
        } catch (e) {
            errors.push("Formato de sucursales inválido");
            return errors;
        }
    }
    
    if (!Array.isArray(sucursales) || sucursales.length === 0) {
        errors.push("Debe seleccionar al menos una sucursal");
    } else {
        sucursales.forEach((sucursal, index) => {
            if (!sucursal.sucursalId) {
                errors.push(`Sucursal ${index + 1}: ID de sucursal requerido`);
            }
            if (!sucursal.nombreSucursal?.trim()) {
                errors.push(`Sucursal ${index + 1}: Nombre de sucursal requerido`);
            }
            if (sucursal.stock < 0) {
                errors.push(`Sucursal ${index + 1}: El stock no puede ser negativo`);
            }
        });
    }
    
    // Validar precios si está en promoción
    if (data.enPromocion === 'true' || data.enPromocion === true) {
        const precioBase = parseFloat(data.precioBase);
        const precioActual = parseFloat(data.precioActual);
        
        if (!precioActual || precioActual <= 0) {
            errors.push("El precio promocional debe ser mayor a 0");
        } else if (precioActual >= precioBase) {
            errors.push("El precio promocional debe ser menor al precio base");
        }
    }
    
    return errors;
};

// ===== SELECT - Obtiene todos los accesorios con paginación =====
accesoriosController.getAccesorios = async (req, res) => {
    try {
        // Parámetros de paginación y filtrado
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
        const skip = (page - 1) * limit;
        
        // Parámetros de filtrado
        const { search, categoria, marca, enPromocion, conStock, precioMin, precioMax } = req.query;
        
        // Construir filtros
        let filters = { activo: true }; // Solo productos activos por defecto
        
        // Filtro de búsqueda por texto
        if (search) {
            filters.$or = [
                { nombre: { $regex: search, $options: 'i' } },
                { descripcion: { $regex: search, $options: 'i' } },
                { material: { $regex: search, $options: 'i' } },
                { color: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Filtro por categoría
        if (categoria) filters.tipo = categoria;
        
        // Filtro por marca
        if (marca) filters.marcaId = marca;
        
        // Filtro por promoción
        if (enPromocion !== undefined) {
            filters.enPromocion = enPromocion === 'true';
        }
        
        // Filtro por rango de precios
        if (precioMin || precioMax) {
            filters.precioActual = {};
            if (precioMin) filters.precioActual.$gte = parseFloat(precioMin);
            if (precioMax) filters.precioActual.$lte = parseFloat(precioMax);
        }
        
        // Filtro por stock
        if (conStock === 'true') {
            filters['sucursales.stock'] = { $gt: 0 };
        } else if (conStock === 'false') {
            filters['sucursales.stock'] = { $lte: 0 };
        }
        
        console.log("Filtros aplicados:", filters);
        
        // Conteo total con filtros
        const total = await accesoriosModel.countDocuments(filters);
        
        // Consulta principal con poblado de relaciones
        const accesorios = await accesoriosModel
            .find(filters)
            .populate('marcaId', 'nombre')
            .populate('tipo', 'nombre')
            .populate('promocionId', 'nombre descuento fechaInicio fechaFin')
            .populate('sucursales.sucursalId', 'nombre')
            .sort({ createdAt: -1 }) // Más recientes primero
            .skip(skip)
            .limit(limit)
            .lean(); // Para mejor rendimiento
        
        console.log(`Encontrados ${accesorios.length} accesorios de ${total} total`);
        
        return res.json({
            success: true,
            data: accesorios,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page < Math.ceil(total / limit),
                hasPrevPage: page > 1
            }
        });
    } catch (error) {
        return handleError(res, error, "Error obteniendo accesorios");
    }
};

// ===== INSERT - Crea un nuevo accesorio =====
accesoriosController.createAccesorios = async (req, res) => {
    try {
        console.log("Datos recibidos:", req.body);
        console.log("Archivos recibidos:", req.files);
        
        // Validar datos básicos
        const validationErrors = validateAccesorioData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Errores de validación",
                errors: validationErrors
            });
        }
        
        // Procesar sucursales
        let sucursales = req.body.sucursales;
        if (typeof sucursales === "string") {
            try {
                sucursales = JSON.parse(sucursales);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Error en el formato de sucursales"
                });
            }
        }
        
        // Procesar imágenes
        let imagenesURLs = [];
        
        // Si se enviaron archivos, subirlos a Cloudinary
        if (req.files && req.files.length > 0) {
            console.log("Subiendo imágenes a Cloudinary...");
            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "accesorios",
                        allowed_formats: ["png", "jpg", "jpeg", "webp"],
                        transformation: [
                            { width: 800, height: 600, crop: "limit" },
                            { quality: "auto" }
                        ]
                    });
                    imagenesURLs.push(result.secure_url);
                } catch (uploadError) {
                    console.error("Error subiendo imagen:", uploadError);
                    return res.status(400).json({
                        success: false,
                        message: "Error subiendo imagen: " + uploadError.message
                    });
                }
            }
        } 
        // Si se enviaron URLs directamente (desde el widget de Cloudinary)
        else if (req.body.imagenes) {
            try {
                const imagenesData = typeof req.body.imagenes === 'string' 
                    ? JSON.parse(req.body.imagenes) 
                    : req.body.imagenes;
                imagenesURLs = Array.isArray(imagenesData) ? imagenesData : [imagenesData];
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Error en el formato de imágenes"
                });
            }
        }
        
        // Validar que haya al menos una imagen
        if (imagenesURLs.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Debe agregar al menos una imagen del producto"
            });
        }
        
        // Determinar precio actual
        const enPromocion = req.body.enPromocion === 'true' || req.body.enPromocion === true;
        const precioActual = enPromocion 
            ? parseFloat(req.body.precioActual) 
            : parseFloat(req.body.precioBase);
        
        // Crear el accesorio
        const nuevoAccesorio = new accesoriosModel({
            nombre: req.body.nombre.trim(),
            descripcion: req.body.descripcion.trim(),
            tipo: req.body.tipo,
            marcaId: req.body.marcaId,
            linea: req.body.linea,
            material: req.body.material,
            color: req.body.color,
            precioBase: parseFloat(req.body.precioBase),
            precioActual: precioActual,
            imagenes: imagenesURLs,
            enPromocion: enPromocion,
            promocionId: enPromocion ? req.body.promocionId : undefined,
            sucursales: sucursales.map(s => ({
                sucursalId: s.sucursalId,
                nombreSucursal: s.nombreSucursal.trim(),
                stock: parseInt(s.stock) || 0
            })),
            // Campos opcionales
            codigoBarras: req.body.codigoBarras?.trim() || undefined,
            pesoGramos: req.body.pesoGramos ? parseFloat(req.body.pesoGramos) : undefined,
            etiquetas: req.body.etiquetas ? req.body.etiquetas.split(',').map(t => t.trim().toLowerCase()) : []
        });
        
        const accesorioGuardado = await nuevoAccesorio.save();
        
        // Poblar las referencias para la respuesta
        await accesorioGuardado.populate([
            { path: 'marcaId', select: 'nombre' },
            { path: 'tipo', select: 'nombre' },
            { path: 'promocionId', select: 'nombre descuento' },
            { path: 'sucursales.sucursalId', select: 'nombre' }
        ]);
        
        console.log("Accesorio creado exitosamente:", accesorioGuardado._id);
        
        return res.status(201).json({
            success: true,
            message: "Accesorio creado exitosamente",
            data: accesorioGuardado
        });
        
    } catch (error) {
        return handleError(res, error, "Error creando accesorio");
    }
};

// ===== UPDATE - Actualiza un accesorio existente =====
accesoriosController.updateAccesorios = async (req, res) => {
    try {
        console.log("Actualizando accesorio ID:", req.params.id);
        console.log("Datos recibidos:", req.body);
        
        // Buscar el accesorio existente
        const accesorioExistente = await accesoriosModel.findById(req.params.id);
        if (!accesorioExistente) {
            return res.status(404).json({
                success: false,
                message: "Accesorio no encontrado"
            });
        }
        
        // Validar datos si se proporcionan
        if (Object.keys(req.body).length > 1) { // Más de un campo (no solo _id)
            const validationErrors = validateAccesorioData(req.body);
            if (validationErrors.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Errores de validación",
                    errors: validationErrors
                });
            }
        }
        
        // Procesar sucursales
        let sucursales = req.body.sucursales;
        if (typeof sucursales === "string") {
            try {
                sucursales = JSON.parse(sucursales);
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Error en el formato de sucursales"
                });
            }
        }
        
        // Procesar imágenes
        let imagenesURLs = accesorioExistente.imagenes || []; // Mantener imágenes existentes por defecto
        
        // Si se enviaron nuevos archivos, subirlos a Cloudinary
        if (req.files && req.files.length > 0) {
            console.log("Subiendo nuevas imágenes a Cloudinary...");
            imagenesURLs = []; // Reemplazar todas las imágenes
            for (const file of req.files) {
                try {
                    const result = await cloudinary.uploader.upload(file.path, {
                        folder: "accesorios",
                        allowed_formats: ["png", "jpg", "jpeg", "webp"],
                        transformation: [
                            { width: 800, height: 600, crop: "limit" },
                            { quality: "auto" }
                        ]
                    });
                    imagenesURLs.push(result.secure_url);
                } catch (uploadError) {
                    console.error("Error subiendo imagen:", uploadError);
                    return res.status(400).json({
                        success: false,
                        message: "Error subiendo imagen: " + uploadError.message
                    });
                }
            }
        } 
        // Si se enviaron URLs directamente (desde el widget)
        else if (req.body.imagenes) {
            try {
                const imagenesData = typeof req.body.imagenes === 'string' 
                    ? JSON.parse(req.body.imagenes) 
                    : req.body.imagenes;
                imagenesURLs = Array.isArray(imagenesData) ? imagenesData : [imagenesData];
            } catch (e) {
                return res.status(400).json({
                    success: false,
                    message: "Error en el formato de imágenes"
                });
            }
        }
        
        // Determinar precio actual
        const enPromocion = req.body.enPromocion === 'true' || req.body.enPromocion === true;
        const precioBase = req.body.precioBase ? parseFloat(req.body.precioBase) : accesorioExistente.precioBase;
        const precioActual = enPromocion 
            ? parseFloat(req.body.precioActual) 
            : precioBase;
        
        // Preparar datos para actualización
        const updateData = {
            nombre: req.body.nombre?.trim() || accesorioExistente.nombre,
            descripcion: req.body.descripcion?.trim() || accesorioExistente.descripcion,
            tipo: req.body.tipo || accesorioExistente.tipo,
            marcaId: req.body.marcaId || accesorioExistente.marcaId,
            linea: req.body.linea || accesorioExistente.linea,
            material: req.body.material || accesorioExistente.material,
            color: req.body.color || accesorioExistente.color,
            precioBase: precioBase,
            precioActual: precioActual,
            imagenes: imagenesURLs,
            enPromocion: enPromocion,
            sucursales: sucursales ? sucursales.map(s => ({
                sucursalId: s.sucursalId,
                nombreSucursal: s.nombreSucursal.trim(),
                stock: parseInt(s.stock) || 0
            })) : accesorioExistente.sucursales,
            // Campos opcionales
            codigoBarras: req.body.codigoBarras?.trim() || accesorioExistente.codigoBarras,
            pesoGramos: req.body.pesoGramos ? parseFloat(req.body.pesoGramos) : accesorioExistente.pesoGramos,
            etiquetas: req.body.etiquetas ? req.body.etiquetas.split(',').map(t => t.trim().toLowerCase()) : accesorioExistente.etiquetas
        };
        
        // Manejar promoción
        if (enPromocion && req.body.promocionId) {
            updateData.promocionId = req.body.promocionId;
        } else {
            updateData.$unset = { promocionId: "" };
        }
        
        // Actualizar el documento
        const accesorioActualizado = await accesoriosModel.findByIdAndUpdate(
            req.params.id,
            updateData,
            { 
                new: true, // Retornar documento actualizado
                runValidators: true // Ejecutar validaciones del schema
            }
        ).populate([
            { path: 'marcaId', select: 'nombre' },
            { path: 'tipo', select: 'nombre' },
            { path: 'promocionId', select: 'nombre descuento' },
            { path: 'sucursales.sucursalId', select: 'nombre' }
        ]);
        
        if (!accesorioActualizado) {
            return res.status(404).json({
                success: false,
                message: "Accesorio no encontrado"
            });
        }
        
        console.log("Accesorio actualizado exitosamente:", accesorioActualizado._id);
        
        return res.json({
            success: true,
            message: "Accesorio actualizado exitosamente",
            data: accesorioActualizado
        });
        
    } catch (error) {
        return handleError(res, error, "Error actualizando accesorio");
    }
};

// ===== DELETE - Elimina un accesorio =====
accesoriosController.deleteAccesorios = async (req, res) => {
    try {
        console.log("Eliminando accesorio ID:", req.params.id);
        
        // Buscar y eliminar el accesorio
        const accesorioEliminado = await accesoriosModel.findByIdAndDelete(req.params.id);
        
        if (!accesorioEliminado) {
            return res.status(404).json({
                success: false,
                message: "Accesorio no encontrado"
            });
        }
        
        // Opcional: Eliminar imágenes de Cloudinary
        if (accesorioEliminado.imagenes && accesorioEliminado.imagenes.length > 0) {
            try {
                for (const imageUrl of accesorioEliminado.imagenes) {
                    // Extraer public_id de la URL de Cloudinary
                    const publicId = imageUrl.split('/').pop().split('.')[0];
                    await cloudinary.uploader.destroy(`accesorios/${publicId}`);
                }
                console.log("Imágenes eliminadas de Cloudinary");
            } catch (cloudinaryError) {
                console.warn("Error eliminando imágenes de Cloudinary:", cloudinaryError.message);
                // No fallar la operación por esto
            }
        }
        
        console.log("Accesorio eliminado exitosamente:", req.params.id);
        
        return res.json({
            success: true,
            message: "Accesorio eliminado exitosamente"
        });
        
    } catch (error) {
        return handleError(res, error, "Error eliminando accesorio");
    }
};

// ===== SELECT BY ID - Obtiene un accesorio específico =====
accesoriosController.getAccesorioById = async (req, res) => {
    try {
        console.log("Buscando accesorio ID:", req.params.id);
        
        const accesorio = await accesoriosModel
            .findById(req.params.id)
            .populate('marcaId', 'nombre lineas')
            .populate('tipo', 'nombre descripcion')
            .populate('promocionId', 'nombre descuento fechaInicio fechaFin activa')
            .populate('sucursales.sucursalId', 'nombre direccion telefono');
        
        if (!accesorio) {
            return res.status(404).json({
                success: false,
                message: "Accesorio no encontrado"
            });
        }
        
        return res.json({
            success: true,
            data: accesorio
        });
        
    } catch (error) {
        return handleError(res, error, "Error obteniendo accesorio");
    }
};

// ===== SELECT BY MARCA - Obtiene accesorios por marca =====
accesoriosController.getAccesoriosByMarca = async (req, res) => {
    try {
        console.log("Buscando accesorios por marca ID:", req.params.marcaId);
        
        const accesorios = await accesoriosModel
            .find({ 
                marcaId: req.params.marcaId,
                activo: true
            })
            .populate('marcaId', 'nombre')
            .populate('tipo', 'nombre')
            .populate('promocionId', 'nombre descuento')
            .populate('sucursales.sucursalId', 'nombre')
            .sort({ createdAt: -1 });
        
        return res.json({
            success: true,
            data: accesorios,
            total: accesorios.length
        });
        
    } catch (error) {
        return handleError(res, error, "Error obteniendo accesorios por marca");
    }
};

// ===== SELECT PROMOCIONES - Obtiene accesorios en promoción =====
accesoriosController.getAccesoriosEnPromocion = async (req, res) => {
    try {
        console.log("Buscando accesorios en promoción");
        
        const accesorios = await accesoriosModel
            .find({ 
                enPromocion: true,
                activo: true
            })
            .populate('marcaId', 'nombre')
            .populate('tipo', 'nombre')
            .populate('promocionId', 'nombre descuento fechaInicio fechaFin activa')
            .populate('sucursales.sucursalId', 'nombre')
            .sort({ createdAt: -1 });
        
        // Filtrar solo promociones activas (opcional)
        const promocionesActivas = accesorios.filter(accesorio => {
            if (!accesorio.promocionId) return false;
            const ahora = new Date();
            const inicio = new Date(accesorio.promocionId.fechaInicio);
            const fin = new Date(accesorio.promocionId.fechaFin);
            return ahora >= inicio && ahora <= fin && accesorio.promocionId.activa;
        });
        
        return res.json({
            success: true,
            data: promocionesActivas,
            total: promocionesActivas.length
        });
        
    } catch (error) {
        return handleError(res, error, "Error obteniendo accesorios en promoción");
    }
};

// ===== ENDPOINTS ADICIONALES ÚTILES =====

// Obtener accesorios con poco stock
accesoriosController.getAccesoriosBajoStock = async (req, res) => {
    try {
        const limite = parseInt(req.query.limite) || 10;
        
        const accesorios = await accesoriosModel.aggregate([
            { $match: { activo: true } },
            { $unwind: "$sucursales" },
            { $match: { "sucursales.stock": { $lte: limite } } },
            { $group: {
                _id: "$_id",
                nombre: { $first: "$nombre" },
                marcaId: { $first: "$marcaId" },
                tipo: { $first: "$tipo" },
                stockTotal: { $sum: "$sucursales.stock" },
                sucursales: { $push: "$sucursales" }
            }},
            { $sort: { stockTotal: 1 } }
        ]);
        
        // Poblar referencias
        await accesoriosModel.populate(accesorios, [
            { path: 'marcaId', select: 'nombre' },
            { path: 'tipo', select: 'nombre' },
            { path: 'sucursales.sucursalId', select: 'nombre' }
        ]);
        
        return res.json({
            success: true,
            data: accesorios,
            total: accesorios.length,
            limite: limite
        });
        
    } catch (error) {
        return handleError(res, error, "Error obteniendo accesorios con bajo stock");
    }
};

// Obtener estadísticas de accesorios
accesoriosController.getEstadisticasAccesorios = async (req, res) => {
    try {
        const estadisticas = await accesoriosModel.aggregate([
            {
                $facet: {
                    total: [{ $match: { activo: true } }, { $count: "total" }],
                    enPromocion: [{ $match: { activo: true, enPromocion: true } }, { $count: "total" }],
                    stockTotal: [
                        { $match: { activo: true } },
                        { $unwind: "$sucursales" },
                        { $group: { _id: null, total: { $sum: "$sucursales.stock" } } }
                    ],
                    precioPromedio: [
                        { $match: { activo: true } },
                        { $group: { _id: null, promedio: { $avg: "$precioActual" } } }
                    ],
                    porMarca: [
                        { $match: { activo: true } },
                        { $group: { _id: "$marcaId", total: { $sum: 1 } } },
                        { $sort: { total: -1 } },
                        { $limit: 5 }
                    ],
                    porCategoria: [
                        { $match: { activo: true } },
                        { $group: { _id: "$tipo", total: { $sum: 1 } } },
                        { $sort: { total: -1 } }
                    ]
                }
            }
        ]);
        
        const result = estadisticas[0];
        
        return res.json({
            success: true,
            data: {
                totalAccesorios: result.total[0]?.total || 0,
                enPromocion: result.enPromocion[0]?.total || 0,
                stockTotal: result.stockTotal[0]?.total || 0,
                precioPromedio: Math.round((result.precioPromedio[0]?.promedio || 0) * 100) / 100,
                topMarcas: result.porMarca,
                porCategoria: result.porCategoria
            }
        });
        
    } catch (error) {
        return handleError(res, error, "Error obteniendo estadísticas");
    }
};

// Actualizar stock masivo
accesoriosController.updateStockMasivo = async (req, res) => {
    try {
        const { updates } = req.body; // Array de { accesorioId, sucursalId, nuevoStock }
        
        if (!Array.isArray(updates) || updates.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Se requiere un array de actualizaciones"
            });
        }
        
        const resultados = [];
        
        for (const update of updates) {
            try {
                const accesorio = await accesoriosModel.findById(update.accesorioId);
                if (accesorio) {
                    const sucursal = accesorio.sucursales.find(s => 
                        s.sucursalId.toString() === update.sucursalId.toString()
                    );
                    
                    if (sucursal) {
                        sucursal.stock = update.nuevoStock;
                        await accesorio.save();
                        resultados.push({ 
                            accesorioId: update.accesorioId, 
                            sucursalId: update.sucursalId, 
                            exito: true 
                        });
                    } else {
                        resultados.push({ 
                            accesorioId: update.accesorioId, 
                            sucursalId: update.sucursalId, 
                            exito: false, 
                            error: "Sucursal no encontrada" 
                        });
                    }
                } else {
                    resultados.push({ 
                        accesorioId: update.accesorioId, 
                        exito: false, 
                        error: "Accesorio no encontrado" 
                    });
                }
            } catch (error) {
                resultados.push({ 
                    accesorioId: update.accesorioId, 
                    exito: false, 
                    error: error.message 
                });
            }
        }
        
        const exitosos = resultados.filter(r => r.exito).length;
        
        return res.json({
            success: true,
            message: `${exitosos} de ${updates.length} actualizaciones completadas`,
            resultados: resultados
        });
        
    } catch (error) {
        return handleError(res, error, "Error en actualización masiva de stock");
    }
};

export default accesoriosController;