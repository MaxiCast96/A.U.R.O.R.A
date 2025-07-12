// ===== RUTAS PROMOCIONES =====
import express from 'express';
import promocionesController from '../controllers/PromocionesController.js';

const router = express.Router();

// Rutas principales CRUD para promociones
router.route("/")
    .get(promocionesController.getPromociones) // GET /api/promociones - Obtener todas
    .post(promocionesController.createPromocion); // POST /api/promociones - Crear nueva

// IMPORTANTE: Rutas específicas ANTES de rutas con parámetros

// GET /api/promociones/activas - Obtener solo promociones actualmente activas
router.route("/activas")
    .get(promocionesController.getPromocionesActivas);

// GET /api/promociones/codigo/:codigo - Buscar promoción por código específico
router.route("/codigo/:codigo")
    .get(promocionesController.getPromocionByCodigo);

// Rutas para manejo de promoción específica por ID
router.route("/:id")
    .get(promocionesController.getPromocionById) // GET /api/promociones/:id - Obtener por ID
    .put(promocionesController.updatePromocion) // PUT /api/promociones/:id - Actualizar promoción
    .delete(promocionesController.deletePromocion); // DELETE /api/promociones/:id - Eliminar

export default router;