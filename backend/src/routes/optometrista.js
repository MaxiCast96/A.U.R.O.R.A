import { Router } from 'express';
import optometristaController from '../controllers/OptometristaController.js';

const router = Router();

// Rutas CRUD básicas
router.get('/', optometristaController.getOptometristas);
router.post('/', optometristaController.createOptometrista);
router.put('/:id', optometristaController.updateOptometrista);
router.delete('/:id', optometristaController.deleteOptometrista);

// Rutas de consulta específicas
router.get('/id/:id', optometristaController.getOptometristaById);
router.get('/empleado/:empleadoId', optometristaController.getOptometristaByEmpleado);
router.get('/sucursal/:sucursalId', optometristaController.getOptometristasBySucursal);
router.get('/disponibles', optometristaController.getOptometristasDisponibles);
router.get('/especialidad/:especialidad', optometristaController.getOptometristasByEspecialidad);

// Ruta para actualizar solo disponibilidad
router.patch('/:id/disponibilidad', optometristaController.updateDisponibilidad);

export default router;