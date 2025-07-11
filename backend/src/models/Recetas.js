import { Schema, model } from 'mongoose';

const recetaSchema = new Schema({
    historialMedicoId: { type: Schema.Types.ObjectId, ref: 'historialMedico', required: [true, 'El historial médico es obligatorio'] },
    optometristaId: { type: Schema.Types.ObjectId, ref: 'Optometrista', required: [true, 'El optometrista es obligatorio'] },
    fecha: { type: Date, required: [true, 'La fecha es obligatoria'], default: Date.now },
    diagnostico: { type: String, required: [true, 'El diagnóstico es obligatorio'] },
    ojoDerecho: {
        esfera: { type: Number, required: [true, 'La esfera OD es obligatoria'] },
        cilindro: { type: Number, required: [true, 'El cilindro OD es obligatorio'] },
        eje: { type: Number, required: [true, 'El eje OD es obligatorio'] },
        adicion: { type: Number, default: 0 }
    },
    ojoIzquierdo: {
        esfera: { type: Number, required: [true, 'La esfera OI es obligatoria'] },
        cilindro: { type: Number, required: [true, 'El cilindro OI es obligatorio'] },
        eje: { type: Number, required: [true, 'El eje OI es obligatorio'] },
        adicion: { type: Number, default: 0 }
    },
    observaciones: {
        type: String,
        required: false
    },
    vigencia: { type: Number, required: [true, 'La vigencia es obligatoria'], default: 12 },
    urlReceta: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    strict: true
});

export default model('recetas', recetaSchema);