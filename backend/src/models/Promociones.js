// ===== MODELO PROMOCIONES =====
import { Schema, model } from 'mongoose';

const promocionSchema = new Schema({
    nombre: {
        type: String,
        required: true, // Nombre de la promoción
    },
    descripcion: {
        type: String,
        required: true, // Descripción de la promoción
    },
    tipoDescuento: {
        type: String,
        required: true,
        enum: ['porcentaje', 'monto_fijo'], // Tipo de descuento
        default: 'porcentaje'
    },
    valorDescuento: {
        type: Number,
        required: true, // Valor del descuento (% o monto)
        min: 0
    },
    aplicaA: {
        type: String,
        required: true,
        enum: ['categoria', 'lente', 'todos'], // A qué aplica la promoción
        default: 'todos'
    },
    categoriasAplicables: [{ // Categorías donde aplica (si aplicaA = 'categoria')
        type: Schema.Types.ObjectId,
        ref: 'Categoria',
        required: function() {
            return this.aplicaA === 'categoria';
        }
    }],
    lentesAplicables: [{ // Lentes específicos donde aplica (si aplicaA = 'lente')
        type: Schema.Types.ObjectId,
        ref: 'Lentes',
        required: function() {
            return this.aplicaA === 'lente';
        }
    }],
    idsAplicacion: [{ // IDs genéricos de aplicación
        type: Schema.Types.ObjectId,
        required: false
    }],
    fechaInicio: {
        type: Date,
        required: true, // Fecha de inicio de la promoción
    },
    fechaFin: {
        type: Date,
        required: true, // Fecha de fin de la promoción
    },
    codigoPromo: {
        type: String,
        required: true, // Código único de la promoción
        unique: true, // No puede repetirse
        uppercase: true // Convierte a mayúsculas automáticamente
    },
    activo: {
        type: Boolean,
        required: true, // Si la promoción está activa
        default: true
    }
});

// Validación personalizada para el valor de descuento
promocionSchema.pre('save', function(next) {
    if (this.tipoDescuento === 'porcentaje' && this.valorDescuento > 100) {
        next(new Error('El descuento por porcentaje no puede ser mayor a 100%'));
    }
    next();
});

export default model('Promocion', promocionSchema);