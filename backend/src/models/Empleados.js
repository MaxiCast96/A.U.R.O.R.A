// ===== MODELO EMPLEADOS =====
import { Schema, model } from 'mongoose';

const empleadoSchema = new Schema({
    nombre: { 
        type: String, 
        required: [true, 'El nombre es obligatorio'], 
        trim: true // Elimina espacios en blanco
    },
    apellido: { 
        type: String, 
        required: [true, 'El apellido es obligatorio'], 
        trim: true 
    },
    dui: { 
        type: String, 
        required: [true, 'El DUI es obligatorio'], 
        unique: true, // No puede repetirse
        trim: true 
    },
    telefono: { 
        type: String, 
        required: [true, 'El teléfono es obligatorio'], 
        trim: true 
    },
    correo: { 
        type: String, 
        required: [true, 'El correo es obligatorio'], 
        unique: true, // No puede repetirse
        trim: true, 
        lowercase: true // Convierte a minúsculas
    },
    direccion: { // Dirección del empleado
        departamento: { 
            type: String, 
            required: false,
            trim: true,
            default: ""
        },
        municipio: { 
            type: String, 
            required: false,
            trim: true,
            default: ""
        },
        direccionDetallada: { 
            type: String, 
            required: false,
            trim: true,
            default: ""
        }
    },
    cargo: { 
        type: String, 
        required: [true, 'El cargo es obligatorio'], 
        enum: ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'] // Cargos permitidos
    },
    sucursalId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Sucursales', // Sucursal donde trabaja
        required: [true, 'La sucursal es obligatoria'] 
    },
    fechaContratacion: { 
        type: Date, 
        required: [true, 'La fecha de contratación es obligatoria'] 
    },
    salario: { 
        type: Number, 
        required: [true, 'El salario es obligatorio'], 
        min: 0 // No puede ser negativo
    },
    estado: {
        type: String,
        enum: ['Activo', 'Inactivo'], // Estados del empleado
        default: 'Activo'
    },
    password: { 
        type: String, 
        required: [true, 'La contraseña es obligatoria'], 
        minlength: 6 // Mínimo 6 caracteres
    },
    isVerified: {
        type: Boolean,
        default: false, // Por defecto no verificado
    },
    fotoPerfil: {
        type: String,
        required: false, // URL de la foto de perfil
        default: ""
    },
    resetPasswordToken: { type: String }, // Token para resetear contraseña
    resetPasswordExpires: { type: Date }, // Expiración del token
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('Empleados', empleadoSchema);