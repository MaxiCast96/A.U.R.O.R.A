// ===== RUTAS LENTES CRISTALES =====
import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import controller from '../controllers/lentesCristalesController.js';

const router = express.Router();

// ==== Multer setup (images optional) ====
// Use OS temp directory to ensure write access in production platforms (e.g., Railway)
const tempDir = os.tmpdir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, tempDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `lente-cristal-${unique}${ext}`);
  }
});
const fileFilter = (req, file, cb) => {
  const ok = /jpeg|jpg|png|webp/.test(path.extname(file.originalname).toLowerCase()) && /image\//.test(file.mimetype);
  if (ok) return cb(null, true);
  cb(new Error('Solo imágenes (jpeg, jpg, png, webp)'));
};
const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024, files: 5 } });

const cleanupTempFiles = (req, res, next) => {
  const end = res.end;
  res.end = function(...args) {
    try {
      if (Array.isArray(req.files)) {
        req.files.forEach(f => fs.unlink(f.path, () => {}));
      }
    } catch {}
    end.apply(this, args);
  };
  next();
};

const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ success: false, message: 'ID inválido' });
  }
  next();
};

// Específicas
router.get('/promociones/activas', controller.getLentesCristalesEnPromocion);
router.get('/marca/:marcaId', controller.getLentesCristalesByMarca);

// Principales
router.route('/')
  .get(controller.getLentesCristales)
  .post(upload.array('imagenes', 5), cleanupTempFiles, controller.createLenteCristal);

router.route('/:id')
  .get(validateId, controller.getLenteCristalById)
  .put(validateId, upload.array('imagenes', 5), cleanupTempFiles, controller.updateLenteCristal)
  .delete(validateId, controller.deleteLenteCristal);

export default router;
