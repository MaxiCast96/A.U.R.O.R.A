// ===== RUTAS MARCAS =====
import express from "express";
import marcasController from "../controllers/MarcasController.js";
import multer from "multer";

// Configuración de multer para manejo de logos de marcas
const upload = multer({ dest: "uploads/" }); // Directorio temporal para uploads

const router = express.Router();

// Rutas principales CRUD para marcas
router.route("/")
    .get(marcasController.getMarcas) // GET /api/marcas - Obtener todas las marcas
    .post(upload.single("logo"), marcasController.createMarcas); // POST - Crear con logo

// Rutas para manejo de marca específica por ID
router.route("/:id")
    .get(marcasController.getMarcaById) // GET /api/marcas/:id - Obtener marca por ID
    .put(upload.single("logo"), marcasController.updateMarcas) // PUT - Actualizar con logo
    .delete(marcasController.deleteMarcas); // DELETE /api/marcas/:id - Eliminar marca

export default router;