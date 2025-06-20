import { Schema, model } from 'mongoose';

const citaSchema = new Schema({
    clientId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true,
    },
    optometristaId: {
        type: Schema.Types.ObjectId,
        ref: 'Empleados',
        required: true,
    },
    sucursalId: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursales',
        required: true,
    },
    fecha: {
        type: Date,
        required: true,
    },
    hora: {
        type: String,
        required: true,
    },
    estado: {
        type: String,
        required: true,
        enum: ['agendada', 'confirmada', 'completada', 'cancelada', 'reprogramada'], // Posibles estados de la cita
        default: 'agendada',
    },
    motivoCita: {
        type: String,
        required: true,
    },
    tipoLente: {
        type: String,
        required: false,
    },
    graduacion: {
        type: String,
        required: false,
    },
    notasAdicionales: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    strict: true
});

export default model('Citas', citaSchema);