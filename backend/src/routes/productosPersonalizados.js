import express from 'express';

const router = express.Router();
import productosPersonalizadosController from '../controllers/ProductosPersonalizadosController.js';

// Rutas principales
router.route("/")
    .get(productosPersonalizadosController.getProductosPersonalizados)
    .post(productosPersonalizadosController.createProductoPersonalizado);

// Rutas por ID
router.route("/:id")
    .get(productosPersonalizadosController.getProductoPersonalizadoById)
    .put(productosPersonalizadosController.updateProductoPersonalizado)
    .delete(productosPersonalizadosController.deleteProductoPersonalizado);

// Rutas específicas
router.route("/cliente/:clienteId")
    .get(productosPersonalizadosController.getProductosByCliente);

router.route("/estado/:estado")
    .get(productosPersonalizadosController.getProductosByEstado);

router.route("/:id/estado")
    .patch(productosPersonalizadosController.updateEstado);

router.route("/estadisticas/resumen")
    .get(productosPersonalizadosController.getEstadisticas);

export default router;