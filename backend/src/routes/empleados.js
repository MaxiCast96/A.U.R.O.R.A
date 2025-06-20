import express from 'express';

const router = express.Router();
import empleadosController from '../controllers/EmpleadosController.js';

router.route("/")
.get(empleadosController.getEmpleados)
.post(empleadosController.createEmpleados);

router.route("/:id")
.get(empleadosController.getEmpleadoById)
.put(empleadosController.updateEmpleados)
.delete(empleadosController.deleteEmpleados);

export default router;