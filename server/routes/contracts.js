const express = require('express');
const { body, param } = require('express-validator');
const { pool } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Generate contract number
function generateContractNumber() {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `AEMCO-${year}-${random}`;
}

// Get all contracts
router.get('/', async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { status, provider_id, search } = req.query;
    let query = `
      SELECT c.*, 
             u.name as provider_name, 
             u.company_name as provider_company,
             t.name as template_name
      FROM contracts c
      LEFT JOIN users u ON c.provider_id = u.id
      LEFT JOIN contract_templates t ON c.template_id = t.id
      WHERE 1=1
    `;
    const params = [];

    if (status) {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (provider_id) {
      query += ' AND c.provider_id = ?';
      params.push(provider_id);
    }

    if (search) {
      query += ' AND (c.contract_number LIKE ? OR c.title LIKE ? OR u.name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY c.created_at DESC';

    const contracts = await conn.query(query, params);
    res.json({ contracts });

  } catch (err) {
    console.error('Get contracts error:', err);
    res.status(500).json({ error: 'Failed to fetch contracts' });
  } finally {
    conn.release();
  }
});

// Get contract PDF (admin)
router.get('/:id/pdf', [
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
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // TODO: Replace with actual PDF generation. For now, return HTML content.
    res.setHeader('Content-Type', 'text/html');
    res.send(contract.content);
  } catch (err) {
    console.error('Get admin contract PDF error:', err);
    res.status(500).json({ error: 'Failed to generate PDF' });
  } finally {
    conn.release();
  }
});

// Get contract by ID
router.get('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const [contract] = await conn.query(
      `SELECT c.*, 
              u.name as provider_name, 
              u.company_name as provider_company,
              u.email as provider_email,
              u.phone as provider_phone,
              t.name as template_name
       FROM contracts c
       LEFT JOIN users u ON c.provider_id = u.id
       LEFT JOIN contract_templates t ON c.template_id = t.id
       WHERE c.id = ?`,
      [req.params.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Get contract versions
    const versions = await conn.query(
      `SELECT v.*, u.name as changed_by_name
       FROM contract_versions v
       LEFT JOIN users u ON v.changed_by = u.id
       WHERE v.contract_id = ?
       ORDER BY v.version_number DESC`,
      [req.params.id]
    );

    res.json({ contract, versions });

  } catch (err) {
    console.error('Get contract error:', err);
    res.status(500).json({ error: 'Failed to fetch contract' });
  } finally {
    conn.release();
  }
});

// Create new contract
router.post('/', [
  body('provider_id').isInt(),
  body('title').notEmpty().trim(),
  body('content').notEmpty(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const {
      provider_id,
      template_id,
      title,
      content,
      start_date,
      end_date,
      amount,
      currency,
      notes,
      metadata
    } = req.body;

    // Verify provider exists
    const [provider] = await conn.query(
      'SELECT id FROM users WHERE id = ? AND role = "provider"',
      [provider_id]
    );

    if (!provider) {
      await conn.rollback();
      return res.status(400).json({ error: 'Invalid provider' });
    }

    // Generate unique contract number
    let contractNumber;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 10) {
      contractNumber = generateContractNumber();
      const [existing] = await conn.query(
        'SELECT id FROM contracts WHERE contract_number = ?',
        [contractNumber]
      );
      if (!existing) isUnique = true;
      attempts++;
    }

    if (!isUnique) {
      await conn.rollback();
      return res.status(500).json({ error: 'Failed to generate unique contract number' });
    }

    // Create contract
    const result = await conn.query(
      `INSERT INTO contracts 
       (contract_number, template_id, provider_id, title, content, start_date, end_date, 
        amount, currency, notes, metadata, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')`,
      [
        contractNumber,
        template_id || null,
        provider_id,
        title,
        content,
        start_date || null,
        end_date || null,
        amount || null,
        currency || 'SAR',
        notes || null,
        metadata ? JSON.stringify(metadata) : null,
        req.user.id
      ]
    );

    const contractId = Number(result.insertId);

    // Create initial version
    await conn.query(
      `INSERT INTO contract_versions (contract_id, version_number, content, changed_by, change_notes)
       VALUES (?, 1, ?, ?, 'Initial version')`,
      [contractId, content, req.user.id]
    );

    await conn.commit();

    await logAudit(req.user.id, 'CREATE_CONTRACT', 'contract', contractId, { 
      contract_number: contractNumber, 
      title 
    }, req);

    res.status(201).json({
      message: 'Contract created successfully',
      contract: {
        id: contractId,
        contract_number: contractNumber,
        title
      }
    });

  } catch (err) {
    await conn.rollback();
    console.error('Create contract error:', err);
    res.status(500).json({ error: 'Failed to create contract' });
  } finally {
    conn.release();
  }
});

// Update contract
router.put('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();

    const {
      title,
      content,
      start_date,
      end_date,
      amount,
      currency,
      status,
      notes,
      metadata,
      change_notes
    } = req.body;

    // Check if contract exists
    const [existing] = await conn.query(
      'SELECT * FROM contracts WHERE id = ?',
      [req.params.id]
    );

    if (!existing) {
      await conn.rollback();
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Don't allow editing signed contracts
    if (existing.status === 'signed' && !req.body.force) {
      await conn.rollback();
      return res.status(400).json({ 
        error: 'Cannot edit signed contract without force flag' 
      });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (title) {
      updates.push('title = ?');
      params.push(title);
    }
    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(start_date);
    }
    if (end_date !== undefined) {
      updates.push('end_date = ?');
      params.push(end_date);
    }
    if (amount !== undefined) {
      updates.push('amount = ?');
      params.push(amount);
    }
    if (currency) {
      updates.push('currency = ?');
      params.push(currency);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }
    if (metadata) {
      updates.push('metadata = ?');
      params.push(JSON.stringify(metadata));
    }

    if (updates.length === 0) {
      await conn.rollback();
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    await conn.query(
      `UPDATE contracts SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    // Create new version if content changed
    if (content && content !== existing.content) {
      const [latestVersion] = await conn.query(
        'SELECT MAX(version_number) as max_version FROM contract_versions WHERE contract_id = ?',
        [req.params.id]
      );

      const newVersionNumber = (latestVersion.max_version || 0) + 1;

      await conn.query(
        `INSERT INTO contract_versions (contract_id, version_number, content, changed_by, change_notes)
         VALUES (?, ?, ?, ?, ?)`,
        [req.params.id, newVersionNumber, content, req.user.id, change_notes || 'Updated']
      );
    }

    await conn.commit();

    await logAudit(req.user.id, 'UPDATE_CONTRACT', 'contract', req.params.id, { title }, req);

    res.json({ message: 'Contract updated successfully' });

  } catch (err) {
    await conn.rollback();
    console.error('Update contract error:', err);
    res.status(500).json({ error: 'Failed to update contract' });
  } finally {
    conn.release();
  }
});

// Send contract to provider
router.post('/:id/send', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const [contract] = await conn.query(
      'SELECT * FROM contracts WHERE id = ?',
      [req.params.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    await conn.query(
      'UPDATE contracts SET status = ? WHERE id = ?',
      ['sent', req.params.id]
    );

    await logAudit(req.user.id, 'SEND_CONTRACT', 'contract', req.params.id, {
      contract_number: contract.contract_number
    }, req);

    // TODO: Send email notification to provider

    res.json({ message: 'Contract sent to provider successfully' });

  } catch (err) {
    console.error('Send contract error:', err);
    res.status(500).json({ error: 'Failed to send contract' });
  } finally {
    conn.release();
  }
});

// Delete contract
router.delete('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const [contract] = await conn.query(
      'SELECT status FROM contracts WHERE id = ?',
      [req.params.id]
    );

    if (!contract) {
      return res.status(404).json({ error: 'Contract not found' });
    }

    // Don't allow deleting signed or active contracts
    if (['signed', 'active'].includes(contract.status)) {
      return res.status(400).json({ 
        error: 'Cannot delete signed or active contracts' 
      });
    }

    await conn.query('DELETE FROM contracts WHERE id = ?', [req.params.id]);

    await logAudit(req.user.id, 'DELETE_CONTRACT', 'contract', req.params.id, {}, req);

    res.json({ message: 'Contract deleted successfully' });

  } catch (err) {
    console.error('Delete contract error:', err);
    res.status(500).json({ error: 'Failed to delete contract' });
  } finally {
    conn.release();
  }
});

module.exports = router;
