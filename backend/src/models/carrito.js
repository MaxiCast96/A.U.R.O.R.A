import { Schema, model } from "mongoose";

const carritoSchema = new Schema(
  {
    clienteId: {
      type: Schema.Types.ObjectId,
      ref: "Cliente",
      required: true,
    },
    productos: [
      {
        tipoProducto: {
          type: String,
          required: true,
        },
        productoId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        cantidad: {
          type: Number,
          required: true,
          min: 1,
        },
        precioUnitario: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default model("Carrito", carritoSchema);