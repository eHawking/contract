# How to Run SQL Commands Manually

## 🎯 Quick Guide

### Method 1: Using Plesk Database Manager (Easiest)

1. **Login to Plesk**
2. Go to **Databases** → **aemco_contracts**
3. Click **phpMyAdmin** or **Adminer**
4. Click **SQL** tab
5. Copy and paste SQL from `DATABASE_UPDATE_SIMPLE.sql`
6. Click **Execute** or **Go**

---

### Method 2: SSH Command Line

```bash
# Login to your database
mysql -u your_db_user -p aemco_contracts

# Paste the SQL commands from DATABASE_UPDATE_SIMPLE.sql
# Or run the file directly:
mysql -u your_db_user -p aemco_contracts < DATABASE_UPDATE_SIMPLE.sql
```

---

### Method 3: Execute Each Command Separately

SSH into your server and run:

```bash
mysql -u your_db_user -p aemco_contracts
```

Then copy-paste each block:

#### Block 1: Create Settings Table
```sql
CREATE TABLE IF NOT EXISTS settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type VARCHAR(50) DEFAULT 'text',
  updated_by INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### Block 2: Add User Columns (ignore errors if they exist)
```sql
ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255) DEFAULT NULL;
ALTER TABLE users ADD COLUMN phone VARCHAR(50) DEFAULT NULL;
ALTER TABLE users ADD COLUMN address TEXT DEFAULT NULL;
```

#### Block 3: Create Uploads Table
```sql
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
```

#### Block 4: Insert Default Settings
```sql
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
```

#### Block 5: Verify Installation
```sql
SELECT COUNT(*) AS settings_count FROM settings;
SELECT * FROM settings;
```

---

## 🔍 Verification Commands

After running the SQL, verify everything worked:

```sql
-- Check settings table exists and has data
SELECT COUNT(*) FROM settings;

-- Check new columns in users table
DESCRIBE users;

-- Check uploads table exists
DESCRIBE uploads;

-- View all settings
SELECT * FROM settings ORDER BY setting_key;
```

Expected results:
- **settings** table should have **15 rows**
- **users** table should have columns: `profile_photo`, `phone`, `address`
- **uploads** table should exist (empty initially)

---

## ⚠️ Common Issues

### Error: "Duplicate column name"
**Solution:** Ignore this error. It means the column already exists.

### Error: "Table already exists"
**Solution:** Ignore this error. The table is already created.

### Error: "Access denied"
**Solution:** Make sure you're using the correct database username and password from your `.env` file.

### Error: "Unknown database"
**Solution:** Create the database first:
```sql
CREATE DATABASE IF NOT EXISTS aemco_contracts;
USE aemco_contracts;
```

---

## 📋 Complete Step-by-Step Checklist

- [ ] Access database via Plesk phpMyAdmin or SSH
- [ ] Run Block 1: Create settings table
- [ ] Run Block 2: Add user columns (ignore duplicate errors)
- [ ] Run Block 3: Create uploads table
- [ ] Run Block 4: Insert default settings
- [ ] Run Block 5: Verify (should show 15 settings)
- [ ] Exit database
- [ ] Pull latest code: `git pull origin main`
- [ ] Rebuild frontend: `cd client && npm run build && cd ..`
- [ ] Restart application

---

## 🚀 After SQL Setup

Once database is updated, complete the deployment:

```bash
cd ~/workspace.ahmed-essa.com

# Pull latest code
git pull origin main

# Rebuild frontend
cd client
npm run build
cd ..

# Start application
NODE_ENV=production node server/index.js &
```

---

## 📞 Need Help?

If you get stuck, contact: ahmed.Wasim@ahmed-essa.com

---

## 📁 Files Reference

- **DATABASE_UPDATE_SIMPLE.sql** - Simple copy-paste SQL commands
- **MANUAL_DATABASE_SETUP.sql** - Advanced version with column checking
- **server/update-database.js** - Automated script (alternative to manual)

Choose whichever method is easiest for you!
