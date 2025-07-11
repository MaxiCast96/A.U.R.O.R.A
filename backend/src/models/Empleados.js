import { Schema, model } from 'mongoose';

const empleadoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es obligatorio'], trim: true },
    apellido: { type: String, required: [true, 'El apellido es obligatorio'], trim: true },
    dui: { type: String, required: [true, 'El DUI es obligatorio'], unique: true, trim: true },
    telefono: { type: String, required: [true, 'El teléfono es obligatorio'], trim: true },
    correo: { type: String, required: [true, 'El correo es obligatorio'], unique: true, trim: true, lowercase: true },
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
    cargo: { type: String, required: [true, 'El cargo es obligatorio'], enum: ['Administrador', 'Gerente', 'Vendedor', 'Optometrista', 'Técnico', 'Recepcionista'] },
    sucursalId: { type: Schema.Types.ObjectId, ref: 'Sucursales', required: [true, 'La sucursal es obligatoria'] },
    fechaContratacion: { type: Date, required: [true, 'La fecha de contratación es obligatoria'] },
    salario: { type: Number, required: [true, 'El salario es obligatorio'], min: 0 },
    estado: {
        type: String,
        enum: ['Activo', 'Inactivo'],
        default: 'Activo'
    },
    password: { type: String, required: [true, 'La contraseña es obligatoria'], minlength: 6 },
    isVerified: {
        type: Boolean,
        default: false,
    },
    fotoPerfil: {
        type: String,
        required: false,
        default: ""
    },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
}, {
    timestamps: true,
    strict: true
});

export default model('Empleados', empleadoSchema);