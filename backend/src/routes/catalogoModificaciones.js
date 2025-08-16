// ===== RUTAS CATALOGO MODIFICACIONES (Aros Personalizados) =====
import express from 'express';
import ctrl from '../controllers/CatalogoModificacionesController.js';

const router = express.Router();

router.post('/seed', ctrl.seed);

router.route('/')
  .get(ctrl.list)      // ?activos=true para solo activos
  .post(ctrl.create);

router.route('/:id')
  .get(ctrl.getById)
  .put(ctrl.update)
  .delete(ctrl.remove);

export default router;
