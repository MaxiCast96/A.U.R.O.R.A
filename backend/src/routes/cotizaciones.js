import express from 'express';
import cotizacionesController from '../controllers/CotizacionesController.js';

const router = express.Router();

// Rutas principales CRUD
router.route("/")
    .get(cotizacionesController.getCotizaciones)
    .post(cotizacionesController.createCotizacion);

router.route("/:id")
    .get(cotizacionesController.getCotizacionById)
    .put(cotizacionesController.updateCotizacion)
    .delete(cotizacionesController.deleteCotizacion);

// Rutas adicionales específicas

// Obtener cotizaciones por cliente
router.get("/cliente/:clienteId", cotizacionesController.getCotizacionesByCliente);

// Obtener cotizaciones por estado
router.get("/estado/:estado", cotizacionesController.getCotizacionesByEstado);

// Actualizar solo el estado de una cotización
router.patch("/:id/estado", cotizacionesController.updateEstadoCotizacion);

// Actualizar cotizaciones expiradas (tarea de mantenimiento)
router.post("/actualizar-expiradas", cotizacionesController.actualizarCotizacionesExpiradas);

export default router;