import express from 'express';
import multer from "multer";

// Configuración básica de multer (guarda archivos en la carpeta 'uploads')
const upload = multer({ dest: "uploads/" });

const router = express.Router();
import lentesController from '../controllers/lentesController.js';

// Endpoint para obtener lentes populares
router.get("/populares", lentesController.getLentesPopulares);

// Endpoint para promociones activas
router.get("/promociones/activas", lentesController.getLentesByIdMarca);

// Endpoint para lentes por marca
router.get("/marca/:marcaId", lentesController.getLentesByPromocion);

// Rutas principales con filtro para populares
router.route("/")
.get((req, res, next) => {
  if (req.query.popular === 'true') {
    return lentesController.getLentesPopulares(req, res, next);
  }
  return lentesController.getLentes(req, res, next);
})
.post(upload.array("imagenes", 5), lentesController.createLentes);

router.route("/:id")
.get(lentesController.getLentesById)
.put(upload.array("imagenes", 5), lentesController.updateLentes)
.delete(lentesController.deleteLentes);

export default router;