import { Schema, model } from 'mongoose';

const promocionSchema = new Schema({
    nombre: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        required: true,
    },
    tipoDescuento: {
        type: String,
        required: true,
        enum: ['porcentaje', 'monto_fijo'],
        default: 'porcentaje'
    },
    valorDescuento: {
        type: Number,
        required: true,
        min: 0
    },
    aplicaA: {
        type: String,
        required: true,
        enum: ['lente', 'accesorio', 'consulta', 'todos'],
        default: 'todos'
    },
    idsAplicacion: [{
        type: Schema.Types.ObjectId,
        required: false
    }],
    fechaInicio: {
        type: Date,
        required: true,
    },
    fechaFin: {
        type: Date,
        required: true,
    },
    codigoPromo: {
        type: String,
        required: true,
        unique: true,
        uppercase: true
    },
    activo: {
        type: Boolean,
        required: true,
        default: true
    },
    limiteUsos: {
        type: Number,
        required: false,
        min: 1
    },
    usosActuales: {
        type: Number,
        required: true,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    strict: true
});

// Validación personalizada para fechas
promocionSchema.pre('save', function(next) {
    if (this.fechaFin <= this.fechaInicio) {
        next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
    }
    next();
});

// Validación para valor de descuento según tipo
promocionSchema.pre('save', function(next) {
    if (this.tipoDescuento === 'porcentaje' && this.valorDescuento > 100) {
        next(new Error('El descuento por porcentaje no puede ser mayor a 100%'));
    }
    next();
});

export default model('Promocion', promocionSchema);