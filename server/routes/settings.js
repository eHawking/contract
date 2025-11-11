const express = require('express');
const router = express.Router();
const { pool } = require('../database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { auditLog } = require('../middleware/audit');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get all settings (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [settings] = await pool.query(
      'SELECT setting_key, setting_value, setting_type FROM settings ORDER BY setting_key'
    );
    
    // Convert array to object for easier frontend use
    const settingsObj = {};
    settings.forEach(setting => {
      // Don't send password fields in plain text
      if (setting.setting_type === 'password' && setting.setting_value) {
        settingsObj[setting.setting_key] = '********';
      } else {
        settingsObj[setting.setting_key] = setting.setting_value;
      }
    });
    
    res.json(settingsObj);
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Get public settings (no auth required)
router.get('/public', async (req, res) => {
  try {
    const [settings] = await pool.query(
      `SELECT setting_key, setting_value FROM settings 
       WHERE setting_key IN ('company_logo', 'company_name', 'company_phone', 
                              'company_email', 'company_website', 'company_address')`
    );
    
    const settingsObj = {};
    settings.forEach(setting => {
      settingsObj[setting.setting_key] = setting.setting_value;
    });
    
    res.json(settingsObj);
  } catch (err) {
    console.error('Error fetching public settings:', err);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (admin only)
router.put('/', authenticateToken, requireAdmin, auditLog('update_settings'), async (req, res) => {
  const conn = await pool.getConnection();
  
  try {
    await conn.beginTransaction();
    
    const updates = req.body;
    
    for (const [key, value] of Object.entries(updates)) {
      // Skip empty password fields (they mean "don't change")
      if (value === '********') continue;
      
      await conn.query(
        `INSERT INTO settings (setting_key, setting_value, updated_by) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?`,
        [key, value, req.user.id, value, req.user.id]
      );
    }
    
    await conn.commit();
    res.json({ message: 'Settings updated successfully' });
  } catch (err) {
    await conn.rollback();
    console.error('Error updating settings:', err);
    res.status(500).json({ error: 'Failed to update settings' });
  } finally {
    conn.release();
  }
});

// Upload company logo
router.post('/upload-logo', authenticateToken, requireAdmin, upload.single('logo'), auditLog('upload_logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const filePath = '/uploads/' + req.file.filename;
    
    // Save to uploads table
    await pool.query(
      `INSERT INTO uploads (file_name, file_path, file_type, file_size, uploaded_by, upload_type)
       VALUES (?, ?, ?, ?, ?, 'logo')`,
      [req.file.filename, filePath, req.file.mimetype, req.file.size, req.user.id]
    );
    
    // Update settings
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value, updated_by) 
       VALUES ('company_logo', ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_by = ?`,
      [filePath, req.user.id, filePath, req.user.id]
    );
    
    res.json({ 
      message: 'Logo uploaded successfully',
      filePath: filePath
    });
  } catch (err) {
    console.error('Error uploading logo:', err);
    res.status(500).json({ error: 'Failed to upload logo' });
  }
});

// Generate contract content using Gemini AI
router.post('/ai/generate-content', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { prompt, type } = req.body; // type: 'contract' or 'template'
    
    // Get Gemini API key from settings
    const [settings] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'gemini_api_key'"
    );
    
    if (!settings[0] || !settings[0].setting_value) {
      return res.status(400).json({ error: 'Gemini API key not configured' });
    }
    
    const apiKey = settings[0].setting_value;
    const [modelSettings] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'gemini_model'"
    );
    const model = modelSettings[0]?.setting_value || 'gemini-1.5-pro-latest';
    
    // Call Gemini API
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error('Gemini API request failed');
    }
    
    const data = await response.json();
    const generatedText = data.candidates[0]?.content?.parts[0]?.text || '';
    
    res.json({ 
      content: generatedText,
      model: model
    });
  } catch (err) {
    console.error('Error generating content:', err);
    res.status(500).json({ error: 'Failed to generate content: ' + err.message });
  }
});

module.exports = router;
