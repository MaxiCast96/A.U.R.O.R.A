// ===== MODELO CITAS =====
import mongoose from "mongoose";

const citaSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clientes", // Referencia al cliente que agenda la cita
        required: true,
    },
    optometristaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Optometrista", // Referencia al optometrista asignado
        required: true,
    },
    sucursalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sucursales", // Sucursal donde se realizará la cita
        required: true,
    },
    fecha: {
        type: Date,
        required: true, // Fecha de la cita
    },
    hora: {
        type: String,
        required: true, // Hora de la cita en formato string
    },
    estado: {
        type: String,
        enum: ["agendada", "pendiente", "confirmada", "cancelada", "completada"], // Estados de la cita
        default: "agendada", // Por defecto queda agendada
    },
    motivoCita: {
        type: String,
        required: true, // Razón de la cita (examen, revisión, etc.)
    },
    tipoLente: {
        type: String,
        required: true, // Tipo de lente que necesita el cliente
    },
    graduacion: {
        type: String,
        required: true, // Graduación actual o aproximada
    },
    notasAdicionales: {
        type: String,
        default: "", // Notas extras sobre la cita
    }
}, { timestamps: true }); // Agrega createdAt y updatedAt

export default mongoose.model("Citas", citaSchema);