import { Schema, model } from 'mongoose';

const marcaSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        unique: true
    },
    descripcion: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
        required: false,
    },
    paisOrigen: {
        type: String,
        required: true,
    },
    lineas: [ 
        {
            type: String,
            enum: ['Premium', 'Económica'],
            required: true
        }
    ]
}, {
    timestamps: true,
    strict: true
});

export default model('Marcas', marcaSchema);