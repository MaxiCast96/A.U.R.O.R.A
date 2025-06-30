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

// Rutas por ID
router.route("/:id")
    .get(promocionesController.getPromocionById)
    .put(promocionesController.updatePromocion)
    .delete(promocionesController.deletePromocion);

export default router;