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
        enum: ['categoria', 'lente', 'todos'],
        default: 'todos'
    },
    categoriasAplicables: [{
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: function() {
            return this.aplicaA === 'categoria';
        }
    }],
    lentesAplicables: [{
        type: Schema.Types.ObjectId,
        ref: 'Lentes',
        required: function() {
            return this.aplicaA === 'lente';
        }
    }],
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
    }
},);

// Validación para valor de descuento según tipo
promocionSchema.pre('save', function(next) {
    if (this.tipoDescuento === 'porcentaje' && this.valorDescuento > 100) {
        next(new Error('El descuento por porcentaje no puede ser mayor a 100%'));
    }
    next();
});

export default model('promociones', promocionSchema);