import AuditLog from '../models/AuditLog.js';
import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import empleadosModel from '../models/Empleados.js';
import clientesModel from '../models/Clientes.js';

// Paths to ignore from logging
const IGNORE_PATHS = new Set([
  '/api/auditoria',
  '/api/auditoria/stream',
  '/api/wompi/token',
  '/api/wompi/tokenless',
  '/api/wompi/testPayment',
  '/api/wompi/payment3ds'
]);

export const auditLogger = async (req, res, next) => {
  try {
    // Skip health and ignored paths
    const path = req.originalUrl || req.url || '';
    if (path === '/' || path.startsWith('/uploads') || [...IGNORE_PATHS].some(p => path.startsWith(p))) {
      return next();
    }

    const start = Date.now();
    const ua = req.headers['user-agent'] || '';
    const ip = req.headers['x-forwarded-for'] || req.ip || req.connection?.remoteAddress;

    // Hook into finish event to capture final status
    res.on('finish', async () => {
      try {
        const status = res.statusCode;
        // Only log interesting methods
        const interesting = ['POST', 'PUT', 'PATCH', 'DELETE'];
        const shouldLog = interesting.includes(req.method) || status >= 400;
        if (!shouldLog) return;

        // Derive entity from full original URL to avoid capturing IDs when router is mounted
        const fullPath = (req.originalUrl || req.url || '').split('?')[0];
        const parts = fullPath.split('/').filter(Boolean);
        const apiIdx = parts.indexOf('api');
        const entity = apiIdx >= 0 ? (parts[apiIdx + 1] || 'unknown') : (parts[0] || 'unknown');
        let type = 'read';
        if (req.method === 'POST') type = 'create';
        else if (req.method === 'PUT' || req.method === 'PATCH') type = 'update';
        else if (req.method === 'DELETE') type = 'delete';

        // Build user info: prefer req.user; if absent, try to decode token and enrich from DB
        let user = req.user || {};
        if (!user || (!user.id && !user._id)) {
          try {
            const authHeader = req.headers['authorization'];
            let tok = authHeader && authHeader.split(' ')[1];
            if (!tok && req.cookies) {
              tok = req.cookies.aurora_auth_token || req.cookies.token || null;
            }
            if (tok) {
              const decoded = jwt.verify(tok, config.jwt.secret);
              user = { ...decoded };
              if (decoded?.id) {
                if (decoded.rol === 'Cliente') {
                  const cli = await clientesModel.findById(decoded.id).lean();
                  if (cli) {
                    user.nombre = [cli.nombre, cli.apellido].filter(Boolean).join(' ') || cli.nombre;
                    user.correo = cli.correo || user.correo;
                  }
                } else {
                  const emp = await empleadosModel.findById(decoded.id).lean();
                  if (emp) {
                    user.nombre = [emp.nombre, emp.apellido].filter(Boolean).join(' ') || emp.nombre;
                    user.correo = emp.correo || user.correo;
                    user.cargo = emp.cargo || user.cargo;
                  }
                }
              }
            }
          } catch { /* ignore token errors for audit */ }
        }
        const payloadBody = (() => {
          try {
            // Avoid logging secrets
            const clone = { ...(req.body || {}) };
            if (clone.password) clone.password = '***';
            if (clone.token) clone.token = '***';
            return clone;
          } catch { return {}; }
        })();

        await AuditLog.create({
          timestamp: new Date(),
          user: {
            id: user.id || user._id || null,
            email: user.correo || user.email || null,
            nombre: user.nombre || null,
            cargo: user.cargo || null,
            rol: user.rol || null,
          },
          request: {
            method: req.method,
            path: fullPath,
            query: req.query || {},
            params: req.params || {},
            ip,
            userAgent: ua,
          },
          response: { status },
          action: {
            entity,
            type,
            summary: `${req.method} ${path} -> ${status} (${Date.now() - start}ms)`
          },
          payload: { body: payloadBody }
        });
      } catch (err) {
        // Silent fail to not break the request
        console.error('Audit log error:', err.message);
      }
    });
  } catch (e) {
    // ignore
  }
  next();
};
