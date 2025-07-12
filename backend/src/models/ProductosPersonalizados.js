// ===== MODELO PRODUCTOS PERSONALIZADOS =====
import { Schema, model } from 'mongoose';

const productosPersonalizadosSchema = new Schema({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Clientes', // Cliente que solicita la personalización
        required: true,
    },
    productoBaseId: {
        type: Schema.Types.ObjectId,
        ref: 'Lentes', // Producto base a personalizar
        required: true,
    },
    nombre: {
        type: String,
        required: true, // Nombre del producto personalizado
    },
    descripcion: {
        type: String,
        required: true, // Descripción de la personalización
    },
    categoria: {
        type: String,
        required: true, // Categoría del producto
    },
    marcaId: {
        type: Schema.Types.ObjectId,
        ref: 'Marcas', // Marca del producto
        required: true,
    },
    material: {
        type: String,
        required: true, // Material seleccionado
    },
    color: {
        type: String,
        required: true, // Color personalizado
    },
    tipoLente: {
        type: String,
        required: true, // Tipo de lente personalizado
    },
    precioCalculado: {
        type: Number,
        required: true, // Precio final calculado
        min: 0
    },
    detallesPersonalizacion: { // Detalles específicos de la personalización
        receta: { // Graduación personalizada
            ojoDerecho: {
                esfera: { type: Number, required: false },
                cilindro: { type: Number, required: false },
                eje: { type: Number, required: false },
                adicion: { type: Number, required: false }
            },
            ojoIzquierdo: {
                esfera: { type: Number, required: false },
                cilindro: { type: Number, required: false },
                eje: { type: Number, required: false },
                adicion: { type: Number, required: false }
            }
        },
        modificacionesEspeciales: {
            type: String,
            required: false // Modificaciones especiales solicitadas
        },
        instruccionesAdicionales: {
            type: String,
            required: false // Instrucciones adicionales para el técnico
        }
    },
    estado: {
        type: String,
        required: true,
        enum: ['pendiente', 'en_proceso', 'completado', 'cancelado', 'entregado'], // Estados del proceso
        default: 'pendiente'
    },
    fechaSolicitud: {
        type: Date,
        required: true, // Fecha de solicitud
        default: Date.now
    },
    fechaEntregaEstimada: {
        type: Date,
        required: true // Fecha estimada de entrega
    },
    cotizacion: { // Cotización para el producto personalizado
        total: {
            type: Number,
            required: true, // Total de la cotización
            min: 0
        },
        validaHasta: {
            type: Date,
            required: true // Vigencia de la cotización
        },
        estado: {
            type: String,
            required: true,
            enum: ['vigente', 'expirada', 'aceptada', 'rechazada'], // Estados de la cotización
            default: 'vigente'
        },
        recetaUrl: {
            type: String,
            required: false // URL de la receta subida
        },
        urlCotizacion: {
            type: String,
            required: false // URL del documento de cotización
        }
    }
}, {
    timestamps: true, // Agrega createdAt y updatedAt
    strict: true
});

export default model('productosPersonalizados', productosPersonalizadosSchema);