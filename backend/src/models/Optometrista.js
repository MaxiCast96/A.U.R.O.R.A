import { Schema, model } from 'mongoose';

const optometristaSchema = new Schema({
    
    empleadoId: {
        type: Schema.Types.ObjectId,
        ref: 'Empleados',
        required: true,
    },
    especialidad: {
        type: String,
        required: true,
    },
    licencia: {
        type: String,
        required: true,
    },
    experiencia: {
        type: Number,
        required: true
    },
    disponibilidad: {
        dia: {
            type: String,
            required: true
        },
        horaInicio: {
            type: String,
            required: true
        },
        horaFin: {
            type: String,
            required: true
        }
    },
   sucursalesAsignadas: [
        {
            type: Schema.Types.ObjectId,
                    ref: 'Sucursales',
                    required: true,
        }
    ],
    disponible: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true,
    strict: true
});

export default model('Optometrista', optometristaSchema);