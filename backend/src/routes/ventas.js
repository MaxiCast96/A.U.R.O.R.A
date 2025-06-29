import express from 'express';
import ventasController from '../controllers/VentasController.js';

const router = express.Router();

// Rutas principales CRUD
router.route("/")
    .get(ventasController.getVentas)           // GET /api/ventas - Obtener todas las ventas
    .post(ventasController.createVenta);        // POST /api/ventas - Crear nueva venta

router.route("/:id")
    .get(ventasController.getVentaById)         // GET /api/ventas/:id - Obtener venta por ID
    .put(ventasController.updateVenta)          // PUT /api/ventas/:id - Actualizar venta
    .delete(ventasController.deleteVenta);      // DELETE /api/ventas/:id - Eliminar venta

// Rutas adicionales para consultas específicas
router.route("/estado/:estado")
    .get(ventasController.getVentasByEstado);   // GET /api/ventas/estado/:estado - Ventas por estado

router.route("/sucursal/:sucursalId")
    .get(ventasController.getVentasBySucursal); // GET /api/ventas/sucursal/:sucursalId - Ventas por sucursal

router.route("/empleado/:empleadoId")
    .get(ventasController.getVentasByEmpleado); // GET /api/ventas/empleado/:empleadoId - Ventas por empleado

router.route("/fecha/rango")
    .get(ventasController.getVentasByFecha);    // GET /api/ventas/fecha/rango?fechaInicio=YYYY-MM-DD&fechaFin=YYYY-MM-DD

export default router;