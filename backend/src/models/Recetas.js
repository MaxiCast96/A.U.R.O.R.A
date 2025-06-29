import { Schema, model } from 'mongoose';

const recetaSchema = new Schema({
    historialMedicoId: {
        type: Schema.Types.ObjectId,
        ref: 'HistorialMedico',
        required: true,
    },
    optometristaId: {
        type: Schema.Types.ObjectId,
        ref: 'Optometrista',
        required: true,
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    diagnostico: {
        type: String,
        required: true,
    },
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
            default: 0
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
            default: 0
        }
    },
    observaciones: {
        type: String,
        required: false
    },
    vigencia: {
        type: Number,
        required: true,
        default: 12 // meses
    },
    urlReceta: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    strict: true
});

export default model('Recetas', recetaSchema);