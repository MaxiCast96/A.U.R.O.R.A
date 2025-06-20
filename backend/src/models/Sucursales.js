import { Schema, model } from 'mongoose';

const sucursalSchema = new Schema({
    nombre: {
        type: String,
        required: true,
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
    telefono: {
        type: String,
        required: true,
    },
    correo: {
        type: String,
        required: true,
    },
    horariosAtencion: [
        {
            dia: {
                type: String
            },
            apertura: {
                type: String
            },
            cierre: {
                type: String
            }
        }
    ],
    activo: {
        type: Boolean,
        required: true
    }
}, {
    timestamps: true,
    strict: true
});

export default model('Sucursales', sucursalSchema);