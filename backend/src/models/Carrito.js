// ===== MODELO CARRITO =====
import { Schema, model } from 'mongoose';

const carritosSchema = new Schema({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes', // Referencia al cliente propietario del carrito
        required: true
    },
    productos: [{ // Array de productos en el carrito
        productoId: {
            type: Schema.Types.ObjectId,
            required: true // ID del producto (puede ser lente, accesorio, etc.)
        },
        nombre: {
            type: String,
            required: true // Nombre del producto para mostrar
        },
        precio: {
            type: Number,
            required: true // Precio unitario del producto
        },
        cantidad: {
            type: Number,
            required: true, // Cantidad de este producto
            min: 1 // Mínimo 1 producto
        },
        subtotal: {
            type: Number,
            required: true // Precio * cantidad
        }
    }],
    total: {
        type: Number,
        required: true, // Suma de todos los subtotales
        default: 0
    },
    estado: {
        type: String,
        enum: ['activo', 'finalizado', 'cancelado'], // Estados posibles del carrito
        default: 'activo' // Por defecto está activo
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

// Middleware para calcular el total automáticamente antes de guardar
carritosSchema.pre('save', function(next) {
    this.total = this.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
    next();
});

export default model('carrito', carritosSchema);