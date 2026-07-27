const AuditLog = require('../models/AuditLog');

// Best-effort audit trail for sensitive admin actions — never blocks the
// request if logging itself fails.
const logAdminAction = (req, action, target, details) => {
  if (!req.user) return;
  AuditLog.create({
    admin: req.user._id,
    adminName: req.user.name,
    action,
    target,
    details,
  }).catch((err) => console.error('Audit log write failed:', err.message));
};

module.exports = logAdminAction;
