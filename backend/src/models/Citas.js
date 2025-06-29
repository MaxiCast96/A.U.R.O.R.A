import mongoose from "mongoose";

const citaSchema = new mongoose.Schema({
    clienteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Clientes",
        required: true,
    },
    optometristaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Optometrista",
        required: true,
    },
    sucursalId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sucursales",
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
        enum: ["agendada", "pendiente", "confirmada", "cancelada", "completada"],
        default: "agendada",
    },
    motivoCita: {
        type: String,
        required: true,
    },
    tipoLente: {
        type: String,
        required: true,
    },
    graduacion: {
        type: String,
        required: true,
    },
    notasAdicionales: {
        type: String,
        default: "",
    }
}, { timestamps: true });

export default mongoose.model("Citas", citaSchema);