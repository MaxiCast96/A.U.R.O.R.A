// ===== RUTAS ACCESORIOS ACTUALIZADAS =====
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import accesoriosController from "../controllers/AccesoriosController.js";

const router = express.Router();

// ===== CONFIGURACIÓN DE MULTER PARA SUBIDA DE ARCHIVOS =====
// Crear directorio temporal si no existe
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

// Configuración de almacenamiento temporal
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para evitar conflictos
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname).toLowerCase();
        cb(null, 'accesorio-' + uniqueSuffix + extension);
    }
});

// Filtro de archivos - solo imágenes
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, JPG, PNG, WEBP)'));
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB por archivo
        files: 5 // Máximo 5 archivos por request
    }
});

// Middleware para limpiar archivos temporales después de procesar
const cleanupTempFiles = (req, res, next) => {
    const originalEnd = res.end;
    res.end = function(...args) {
        // Limpiar archivos temporales
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            req.files.forEach(file => {
                fs.unlink(file.path, (err) => {
                    if (err) console.warn('Error eliminando archivo temporal:', err.message);
                });
            });
        }
        originalEnd.apply(this, args);
    };
    next();
};

// ===== MIDDLEWARE DE VALIDACIÓN =====
const validateAccesorioId = (req, res, next) => {
    const { id } = req.params;
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
        return res.status(400).json({
            success: false,
            message: "ID de accesorio inválido"
        });
    }
    next();
};

// Middleware para debug de req.files - AGREGADO PARA DEBUGGING
const debugFiles = (req, res, next) => {
    console.log('=== DEBUG MIDDLEWARE ===');
    console.log('req.files:', req.files);
    console.log('req.body:', req.body);
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('========================');
    next();
};

// ===== RUTAS ESPECÍFICAS (DEBEN IR ANTES DE LAS RUTAS CON PARÁMETROS) =====

// GET /api/accesorios/promociones/activas - Accesorios en promoción activa
router.get("/promociones/activas", accesoriosController.getAccesoriosEnPromocion);

// GET /api/accesorios/bajo-stock - Accesorios con poco stock
router.get("/bajo-stock", accesoriosController.getAccesoriosBajoStock);

// GET /api/accesorios/estadisticas - Estadísticas generales
router.get("/estadisticas", accesoriosController.getEstadisticasAccesorios);

// PUT /api/accesorios/stock/masivo - Actualización masiva de stock
router.put("/stock/masivo", accesoriosController.updateStockMasivo);

// GET /api/accesorios/marca/:marcaId - Filtrar por marca específica
router.get("/marca/:marcaId", validateAccesorioId, accesoriosController.getAccesoriosByMarca);

// ===== RUTAS PRINCIPALES CRUD =====

// GET /api/accesorios - Obtener todos los accesorios (con filtros y paginación)
// POST /api/accesorios - Crear nuevo accesorio (con imágenes)
router.route("/")
    .get(accesoriosController.getAccesorios)
    .post(
        debugFiles, // Middleware de debug
        upload.array('imagenes', 5), // Máximo 5 imágenes
        cleanupTempFiles,
        accesoriosController.createAccesorios
    );

// ===== RUTAS POR ID =====

// GET /api/accesorios/:id - Obtener accesorio específico
// PUT /api/accesorios/:id - Actualizar accesorio (con imágenes)
// DELETE /api/accesorios/:id - Eliminar accesorio
router.route("/:id")
    .get(validateAccesorioId, accesoriosController.getAccesorioById)
    .put(
        validateAccesorioId,
        debugFiles, // Middleware de debug
        upload.array('imagenes', 5), // Máximo 5 imágenes
        cleanupTempFiles,
        accesoriosController.updateAccesorios
    )
    .delete(validateAccesorioId, accesoriosController.deleteAccesorios);

// ===== MIDDLEWARE DE MANEJO DE ERRORES ESPECÍFICO PARA MULTER =====
router.use((error, req, res, next) => {
    console.error('Error en middleware:', error);
    
    if (error instanceof multer.MulterError) {
        let message = "Error en la subida de archivos";
        
        switch (error.code) {
            case 'LIMIT_FILE_SIZE':
                message = "El archivo es demasiado grande. Máximo 10MB por imagen.";
                break;
            case 'LIMIT_FILE_COUNT':
                message = "Demasiados archivos. Máximo 5 imágenes por producto.";
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                message = "Campo de archivo inesperado.";
                break;
            default:
                message = `Error de Multer: ${error.message}`;
        }
        
        return res.status(400).json({
            success: false,
            message: message,
            code: error.code
        });
    }
    
    // Error de filtro de archivos
    if (error.message.includes('Solo se permiten archivos de imagen')) {
        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
    
    // Otros errores
    return res.status(500).json({
        success: false,
        message: error.message || "Error interno del servidor",
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
});

export default router;