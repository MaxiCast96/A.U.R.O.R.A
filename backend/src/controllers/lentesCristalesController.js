import "../models/Marcas.js";
import "../models/Categoria.js";
import { v2 as cloudinary } from "cloudinary";
import LentesCristales from "../models/LentesCristales.js";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function getLentesCristales(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 12, 1), 100);
    const skip = (page - 1) * limit;

    const total = await LentesCristales.countDocuments();

    const items = await LentesCristales.find()
      .populate('categoriaId')
      .populate('marcaId')
      .populate('promocionId')
      .populate('sucursales.sucursalId')
      .skip(skip)
      .limit(limit);

    return res.json({
      success: true,
      data: items,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo lentes (cristales): ' + error.message });
  }
}

async function getLenteCristalById(req, res) {
  try {
    const item = await LentesCristales.findById(req.params.id)
      .populate('categoriaId')
      .populate('marcaId')
      .populate('promocionId')
      .populate('sucursales.sucursalId');
    if (!item) return res.status(404).json({ success: false, message: 'Lente (cristal) no encontrado' });
    return res.json({ success: true, data: item });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error obteniendo lente (cristal): ' + error.message });
  }
}

async function getLentesCristalesByMarca(req, res) {
  try {
    const items = await LentesCristales.find({ marcaId: req.params.marcaId })
      .populate('categoriaId').populate('marcaId').populate('promocionId').populate('sucursales.sucursalId');
    return res.json({ success: true, data: items });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error listando por marca: ' + error.message });
  }
}

async function getLentesCristalesEnPromocion(_req, res) {
  try {
    const items = await LentesCristales.find({ enPromocion: true })
      .populate('categoriaId').populate('marcaId').populate('promocionId').populate('sucursales.sucursalId');
    return res.json({ success: true, data: items });
  } catch (error) {
  }
}

async function createLenteCristal(req, res) {
  try {
    let sucursales = req.body.sucursales;
    if (typeof sucursales === 'string') {
      try { sucursales = JSON.parse(sucursales); } catch { return res.status(400).json({ success:false, message: 'Formato inválido de sucursales' }); }
    }

    const data = req.body || {};
    let imagenes = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'lentes-cristales',
          allowed_formats: ['png','jpg','jpeg','webp']
        });
        imagenes.push(result.secure_url);
      }
    } else if (Array.isArray(data.imagenes)) {
      imagenes = data.imagenes;
    }

    // Normalizar promo
    const enPromoFlag = (data.enPromocion === true || data.enPromocion === 'true');
    const promoId = data.promocionId || null;
    const isPromoValid = enPromoFlag && promoId;

    const doc = new LentesCristales({
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoriaId: data.categoriaId,
      marcaId: data.marcaId,
      material: data.material,
      indice: data.indice,
      tratamientos: Array.isArray(data.tratamientos) ? data.tratamientos : (data.tratamientos ? [data.tratamientos] : []),
      rangoEsferico: data.rangoEsferico,
      rangoCilindrico: data.rangoCilindrico,
      diametro: data.diametro,
      precioBase: data.precioBase,
      precioActual: isPromoValid ? data.precioActual : data.precioBase,
      enPromocion: !!isPromoValid,
      promocionId: isPromoValid ? promoId : undefined,
      imagenes,
      sucursales: Array.isArray(sucursales) ? sucursales : [],
      fechaCreacion: data.fechaCreacion ? new Date(data.fechaCreacion) : new Date()
    });

    await doc.save();
    return res.json({ success: true, message: 'Lente (cristal) creado', data: doc });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error creando: ' + error.message });
  }
}

async function updateLenteCristal(req, res) {
  try {
    const id = req.params.id;
    let sucursales = req.body.sucursales;
    if (typeof sucursales === 'string') {
      try { sucursales = JSON.parse(sucursales); } catch { return res.status(400).json({ success:false, message: 'Formato inválido de sucursales' }); }
    }

    const data = req.body || {};
    let imagenes = data.imagenes || [];

    if (req.files && req.files.length > 0) {
      imagenes = [];
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'lentes-cristales',
          allowed_formats: ['png','jpg','jpeg','webp']
        });
        imagenes.push(result.secure_url);
      }
    }

    // Normalizar promo para update
  const enPromoFlag = (data.enPromocion === true || data.enPromocion === 'true');
  const promoId = data.promocionId || null;
  const isPromoValid = enPromoFlag && promoId;

  const setData = {
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoriaId: data.categoriaId,
      marcaId: data.marcaId,
      material: data.material,
      indice: data.indice,
      tratamientos: Array.isArray(data.tratamientos) ? data.tratamientos : (data.tratamientos ? [data.tratamientos] : undefined),
      rangoEsferico: data.rangoEsferico,
      rangoCilindrico: data.rangoCilindrico,
      diametro: data.diametro,
      precioBase: data.precioBase,
      precioActual: isPromoValid ? data.precioActual : (data.precioBase ?? undefined),
      enPromocion: isPromoValid ? true : false,
      promocionId: isPromoValid ? promoId : undefined,
      imagenes,
      sucursales: Array.isArray(sucursales) ? sucursales : undefined,
      fechaCreacion: data.fechaCreacion
    };
    Object.keys(setData).forEach(k => { if (typeof setData[k] === 'undefined') delete setData[k]; });

    const updated = await LentesCristales.findByIdAndUpdate(id, { $set: setData }, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ success: false, message: 'Lente (cristal) no encontrado' });
    return res.json({ success: true, message: 'Lente (cristal) actualizado', data: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error actualizando: ' + error.message });
  }
}

async function deleteLenteCristal(req, res) {
  try {
    const deleted = await LentesCristales.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'Lente (cristal) no encontrado' });
    return res.json({ success: true, message: 'Lente (cristal) eliminado' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error eliminando: ' + error.message });
  }
}

export default {
  getLentesCristales,
  getLenteCristalById,
  getLentesCristalesByMarca,
  getLentesCristalesEnPromocion,
  createLenteCristal,
  updateLenteCristal,
  deleteLenteCristal,
};
