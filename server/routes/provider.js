const express = require('express');
const { param } = require('express-validator');
const { pool } = require('../database');
const { authenticateToken, requireProvider } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// All routes require provider authentication
router.use(authenticateToken);

// Get my contracts
router.get('/contracts', async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { status } = req.query;
    let query = `
      SELECT c.*,
             t.name as template_name
      FROM contracts c
      LEFT JOIN contract_templates t ON c.template_id = t.id
      WHERE c.provider_id = ?
    `;
    const params = [req.user.id];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    query += ' ORDER BY c.created_at DESC';

    const contracts = await conn.query(query, params);
    res.json({ contracts });

  } catch (err) {
    console.error('Get provider contracts error:', err);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  } finally {
    conn.release();
  }
});

// Get contract details
router.get('/contracts/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const [contract] = await conn.query(
      `SELECT c.*,
              t.name as template_name
       FROM contracts c
       LEFT JOIN contract_templates t ON c.template_id = t.id
       WHERE c.id = ? AND c.provider_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    res.json({ contract });

  } catch (err) {
    console.error('Get contract error:', err);
    res.status(500).json({ error: 'Failed to fetch contract' });
  } finally {
    conn.release();
  }
});

// Sign contract
router.post('/contracts/:id/sign', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { signature } = req.body;

    const [contract] = await conn.query(
      'SELECT * FROM contracts WHERE id = ? AND provider_id = ?',
      [req.params.id, req.user.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status !== 'sent') {
      return res.status(400).json({ error: 'Contract is not available for signing' });
    }

    if (contract.signed_by_provider) {
      return res.status(400).json({ error: 'Contract already signed' });
    }

    await conn.query(
      `UPDATE contracts 
       SET signed_by_provider = TRUE, 
           signed_at = NOW(), 
           provider_signature = ?,
           status = 'signed'
       WHERE id = ?`,
      [signature || 'ELECTRONICALLY_SIGNED', req.params.id]
    );

    await logAudit(req.user.id, 'SIGN_CONTRACT', 'contract', req.params.id, {
      contract_number: contract.contract_number
    }, req);

    res.json({ message: 'Contract signed successfully' });

  } catch (err) {
    console.error('Sign contract error:', err);
    res.status(500).json({ error: 'Failed to sign contract' });
  } finally {
    conn.release();
  }
});

// Reject contract
router.post('/contracts/:id/reject', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { reason } = req.body;

    const [contract] = await conn.query(
      'SELECT * FROM contracts WHERE id = ? AND provider_id = ?',
      [req.params.id, req.user.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    if (contract.status !== 'sent') {
      return res.status(400).json({ error: 'Contract cannot be rejected' });
    }

    await conn.query(
      `UPDATE contracts 
       SET status = 'draft',
           notes = CONCAT(COALESCE(notes, ''), '\n[REJECTED BY PROVIDER]: ', ?)
       WHERE id = ?`,
      [reason || 'No reason provided', req.params.id]
    );

    await logAudit(req.user.id, 'REJECT_CONTRACT', 'contract', req.params.id, {
      contract_number: contract.contract_number,
      reason
    }, req);

    res.json({ message: 'Contract rejected' });

  } catch (err) {
    console.error('Reject contract error:', err);
    res.status(500).json({ error: 'Failed to reject contract' });
  } finally {
    conn.release();
  }
});

// Get contract PDF
router.get('/contracts/:id/pdf', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const [contract] = await conn.query(
      `SELECT c.*,
              u.name as provider_name,
              u.company_name as provider_company
       FROM contracts c
       LEFT JOIN users u ON c.provider_id = u.id
       WHERE c.id = ? AND c.provider_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // TODO: Generate PDF using pdf-lib
    // For now, return HTML content
    res.setHeader('Content-Type', 'text/html');
    res.send(contract.content);

  } catch (err) {
    console.error('Get contract PDF error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  } finally {
    conn.release();
  }
});

// Get dashboard stats
router.get('/dashboard/stats', async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const stats = {};

    // Total contracts
    const [total] = await conn.query(
      'SELECT COUNT(*) as count FROM contracts WHERE provider_id = ?',
      [req.user.id]
    );
    stats.total_contracts = total.count;

    // Pending (sent but not signed)
    const [pending] = await conn.query(
      'SELECT COUNT(*) as count FROM contracts WHERE provider_id = ? AND status = "sent"',
      [req.user.id]
    );
    stats.pending_contracts = pending.count;

    // Active contracts
    const [active] = await conn.query(
      'SELECT COUNT(*) as count FROM contracts WHERE provider_id = ? AND status IN ("signed", "active")',
      [req.user.id]
    );
    stats.active_contracts = active.count;

    // Total contract value
    const [value] = await conn.query(
      'SELECT SUM(amount) as total FROM contracts WHERE provider_id = ? AND status IN ("signed", "active")',
      [req.user.id]
    );
    stats.total_value = value.total || 0;

    res.json({ stats });

  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  } finally {
    conn.release();
  }
});

module.exports = router;
