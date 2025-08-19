import mongoose from 'mongoose';

const AuditLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now, index: true },
  user: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'Empleados' },
    email: String,
    nombre: String,
    cargo: String,
    rol: String,
  },
  request: {
    method: String,
    path: String,
    query: Object,
    params: Object,
    ip: String,
    userAgent: String,
  },
  response: {
    status: Number,
  },
  // action may be stored as an object (entity/type/summary) or as a string in older records/deploys
  action: mongoose.Schema.Types.Mixed,
  payload: {
    body: Object,
  }
}, { timestamps: true });

// Indexes for filtering
AuditLogSchema.index({ 'user.email': 1, timestamp: -1 });
AuditLogSchema.index({ 'action.entity': 1, timestamp: -1 });
AuditLogSchema.index({ 'request.method': 1, timestamp: -1 });
AuditLogSchema.index({ 'response.status': 1, timestamp: -1 });

const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
