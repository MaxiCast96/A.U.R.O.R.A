// ===== MODELO CLIENTES =====
import { Schema, model } from 'mongoose';

const clientesSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre es obligatorio'], // Nombre del cliente
    },
    apellido: {
        type: String,
        required: [true, 'El apellido es obligatorio'], // Apellido del cliente
    },
    edad: {
        type: Number,
        required: [true, 'La edad es obligatoria'] // Edad del cliente
    },
    dui: {
        type: String,
        required: [true, 'El DUI es obligatorio'], // Documento de identidad único
        unique: true // No puede repetirse
    },
    telefono: {
        type: String,
        required: [true, 'El teléfono es obligatorio'], // Número de contacto
    },
    correo: {
        type: String,
        required: [true, 'El correo es obligatorio'], // Email del cliente
        unique: true, // No puede repetirse
        lowercase: true, // Convierte a minúsculas automáticamente
        trim: true // Elimina espacios en blanco
    },
    direccion: { // Dirección completa del cliente
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
        required: [true, 'La contraseña es obligatoria'] // Contraseña para login
    },
    isVerified: {
        type: Boolean,
        default: false // Por defecto no está verificado
    },
    estado: {
        type: String,
        required: [true, 'El estado es obligatorio'],
        default: 'Activo' // Estado del cliente (Activo/Inactivo)
    },
    resetPasswordToken: { type: String }, // Token para resetear contraseña
    resetPasswordExpires: { type: Date }, // Fecha de expiración del token
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('Clientes', clientesSchema);