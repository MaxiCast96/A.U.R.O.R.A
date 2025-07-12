// ===== MODELO OPTOMETRISTA =====
import { Schema, model } from 'mongoose';

const optometristaSchema = new Schema({
    empleadoId: {
        type: Schema.Types.ObjectId,
        ref: 'Empleados', // Referencia al empleado base
        required: true,
    },
    especialidad: {
        type: String,
        required: true, // Especialidad del optometrista
    },
    licencia: {
        type: String,
        required: true, // Número de licencia profesional
    },
    experiencia: {
        type: Number,
        required: true // Años de experiencia
    },
    disponibilidad: [ // Horarios de trabajo
        {
            dia: { type: String, required: true }, // Día de la semana
            horaInicio: { type: String, required: true }, // Hora de inicio
            horaFin: { type: String, required: true } // Hora de fin
        }
    ],
    sucursalesAsignadas: [ // Sucursales donde puede trabajar
        {
            type: Schema.Types.ObjectId,
            ref: 'Sucursales',
            required: true,
        }
    ],
    disponible: {
        type: Boolean,
        required: true // Si está disponible para citas
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('Optometrista', optometristaSchema);