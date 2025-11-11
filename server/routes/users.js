const express = require('express');
const bcrypt = require('bcryptjs');
const { body, param } = require('express-validator');
const { pool } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// All routes require admin authentication
router.use(authenticateToken, requireAdmin);

// Get all users
router.get('/', async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { role, status, search } = req.query;
    let query = 'SELECT id, email, name, role, company_name, phone, address, commercial_registration, status, created_at, last_login FROM users WHERE 1=1';
    const params = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR company_name LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const users = await conn.query(query, params);
    res.json({ users });

  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  } finally {
    conn.release();
  }
});

// Get user by ID
router.get('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const [user] = await conn.query(
      'SELECT id, email, name, role, company_name, phone, address, commercial_registration, status, created_at, last_login FROM users WHERE id = ?',
      [req.params.id]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user's contract stats
    const [contractStats] = await conn.query(
      `SELECT 
         COUNT(*) as total_contracts,
         SUM(CASE WHEN status IN ('signed', 'active') THEN 1 ELSE 0 END) as active_contracts,
         SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as pending_contracts,
         SUM(CASE WHEN status IN ('signed', 'active') THEN amount ELSE 0 END) as total_value
       FROM contracts WHERE provider_id = ?`,
      [req.params.id]
    );

    res.json({ user, stats: contractStats });

  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ error: 'Failed to fetch user' });
  } finally {
    conn.release();
  }
});

// Create user (service provider)
router.post('/', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty().trim(),
  body('company_name').notEmpty().trim(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { email, password, name, company_name, phone, address, commercial_registration } = req.body;

    // Check if user exists
    const [existing] = await conn.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = await conn.query(
      `INSERT INTO users (email, password, name, role, company_name, phone, address, commercial_registration, status)
       VALUES (?, ?, ?, 'provider', ?, ?, ?, ?, 'active')`,
      [email, hashedPassword, name, company_name, phone, address, commercial_registration]
    );

    const userId = Number(result.insertId);

    await logAudit(req.user.id, 'CREATE_USER', 'user', userId, { email, company_name }, req);

    res.status(201).json({
      message: 'User created successfully',
      user: { id: userId, email, name, company_name }
    });

  } catch (err) {
    console.error('Create user error:', err);
    res.status(500).json({ error: 'Failed to create user' });
  } finally {
    conn.release();
  }
});

// Update user
router.put('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { name, company_name, phone, address, commercial_registration, status } = req.body;

    // Build update query
    const updates = [];
    const params = [];

    if (name) {
      updates.push('name = ?');
      params.push(name);
    }
    if (company_name) {
      updates.push('company_name = ?');
      params.push(company_name);
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      params.push(phone);
    }
    if (address !== undefined) {
      updates.push('address = ?');
      params.push(address);
    }
    if (commercial_registration !== undefined) {
      updates.push('commercial_registration = ?');
      params.push(commercial_registration);
    }
    if (status) {
      updates.push('status = ?');
      params.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    params.push(req.params.id);

    const result = await conn.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAudit(req.user.id, 'UPDATE_USER', 'user', req.params.id, { name }, req);

    res.json({ message: 'User updated successfully' });

  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ error: 'Failed to update user' });
  } finally {
    conn.release();
  }
});

// Approve pending user
router.post('/:id/approve', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const result = await conn.query(
      'UPDATE users SET status = "active" WHERE id = ? AND status = "pending"',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or not pending' });
    }

    await logAudit(req.user.id, 'APPROVE_USER', 'user', req.params.id, {}, req);

    res.json({ message: 'User approved successfully' });

  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ error: 'Failed to approve user' });
  } finally {
    conn.release();
  }
});

// Reset user password
router.post('/:id/reset-password', [
  param('id').isInt(),
  body('newPassword').isLength({ min: 8 }),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { newPassword } = req.body;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await conn.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    await logAudit(req.user.id, 'RESET_PASSWORD', 'user', req.params.id, {}, req);

    res.json({ message: 'Password reset successfully' });

  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Failed to reset password' });
  } finally {
    conn.release();
  }
});

// Delete user
router.delete('/:id', [
  param('id').isInt(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    // Check if user has contracts
    const [contractCount] = await conn.query(
      'SELECT COUNT(*) as count FROM contracts WHERE provider_id = ?',
      [req.params.id]
    );

    if (contractCount.count > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete user with existing contracts. Deactivate instead.' 
      });
    }

    const result = await conn.query(
      'DELETE FROM users WHERE id = ? AND role = "provider"',
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found or cannot be deleted' });
    }

    await logAudit(req.user.id, 'DELETE_USER', 'user', req.params.id, {}, req);

    res.json({ message: 'User deleted successfully' });

  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    conn.release();
  }
});

module.exports = router;
