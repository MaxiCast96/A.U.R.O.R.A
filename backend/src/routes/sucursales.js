// ===== RUTAS SUCURSALES =====
import express from 'express';
import sucursalesController from '../controllers/SucursalesController.js';

const router = express.Router();

// Rutas principales CRUD para sucursales
router.route("/")
    .get(sucursalesController.getSucursales) // GET /api/sucursales - Obtener todas las sucursales
    .post(sucursalesController.createSucursales); // POST /api/sucursales - Crear nueva sucursal

// Rutas para manejo de sucursal específica por ID
router.route("/:id")
    .get(sucursalesController.getSucursalById) // GET /api/sucursales/:id - Obtener sucursal por ID
    .put(sucursalesController.updateSucursales) // PUT /api/sucursales/:id - Actualizar sucursal
    .delete(sucursalesController.deleteSucursales); // DELETE /api/sucursales/:id - Eliminar sucursal

export default router;
