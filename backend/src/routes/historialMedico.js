// ===== RUTAS HISTORIAL MÉDICO =====
import { Router } from 'express';
import historialMedicoController from '../controllers/HistorialMedicoController.js';

const router = Router();

// Rutas CRUD básicas para historiales médicos
router.get('/', historialMedicoController.getHistorialesMedicos); // GET - Obtener todos los historiales
router.post('/', historialMedicoController.createHistorialMedico); // POST - Crear nuevo historial
router.put('/:id', historialMedicoController.updateHistorialMedico); // PUT - Actualizar historial completo
router.delete('/:id', historialMedicoController.deleteHistorialMedico); // DELETE - Eliminar historial

// Rutas de consulta específicas para filtrar historiales

// GET /api/historialMedico/id/:id - Obtener historial por ID específico
router.get('/id/:id', historialMedicoController.getHistorialMedicoById);

// GET /api/historialMedico/cliente/:clienteId - Historial de un cliente específico
router.get('/cliente/:clienteId', historialMedicoController.getHistorialMedicoByCliente);

// GET /api/historialMedico/padecimiento/:tipo - Filtrar por tipo de padecimiento
router.get('/padecimiento/:tipo', historialMedicoController.getHistorialesByTipoPadecimiento);

// GET /api/historialMedico/diagnostico/:diagnostico - Filtrar por diagnóstico
router.get('/diagnostico/:diagnostico', historialMedicoController.getHistorialesByDiagnostico);

// GET /api/historialMedico/fecha - Filtrar por fecha de diagnóstico (usar query params)
router.get('/fecha', historialMedicoController.getHistorialesByFechaDiagnostico);

// Rutas para actualizaciones parciales de secciones específicas

// PATCH /api/historialMedico/:id/padecimientos - Actualizar solo sección de padecimientos
router.patch('/:id/padecimientos', historialMedicoController.updatePadecimientos);

// PATCH /api/historialMedico/:id/historial-visual - Actualizar solo historial visual
router.patch('/:id/historial-visual', historialMedicoController.updateHistorialVisual);

export default router;
