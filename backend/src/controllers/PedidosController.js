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

// PATCH /api/pedidos/:id/estado - actualizar estado del pedido
pedidosController.updateEstado = async (req, res) => {
  try {
    const { estado } = req.body || {};
    if (!estado) return res.status(400).json({ message: 'estado requerido' });
    const permitido = ['creado','en_proceso','enviado','entregado','cancelado'];
    if (!permitido.includes(estado)) {
      return res.status(400).json({ message: 'estado inválido' });
    }
    const pedido = await pedidosModel.findByIdAndUpdate(
      req.params.id,
      { estado },
      { new: true }
    ).populate('clienteId','nombre apellido correo telefono');
    if (!pedido) return res.status(404).json({ message: 'Pedido no encontrado' });
    return res.json({ message: 'Estado de pedido actualizado', pedido });
  } catch (error) {
    console.log('Error: ' + error);
    return res.status(500).json({ message: 'Error actualizando estado de pedido: ' + error.message });
  }
};
