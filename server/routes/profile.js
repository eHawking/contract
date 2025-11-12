const express = require('express');
const { body } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validator');
const { logAudit } = require('../middleware/audit');

const router = express.Router();
router.use(authenticateToken);

router.get('/', async (req, res) => {
  res.json({ user: req.user });
});

router.put('/', [
  body('name').optional().isString().trim(),
  body('phone').optional().isString(),
  body('address').optional().isString(),
  body('company_name').optional().isString().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  validate
], async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const fields = ['name','phone','address','company_name','email'];
    const updates = [];
    const params = [];
    for (const f of fields) {
      if (req.body[f] !== undefined) { updates.push(`${f} = ?`); params.push(req.body[f]); }
    }
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });
    params.push(req.user.id);

    // If updating email, ensure uniqueness
    if (req.body.email) {
      const [existing] = await conn.query('SELECT id FROM users WHERE email = ? AND id <> ?', [req.body.email, req.user.id]);
      if (existing) return res.status(400).json({ error: 'Email already in use' });
    }

    await conn.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);
    await logAudit(req.user.id, 'UPDATE_PROFILE', 'user', req.user.id, {}, req);
    const [updated] = await conn.query('SELECT id, email, name, role, company_name, phone, status, avatar_url FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated', user: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update profile' });
  } finally {
    conn.release();
  }
});

// Avatar upload
const avatarDir = path.join(__dirname, '..', '..', 'uploads', 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase();
    cb(null, `avatar_${req.user.id}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.png','.jpg','.jpeg','.webp'];
    const ext = path.extname(file.originalname || '').toLowerCase();
    if (!allowed.includes(ext)) return cb(new Error('Invalid file type'));
    cb(null, true);
  }
});

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const rel = `/uploads/avatars/${path.basename(req.file.path)}`;
    await conn.query('UPDATE users SET avatar_url = ? WHERE id = ?', [rel, req.user.id]);
    await logAudit(req.user.id, 'UPLOAD_AVATAR', 'user', req.user.id, { avatar_url: rel }, req);
    res.json({ message: 'Avatar updated', avatar_url: rel });
  } catch (err) {
    res.status(500).json({ error: 'Failed to upload avatar' });
  } finally {
    conn.release();
  }
});

module.exports = router;
