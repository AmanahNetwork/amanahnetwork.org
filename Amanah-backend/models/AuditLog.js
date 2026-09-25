import mongoose from 'mongoose';
import crypto from 'crypto';

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true, index: true },
  actorId: { type: String, default: null },
  actorEmail: { type: String, default: null },
  actorRole: { type: String, default: 'ANONYMOUS' },
  targetResource: { type: String, default: null },
  ipAddress: { type: String, default: null },
  userAgent: { type: String, default: null },
  status: { type: String, enum: ['SUCCESS', 'FAILED', 'BLOCKED'], default: 'SUCCESS', index: true },
  details: { type: mongoose.Schema.Types.Mixed, default: {} },
  previousHash: { type: String, default: null },
  entryHash: { type: String, default: null },
  timestamp: { type: Date, default: Date.now, index: true }
}, {
  timestamps: true
});

// Compute tamper-evident hash chain prior to saving
AuditLogSchema.pre('save', async function() {
  const content = `${this.action}|${this.actorId}|${this.status}|${this.timestamp?.toISOString()}|${JSON.stringify(this.details)}|${this.previousHash || 'GENESIS'}`;
  this.entryHash = crypto.createHash('sha256').update(content).digest('hex');
});

delete mongoose.models.AuditLog;
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
export default AuditLog;
