// ===== MODELO ACCESORIOS ACTUALIZADO =====
import { Schema, model } from 'mongoose';

const accesorioSchema = new Schema({
    nombre: {
        type: String,
        required: [true, 'El nombre del accesorio es requerido'],
        trim: true,
        minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
        maxlength: [100, 'El nombre no puede exceder 100 caracteres']
    },
    descripcion: {
        type: String,
        required: [true, 'La descripción es requerida'],
        trim: true,
        minlength: [10, 'La descripción debe tener al menos 10 caracteres'],
        maxlength: [500, 'La descripción no puede exceder 500 caracteres']
    },
    tipo: {
        type: Schema.Types.ObjectId,
        ref: 'Categoria', // Referencia a categorías para mejor organización
        required: [true, 'El tipo/categoría es requerido']
    },
    marcaId: {
        type: Schema.Types.ObjectId,
        ref: 'Marcas',
        required: [true, 'La marca es requerida']
    },
    linea: {
        type: String,
        required: [true, 'La línea del producto es requerida'],
        enum: {
            values: ['Económica', 'Estándar', 'Premium', 'Luxury', 'Edición Especial'],
            message: 'La línea debe ser: Económica, Estándar, Premium, Luxury o Edición Especial'
        }
    },
    material: {
        type: String,
        required: [true, 'El material es requerido'],
        enum: {
            values: [
                'Cuero', 'Cuero sintético', 'Tela', 'Plástico', 'Metal', 
                'Silicona', 'Goma', 'Madera', 'Fibra de carbono', 'Otro'
            ],
            message: 'Material no válido'
        }
    },
    color: {
        type: String,
        required: [true, 'El color es requerido'],
        enum: {
            values: [
                'Negro', 'Marrón', 'Blanco', 'Gris', 'Azul', 'Rojo', 
                'Verde', 'Amarillo', 'Naranja', 'Rosa', 'Morado', 'Multicolor'
            ],
            message: 'Color no válido'
        }
    },
    precioBase: {
        type: Number,
        required: [true, 'El precio base es requerido'],
        min: [0.01, 'El precio base debe ser mayor a 0'],
        max: [999999.99, 'El precio base no puede exceder $999,999.99'],
        set: function(val) {
            return Math.round(val * 100) / 100; // Redondear a 2 decimales
        }
    },
    precioActual: {
        type: Number,
        required: [true, 'El precio actual es requerido'],
        min: [0.01, 'El precio actual debe ser mayor a 0'],
        max: [999999.99, 'El precio actual no puede exceder $999,999.99'],
        set: function(val) {
            return Math.round(val * 100) / 100; // Redondear a 2 decimales
        },
        validate: {
            validator: function(val) {
                // Si está en promoción, el precio actual debe ser menor al precio base
                if (this.enPromocion) {
                    return val < this.precioBase;
                }
                return true;
            },
            message: 'El precio promocional debe ser menor al precio base'
        }
    },
    imagenes: [{
        type: String,
        validate: {
            validator: function(val) {
                // Validar que sea una URL válida
                return /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(val);
            },
            message: 'Debe ser una URL válida de imagen (jpg, jpeg, png, webp)'
        }
    }],
    enPromocion: {
        type: Boolean,
        default: false,
        required: true
    },
    promocionId: {
        type: Schema.Types.ObjectId,
        ref: 'Promociones',
        required: function () {
            return this.enPromocion;
        },
        validate: {
            validator: function(val) {
                // Si está en promoción, debe tener un ID de promoción
                if (this.enPromocion && !val) {
                    return false;
                }
                return true;
            },
            message: 'Se requiere una promoción cuando el producto está marcado como en promoción'
        }
    },
    sucursales: [{
        sucursalId: {
            type: Schema.Types.ObjectId,
            ref: 'Sucursales',
            required: [true, 'El ID de la sucursal es requerido']
        },
        nombreSucursal: {
            type: String,
            required: [true, 'El nombre de la sucursal es requerido'],
            trim: true
        },
        stock: {
            type: Number,
            required: [true, 'El stock es requerido'],
            min: [0, 'El stock no puede ser negativo'],
            max: [99999, 'El stock no puede exceder 99,999 unidades'],
            default: 0
        }
    }],
    // Campos adicionales útiles
    activo: {
        type: Boolean,
        default: true // Para poder "desactivar" productos sin eliminarlos
    },
    fechaDescontinuado: {
        type: Date,
        default: null // Para marcar cuando un producto ya no se vende
    },
    codigoBarras: {
        type: String,
        unique: true,
        sparse: true, // Permite valores null sin violar la unicidad
        trim: true
    },
    pesoGramos: {
        type: Number,
        min: [0, 'El peso no puede ser negativo'],
        max: [50000, 'El peso no puede exceder 50kg'] // 50kg máximo
    },
    dimensiones: {
        largo: {
            type: Number,
            min: [0, 'El largo no puede ser negativo'],
            max: [1000, 'El largo no puede exceder 1000cm']
        },
        ancho: {
            type: Number,
            min: [0, 'El ancho no puede ser negativo'],
            max: [1000, 'El ancho no puede exceder 1000cm']
        },
        alto: {
            type: Number,
            min: [0, 'El alto no puede ser negativo'],
            max: [1000, 'El alto no puede exceder 1000cm']
        }
    },
    // Metadatos para SEO y búsquedas
    etiquetas: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    // Información del proveedor
    proveedor: {
        nombre: {
            type: String,
            trim: true
        },
        contacto: {
            type: String,
            trim: true
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            validate: {
                validator: function(val) {
                    if (!val) return true; // Campo opcional
                    return /\S+@\S+\.\S+/.test(val);
                },
                message: 'Email del proveedor no válido'
            }
        }
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt automáticamente
    strict: true, // Solo permite campos definidos en el schema
    toJSON: { 
        virtuals: true,
        transform: function(doc, ret) {
            // Ocultar campos sensibles en la respuesta JSON
            delete ret.__v;
            return ret;
        }
    },
    toObject: { virtuals: true }
});

// ===== ÍNDICES PARA MEJORAR RENDIMIENTO =====
accesorioSchema.index({ nombre: 'text', descripcion: 'text', etiquetas: 'text' }); // Búsqueda de texto
accesorioSchema.index({ marcaId: 1 }); // Filtro por marca
accesorioSchema.index({ tipo: 1 }); // Filtro por categoría
accesorioSchema.index({ enPromocion: 1 }); // Filtro por promociones
accesorioSchema.index({ 'sucursales.sucursalId': 1 }); // Filtro por sucursal
accesorioSchema.index({ precioActual: 1 }); // Filtro por precio
accesorioSchema.index({ activo: 1 }); // Filtro por productos activos
accesorioSchema.index({ createdAt: -1 }); // Ordenar por fecha de creación

// ===== VIRTUALS =====
// Virtual para calcular el descuento porcentual
accesorioSchema.virtual('descuentoPorcentaje').get(function() {
    if (this.enPromocion && this.precioBase > this.precioActual) {
        return Math.round(((this.precioBase - this.precioActual) / this.precioBase) * 100);
    }
    return 0;
});

// Virtual para calcular el ahorro en dinero
accesorioSchema.virtual('ahorroMonto').get(function() {
    if (this.enPromocion && this.precioBase > this.precioActual) {
        return Math.round((this.precioBase - this.precioActual) * 100) / 100;
    }
    return 0;
});

// Virtual para calcular stock total
accesorioSchema.virtual('stockTotal').get(function() {
    return this.sucursales.reduce((total, sucursal) => total + (sucursal.stock || 0), 0);
});

// Virtual para verificar disponibilidad
accesorioSchema.virtual('disponible').get(function() {
    return this.activo && this.stockTotal > 0;
});

// Virtual para la imagen principal
accesorioSchema.virtual('imagenPrincipal').get(function() {
    return this.imagenes && this.imagenes.length > 0 ? this.imagenes[0] : null;
});

// ===== MIDDLEWARE =====
// Pre-save middleware para validaciones adicionales
accesorioSchema.pre('save', function(next) {
    // Si no está en promoción, el precio actual debe ser igual al precio base
    if (!this.enPromocion) {
        this.precioActual = this.precioBase;
        this.promocionId = undefined;
    }
    
    // Validar que haya al menos una sucursal
    if (!this.sucursales || this.sucursales.length === 0) {
        return next(new Error('Debe asignar el producto a al menos una sucursal'));
    }
    
    // Validar que haya al menos una imagen
    if (!this.imagenes || this.imagenes.length === 0) {
        return next(new Error('Debe agregar al menos una imagen del producto'));
    }
    
    next();
});

// Pre-remove middleware para limpiar relaciones
accesorioSchema.pre('remove', function(next) {
    // Aquí podrías limpiar referencias en otras colecciones
    // Por ejemplo, remover de carritos de compra, listas de deseos, etc.
    next();
});

// ===== MÉTODOS ESTÁTICOS =====
// Método para buscar productos con stock
accesorioSchema.statics.findConStock = function() {
    return this.find({ 
        activo: true,
        'sucursales.stock': { $gt: 0 }
    });
};

// Método para buscar productos en promoción
accesorioSchema.statics.findEnPromocion = function() {
    return this.find({ 
        activo: true,
        enPromocion: true 
    }).populate('promocionId');
};

// Método para buscar por rango de precios
accesorioSchema.statics.findByPriceRange = function(min, max) {
    return this.find({ 
        activo: true,
        precioActual: { $gte: min, $lte: max }
    });
};

// ===== MÉTODOS DE INSTANCIA =====
// Método para actualizar stock en una sucursal específica
accesorioSchema.methods.updateStock = function(sucursalId, nuevoStock) {
    const sucursal = this.sucursales.find(s => s.sucursalId.toString() === sucursalId.toString());
    if (sucursal) {
        sucursal.stock = nuevoStock;
    } else {
        throw new Error('Sucursal no encontrada para este producto');
    }
    return this.save();
};

// Método para aplicar promoción
accesorioSchema.methods.aplicarPromocion = function(promocionId, nuevoPrecio) {
    if (nuevoPrecio >= this.precioBase) {
        throw new Error('El precio promocional debe ser menor al precio base');
    }
    
    this.enPromocion = true;
    this.promocionId = promocionId;
    this.precioActual = nuevoPrecio;
    
    return this.save();
};

// Método para quitar promoción
accesorioSchema.methods.quitarPromocion = function() {
    this.enPromocion = false;
    this.promocionId = undefined;
    this.precioActual = this.precioBase;
    
    return this.save();
};

export default model('Accesorios', accesorioSchema);