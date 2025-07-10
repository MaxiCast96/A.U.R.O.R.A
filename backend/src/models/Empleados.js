import { Schema, model } from 'mongoose';

const empleadoSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    apellido: {
        type: String,
        required: true,
        trim: true
    },
    dui: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    direccion: {
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
        required: true,
        enum: ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista']
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
    salario: {
        type: Number,
        required: true,
        min: 0
    },
    estado: {
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    fotoPerfil: {
        type: String,
        required: false,
        default: ""
    }
}, {
    timestamps: true,
    strict: true
});

// Índices para optimización
empleadoSchema.index({ correo: 1 });
empleadoSchema.index({ dui: 1 });
empleadoSchema.index({ sucursalId: 1 });

export default model('Empleados', empleadoSchema);