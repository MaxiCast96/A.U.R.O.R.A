import express from 'express';
import empleadosController from '../controllers/EmpleadosController.js';

const router = express.Router();

// Removemos el middleware de multer ya que ahora manejamos las imágenes
// directamente desde el frontend con Cloudinary
router.route("/")
    .get(empleadosController.getEmpleados)
    .post(empleadosController.createEmpleados);

router.route("/:id")
    .get(empleadosController.getEmpleadoById)
    .put(empleadosController.updateEmpleados)
    .delete(empleadosController.deleteEmpleados);

export default router;