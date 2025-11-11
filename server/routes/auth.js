const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// Login
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { email, password } = req.body;

    // Get user
    const [user] = await conn.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ error: 'Account is not active' });
    }

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Update last login
    await conn.query(
      'UPDATE users SET last_login = NOW() WHERE id = ?',
      [user.id]
    );

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Log audit
    await logAudit(user.id, 'LOGIN', 'user', user.id, { email }, req);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company_name: user.company_name,
        phone: user.phone
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  } finally {
    conn.release();
  }
});

// Register (Service Provider)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }),
  body('name').notEmpty().trim(),
  body('company_name').notEmpty().trim(),
  body('phone').notEmpty(),
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
       VALUES (?, ?, ?, 'provider', ?, ?, ?, ?, 'pending')`,
      [email, hashedPassword, name, company_name, phone, address, commercial_registration]
    );

    const userId = Number(result.insertId);

    // Log audit
    await logAudit(userId, 'REGISTER', 'user', userId, { email, company_name }, req);

    res.status(201).json({
      message: 'Registration successful. Your account is pending approval.',
      user: { id: userId, email, name, company_name }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    conn.release();
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res) => {
  res.json({ user: req.user });
});

// Logout (client-side token removal)
router.post('/logout', authenticateToken, async (req, res) => {
  await logAudit(req.user.id, 'LOGOUT', 'user', req.user.id, {}, req);
  res.json({ message: 'Logged out successfully' });
});

// Change password
router.post('/change-password', [
  authenticateToken,
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 8 }),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const [user] = await conn.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    // Verify current password
    const validPassword = await bcrypt.compare(currentPassword, user.password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await conn.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    // Log audit
    await logAudit(req.user.id, 'CHANGE_PASSWORD', 'user', req.user.id, {}, req);

    res.json({ message: 'Password changed successfully' });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Failed to change password' });
  } finally {
    conn.release();
  }
});

module.exports = router;
