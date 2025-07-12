// ===== RUTAS VENTAS =====
import express from 'express';
import ventasController from '../controllers/VentasController.js';

const router = express.Router();

// Rutas principales CRUD para ventas
router.route("/")
    .get(ventasController.getVentas) // GET /api/ventas - Obtener todas las ventas
    .post(ventasController.createVenta); // POST /api/ventas - Crear nueva venta/transacción

// Rutas para manejo de venta específica por ID
router.route("/:id")
    .get(ventasController.getVentaById) // GET /api/ventas/:id - Obtener venta por ID
    .put(ventasController.updateVenta) // PUT /api/ventas/:id - Actualizar venta
    .delete(ventasController.deleteVenta); // DELETE /api/ventas/:id - Eliminar venta

// Rutas adicionales para consultas específicas y reportes

// GET /api/ventas/estado/:estado - Filtrar ventas por estado (pendiente, completada, etc.)
router.route("/estado/:estado")
    .get(ventasController.getVentasByEstado);

// GET /api/ventas/sucursal/:sucursalId - Ventas realizadas en una sucursal específica
router.route("/sucursal/:sucursalId")
    .get(ventasController.getVentasBySucursal);

// GET /api/ventas/empleado/:empleadoId - Ventas procesadas por un empleado específico
router.route("/empleado/:empleadoId")
    .get(ventasController.getVentasByEmpleado);

// GET /api/ventas/fecha/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD
// Obtener ventas en un rango de fechas específico usando query parameters
router.route("/fecha/rango")
    .get(ventasController.getVentasByFecha);

export default router;