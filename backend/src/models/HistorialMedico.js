import { Schema, model } from 'mongoose';

const HistorialMedicoSchema = new Schema({
    
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true,
    },
    padecimientos: {
        tipo: {
            type: String,
            required: true
        },
        descripcion: {
            type: String,
            required: true
        },
        fechaDeteccion: {
            type: Date,
            required: true
        }
    },
     historialVisual: {
        fecha: {
            type: Date,
            required: true
        },
        diagnostico: {
            type: String,
            required: true
        },
        receta: {
            ojoDerecho: {
                esfera: {
                    type: Number,
                    required: true
                },
                cilindro: {
                    type: Number,
                    required: true
                },
                eje: {
                    type: Number,
                    required: true
                },
                adicion: {
                    type: Number,
                    required: true
                }
            },
            ojoIzquierdo: {
                esfera: {
                    type: Number,
                    required: true
                },
                cilindro: {
                    type: Number,
                    required: true
                },
                eje: {
                    type: Number,
                    required: true
                },
                adicion: {
                    type: Number,
                    required: true
                }
            }
        }
    }
}, {
    timestamps: true,
    strict: true
});

export default model('historialMedico', HistorialMedicoSchema);