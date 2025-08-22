// ===== RUTAS OPTOMETRISTA =====
import { Router } from 'express';
import optometristaController from '../controllers/OptometristaController.js';

const router = Router();

// Rutas CRUD básicas para optometristas
router.get('/', optometristaController.getOptometristas); // GET - Obtener todos los optometristas
router.post('/', optometristaController.createOptometrista); // POST - Crear nuevo optometrista
router.put('/:id', optometristaController.updateOptometrista); // PUT - Actualizar optometrista
router.delete('/:id', optometristaController.deleteOptometrista); // DELETE - Eliminar optometrista

// Rutas de consulta específicas para filtrar optometristas

// GET /api/optometrista/id/:id - Obtener optometrista por ID específico
router.get('/id/:id', optometristaController.getOptometristaById);

// GET /api/optometrista/empleado/:empleadoId - Buscar por ID de empleado base
router.get('/empleado/:empleadoId', optometristaController.getOptometristaByEmpleado);

// GET /api/optometrista/sucursal/:sucursalId - Optometristas asignados a una sucursal
router.get('/sucursal/:sucursalId', optometristaController.getOptometristasBySucursal);

// GET /api/optometrista/disponibles - Solo optometristas marcados como disponibles
router.get('/disponibles', optometristaController.getOptometristasDisponibles);

// GET /api/optometrista/especialidad/:especialidad - Filtrar por especialidad
router.get('/especialidad/:especialidad', optometristaController.getOptometristasByEspecialidad);

// Ruta para actualización parcial de disponibilidad
// PATCH /api/optometrista/:id/disponibilidad - Cambiar solo estado de disponibilidad
router.patch('/:id/disponibilidad', optometristaController.updateDisponibilidad);

export default router;