// ===== RUTAS AROS =====
import express from 'express';
import arosController from '../controllers/arosController.js';

const router = express.Router();

// Específicas primero
router.get("/populares", arosController.getArosPopulares);
router.get("/promociones/activas", arosController.getArosByPromocion);
router.get("/marca/:marcaId", arosController.getArosByIdMarca);

// Principales
router.route("/")
  .get((req, res, next) => {
    if (req.query.popular === 'true') {
      return arosController.getArosPopulares(req, res, next);
    }
    return arosController.getAros(req, res, next);
  })
  .post(arosController.createAros);

// Por ID
router.route("/:id")
  .get(arosController.getArosById)
  .put(arosController.updateAros)
  .delete(arosController.deleteAros);

export default router;
