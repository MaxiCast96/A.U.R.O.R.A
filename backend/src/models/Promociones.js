// ===== MODELO PROMOCIONES MEJORADO =====
import { Schema, model } from 'mongoose';

const promocionSchema = new Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    descripcion: {
        type: String,
        required: true,
        trim: true
    },
    tipoDescuento: {
        type: String,
        required: true,
        enum: ['porcentaje', 'monto', '2x1'], // Corregido: 'monto' en lugar de 'monto_fijo'
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
    fechaInicio: {
        type: Date,
        required: true
    },
    fechaFin: {
        type: Date,
        required: true
    },
    codigoPromo: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    // NUEVO: Campo para imagen de la promoción
    imagenPromocion: {
        type: String,
        required: false, // Opcional
        default: null
    },
    // NUEVO: Metadatos de la imagen
    imagenMetadata: {
        publicId: String, // ID de Cloudinary para poder eliminar la imagen
        width: Number,
        height: Number,
        format: String
    },
    activo: {
        type: Boolean,
        required: true,
        default: true
    },
    // NUEVO: Campos adicionales útiles
    prioridad: {
        type: Number,
        default: 0, // Para ordenar promociones en el carrusel
        min: 0,
        max: 10
    },
    mostrarEnCarrusel: {
        type: Boolean,
        default: true // Si se debe mostrar en el carrusel principal
    },
    usos: {
        type: Number,
        default: 0, // Contador de veces que se ha usado la promoción
        min: 0
    },
    limiteUsos: {
        type: Number,
        default: null, // Límite máximo de usos (null = ilimitado)
        min: 1
    }
}, {
    timestamps: true // Agrega createdAt y updatedAt automáticamente
});

// Validación personalizada para el valor de descuento
promocionSchema.pre('save', function(next) {
    // Validar porcentaje
    if (this.tipoDescuento === 'porcentaje' && this.valorDescuento > 100) {
        next(new Error('El descuento por porcentaje no puede ser mayor a 100%'));
        return;
    }

    // Validar fechas
    if (this.fechaFin <= this.fechaInicio) {
        next(new Error('La fecha de fin debe ser posterior a la fecha de inicio'));
        return;
    }

    // Validar límite de usos
    if (this.limiteUsos !== null && this.usos > this.limiteUsos) {
        next(new Error('Los usos no pueden exceder el límite establecido'));
        return;
    }

    next();
});

// Índices para mejor rendimiento
promocionSchema.index({ codigoPromo: 1 });
promocionSchema.index({ activo: 1, fechaInicio: 1, fechaFin: 1 });
promocionSchema.index({ mostrarEnCarrusel: 1, prioridad: -1 });
promocionSchema.index({ aplicaA: 1 });

// Método para verificar si la promoción está vigente
promocionSchema.methods.estaVigente = function() {
    const ahora = new Date();
    return this.activo && 
           this.fechaInicio <= ahora && 
           this.fechaFin >= ahora &&
           (this.limiteUsos === null || this.usos < this.limiteUsos);
};

// Método para obtener el estado de la promoción
promocionSchema.methods.getEstado = function() {
    const ahora = new Date();
    
    if (!this.activo) return 'Inactiva';
    if (this.limiteUsos && this.usos >= this.limiteUsos) return 'Agotada';
    if (ahora < this.fechaInicio) return 'Programada';
    if (ahora > this.fechaFin) return 'Expirada';
    
    return 'Activa';
};

export default model('Promociones', promocionSchema);