// ===== RUTAS EMPLEADOS =====
import express from 'express';
import empleadosController from '../controllers/EmpleadosController.js';

const router = express.Router();

// Rutas principales CRUD para empleados
router.route("/")
    .get(empleadosController.getEmpleados) // GET /api/empleados - Obtener todos los empleados
    .post(empleadosController.createEmpleados); // POST /api/empleados - Crear nuevo empleado

// ===== RUTAS DE RECUPERACIÓN DE CONTRASEÑA =====
router.post('/forgot-password', empleadosController.forgotPassword); // POST - Solicitar recuperación
router.post('/verify-reset-code', empleadosController.verifyResetCode); // POST - Verificar código
router.post('/reset-password', empleadosController.resetPassword); // POST - Resetear contraseña

// Rutas para manejo de empleado específico por ID
router.route("/:id")
    .get(empleadosController.getEmpleadoById) // GET /api/empleados/:id - Obtener empleado por ID
    .put(empleadosController.updateEmpleados) // PUT /api/empleados/:id - Actualizar empleado
    .delete(empleadosController.deleteEmpleados); // DELETE /api/empleados/:id - Eliminar empleado

export default router;