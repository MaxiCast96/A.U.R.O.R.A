// ===== RUTAS CARRITO =====
import express from 'express';
import carritosController from '../controllers/CarritoController.js';

const router = express.Router();

// Rutas principales CRUD para carritos
router.route("/")
    .get(carritosController.getCarritos) // GET /api/carrito - Obtener todos los carritos
    .post(carritosController.createCarrito); // POST /api/carrito - Crear nuevo carrito

// Rutas para manejo de carrito específico por ID
router.route("/:id")
    .get(carritosController.getCarritoById) // GET /api/carrito/:id - Obtener carrito por ID
    .put(carritosController.updateCarrito) // PUT /api/carrito/:id - Actualizar carrito
    .delete(carritosController.deleteCarrito); // DELETE /api/carrito/:id - Eliminar carrito

// Rutas específicas para gestión de productos dentro del carrito
router.route("/:id/productos")
    .post(carritosController.addProductoToCarrito) // POST /api/carrito/:id/productos - Agregar producto
    .delete(carritosController.removeProductoFromCarrito); // DELETE - Remover producto del carrito

// Ruta para obtener carritos filtrados por cliente
router.route("/cliente/:clienteId")
    .get(carritosController.getCarritosByCliente); // GET /api/carrito/cliente/:clienteId

export default router;