import express from 'express';
import { authenticateToken, requireAdmin } from '../middlewares/auth.js';
import { listLogs, streamLogs } from '../controllers/AuditController.js';

const router = express.Router();

// Solo admin puede ver auditoría
router.get('/', authenticateToken, requireAdmin, listLogs);
router.get('/stream', authenticateToken, requireAdmin, streamLogs);

export default router;
