// ===== RUTAS LENTES CRISTALES =====
import express from 'express';
import controller from '../controllers/lentesCristalesController.js';

const router = express.Router();

// Específicas
router.get('/promociones/activas', controller.getLentesCristalesEnPromocion);
router.get('/marca/:marcaId', controller.getLentesCristalesByMarca);

// Principales
router.route('/')
  .get(controller.getLentesCristales)
  .post(controller.createLenteCristal);

router.route('/:id')
  .get(controller.getLenteCristalById)
  .put(controller.updateLenteCristal)
  .delete(controller.deleteLenteCristal);

export default router;
