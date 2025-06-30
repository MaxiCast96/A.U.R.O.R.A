import express from 'express';
import carritosController from '../controllers/CarritoController.js';

const router = express.Router();

// Rutas principales
router.route("/")
    .get(carritosController.getCarritos)
    .post(carritosController.createCarrito);

router.route("/:id")
    .get(carritosController.getCarritoById)
    .put(carritosController.updateCarrito)
    .delete(carritosController.deleteCarrito);

// Rutas específicas para manejo de productos en el carrito
router.route("/:id/productos")
    .post(carritosController.addProductoToCarrito)
    .delete(carritosController.removeProductoFromCarrito);

// Ruta para obtener carritos por cliente
router.route("/cliente/:clienteId")
    .get(carritosController.getCarritosByCliente);

export default router;