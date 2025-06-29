import { Router } from 'express';
import historialMedicoController from '../controllers/HistorialMedicoController.js';

const router = Router();

// Rutas CRUD básicas
router.get('/', historialMedicoController.getHistorialesMedicos);
router.post('/', historialMedicoController.createHistorialMedico);
router.put('/:id', historialMedicoController.updateHistorialMedico);
router.delete('/:id', historialMedicoController.deleteHistorialMedico);

// Rutas de consulta específicas
router.get('/id/:id', historialMedicoController.getHistorialMedicoById);
router.get('/cliente/:clienteId', historialMedicoController.getHistorialMedicoByCliente);
router.get('/padecimiento/:tipo', historialMedicoController.getHistorialesByTipoPadecimiento);
router.get('/diagnostico/:diagnostico', historialMedicoController.getHistorialesByDiagnostico);
router.get('/fecha', historialMedicoController.getHistorialesByFechaDiagnostico);

// Rutas para actualizaciones parciales
router.patch('/:id/padecimientos', historialMedicoController.updatePadecimientos);
router.patch('/:id/historial-visual', historialMedicoController.updateHistorialVisual);

export default router;