-- Update schema for new features
-- Run this to add new tables and columns

-- Add settings table for admin configuration
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add profile photo column to users table (MariaDB compatible)
-- These will fail if columns exist, but that's OK
ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL;

-- Insert default settings
INSERT INTO settings (setting_key, setting_value, setting_type) VALUES
('company_logo', NULL, 'file'),
('company_name', 'AHMED ESSA CONSTRUCTION & TRADING (AEMCO)', 'text'),
('company_address', '6619, King Fahd Road, Dammam, 32243, Saudi Arabia', 'text'),
('company_phone', '+966 50 911 9859', 'text'),
('company_email', 'ahmed.Wasim@ahmed-essa.com', 'email'),
('company_website', 'ahmed-essa.com', 'text'),
('smtp_host', '', 'text'),
('smtp_port', '587', 'number'),
('smtp_user', '', 'text'),
('smtp_password', '', 'password'),
('smtp_from_name', 'AEMCO Contract Builder', 'text'),
('smtp_from_email', '', 'email'),
('gemini_api_key', '', 'password'),
('gemini_model', 'gemini-1.5-pro-latest', 'text'),
('ai_enabled', 'false', 'boolean')
ON DUPLICATE KEY UPDATE setting_key=setting_key;

-- Create uploads directory table for tracking uploaded files
CREATE TABLE IF NOT EXISTS uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INT,
  uploaded_by INT,
  upload_type VARCHAR(50), -- 'logo', 'profile_photo', 'document'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_upload_type (upload_type),
  INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
