// ===== RUTAS DASHBOARD =====
import express from 'express';
import {
  getDashboardStats,
  getVentasMensuales,
  getEstadoCitas,
  getProductosPopulares,
  getAllDashboardData
} from '../controllers/DashboardController.js';
import { authenticateToken, requireEmployee } from '../middlewares/auth.js'; // Middleware de autenticación

const router = express.Router();

// Aplicar middleware de autenticación a TODAS las rutas del dashboard
// Solo usuarios autenticados pueden acceder a estas estadísticas
router.use(authenticateToken);

/**
 * @route GET /api/dashboard/all
 * @desc Obtiene todos los datos del dashboard en una sola petición
 * @access Private - Requiere autenticación y rol de empleado
 */
router.get('/all', authenticateToken, getAllDashboardData);

/**
 * @route GET /api/dashboard/stats
 * @desc Obtiene estadísticas básicas (totales, promedios, etc.)
 * @access Private - Requiere autenticación
 */
router.get('/stats', getDashboardStats);

/**
 * @route GET /api/dashboard/ventas-mensuales
 * @desc Obtiene datos de ventas por mes para gráficos
 * @access Private - Requiere autenticación
 */
router.get('/ventas-mensuales', getVentasMensuales);

/**
 * @route GET /api/dashboard/estado-citas
 * @desc Obtiene distribución de estados de citas para gráfico circular
 * @access Private - Requiere autenticación
 */
router.get('/estado-citas', getEstadoCitas);

/**
 * @route GET /api/dashboard/productos-populares
 * @desc Obtiene los productos más vendidos/populares
 * @access Private - Requiere autenticación
 */
router.get('/productos-populares', getProductosPopulares);

export default router;