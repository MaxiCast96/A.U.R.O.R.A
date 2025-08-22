// ===== RUTAS EMPLEADOS =====
import express from 'express';
import empleadosController from '../controllers/EmpleadosController.js';

const router = express.Router();

// ===== RUTAS DE RECUPERACIÓN DE CONTRASEÑA PRIMERO =====
router.post('/forgot-password', empleadosController.forgotPassword);
router.post('/verify-reset-code', empleadosController.verifyResetCode);
router.post('/reset-password', empleadosController.resetPassword);

// Rutas principales CRUD para empleados
router.route("/")
    .get(empleadosController.getEmpleados)
    .post(empleadosController.createEmpleados);

// Rutas específicas por ID - AL FINAL
router.route("/:id")
    .get(empleadosController.getEmpleadoById)
    .put(empleadosController.updateEmpleados)
    .delete(empleadosController.deleteEmpleados);

export default router;