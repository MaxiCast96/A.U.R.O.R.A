import { Schema, model } from 'mongoose';

const productosPersonalizadosSchema = new Schema({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true,
    },
    productoBaseId: {
        type: Schema.Types.ObjectId,
        ref: 'Lentes',
        required: true,
    },
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    categoria: {
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
    tipoLente: {
        type: String,
        required: true,
    },
    precioCalculado: {
        type: Number,
        required: true,
        min: 0
    },
    detallesPersonalizacion: {
        receta: {
            ojoDerecho: {
                esfera: {
                    type: Number,
                    required: false
                },
                cilindro: {
                    type: Number,
                    required: false
                },
                eje: {
                    type: Number,
                    required: false
                },
                adicion: {
                    type: Number,
                    required: false
                }
            },
            ojoIzquierdo: {
                esfera: {
                    type: Number,
                    required: false
                },
                cilindro: {
                    type: Number,
                    required: false
                },
                eje: {
                    type: Number,
                    required: false
                },
                adicion: {
                    type: Number,
                    required: false
                }
            }
        },
        modificacionesEspeciales: {
            type: String,
            required: false
        },
        instruccionesAdicionales: {
            type: String,
            required: false
        }
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'en_proceso', 'completado', 'cancelado', 'entregado'],
        default: 'pendiente'
    },
    fechaSolicitud: {
        type: Date,
        required: true,
        default: Date.now
    },
    fechaEntregaEstimada: {
        type: Date,
        required: true
    },
    cotizacion: {
        total: {
            type: Number,
            required: true,
            min: 0
        },
        validaHasta: {
            type: Date,
            required: true
        },
        estado: {
            type: String,
            required: true,
            enum: ['vigente', 'expirada', 'aceptada', 'rechazada'],
            default: 'vigente'
        },
        recetaUrl: {
            type: String,
            required: false
        },
        urlCotizacion: {
            type: String,
            required: false
        }
    }
}, {
    timestamps: true,
    strict: true
});

export default model('ProductosPersonalizados', productosPersonalizadosSchema);