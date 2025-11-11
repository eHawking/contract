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

module.exports = { logAudit };
