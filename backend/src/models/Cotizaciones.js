import { Schema, model } from 'mongoose';

const cotizacionesSchema = new Schema({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes',
        required: true,
    },
    correoCliente: {
        type: String,
        required: false,
    },
    telefonoCliente: {
        type: String,
        required: true,
    },
    fecha: {
        type: Date,
        required: true,
        default: Date.now
    },
    productos: [
        {
            productoId: {
                type: Schema.Types.ObjectId,
                ref: 'Lentes', // Puede ser lente, aro, etc.
                required: true,
            },
            nombre: {
                type: String,
                required: true,
            },
            categoria: {
                type: String,
                required: true, // "lente", "aro", etc.
            },
            cantidad: {
                type: Number,
                required: true,
                min: 1,
                default: 1
            },
            precioUnitario: {
                type: Number,
                required: true,
                min: 0
            },
            subtotal: {
                type: Number,
                required: true,
                min: 0
            }
        }
    ],
    // Graduación general para toda la cotización
    graduacion: {
        ojoDerecho: {
            esfera: { type: Number, default: 0 },
            cilindro: { type: Number, default: 0 },
            eje: { type: Number, default: 0 },
            adicion: { type: Number, default: 0 }
        },
        ojoIzquierdo: {
            esfera: { type: Number, default: 0 },
            cilindro: { type: Number, default: 0 },
            eje: { type: Number, default: 0 },
            adicion: { type: Number, default: 0 }
        }
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    validaHasta: {
        type: Date,
        required: true,
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'aprobada', 'rechazada', 'expirada', 'convertida'],
        default: 'pendiente'
    },
    recetaUrl: {
        type: String,
        required: false,
    },
    urlCotizacion: {
        type: String,
        required: false,
    },
    observaciones: {
        type: String,
        required: false,
    },
    descuento: {
        type: Number,
        default: 0,
        min: 0
    },
    impuesto: {
        type: Number,
        default: 0,
        min: 0
    }
}, {
    timestamps: true,
    strict: true
});

// Middleware para calcular el total antes de validar
cotizacionesSchema.pre('validate', function(next) {
    // 1. Asegurar que descuento e impuesto tengan valores numéricos
    this.descuento = this.descuento || 0;
    this.impuesto = this.impuesto || 0;

    // 2. Calcular subtotales si no existen
    if (this.productos && this.productos.length > 0) {
        this.productos.forEach(producto => {
            if (!producto.subtotal) {
                producto.subtotal = producto.precioUnitario * producto.cantidad;
            }
        });

        // 3. Calcular el total
        this.total = this.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
        this.total = this.total - this.descuento + this.impuesto;
    } else {
        this.total = 0; // Asegurar que siempre haya un total
    }

    // 4. Establecer fecha de vencimiento
    if (!this.validaHasta) {
        this.validaHasta = new Date(this.fecha || Date.now());
        this.validaHasta.setDate(this.validaHasta.getDate() + 30);
    }

    next();
});

export default model('cotizaciones', cotizacionesSchema);