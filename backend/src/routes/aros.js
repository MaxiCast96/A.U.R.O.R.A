// ===== RUTAS AROS =====
import express from 'express';
import multer from 'multer';
import arosController from '../controllers/arosController.js';

const router = express.Router();

// ⚠️ CRÍTICO: Configurar multer para manejar multipart/form-data
// Usar memoria temporal porque Cloudinary maneja la subida desde el frontend
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
        files: 5 // máximo 5 archivos
    }
});

// ===== RUTAS ESPECÍFICAS PRIMERO =====
// IMPORTANTE: Las rutas más específicas deben ir antes de las genéricas

// GET - Obtener aros populares
router.get("/populares", arosController.getArosPopulares);

// GET - Obtener aros en promoción
router.get("/promociones/activas", arosController.getArosByPromocion);

// GET - Obtener aros por marca
router.get("/marca/:marcaId", arosController.getArosByIdMarca);

// ===== RUTAS PRINCIPALES =====

// Ruta principal "/"
router.route("/")
  .get((req, res, next) => {
    // Soporte para query parameter ?popular=true
    if (req.query.popular === 'true') {
      return arosController.getArosPopulares(req, res, next);
    }
    return arosController.getAros(req, res, next);
  })
  // ⚠️ CRÍTICO: Agregar multer para POST
  .post(upload.any(), arosController.createAros);

// Rutas por ID "/:id"
router.route("/:id")
  .get(arosController.getArosById)
  // ⚠️ CRÍTICO: Agregar multer para PUT
  .put(upload.any(), arosController.updateAros)
  .delete(arosController.deleteAros);

export default router;