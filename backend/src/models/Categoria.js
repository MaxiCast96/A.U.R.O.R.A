import { Schema, model } from 'mongoose';

const categoriaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    icono: {
        type: String
    }
}, {
    timestamps: true,
    strict: true
});

export default model('Categoria', categoriaSchema);