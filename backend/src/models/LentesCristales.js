// ===== MODELO LENTES CRISTALES =====
import { Schema, model } from 'mongoose';

const LenteCristalSchema = new Schema({
  nombre: { type: String, required: true },
  descripcion: { type: String, required: true },
  categoriaId: { type: Schema.Types.ObjectId, ref: 'Categoria' },
  marcaId: { type: Schema.Types.ObjectId, ref: 'Marcas', required: true },

  // Propiedades técnicas de cristales
  material: { type: String, enum: ['Vidrio', 'Policarbonato', 'Cr39'], required: true },
  indice: { type: String, enum: ['1.50', '1.56', '1.60', '1.67', '1.74', 'Otro'], required: true },
  vision: { 
    type: String, 
    enum: ['Sencilla', 'Multifocal', 'Bifocal'], 
    default: 'Sencilla' 
  },
  protecciones: [{ 
    type: String,
    enum: ['Antirreflejante', 'Filtro azul', 'Fotocromático', 'Fotogray', 'Transition', 'Polarizado', 'Endurecido']
  }],
  tratamientos: [{ type: String }], // AR, BlueCut, Fotocromatico, Polarizado, Endurecido, etc.
  rangoEsferico: {
    min: { type: Number, default: -20 },
    max: { type: Number, default: 12 },
  },
  rangoCilindrico: {
    min: { type: Number, default: -6 },
    max: { type: Number, default: 6 },
  },
  diametro: { type: Number, default: 65 },

  // Precios y promociones
  precioBase: { type: Number, required: true },
  precioActual: { type: Number, required: true },
  enPromocion: { type: Boolean, default: false, required: true },
  promocionId: {
    type: Schema.Types.ObjectId,
    ref: 'Promociones',
    required: function () { return this.enPromocion; }
  },

  // Media
  imagenes: [{ type: String }],

  // Stock por sucursal (si aplica)
  sucursales: [
    {
      sucursalId: { type: Schema.Types.ObjectId, ref: 'Sucursales', required: true },
      nombreSucursal: { type: String, required: true },
      stock: { type: Number, required: true, min: 0 }
    }
  ],

  fechaCreacion: { type: Date, required: true },
}, {
  timestamps: true,
  strict: true
});

export default model('LentesCristales', LenteCristalSchema);