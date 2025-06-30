import { Schema, model } from 'mongoose';

const ventasSchema = new Schema({
    carritoId: {
        type: Schema.Types.ObjectId,
        ref: 'Carrito',
        required: true,
    },
    empleadoId: {
        type: Schema.Types.ObjectId,
        ref: 'Empleados',
        required: true,
    },
    sucursalId: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursales',
        required: true,
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'procesada', 'completada', 'cancelada', 'refund'],
        default: 'pendiente'
    },
    datosPago: {
        metodoPago: {
            type: String,
            required: true,
            enum: ['efectivo', 'tarjeta_credito', 'tarjeta_debito', 'transferencia', 'cheque']
        },
        montoPagado: {
            type: Number,
            required: true,
            min: 0
        },
        montoTotal: {
            type: Number,
            required: true,
            min: 0
        },
        cambio: {
            type: Number,
            default: 0,
            min: 0
        },
        numeroTransaccion: {
            type: String,
            required: function() {
                return this.datosPago.metodoPago !== 'efectivo';
            }
        }
    },
    facturaDatos: {
        numeroFactura: {
            type: String,
            required: true,
            unique: true
        },
        clienteId: {
            type: Schema.Types.ObjectId,
            ref: 'Clientes',
            required: true
        },
        nombreCliente: {
            type: String,
            required: true
        },
        duiCliente: {
            type: String,
            required: true
        },
        direccionCliente: {
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
            required: true,
            min: 0
        },
        iva: {
            type: Number,
            required: true,
            min: 0
        },
        total: {
            type: Number,
            required: true,
            min: 0
        }
    },
    observaciones: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    strict: true
});

// Middleware para generar número de factura automáticamente
ventasSchema.pre('save', async function(next) {
    if (this.isNew && !this.facturaDatos.numeroFactura) {
        const count = await this.constructor.countDocuments();
        this.facturaDatos.numeroFactura = `FAC-${Date.now()}-${count + 1}`;
    }
    next();
});

export default model('Ventas', ventasSchema);