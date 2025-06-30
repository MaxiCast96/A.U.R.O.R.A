import express from 'express';
import recetasController from '../controllers/RecetasController.js';

const router = express.Router();

// Rutas principales
router.route("/")
    .get(recetasController.getRecetas)
    .post(recetasController.createReceta);

// Rutas con parámetros ID
router.route("/:id")
    .get(recetasController.getRecetaById)
    .put(recetasController.updateReceta)
    .delete(recetasController.deleteReceta);

// Rutas especiales para consultas específicas
router.route("/historial/:historialId")
    .get(recetasController.getRecetasByHistorialMedico);

router.route("/optometrista/:optometristaId")
    .get(recetasController.getRecetasByOptometrista);

router.route("/vigentes/activas")
    .get(recetasController.getRecetasVigentes);

export default router;