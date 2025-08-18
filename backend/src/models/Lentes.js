// ===== MODELO LENTES =====
import { Schema, model } from 'mongoose';

const LentesSchema = new Schema({
    nombre: {
        type: String,
        required: true, // Nombre del modelo de lentes
    },
    descripcion: {
        type: String,
        required: true, // Descripción del producto
    },
    categoriaId: {
         type: Schema.Types.ObjectId,
        ref: 'Categoria', // Categoría del lente
        required: true,
    },
    marcaId: {
         type: Schema.Types.ObjectId,
        ref: 'Marcas', // Marca del lente
        required: true,
    },
    material: {
        type: String,
        required: true // Material del armazón
    },
     color: {
        type: String,
        required: true // Color del armazón
    },
     tipoLente: {
        type: String,
        required: true // Tipo (graduado, sol, bifocal, etc.)
    },
     precioBase: {
        type: Number,
        required: true // Precio original
    },
      precioActual: {
        type: Number,
        required: true // Precio actual (con descuentos)
    },
      linea: {
        type: String,
        required: true // Línea de producto (Premium, Económica)
    },
    medidas: { // Dimensiones físicas del lente
        anchoPuente: {
            type: Number,
            required: true // Ancho del puente nasal
        },
        altura: {
            type: Number,
            required: true // Altura del lente
        },
        ancho: {
            type: Number,
            required: true // Ancho total del armazón
        }
    },
    imagenes: [
        {
            type: String // URLs de las imágenes del producto
        }
    ],
    enPromocion: {
        type: Boolean,
        default: false, // Por defecto no está en promoción
        required: true,
    },
    promocionId: {
        type: Schema.Types.ObjectId,
        ref: 'Promociones', // Promoción aplicada si aplica
        required: function () {
            return this.enPromocion; // Solo requerido si está en promoción
        },
    },
    fechaCreacion: {
        type: Date,
        required: true // Fecha de creación del producto
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
                required: true, // Nombre para referencia rápida
            },
            stock: {
                type: Number,
                required: true, // Cantidad disponible
                min: 0
            }
        }
    ]
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('Lentes', LentesSchema);
