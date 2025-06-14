import { Schema, model } from "mongoose";

const promocionSchema = new Schema(
  {
    nombre: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    tipoDescuento: {
      type: String,
      required: true,
    },
    valorDescuento: {
      type: Number,
      required: true,
    },
    aplicaA: {
      type: String,
      required: true,
    },
    idsAplicacion: {
      type: Array,
      required: true,
    },
    fechaInicio: {
      type: String,
      required: true,
    },
    fechaFin: {
      type: String,
      required: true,
    },
    codigoPromo: {
      type: String,
      required: true,
    },
    activo: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Promocion", promocionSchema);