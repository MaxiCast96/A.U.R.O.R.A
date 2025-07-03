import { Schema, model } from 'mongoose';

const empleadoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    apellido: {
        type: String,
        required: true,
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
    cargo: {
        type: String,
        required: true,
    },
    sucursalId: {
        type: Schema.Types.ObjectId,
        ref: 'Sucursales',
        required: true,
    },
    fechaContratacion: {
        type: Date,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        required: true
    },
    fotoPerfil: {
        type: String,
        required: false
    }
}, {
    timestamps: true,
    strict: true
});

export default model('Empleados', empleadoSchema);