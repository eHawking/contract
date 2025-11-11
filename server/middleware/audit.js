const { pool } = require('../database');

// Log user actions
async function logAudit(userId, action, entityType, entityId, details, req) {
  try {
    const conn = await pool.getConnection();
    await conn.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        action,
        entityType,
        entityId,
        JSON.stringify(details),
        req.ip || req.connection.remoteAddress,
        req.get('user-agent')
      ]
    );
    conn.release();
  } catch (err) {
    console.error('Audit log error:', err);
    // Don't throw error to avoid breaking the main flow
  }
}

// Middleware to log actions
function auditLog(action) {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;
    
    // Override send to log after successful response
    res.send = function(data) {
      // Log the action if response is successful
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || req.body.id || null;
        logAudit(
          req.user?.id,
          action,
          req.baseUrl.split('/').pop(),
          entityId,
          { method: req.method, path: req.path },
          req
        );
      }
      
      // Call original send
      originalSend.call(this, data);
    };
    
    next();
  };
}

module.exports = { logAudit, auditLog };
