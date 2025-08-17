// ===== RUTAS PRODUCTOS PERSONALIZADOS =====
import express from 'express';
import productosPersonalizadosController from '../controllers/ProductosPersonalizadosController.js';

const router = express.Router();

// Rutas principales CRUD para productos personalizados
router.route("/")
    .get(productosPersonalizadosController.getProductosPersonalizados) // GET - Obtener todos
    .post(productosPersonalizadosController.createProductoPersonalizado); // POST - Crear nuevo

// Rutas para manejo de producto personalizado específico por ID
router.route("/:id")
    .get(productosPersonalizadosController.getProductoPersonalizadoById) // GET - Obtener por ID
    .put(productosPersonalizadosController.updateProductoPersonalizado) // PUT - Actualizar
    .delete(productosPersonalizadosController.deleteProductoPersonalizado); // DELETE - Eliminar

// Rutas específicas para consultas filtradas

// GET /api/productosPersonalizados/cliente/:clienteId - Productos de un cliente
router.route("/cliente/:clienteId")
    .get(productosPersonalizadosController.getProductosByCliente);

// GET /api/productosPersonalizados/estado/:estado - Filtrar por estado del proceso
router.route("/estado/:estado")
    .get(productosPersonalizadosController.getProductosByEstado);

// PATCH /api/productosPersonalizados/:id/estado - Actualizar solo el estado
router.route("/:id/estado")
    .patch(productosPersonalizadosController.updateEstado);

// PATCH /api/productosPersonalizados/:id/vinculos - Actualizar cotizacionId/pedidoId y estado
router.route("/:id/vinculos")
    .patch(productosPersonalizadosController.updateVinculos);

// GET /api/productosPersonalizados/estadisticas/resumen - Estadísticas y resumen
router.route("/estadisticas/resumen")
    .get(productosPersonalizadosController.getEstadisticas);

export default router;