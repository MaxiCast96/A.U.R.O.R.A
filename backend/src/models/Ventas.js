// ===== MODELO VENTAS =====
import { Schema, model } from 'mongoose';

const ventasSchema = new Schema({
    carritoId: {
        type: Schema.Types.ObjectId,
        ref: 'Carrito', // Carrito que se convierte en venta
        required: true,
    },
    empleadoId: {
        type: Schema.Types.ObjectId,
        ref: 'Empleados', // Empleado que procesa la venta
        required: true,
    },
    sucursalId: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursales', // Sucursal donde se realiza la venta
        required: true,
    },
    fecha: {
        type: Date,
        required: true, // Fecha de la venta
        default: Date.now
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'procesada', 'completada', 'cancelada', 'refund'], // Estados de la venta
        default: 'pendiente'
    },
    datosPago: { // Información del pago
        metodoPago: {
            type: String,
            required: true,
            enum: ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque'] // Métodos de pago
        },
        montoPagado: {
            type: Number,
            required: true, // Monto que pagó el cliente
            min: 0
        },
        montoTotal: {
            type: Number,
            required: true, // Monto total de la venta
            min: 0
        },
        cambio: {
            type: Number,
            default: 0, // Cambio devuelto (solo para efectivo)
            min: 0
        },
        numeroTransaccion: {
            type: String,
            required: function() {
                return this.datosPago.metodoPago !== 'efectivo'; // Solo requerido para pagos electrónicos
            }
        }
    },
    facturaDatos: { // Datos para la factura
        numeroFactura: {
            type: String,
            required: true, // Número único de factura
            unique: true
        },
        clienteId: {
            type: Schema.Types.ObjectId,
            ref: 'Clientes', // Cliente que compra
            required: true
        },
        nombreCliente: {
            type: String,
            required: true // Nombre del cliente para la factura
        },
        duiCliente: {
            type: String,
            required: true // DUI del cliente para la factura
        },
        direccionCliente: { // Dirección del cliente para la factura
            calle: {
                type: String,
                required: true
            },
            ciudad: {
                type: String,
                required: true
            },
            departamento: {
                type: String,
                required: true
            }
        },
        subtotal: {
            type: Number,
            required: true, // Subtotal antes de impuestos
            min: 0
        },
        total: {
            type: Number,
            required: true, // Total final de la factura
            min: 0
        }
    },
    observaciones: {
        type: String,
        required: false // Observaciones adicionales sobre la venta
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

// Middleware para generar número de factura automáticamente
ventasSchema.pre('save', async function(next) {
    if (this.isNew && !this.facturaDatos.numeroFactura) {
        const count = await this.constructor.countDocuments(); // Contar documentos existentes
        this.facturaDatos.numeroFactura = `FAC-${Date.now()}-${count + 1}`; // Generar número único
    }
    next();
});

export default model('ventas', ventasSchema);