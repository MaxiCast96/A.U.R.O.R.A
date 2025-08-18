import AuditLog from '../models/AuditLog.js';

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

        // Derive entity and action
        const pathParts = (req.path || '').split('/').filter(Boolean);
        const entity = pathParts[1] || pathParts[0] || 'unknown';
        let type = 'read';
        if (req.method === 'POST') type = 'create';
        else if (req.method === 'PUT' || req.method === 'PATCH') type = 'update';
        else if (req.method === 'DELETE') type = 'delete';

        const user = req.user || {};
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
            path,
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
