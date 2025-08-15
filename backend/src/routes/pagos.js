// ===== RUTAS PAGOS (Wompi) =====
import express from 'express';
import pagosController from '../controllers/PagosController.js';

const router = express.Router();

// Proxy seguro a Wompi
router.post('/wompi/tokenizada-sin-3ds', pagosController.wompiTokenizadaSin3DS);

export default router;
