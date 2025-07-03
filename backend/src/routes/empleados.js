import express from 'express';
import multer from 'multer';
import empleadosController from '../controllers/EmpleadosController.js';

const router = express.Router();

// Configuración de multer para manejar la subida de archivos
const upload = multer({ dest: 'uploads/' }); // Cambia 'uploads/' si necesitas una carpeta específica

router.route("/")
    .get(empleadosController.getEmpleados)
    .post(upload.single("fotoPerfil"), empleadosController.createEmpleados); // Middleware para manejar la imagen

router.route("/:id")
    .get(empleadosController.getEmpleadoById)
    .put(upload.single("fotoPerfil"), empleadosController.updateEmpleados) // Middleware para manejar la imagen
    .delete(empleadosController.deleteEmpleados);

export default router;