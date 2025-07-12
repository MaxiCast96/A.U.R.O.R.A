import express from 'express';
import {
  getDashboardStats,
  getVentasMensuales,
  getEstadoCitas,
  getProductosPopulares,
  getAllDashboardData
} from '../controllers/DashboardController.js';
import { authenticateToken } from '../middlewares/auth.js';

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

/**
 * @route GET /api/dashboard/all
 * @desc Obtiene todos los datos del dashboard en una sola llamada
 * @access Private
 */
router.get('/all', getAllDashboardData);

/**
 * @route GET /api/dashboard/stats
 * @desc Obtiene estadísticas básicas del dashboard
 * @access Private
 */
router.get('/stats', getDashboardStats);

/**
 * @route GET /api/dashboard/ventas-mensuales
 * @desc Obtiene datos de ventas mensuales para gráfico
 * @access Private
 */
router.get('/ventas-mensuales', getVentasMensuales);

/**
 * @route GET /api/dashboard/estado-citas
 * @desc Obtiene estado de citas para gráfico circular
 * @access Private
 */
router.get('/estado-citas', getEstadoCitas);

/**
 * @route GET /api/dashboard/productos-populares
 * @desc Obtiene productos más populares
 * @access Private
 */
router.get('/productos-populares', getProductosPopulares);

export default router; 