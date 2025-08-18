import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { listLogs, streamLogs } from '../controllers/AuditController.js';

const router = express.Router();

// Solo admin puede ver auditoría
router.get('/', authenticateToken, requireAdmin, listLogs);
// Permitir token por query en SSE (EventSource no permite headers)
router.get('/stream', (req, _res, next) => {
  if (!req.headers.authorization && req.query.token) {
    req.headers.authorization = `Bearer ${req.query.token}`;
  }
  next();
}, authenticateToken, requireAdmin, streamLogs);

export default router;
