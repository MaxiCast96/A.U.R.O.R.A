import { Schema, model } from 'mongoose';

const LentesSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    categoriaId: {
         type: Schema.Types.ObjectId,
        ref: 'Categoria',
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
        unique: true
    },
     color: {
        type: String,
        required: true,
        unique: true
    },
     tipoLente: {
        type: String,
        required: true,
        unique: true
    },
     precioBase: {
        type: Number,
        required: true,
        unique: true
    },
      precioActual: {
        type: Number,
        required: true,
        unique: true
    },
      linea: {
        type: String,
        required: true,
        unique: true
    },
    medidas: {
        anchoPuente: {
            type: Number,
            required: true
        },
        altura: {
            type: Number,
            required: true
        },
        ancho: {
            type: Number,
            required: true
        }
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
    fechaCreacion: {
        type: Date,
        required: true
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

export default model('Lentes', LentesSchema);