// ===== MODELO PEDIDOS =====
import { Schema, model } from 'mongoose';

const pedidoItemSchema = new Schema({
  productoId: { type: Schema.Types.ObjectId, required: false },
  nombre: { type: String, required: true },
  categoria: { type: String, required: false },
  tipo: { type: String, enum: ['aro', 'lente', 'personalizado', 'otro'], default: 'otro' },
  cantidad: { type: Number, default: 1, min: 1 },
  precioUnitario: { type: Number, default: 0, min: 0 },
  subtotal: { type: Number, default: 0, min: 0 },
}, { _id: false });

const pedidosSchema = new Schema({
  clienteId: { type: Schema.Types.ObjectId, ref: 'Clientes', required: true },
  ventaId: { type: Schema.Types.ObjectId, ref: 'ventas', required: false },
  cotizacionId: { type: Schema.Types.ObjectId, ref: 'cotizaciones', required: false },
  carritoId: { type: Schema.Types.ObjectId, ref: 'carrito', required: false },
  items: { type: [pedidoItemSchema], default: [] },
  total: { type: Number, required: true, min: 0 },
  estado: { type: String, enum: ['creado', 'en_proceso', 'enviado', 'entregado', 'cancelado'], default: 'creado' },
  fecha: { type: Date, default: Date.now },
  notas: { type: String, required: false },
}, {
  timestamps: true,
  strict: true,
});

export default model('pedidos', pedidosSchema);
