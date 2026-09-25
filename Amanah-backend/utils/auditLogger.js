import AuditLog from '../models/AuditLog.js';

/**
 * Record a tamper-evident audit event
 */
export const recordAudit = async ({
  req,
  action,
  actorId = null,
  actorEmail = null,
  actorRole = 'ANONYMOUS',
  targetResource = null,
  status = 'SUCCESS',
  details = {}
}) => {
  try {
    const ipAddress = req ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '') : '';
    const userAgent = req ? (req.headers['user-agent'] || '') : '';
    const resolvedActorId = actorId || req?.user?._id || null;
    const resolvedActorEmail = actorEmail || req?.user?.email || null;
    const resolvedRole = actorRole !== 'ANONYMOUS' ? actorRole : (req?.user?.role || 'ANONYMOUS');

    // Retrieve the latest audit log entry to establish the cryptographic chain
    const lastEntry = await AuditLog.findOne().sort({ createdAt: -1 }).select('entryHash');
    const previousHash = lastEntry ? lastEntry.entryHash : 'GENESIS_BLOCK';

    const logEntry = new AuditLog({
      action,
      actorId: resolvedActorId ? String(resolvedActorId) : null,
      actorEmail: resolvedActorEmail,
      actorRole: resolvedRole,
      targetResource,
      ipAddress: String(ipAddress).split(',')[0].trim(),
      userAgent: String(userAgent).slice(0, 255),
      status,
      details,
      previousHash
    });

    await logEntry.save();
  } catch (err) {
    // Non-blocking: audit logging failures must never bring down primary transactions
    console.error("[WARN] Failed to write audit log entry:", err.message);
  }
};
