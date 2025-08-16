// ===== MODELO CATALOGO MODIFICACIONES (Aros Personalizados) =====
import { Schema, model } from 'mongoose';

const catalogoModificacionesSchema = new Schema({
    codigo: { type: String, required: true, unique: true },
    nombre: { type: String, required: true },
    descripcion: { type: String, default: '' },
    precioBase: { type: Number, required: true, min: 0 },
    editablePrecio: { type: Boolean, default: false },
    activo: { type: Boolean, default: true },
    // Categoría estructurada para construir el producto personalizado de lentes/monturas
    categoria: { 
        type: String, 
        enum: ['material_lente', 'indice_refraccion', 'tratamiento', 'diseno_lente', 'montura', 'general'], 
        default: 'general' 
    },
    // Indica si dentro de esta categoría la selección es única (radio) o múltiple (checkbox)
    seleccionUnica: { type: Boolean, default: false },
    orden: { type: Number, default: 0 }
}, {
    timestamps: true,
    strict: true
});

export default model('CatalogoModificaciones', catalogoModificacionesSchema);
