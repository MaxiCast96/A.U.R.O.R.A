import express from 'express';
import multer from "multer";

// Configuración básica de multer (guarda archivos en la carpeta 'uploads')
const upload = multer({ dest: "uploads/" });

const router = express.Router();
import lentesController from '../controllers/lentesController.js';

router.get("/promociones/activas", lentesController.getLentesByIdMarca);
router.get("/marca/:marcaId", lentesController.getLentesByPromocion);

router.route("/")
.get(lentesController.getLentes)
.post(upload.array("imagenes", 5), lentesController.createLentes);

router.route("/:id")
.get(lentesController.getLentesById)
.put(upload.array("imagenes", 5), lentesController.updateLentes)
.delete(lentesController.deleteLentes);

// Endpoint para obtener lentes populares
router.get("/populares", lentesController.getLentesPopulares);

// Permitir filtro por query param popular=true
router.get("/", (req, res, next) => {
  if (req.query.popular === 'true') {
    return lentesController.getLentesPopulares(req, res, next);
  }
  return lentesController.getLentes(req, res, next);
});

export default router;