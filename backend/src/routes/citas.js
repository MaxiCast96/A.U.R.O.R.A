// ===== RUTAS CITAS =====
import express from "express";
import citasController from "../controllers/CitasController.js";

const router = express.Router();

// Rutas principales CRUD para citas médicas
router.route("/")
    .get(citasController.getCitas) // GET /api/citas - Obtener todas las citas
    .post(citasController.createCita); // POST /api/citas - Agendar nueva cita

// Rutas para manejo de cita específica por ID
router.route("/:id")
    .get(citasController.getCitaById) // GET /api/citas/:id - Obtener cita por ID
    .put(citasController.updateCita) // PUT /api/citas/:id - Actualizar cita (cambiar estado, etc.)
    .delete(citasController.deleteCita); // DELETE /api/citas/:id - Cancelar cita

export default router;
