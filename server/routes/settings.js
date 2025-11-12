const express = require('express');
const { body } = require('express-validator');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { pool } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { logAudit } = require('../middleware/audit');

const router = express.Router();

// Public settings (no auth)
router.get('/public', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [settings] = await conn.query('SELECT company_name, company_address, company_phone, company_email, company_website, logo_url FROM app_settings WHERE id = 1');
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load public settings' });
  } finally {
    conn.release();
  }
});

// Authenticated admin: get all settings
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const [settings] = await conn.query('SELECT * FROM app_settings WHERE id = 1');
    res.json({ settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to load settings' });
  } finally {
    conn.release();
  }
});

router.put('/', [
  authenticateToken,
  requireAdmin,
  body('company_name').optional().isString().trim(),
  body('company_address').optional().isString(),
  body('company_phone').optional().isString(),
  body('company_email').optional().isEmail().normalizeEmail(),
  body('company_website').optional().isString(),
  body('email_smtp_host').optional().isString(),
  body('email_smtp_port').optional().isInt(),
  body('email_smtp_user').optional().isString(),
  body('email_smtp_password').optional().isString(),
  body('email_smtp_secure') .optional().isBoolean(),
  body('gemini_api_key').optional().isString(),
  body('gemini_model').optional().isString(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const fields = [
      'company_name','company_address','company_phone','company_email','company_website',
      'email_smtp_host','email_smtp_port','email_smtp_user','email_smtp_password','email_smtp_secure',
      'gemini_api_key','gemini_model'
    ];
    const updates = [];
    const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(1);
    await conn.query(`UPDATE app_settings SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_SETTINGS', 'app_settings', 1, {}, req);
    const [settings] = await conn.query('SELECT * FROM app_settings WHERE id = 1');
    res.json({ message: 'Settings updated', settings });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update settings' });
  } finally {
    conn.release();
  }
});

const logoDir = path.join(__dirname, '..', '..', 'uploads', 'logos');
fs.mkdirSync(logoDir, { recursive: true });
const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, logoDir); },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `logo_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png','.jpg','.jpeg','.svg','.webp'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Invalid file type'));
    cb(null, true);
  }
});

router.post('/logo', authenticateToken, requireAdmin, upload.single('logo'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rel = `/uploads/logos/${path.basename(req.file.path)}`;
    await conn.query('UPDATE app_settings SET logo_url = ? WHERE id = 1', [rel]);
    await logAudit(req.user.id, 'UPLOAD_LOGO', 'app_settings', 1, { logo_url: rel }, req);
    res.json({ message: 'Logo updated', logo_url: rel });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload logo' });
  } finally {
    conn.release();
  }
});

module.exports = router;
