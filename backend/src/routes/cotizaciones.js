// ===== RUTAS COTIZACIONES =====
import express from 'express';
import cotizacionesController from '../controllers/CotizacionesController.js';

const router = express.Router();

// Rutas principales CRUD para cotizaciones
router.route("/")
    .get(cotizacionesController.getCotizaciones) // GET /api/cotizaciones - Obtener todas las cotizaciones
    .post(cotizacionesController.createCotizacion); // POST /api/cotizaciones - Crear nueva cotización

// Rutas para manejo de cotización específica por ID
router.route("/:id")
    .get(cotizacionesController.getCotizacionById) // GET /api/cotizaciones/:id - Obtener por ID
    .put(cotizacionesController.updateCotizacion) // PUT /api/cotizaciones/:id - Actualizar cotización
    .delete(cotizacionesController.deleteCotizacion); // DELETE /api/cotizaciones/:id - Eliminar

// Rutas específicas para consultas filtradas

// GET /api/cotizaciones/cliente/:clienteId - Cotizaciones de un cliente específico
router.get("/cliente/:clienteId", cotizacionesController.getCotizacionesByCliente);

// GET /api/cotizaciones/estado/:estado - Filtrar por estado (pendiente, aprobada, etc.)
router.get("/estado/:estado", cotizacionesController.getCotizacionesByEstado);

// PATCH /api/cotizaciones/:id/estado - Actualizar solo el estado de una cotización
router.patch("/:id/estado", cotizacionesController.updateEstadoCotizacion);

// POST /api/cotizaciones/:id/convertir-a-pedido - Convierte una cotización en un pedido
router.post("/:id/convertir-a-pedido", cotizacionesController.convertirACedido);

// POST /api/cotizaciones/actualizar-expiradas - Tarea de mantenimiento para expirar cotizaciones
router.post("/actualizar-expiradas", cotizacionesController.actualizarCotizacionesExpiradas);

export default router;