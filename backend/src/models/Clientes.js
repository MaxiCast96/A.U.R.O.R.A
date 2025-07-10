import { Schema, model } from 'mongoose';

const clientesSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    apellido: {
        type: String,
        required: true,
    },
    edad: {
        type: Number,
        required: true
    },
    dui: {
        type: String,
        required: true,
        unique: true
    },
    telefono: {
        type: String,
        required: true,
    },
    correo: {
        type: String,
        required: true,
        unique: true
    },
    direccion: {
        calle: {
            type: String,
            required: true
        },
        ciudad: {
            type: String,
            required: true
        },
        departamento: {
            type: String,
            required: true
        }
    },
    password: {
        type: String,
        required: true
    },
    // --- CAMPO AÑADIDO ---
    estado: {
        type: String,
        required: true,
        default: 'Activo' // Valor por defecto
    }
}, {
    timestamps: true,
    strict: true
});

export default model('Clientes', clientesSchema);