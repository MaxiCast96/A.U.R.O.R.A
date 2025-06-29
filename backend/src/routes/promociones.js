import express from 'express';

const router = express.Router();
import promocionesController from '../controllers/PromocionesController.js';

// Rutas principales CRUD
router.route("/")
    .get(promocionesController.getPromociones)
    .post(promocionesController.createPromocion);

// Ruta para obtener solo promociones activas
router.route("/activas")
    .get(promocionesController.getPromocionesActivas);

// Ruta para buscar por código de promoción
router.route("/codigo/:codigo")
    .get(promocionesController.getPromocionByCodigo);

// Ruta para incrementar uso de promoción
router.route("/:id/usar")
    .patch(promocionesController.incrementarUsoPromocion);

// Rutas por ID
router.route("/:id")
    .get(promocionesController.getPromocionById)
    .put(promocionesController.updatePromocion)
    .delete(promocionesController.deletePromocion);

export default router;