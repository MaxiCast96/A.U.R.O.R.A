// ===== MODELO HISTORIAL MÉDICO =====
import { Schema, model } from 'mongoose';

const HistorialMedicoSchema = new Schema({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes', // Cliente propietario del historial
        required: true,
    },
    padecimientos: { // Problemas de salud visual
        tipo: {
            type: String,
            required: true // Tipo de padecimiento (miopía, astigmatismo, etc.)
        },
        descripcion: {
            type: String,
            required: true // Descripción detallada
        },
        fechaDeteccion: {
            type: Date,
            required: true // Cuándo se detectó
        }
    },
    historialVisual: { // Registro de exámenes visuales
        fecha: {
            type: Date,
            required: true // Fecha del examen
        },
        diagnostico: {
            type: String,
            required: true // Diagnóstico del optometrista
        },
        receta: { // Graduación prescrita
            ojoDerecho: {
                esfera: {
                    type: Number,
                    required: true // Corrección esférica OD
                },
                cilindro: {
                    type: Number,
                    required: true // Corrección cilíndrica OD
                },
                eje: {
                    type: Number,
                    required: true // Eje del cilindro OD
                },
                adicion: {
                    type: Number,
                    required: true // Adición para bifocales OD
                }
            },
            ojoIzquierdo: {
                esfera: {
                    type: Number,
                    required: true // Corrección esférica OI
                },
                cilindro: {
                    type: Number,
                    required: true // Corrección cilíndrica OI
                },
                eje: {
                    type: Number,
                    required: true // Eje del cilindro OI
                },
                adicion: {
                    type: Number,
                    required: true // Adición para bifocales OI
                }
            }
        }
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('historialMedico', HistorialMedicoSchema);