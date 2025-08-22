// ===== MODELO CATEGORIA =====
import { Schema, model } from 'mongoose';

const categoriaSchema = new Schema({
    nombre: {
        type: String,
        required: true, // Nombre de la categoría (ej: Graduados, Sol, Bifocales)
    },
    descripcion: {
        type: String,
        required: true, // Descripción de la categoría
    },
    icono: {
        type: String // URL o nombre del icono para la UI
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('Categoria', categoriaSchema);