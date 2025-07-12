// ===== MODELO ACCESORIOS =====
import { Schema, model } from 'mongoose';

const accesorioSchema = new Schema({
    nombre: {
        type: String,
        required: true, // Nombre del accesorio (ej: estuche, cadena, paño)
    },
    descripcion: {
        type: String,
        required: true, // Descripción detallada del accesorio
    },
    tipo: {
        type: String,
        required: true, // Tipo de accesorio (ej: limpieza, protección, decorativo)
    },
    marcaId: {
        type: Schema.Types.ObjectId,
        ref: 'Marcas', // Referencia a la marca del accesorio
        required: true,
    },
    material: {
        type: String,
        required: true, // Material del que está hecho (ej: cuero, tela, plástico)
    },
    color: {
        type: String,
        required: true, // Color del accesorio
    },
    precioBase: {
        type: Number,
        required: true, // Precio original sin descuentos
        min: 0, // No puede ser negativo
    },
    precioActual: {
        type: Number,
        required: true, // Precio actual (puede incluir descuentos)
        min: 0, // No puede ser negativo
    },
    imagenes: [
        {
            type: String // URLs de las imágenes del accesorio
        }
    ],
    enPromocion: {
        type: Boolean,
        default: false, // Por defecto no está en promoción
        required: true,
    },
    promocionId: {
        type: Schema.Types.ObjectId,
        ref: 'Promocion', // Referencia a la promoción aplicada
        required: function () {
            return this.enPromocion; // Solo requerido si está en promoción
        },
    },
    sucursales: [ // Stock por sucursal
        {
            sucursalId: {
                type: Schema.Types.ObjectId,
                ref: 'Sucursales', // Referencia a la sucursal
                required: true,
            },
            nombreSucursal: {
                type: String,
                required: true, // Nombre de la sucursal para referencia rápida
            },
            stock: {
                type: Number,
                required: true, // Cantidad disponible en esta sucursal
                min: 0 // No puede ser negativo
            }
        }
    ]
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    strict: true // Solo permite campos definidos en el schema
});

export default model('Accesorios', accesorioSchema);