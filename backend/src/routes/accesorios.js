// ===== RUTAS ACCESORIOS =====
import express from "express";
import accesoriosController from "../controllers/AccesoriosController.js";

const router = express.Router();

// IMPORTANTE: Rutas específicas deben ir ANTES de las rutas con parámetros
// para evitar conflictos de routing

// GET /api/accesorios/promociones/activas - Obtener accesorios en promoción
router.get("/promociones/activas", accesoriosController.getAccesoriosEnPromocion);

// GET /api/accesorios/marca/:marcaId - Filtrar accesorios por marca específica
router.get("/marca/:marcaId", accesoriosController.getAccesoriosByMarca);

// Rutas principales CRUD para accesorios
router.route("/")
    .get(accesoriosController.getAccesorios) // GET /api/accesorios - Obtener todos los accesorios
    .post(accesoriosController.createAccesorios); // POST - Crear con hasta 5 imágenes

// Rutas para manejo de accesorio específico por ID
router.route("/:id")
    .get(accesoriosController.getAccesorioById) // GET /api/accesorios/:id - Obtener por ID
    .put(accesoriosController.updateAccesorios) // PUT - Actualizar con imágenes
    .delete(accesoriosController.deleteAccesorios); // DELETE /api/accesorios/:id - Eliminar

export default router;