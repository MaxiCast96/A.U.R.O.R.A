// ===== RUTAS CLIENTES =====
import express from 'express';
import clientesController from '../controllers/ClientesController.js';

const router = express.Router();

// Rutas principales CRUD para clientes
router.route("/")
    .get(clientesController.getClientes) // GET /api/clientes - Obtener todos los clientes
    .post(clientesController.createClientes); // POST /api/clientes - Registrar nuevo cliente

// Rutas para manejo de cliente específico por ID
router.route("/:id")
    .get(clientesController.getClienteById) // GET /api/clientes/:id - Obtener cliente por ID
    .put(clientesController.updateClientes) // PUT /api/clientes/:id - Actualizar datos del cliente
    .delete(clientesController.deleteClientes); // DELETE /api/clientes/:id - Eliminar cliente

// Rutas específicas para autenticación y recuperación
router.post('/login', clientesController.loginUnificado); // POST /api/clientes/login - Login de cliente
router.post('/forgot-password', clientesController.forgotPassword); // POST - Solicitar recuperación
router.post('/reset-password', clientesController.resetPassword); // POST - Resetear contraseña

export default router;
