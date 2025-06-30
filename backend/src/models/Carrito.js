import { Schema, model } from 'mongoose';

const carritosSchema = new Schema({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true
    },
    productos: [{
        productoId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        nombre: {
            type: String,
            required: true
        },
        precio: {
            type: Number,
            required: true
        },
        cantidad: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true
        }
    }],
    total: {
        type: Number,
        required: true,
        default: 0
    },
    estado: {
        type: String,
        enum: ['activo', 'finalizado', 'cancelado'],
        default: 'activo'
    }
}, {
    timestamps: true,
    strict: true
});

// Middleware para calcular el total antes de guardar
carritosSchema.pre('save', function(next) {
    this.total = this.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
    next();
});

export default model('Carritos', carritosSchema);