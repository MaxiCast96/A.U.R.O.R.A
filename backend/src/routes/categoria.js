// ===== RUTAS CATEGORIA =====
import express from "express";
import CategoriaController from "../controllers/CategoriaController.js";
import multer from "multer";

// Configuración de multer para manejo de archivos de icono
const upload = multer({ dest: "uploads/" }); // Directorio temporal para uploads

const router = express.Router();

// Rutas principales CRUD para categorías
router.route("/")
    .get(CategoriaController.getCategoria) // GET /api/categoria - Obtener todas las categorías
    .post(upload.single("icono"), CategoriaController.createCategoria); // POST - Crear con icono

// Rutas para manejo de categoría específica por ID
router.route("/:id")
    .get(CategoriaController.getCategoriaById) // GET /api/categoria/:id - Obtener por ID
    .put(upload.single("icono"), CategoriaController.updateCategoria) // PUT - Actualizar con icono
    .delete(CategoriaController.deleteCategoria); // DELETE /api/categoria/:id - Eliminar

export default router;

