import CatalogoModificaciones from "../models/CatalogoModificaciones.js";

const ctrl = {};

ctrl.list = async (req, res) => {
  try {
    const { activos } = req.query;
    const filter = {};
    if (activos === 'true') filter.activo = true;
    const mods = await CatalogoModificaciones.find(filter).sort({ orden: 1, nombre: 1 });
    res.json(mods);
  } catch (e) {
    res.status(500).json({ message: "Error listando modificaciones: " + e.message });
  }
};

ctrl.getById = async (req, res) => {
  try {
    const mod = await CatalogoModificaciones.findById(req.params.id);
    if (!mod) return res.status(404).json({ message: 'Modificación no encontrada' });
    res.json(mod);
  } catch (e) {
    res.status(500).json({ message: "Error obteniendo modificación: " + e.message });
  }
};

ctrl.create = async (req, res) => {
  try {
    const data = req.body || {};
    const created = await CatalogoModificaciones.create(data);
    res.status(201).json({ message: 'Modificación creada', modificacion: created });
  } catch (e) {
    res.status(500).json({ message: "Error creando modificación: " + e.message });
  }
};

ctrl.update = async (req, res) => {
  try {
    const data = req.body || {};
    const updated = await CatalogoModificaciones.findByIdAndUpdate(req.params.id, data, { new: true });
    if (!updated) return res.status(404).json({ message: 'Modificación no encontrada' });
    res.json({ message: 'Modificación actualizada', modificacion: updated });
  } catch (e) {
    res.status(500).json({ message: "Error actualizando modificación: " + e.message });
  }
};

ctrl.remove = async (req, res) => {
  try {
    const deleted = await CatalogoModificaciones.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Modificación no encontrada' });
    res.json({ message: 'Modificación eliminada' });
  } catch (e) {
    res.status(500).json({ message: "Error eliminando modificación: " + e.message });
  }
};

// Seed inicial de modificaciones (idempotente) - Lentes y Monturas
ctrl.seed = async (req, res) => {
  try {
    const defaults = [
      // Material de la lente (selección única)
      { codigo: 'MAT-CR39', nombre: 'Plástico (CR-39)', descripcion: 'Ligero y económico', precioBase: 0, categoria: 'material_lente', seleccionUnica: true, orden: 10 },
      { codigo: 'MAT-PC', nombre: 'Policarbonato', descripcion: 'Resistente a impactos', precioBase: 15, categoria: 'material_lente', seleccionUnica: true, orden: 20 },
      { codigo: 'MAT-TRIVEX', nombre: 'Trivex', descripcion: 'Mejor claridad y resistencia', precioBase: 25, categoria: 'material_lente', seleccionUnica: true, orden: 30 },
      { codigo: 'MAT-GLASS', nombre: 'Vidrio', descripcion: 'Alta calidad óptica, más pesado', precioBase: 0, categoria: 'material_lente', seleccionUnica: true, orden: 40 },

      // Índice de refracción (selección única)
      { codigo: 'IDX-150', nombre: '1.50', descripcion: 'Estándar, más grueso', precioBase: 0, categoria: 'indice_refraccion', seleccionUnica: true, orden: 10 },
      { codigo: 'IDX-161', nombre: '1.61', descripcion: 'Delgado, graduaciones medias', precioBase: 30, categoria: 'indice_refraccion', seleccionUnica: true, orden: 20 },
      { codigo: 'IDX-167', nombre: '1.67', descripcion: 'Muy delgado, graduaciones altas', precioBase: 70, categoria: 'indice_refraccion', seleccionUnica: true, orden: 30 },
      { codigo: 'IDX-174', nombre: '1.74', descripcion: 'Ultra delgado, graduaciones muy altas', precioBase: 120, categoria: 'indice_refraccion', seleccionUnica: true, orden: 40 },

      // Diseño de la lente (selección única)
      { codigo: 'DSN-MONO', nombre: 'Monofocal', descripcion: 'Visión de una sola distancia', precioBase: 30, categoria: 'diseno_lente', seleccionUnica: true, orden: 10 },
      { codigo: 'DSN-BI', nombre: 'Bifocal', descripcion: 'Dos zonas de visión', precioBase: 120, categoria: 'diseno_lente', seleccionUnica: true, orden: 20 },
      { codigo: 'DSN-PROG', nombre: 'Progresivo', descripcion: 'Transición suave entre distancias', precioBase: 200, categoria: 'diseno_lente', seleccionUnica: true, orden: 30 },
      { codigo: 'DSN-PC', nombre: 'Lentes para computadora', descripcion: 'Optimizado para visión intermedia', precioBase: 60, categoria: 'diseno_lente', seleccionUnica: true, orden: 40 },

      // Tratamientos (multi)
      { codigo: 'TRT-AR', nombre: 'Antirreflejante (AR)', descripcion: 'Reduce reflejos y mejora claridad', precioBase: 40, categoria: 'tratamiento', seleccionUnica: false, orden: 10 },
      { codigo: 'TRT-ARAY', nombre: 'Antirayaduras', descripcion: 'Mayor resistencia a rayones', precioBase: 25, categoria: 'tratamiento', seleccionUnica: false, orden: 20 },
      { codigo: 'TRT-AVAHO', nombre: 'Antivaho', descripcion: 'Evita empañamiento', precioBase: 30, categoria: 'tratamiento', seleccionUnica: false, orden: 30 },
      { codigo: 'TRT-UV', nombre: 'Protección UV', descripcion: 'Bloquea rayos UV', precioBase: 15, categoria: 'tratamiento', seleccionUnica: false, orden: 40 },
      { codigo: 'TRT-FOTO', nombre: 'Fotocromáticos', descripcion: 'Se oscurecen con la luz solar', precioBase: 150, categoria: 'tratamiento', seleccionUnica: false, orden: 50 },

      // Montura (selección única)
      { codigo: 'MNT-ACET', nombre: 'Acetato', descripcion: 'Ligero y versátil', precioBase: 40, categoria: 'montura', seleccionUnica: true, orden: 10 },
      { codigo: 'MNT-MET', nombre: 'Metal', descripcion: 'Resistente', precioBase: 50, categoria: 'montura', seleccionUnica: true, orden: 20 },
      { codigo: 'MNT-TI', nombre: 'Titanio', descripcion: 'Muy ligero y resistente', precioBase: 120, categoria: 'montura', seleccionUnica: true, orden: 30 },
      { codigo: 'MNT-TR90', nombre: 'TR90', descripcion: 'Flexible y duradero', precioBase: 60, categoria: 'montura', seleccionUnica: true, orden: 40 },
    ];

    let created = 0, updated = 0;
    for (const item of defaults) {
      const existing = await CatalogoModificaciones.findOne({ codigo: item.codigo });
      if (!existing) {
        await CatalogoModificaciones.create({
          codigo: item.codigo,
          nombre: item.nombre,
          descripcion: item.descripcion,
          precioBase: item.precioBase,
          editablePrecio: false,
          activo: true,
          categoria: item.categoria,
          seleccionUnica: !!item.seleccionUnica,
          orden: item.orden
        });
        created++;
      } else {
        const patch = {};
        ['nombre','descripcion','precioBase','categoria','seleccionUnica','orden'].forEach(k => {
          if (existing[k] !== item[k]) patch[k] = item[k];
        });
        if (Object.keys(patch).length) {
          await CatalogoModificaciones.updateOne({ _id: existing._id }, { $set: patch });
          updated++;
        }
      }
    }

    res.json({ message: 'Seed ejecutado', created, updated, total: created + updated });
  } catch (e) {
    res.status(500).json({ message: 'Error ejecutando seed: ' + e.message });
  }
};

export default ctrl;
