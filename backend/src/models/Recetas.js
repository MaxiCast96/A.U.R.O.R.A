// ===== MODELO RECETAS =====
import { Schema, model } from 'mongoose';

const recetaSchema = new Schema({
    historialMedicoId: { 
        type: Schema.Types.ObjectId, 
        ref: 'historialMedico', // Referencia al historial médico del cliente
        required: [true, 'El historial médico es obligatorio'] 
    },
    optometristaId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Optometrista', // Optometrista que emite la receta
        required: [true, 'El optometrista es obligatorio'] 
    },
    fecha: { 
        type: Date, 
        required: [true, 'La fecha es obligatoria'], 
        default: Date.now // Por defecto la fecha actual
    },
    diagnostico: { 
        type: String, 
        required: [true, 'El diagnóstico es obligatorio'] // Diagnóstico del examen
    },
    ojoDerecho: { // Graduación para ojo derecho
        esfera: { 
            type: Number, 
            required: [true, 'La esfera OD es obligatoria'] // Corrección esférica
        },
        cilindro: { 
            type: Number, 
            required: [true, 'El cilindro OD es obligatorio'] // Corrección cilíndrica
        },
        eje: { 
            type: Number, 
            required: [true, 'El eje OD es obligatorio'] // Eje del astigmatismo
        },
        adicion: { 
            type: Number, 
            default: 0 // Adición para lentes bifocales/progresivos
        }
    },
    ojoIzquierdo: { // Graduación para ojo izquierdo
        esfera: { 
            type: Number, 
            required: [true, 'La esfera OI es obligatoria'] // Corrección esférica
        },
        cilindro: { 
            type: Number, 
            required: [true, 'El cilindro OI es obligatorio'] // Corrección cilíndrica
        },
        eje: { 
            type: Number, 
            required: [true, 'El eje OI es obligatorio'] // Eje del astigmatismo
        },
        adicion: { 
            type: Number, 
            default: 0 // Adición para lentes bifocales/progresivos
        }
    },
    observaciones: {
        type: String,
        required: false // Observaciones adicionales del optometrista
    },
    vigencia: { 
        type: Number, 
        required: [true, 'La vigencia es obligatoria'], 
        default: 12 // Vigencia en meses (por defecto 12)
    },
    urlReceta: {
        type: String,
        required: false // URL del documento de receta generado
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('recetas', recetaSchema);