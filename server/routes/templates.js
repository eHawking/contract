const express = require('express');
const { body, param } = require('express-validator');
const { pool } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// All routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Get all templates
router.get('/', async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { status, category } = req.query;
    let query = 'SELECT * FROM contract_templates WHERE 1=1';
    const params = [];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY created_at DESC';

    const templates = await conn.query(query, params);
    res.json({ templates });

  } catch (err) {
    console.error('Get templates error:', err);
    res.status(500).json({ error: 'Failed to fetch templates' });
  } finally {
    conn.release();
  }
});

// Get template by ID
router.get('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const [template] = await conn.query(
      'SELECT * FROM contract_templates WHERE id = ?',
      [req.params.id]
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });

  } catch (err) {
    console.error('Get template error:', err);
    res.status(500).json({ error: 'Failed to fetch template' });
  } finally {
    conn.release();
  }
});

// Create new template
router.post('/', [
  body('name').notEmpty().trim(),
  body('content').notEmpty(),
  body('category').optional(),
  body('description').optional(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { name, description, category, content, fields } = req.body;

    const result = await conn.query(
      `INSERT INTO contract_templates (name, description, category, content, fields, created_by, status)
       VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [name, description, category, content, JSON.stringify(fields), req.user.id]
    );

    const templateId = Number(result.insertId);

    await logAudit(req.user.id, 'CREATE_TEMPLATE', 'template', templateId, { name }, req);

    res.status(201).json({
      message: 'Template created successfully',
      template: { id: templateId, name }
    });

  } catch (err) {
    console.error('Create template error:', err);
    res.status(500).json({ error: 'Failed to create template' });
  } finally {
    conn.release();
  }
});

// Update template
router.put('/:id', [
  param('id').isInt(),
  body('name').optional().notEmpty().trim(),
  body('content').optional().notEmpty(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { name, description, category, content, fields, status } = req.body;
    
    // Check if template exists
    const [existing] = await conn.query(
      'SELECT id FROM contract_templates WHERE id = ?',
      [req.params.id]
    );

    if (!existing) {
      return res.status(404).json({ error: 'Template not found' });
    }

    // Build update query
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description);
    }
    if (category) {
      updates.push('category = ?');
      params.push(category);
    }
    if (content) {
      updates.push('content = ?');
      params.push(content);
    }
    if (fields) {
      updates.push('fields = ?');
      params.push(JSON.stringify(fields));
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    await conn.query(
      `UPDATE contract_templates SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    await logAudit(req.user.id, 'UPDATE_TEMPLATE', 'template', req.params.id, { name }, req);

    res.json({ message: 'Template updated successfully' });

  } catch (err) {
    console.error('Update template error:', err);
    res.status(500).json({ error: 'Failed to update template' });
  } finally {
    conn.release();
  }
});

// Delete template
router.delete('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    // Check if template is used in contracts
    const [usageCount] = await conn.query(
      'SELECT COUNT(*) as count FROM contracts WHERE template_id = ?',
      [req.params.id]
    );

    if (usageCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete template. It is used in existing contracts.' 
      });
    }

    const result = await conn.query(
      'DELETE FROM contract_templates WHERE id = ?',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await logAudit(req.user.id, 'DELETE_TEMPLATE', 'template', req.params.id, {}, req);

    res.json({ message: 'Template deleted successfully' });

  } catch (err) {
    console.error('Delete template error:', err);
    res.status(500).json({ error: 'Failed to delete template' });
  } finally {
    conn.release();
  }
});

module.exports = router;
