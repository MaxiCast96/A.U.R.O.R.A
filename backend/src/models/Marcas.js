// ===== MODELO MARCAS =====
import { Schema, model } from 'mongoose';

const marcaSchema = new Schema({
    nombre: {
        type: String,
        required: true, // Nombre de la marca
        unique: true // No puede repetirse
    },
    descripcion: {
        type: String,
        required: true, // Descripción de la marca
    },
    logo: {
        type: String,
        required: false, // URL del logo de la marca
    },
    paisOrigen: {
        type: String,
        required: true, // País de origen de la marca
    },
    lineas: [ // Líneas de productos que maneja
        {
            type: String,
            enum: ['Premium', 'Económica'], // Tipos de línea permitidos
            required: true
        }
    ]
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('Marcas', marcaSchema);