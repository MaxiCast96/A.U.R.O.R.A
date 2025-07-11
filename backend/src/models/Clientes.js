import { Schema, model } from 'mongoose';

const clientesSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'],
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio'],
    },
    edad: {
        type: Number,
        required: [true, 'La edad es obligatoria']
    },
    dui: {
        type: String,
        required: [true, 'El DUI es obligatorio'],
        unique: true
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'],
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'],
        unique: true,
        lowercase: true, // Forzar minúsculas
        trim: true
    },
    direccion: {
        calle: {
            type: String,
            required: [true, 'La calle es obligatoria']
        },
        ciudad: {
            type: String,
            required: [true, 'La ciudad es obligatoria']
        },
        departamento: {
            type: String,
            required: [true, 'El departamento es obligatorio']
        }
    },
    password: {
        type: String,
        required: [true, 'La contraseña es obligatoria']
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    // --- CAMPO AÑADIDO ---
    estado: {
        type: String,
        required: [true, 'El estado es obligatorio'],
        default: 'Activo' // Valor por defecto
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, {
    timestamps: true,
    strict: true
});

export default model('Clientes', clientesSchema);