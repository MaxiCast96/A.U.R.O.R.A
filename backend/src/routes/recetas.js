// ===== RUTAS RECETAS =====
import express from 'express';
import recetasController from '../controllers/RecetasController.js';

const router = express.Router();

// Rutas principales CRUD para recetas médicas
router.route("/")
    .get(recetasController.getRecetas) // GET /api/recetas - Obtener todas las recetas
    .post(recetasController.createReceta); // POST /api/recetas - Crear nueva receta

// Rutas especiales para consultas específicas de recetas

// GET /api/recetas/historial/:historialId - Recetas asociadas a un historial médico
router.route("/historial/:historialId")
    .get(recetasController.getRecetasByHistorialMedico);

// GET /api/recetas/optometrista/:optometristaId - Recetas emitidas por un optometrista
router.route("/optometrista/:optometristaId")
    .get(recetasController.getRecetasByOptometrista);

// GET /api/recetas/vigentes/activas - Recetas que aún están vigentes (no expiradas)
router.route("/vigentes/activas")
    .get(recetasController.getRecetasVigentes);

// Rutas para manejo de receta específica por ID (colocar al final para evitar colisiones)
router.route("/:id")
    .get(recetasController.getRecetaById) // GET /api/recetas/:id - Obtener receta por ID
    .put(recetasController.updateReceta) // PUT /api/recetas/:id - Actualizar receta
    .delete(recetasController.deleteReceta); // DELETE /api/recetas/:id - Eliminar receta

export default router;