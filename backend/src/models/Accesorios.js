import { Schema, model } from 'mongoose';

const accesorioSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    tipo: {
        type: String,
        required: true,
    },
    marcaId: {
        type: Schema.Types.ObjectId,
        ref: 'Marcas',
        required: true,
    },
    material: {
        type: String,
        required: true,
    },
    color: {
        type: String,
        required: true,
    },
    precioBase: {
        type: Number,
        required: true,
        min: 0,
    },
    precioActual: {
        type: Number,
        required: true,
        min: 0,
    },
    imagenes: [
        {
            type: String
        }
    ],
    enPromocion: {
        type: Boolean,
        default: false,
        required: true,
    },
    promocionId: {
        type: Schema.Types.ObjectId,
        ref: 'Promocion',
        required: function () {
            return this.enPromocion;
        },
    },
    sucursales: [
        {
            sucursalId: {
                type: Schema.Types.ObjectId,
                ref: 'Sucursales',
                required: true,
            },
            nombreSucursal: {
                type: String,
                required: true,
            },
            stock: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ]
}, {
    timestamps: true,
    strict: true
});

export default model('Accesorios', accesorioSchema);