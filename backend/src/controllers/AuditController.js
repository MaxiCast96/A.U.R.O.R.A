import AuditLog from '../models/AuditLog.js';

export const listLogs = async (req, res) => {
  try {
    const {
      q,
      userEmail,
      entity,
      method,
      status,
      from,
      to,
      page = 1,
      pageSize = 50,
    } = req.query;

    const filter = {};
    if (q) {
      const rx = new RegExp(String(q).trim(), 'i');
      filter.$or = [
        { 'user.email': rx },
        { 'user.nombre': rx },
        { 'action.summary': rx },
        { 'action.entity': rx },
        { 'request.path': rx },
      ];
    }
    if (userEmail) filter['user.email'] = new RegExp(String(userEmail).trim(), 'i');
    if (entity) filter['action.entity'] = String(entity);
    if (method) filter['request.method'] = String(method).toUpperCase();
    if (status) filter['response.status'] = Number(status);
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Math.min(Number(pageSize) || 50, 200);

    const [items, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter)
    ]);

    res.json({ success: true, data: items, total, page: Number(page), pageSize: limit });
  } catch (err) {
    console.error('listLogs error:', err);
    res.status(500).json({ success: false, message: 'Error listando auditoría' });
  }
};

// Simple SSE using periodic polling (no Mongo change streams requirement)
export const streamLogs = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  let lastId = null;
  let alive = true;
  req.on('close', () => { alive = false; });

  const tick = async () => {
    if (!alive) return;
    try {
      const filter = lastId ? { _id: { $gt: lastId } } : {};
      const latest = await AuditLog.find(filter).sort({ _id: 1 }).limit(50).lean();
      if (latest.length) {
        lastId = latest[latest.length - 1]._id;
        res.write(`data: ${JSON.stringify(latest)}\n\n`);
      }
    } catch (e) {
      // send error but keep stream
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: e.message })}\n\n`);
    } finally {
      setTimeout(tick, 3000);
    }
  };

  // initial burst
  setTimeout(tick, 1000);
};
