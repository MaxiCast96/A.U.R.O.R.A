// ===== MODELO COTIZACIONES =====
import { Schema, model } from 'mongoose';

const cotizacionesSchema = new Schema({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes', // Cliente que solicita la cotización
        required: true,
    },
    correoCliente: {
        type: String,
        required: false, // Email para enviar la cotización
    },
    telefonoCliente: {
        type: String,
        required: true, // Teléfono de contacto
    },
    fecha: {
        type: Date,
        required: true, // Fecha de creación de la cotización
        default: Date.now
    },
    productos: [ // Lista de productos cotizados
        {
            productoId: {
                type: Schema.Types.ObjectId,
                ref: 'Lentes', // Referencia al producto
                required: true,
            },
            nombre: {
                type: String,
                required: true, // Nombre del producto
            },
            categoria: {
                type: String,
                required: true, // Categoría del producto
            },
            cantidad: {
                type: Number,
                required: true, // Cantidad solicitada
                min: 1,
                default: 1
            },
            precioUnitario: {
                type: Number,
                required: true, // Precio por unidad
                min: 0
            },
            subtotal: {
                type: Number,
                required: true, // Cantidad * precio unitario
                min: 0
            }
        }
    ],
    graduacion: { // Graduación para lentes graduados
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
        required: true, // Total de la cotización
        min: 0
    },
    validaHasta: {
        type: Date,
        required: true, // Fecha de vencimiento de la cotización
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'aprobada', 'rechazada', 'expirada', 'convertida'], // Estados posibles
        default: 'pendiente'
    },
    recetaUrl: {
        type: String,
        required: false, // URL de la receta médica si aplica
    },
    urlCotizacion: {
        type: String,
        required: false, // URL del documento de cotización generado
    },
    observaciones: {
        type: String,
        required: false, // Notas adicionales
    },
    descuento: {
        type: Number,
        default: 0, // Descuento aplicado
        min: 0
    },
    impuesto: {
        type: Number,
        default: 0, // Impuestos aplicados
        min: 0
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

// Middleware para calcular totales automáticamente
cotizacionesSchema.pre('validate', function(next) {
    // Asegurar valores numéricos para descuento e impuesto
    this.descuento = this.descuento || 0;
    this.impuesto = this.impuesto || 0;

    // Calcular subtotales si no existen
    if (this.productos && this.productos.length > 0) {
        this.productos.forEach(producto => {
            if (!producto.subtotal) {
                producto.subtotal = producto.precioUnitario * producto.cantidad;
            }
        });

        // Calcular total final
        this.total = this.productos.reduce((sum, producto) => sum + producto.subtotal, 0);
        this.total = this.total - this.descuento + this.impuesto;
    } else {
        this.total = 0;
    }

    // Establecer fecha de vencimiento (30 días por defecto)
    if (!this.validaHasta) {
        this.validaHasta = new Date(this.fecha || Date.now());
        this.validaHasta.setDate(this.validaHasta.getDate() + 30);
    }

    next();
});

export default model('cotizaciones', cotizacionesSchema);