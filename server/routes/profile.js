const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for profile photos
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/profiles');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPG, JPEG, and PNG images are allowed!'));
    }
  }
});

// Get current user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT id, email, name, role, company_name, company_address, 
              phone, address, profile_photo, status, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update profile
router.put('/', authenticateToken, auditLog('update_profile'), async (req, res) => {
  try {
    const { name, email, company_name, company_address, phone, address } = req.body;
    
    // Check if email is already used by another user
    if (email !== req.user.email) {
      const [existing] = await pool.query(
        'SELECT id FROM users WHERE email = ? AND id != ?',
        [email, req.user.id]
      );
      
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Email already in use' });
      }
    }
    
    await pool.query(
      `UPDATE users SET 
        name = ?, 
        email = ?, 
        company_name = ?, 
        company_address = ?,
        phone = ?,
        address = ?
       WHERE id = ?`,
      [name, email, company_name, company_address, phone, address, req.user.id]
    );
    
    // Fetch updated profile
    const [users] = await pool.query(
      `SELECT id, email, name, role, company_name, company_address,
              phone, address, profile_photo, status
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    
    res.json({ 
      message: 'Profile updated successfully',
      user: users[0]
    });
  } catch (err) {
    console.error('Error updating profile:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.post('/change-password', authenticateToken, auditLog('change_password'), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' });
    }
    
    // Verify current password
    const [users] = await pool.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const isValid = await bcrypt.compare(currentPassword, users[0].password);
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update password
    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );
    
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Error changing password:', err);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Upload profile photo
router.post('/upload-photo', authenticateToken, upload.single('photo'), auditLog('upload_profile_photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = '/uploads/profiles/' + req.file.filename;
    
    // Save to uploads table
    await pool.query(
      `INSERT INTO uploads (file_name, file_path, file_type, file_size, uploaded_by, upload_type)
       VALUES (?, ?, ?, ?, ?, 'profile_photo')`,
      [req.file.filename, filePath, req.file.mimetype, req.file.size, req.user.id]
    );
    
    // Delete old profile photo if exists
    const [oldPhoto] = await pool.query(
      'SELECT profile_photo FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (oldPhoto[0]?.profile_photo) {
      const oldPath = path.join(__dirname, '../..', oldPhoto[0].profile_photo);
      try {
        await fs.unlink(oldPath);
      } catch (err) {
        // Ignore error if file doesn't exist
      }
    }
    
    // Update user profile photo
    await pool.query(
      'UPDATE users SET profile_photo = ? WHERE id = ?',
      [filePath, req.user.id]
    );
    
    res.json({ 
      message: 'Profile photo uploaded successfully',
      filePath: filePath
    });
  } catch (err) {
    console.error('Error uploading profile photo:', err);
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
});

// Delete profile photo
router.delete('/photo', authenticateToken, auditLog('delete_profile_photo'), async (req, res) => {
  try {
    const [user] = await pool.query(
      'SELECT profile_photo FROM users WHERE id = ?',
      [req.user.id]
    );
    
    if (user[0]?.profile_photo) {
      const filePath = path.join(__dirname, '../..', user[0].profile_photo);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        // Ignore error if file doesn't exist
      }
      
      await pool.query(
        'UPDATE users SET profile_photo = NULL WHERE id = ?',
        [req.user.id]
      );
    }
    
    res.json({ message: 'Profile photo deleted successfully' });
  } catch (err) {
    console.error('Error deleting profile photo:', err);
    res.status(500).json({ error: 'Failed to delete profile photo' });
  }
});

module.exports = router;
