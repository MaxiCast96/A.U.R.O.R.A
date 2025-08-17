// ===== CONTROLLER PEDIDOS =====
import pedidosModel from "../models/Pedidos.js";

const pedidosController = {};

// GET /api/pedidos - listar pedidos (con datos básicos del cliente)
pedidosController.getPedidos = async (req, res) => {
  try {
    const pedidos = await pedidosModel
      .find()
      .populate('clienteId', 'nombre apellido correo telefono')
      .sort({ createdAt: -1 });
    res.json(pedidos);
  } catch (error) {
    console.log('Error: ' + error);
    res.status(500).json({ message: 'Error obteniendo pedidos: ' + error.message });
  }
};

// GET /api/pedidos/:id - obtener un pedido
pedidosController.getPedidoById = async (req, res) => {
  try {
    const pedido = await pedidosModel
      .findById(req.params.id)
      .populate('clienteId', 'nombre apellido correo telefono');
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (error) {
    console.log('Error: ' + error);
    res.status(500).json({ message: 'Error obteniendo pedido: ' + error.message });
  }
};

export default pedidosController;
