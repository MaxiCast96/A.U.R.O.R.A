// ===== RUTAS PEDIDOS =====
import express from 'express';
import pedidosController from '../controllers/PedidosController.js';

const router = express.Router();

// GET /api/pedidos - listar pedidos
router.route('/')
  .get(pedidosController.getPedidos);

// GET /api/pedidos/:id - pedido por id
router.route('/:id')
  .get(pedidosController.getPedidoById);

// PATCH /api/pedidos/:id/estado - actualizar estado del pedido
router.route('/:id/estado')
  .patch(pedidosController.updateEstado);

export default router;
