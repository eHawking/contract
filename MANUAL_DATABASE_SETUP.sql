-- ============================================
-- AEMCO Contract Builder - Database Schema Update
-- Manual SQL Execution Guide
-- ============================================
-- Run these commands in MariaDB to add new features
-- Either run all at once or line by line

USE aemco_contracts;

-- ============================================
-- 1. CREATE SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. ADD NEW COLUMNS TO USERS TABLE
-- ============================================
-- Check if column exists first, then add if not
SET @dbname = DATABASE();
SET @tablename = 'users';

-- Add profile_photo column
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'profile_photo'
);

SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL', 
  'SELECT "Column profile_photo already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add phone column
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'phone'
);

SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL', 
  'SELECT "Column phone already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add address column
SET @column_exists = (
  SELECT COUNT(*) 
  FROM INFORMATION_SCHEMA.COLUMNS 
  WHERE TABLE_SCHEMA = @dbname 
  AND TABLE_NAME = @tablename 
  AND COLUMN_NAME = 'address'
);

SET @sql = IF(@column_exists = 0, 
  'ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL', 
  'SELECT "Column address already exists" AS message'
);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============================================
-- 3. CREATE UPLOADS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS uploads (
  id INT PRIMARY KEY AUTO_INCREMENT,
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_type VARCHAR(100),
  file_size INT,
  uploaded_by INT,
  upload_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_upload_type (upload_type),
  INDEX idx_uploaded_by (uploaded_by)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. INSERT DEFAULT SETTINGS
-- ============================================
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
ON DUPLICATE KEY UPDATE setting_key = setting_key;

-- ============================================
-- 5. VERIFY INSTALLATION
-- ============================================
-- Check settings table
SELECT 'Settings Table:' AS info, COUNT(*) AS row_count FROM settings;

-- Check new columns in users table
SELECT 'User Columns:' AS info,
  COLUMN_NAME, DATA_TYPE
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'users'
  AND COLUMN_NAME IN ('profile_photo', 'phone', 'address');

-- Check uploads table
SELECT 'Uploads Table:' AS info, COUNT(*) AS row_count FROM uploads;

-- Show all settings
SELECT * FROM settings ORDER BY setting_key;

-- ============================================
-- DONE!
-- ============================================
SELECT '✅ Database schema updated successfully!' AS result;
SELECT 'New features are now available:' AS info;
SELECT '- Admin settings management' AS feature
UNION SELECT '- Company logo upload'
UNION SELECT '- Email configuration'
UNION SELECT '- Gemini AI integration'
UNION SELECT '- Profile photos'
UNION SELECT '- Enhanced user profiles';
