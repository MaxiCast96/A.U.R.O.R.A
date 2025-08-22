// ===== RUTAS CATEGORIA =====
import express from "express";
import CategoriaController from "../controllers/CategoriaController.js";
// import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// Rutas principales CRUD para categorías
router.route("/")
    .get(CategoriaController.getCategoria) // GET /api/categoria - Obtener todas las categorías
    .post(CategoriaController.createCategoria); // POST - Crear con icono (temporalmente público)

// Rutas para manejo de categoría específica por ID
router.route("/:id")
    .get(CategoriaController.getCategoriaById) // GET /api/categoria/:id - Obtener por ID
    .put(CategoriaController.updateCategoria) // PUT - Actualizar con icono (temporalmente público)
    .delete(CategoriaController.deleteCategoria); // DELETE /api/categoria/:id - Eliminar (temporalmente público)

export default router;
