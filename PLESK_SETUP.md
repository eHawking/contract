# Plesk Setup Guide - AEMCO Contract Builder

## 📋 Prerequisites

- Plesk panel access
- Domain: workspace.ahmed-essa.com configured in Plesk
- Node.js 24.11.0 available in Plesk
- MariaDB 10.11.13 configured

---

## Step 1: Create Database in Plesk

1. **Login to Plesk** panel
2. Go to **Databases** → **Add Database**
3. Create database:
   ```
   Database name: aemco_contracts
   ```
4. Create database user:
   ```
   Username: aemco_user (or your choice)
   Password: [Generate strong password]
   ```
5. **Grant all privileges** to the user
6. **Save credentials** - you'll need them for `.env` file

---

## Step 2: Upload Application Files

### Option A: Git Deployment (Recommended)
1. In Plesk, go to **Git**
2. Click **Add Repository**
3. Enter your repository URL
4. Set deployment path: `/httpdocs`
5. Click **Deploy**

### Option B: File Manager
1. In Plesk, go to **File Manager**
2. Navigate to your domain folder
3. Upload all files from `c:\Users\dds\Desktop\workspace\` to `/httpdocs`

### Option C: FTP/SFTP
1. Use FileZilla or WinSCP
2. Connect to your server via FTP/SFTP
3. Upload all files to `/httpdocs`

---

## Step 3: Configure Node.js in Plesk

1. Go to your domain in Plesk
2. Click **Node.js**
3. **Enable Node.js** for this domain

### Node.js Settings:
```
✅ Enable Node.js: ON
Node.js Version: 24.11.0
Document Root: httpdocs
Application Mode: production
Application Root: httpdocs
Application Startup File: server/index.js
```

4. Click **Enable Node.js**
5. Click **Apply**

---

## Step 4: Configure Environment Variables in Plesk

In the **Node.js** settings page, scroll down to **Environment Variables** section.

Add these variables (click **+ Add Variable** for each):

### Required Variables:
```
PORT = 3000
NODE_ENV = production

DB_HOST = localhost
DB_PORT = 3306
DB_USER = aemco_user
DB_PASSWORD = [your_database_password_from_step1]
DB_NAME = aemco_contracts

JWT_SECRET = [generate_random_32char_string]
JWT_EXPIRES_IN = 7d

COMPANY_NAME = AHMED ESSA CONSTRUCTION & TRADING (AEMCO)
COMPANY_ADDRESS = 6619, King Fahd Road, Dammam, 32243, Saudi Arabia
COMPANY_PHONE = +966 50 911 9859
COMPANY_EMAIL = ahmed.Wasim@ahmed-essa.com
COMPANY_WEBSITE = ahmed-essa.com

CLIENT_URL = https://workspace.ahmed-essa.com
```

### Generate JWT_SECRET:
Use this PowerShell command to generate a secure secret:
```powershell
-join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | % {[char]$_})
```

Click **Apply** after adding all variables.

---

## Step 5: Install Dependencies via Plesk

In the **Node.js** settings page:

1. Click **NPM Install** button
2. Wait for backend dependencies to install
3. Check the output for any errors

### Manual Installation (if needed):
If NPM Install button fails, use SSH:
```bash
cd /var/www/vhosts/ahmed-essa.com/httpdocs
npm install
cd client
npm install
npm run build
cd ..
```

---

## Step 6: Build Frontend

### Option A: Via SSH (Recommended)
```bash
cd /var/www/vhosts/ahmed-essa.com/httpdocs/client
npm run build
```

### Option B: Build Locally & Upload
1. On your Windows machine:
   ```bash
   cd c:\Users\dds\Desktop\workspace\client
   npm install
   npm run build
   ```
2. Upload the `client/dist` folder to Plesk via File Manager

---

## Step 7: Initialize Database

### Via SSH:
```bash
cd /var/www/vhosts/ahmed-essa.com/httpdocs
node server/setup-database.js
```

### Via Plesk Node.js Console:
1. In Plesk Node.js settings
2. Click **Run Script**
3. Enter: `server/setup-database.js`
4. Click **Run**

You should see:
```
✅ Database 'aemco_contracts' created or already exists
✅ Users table created
✅ Contract templates table created
✅ Contracts table created
✅ Contract versions table created
✅ Audit logs table created
✅ Default admin user created
✅ Sample contract templates created
```

---

## Step 8: Configure Web Server Proxy

### For Apache (Default in Plesk):

The `.htaccess` file is already included. Verify it's in place:

**Location:** `/httpdocs/.htaccess`

**Key settings:**
```apache
RewriteEngine On
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

### Enable Required Apache Modules:
In Plesk, go to **Apache & nginx Settings**:
```
✅ proxy_module
✅ proxy_http_module
✅ rewrite_module
```

---

## Step 9: Start the Application

### In Plesk Node.js Settings:

1. Scroll to bottom
2. Click **Restart App** button
3. Check status - should show **Running**

### Alternative: Use PM2 via SSH

```bash
cd /var/www/vhosts/ahmed-essa.com/httpdocs

# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Setup PM2 to start on reboot
pm2 startup
pm2 save

# Check status
pm2 status
```

---

## Step 10: Verify Deployment

1. **Visit your site:** https://workspace.ahmed-essa.com
2. You should see the **login page**
3. **Test login** with default credentials:
   ```
   Email: admin@ahmed-essa.com
   Password: Admin@123456
   ```
4. **Change admin password immediately!**

---

## 🔧 Troubleshooting

### Application Not Loading

**Check Node.js Status:**
1. Go to Plesk → Node.js
2. Check if status is "Running"
3. Click "Restart App" if needed

**View Logs:**
1. In Plesk Node.js settings
2. Scroll to **Logs** section
3. Check for errors

**Common Issues:**
```bash
# Port already in use
# Solution: Change PORT in environment variables

# Database connection failed
# Solution: Verify DB credentials in environment variables

# Module not found
# Solution: Run "NPM Install" again in Plesk
```

### Check Application Logs

**Via Plesk File Manager:**
- Navigate to `/httpdocs/logs/`
- View `err.log` and `combined.log`

**Via SSH:**
```bash
tail -f /var/www/vhosts/ahmed-essa.com/httpdocs/logs/combined.log
```

### Database Issues

**Test Database Connection:**
1. In Plesk, go to **Databases**
2. Click **phpMyAdmin**
3. Login and verify `aemco_contracts` database exists
4. Check if tables are created

### SSL/HTTPS Issues

**Verify SSL Certificate:**
1. Go to **SSL/TLS Certificates**
2. Ensure Let's Encrypt or valid SSL is installed
3. Enable **Permanent SEO-safe 301 redirect from HTTP to HTTPS**

---

## 🚀 Post-Deployment Tasks

### 1. Change Admin Password
- Login as admin
- Go to profile settings
- Change password immediately

### 2. Test All Features
- ✅ Create a test service provider
- ✅ Create a contract template
- ✅ Create a contract
- ✅ Send contract to provider
- ✅ Login as provider and sign

### 3. Setup Backups
1. In Plesk, go to **Backup Manager**
2. Configure **Scheduled Backups**
3. Set daily backups
4. Include files and databases

### 4. Configure Email (Optional)
For email notifications:
1. Go to **Mail** in Plesk
2. Create email account: `noreply@ahmed-essa.com`
3. Add SMTP credentials to environment variables:
   ```
   SMTP_HOST = mail.ahmed-essa.com
   SMTP_PORT = 587
   SMTP_USER = noreply@ahmed-essa.com
   SMTP_PASSWORD = [email_password]
   ```

### 5. Monitor Performance
- Go to **Statistics** in Plesk
- Monitor resource usage
- Set up uptime monitoring

---

## 📊 Maintenance Commands

### Restart Application:
**Via Plesk:** Click "Restart App" in Node.js settings

**Via SSH/PM2:**
```bash
pm2 restart aemco-contract-builder
```

### Update Application:
```bash
cd /var/www/vhosts/ahmed-essa.com/httpdocs
git pull  # if using Git
npm install
cd client && npm run build && cd ..
pm2 restart aemco-contract-builder
```

### View Logs:
```bash
# Application logs
pm2 logs

# Plesk logs
tail -f /var/www/vhosts/ahmed-essa.com/httpdocs/logs/combined.log
```

### Database Backup:
```bash
mysqldump -u aemco_user -p aemco_contracts > backup_$(date +%Y%m%d).sql
```

---

## 📞 Support Checklist

If you encounter issues:

- [ ] Node.js 24.11.0 is enabled in Plesk
- [ ] Database credentials are correct in environment variables
- [ ] All dependencies installed (`npm install` completed)
- [ ] Frontend built (`client/dist` folder exists)
- [ ] Database initialized (tables created)
- [ ] Application is running (check Plesk Node.js status)
- [ ] SSL certificate is valid
- [ ] `.htaccess` file is in place
- [ ] Logs checked for errors

---

## 🎯 Quick Reference

| Item | Location in Plesk |
|------|------------------|
| Node.js Settings | Domains → [domain] → Node.js |
| Database Management | Databases → [database_name] |
| File Manager | Files → File Manager |
| SSL Certificates | Domains → [domain] → SSL/TLS |
| Backups | Tools & Settings → Backup Manager |
| Logs | Node.js → Logs section |

---

## ✅ Deployment Checklist

- [ ] Database created in Plesk
- [ ] Files uploaded to `/httpdocs`
- [ ] Node.js 24.11.0 enabled
- [ ] Environment variables configured
- [ ] Dependencies installed (`npm install`)
- [ ] Frontend built (`npm run build`)
- [ ] Database initialized
- [ ] Application started
- [ ] Site accessible at https://workspace.ahmed-essa.com
- [ ] Admin login tested
- [ ] Admin password changed
- [ ] Backups configured

---

**Your application should now be live at:** https://workspace.ahmed-essa.com

**Default Admin Login:**
- Email: `admin@ahmed-essa.com`
- Password: `Admin@123456` (CHANGE THIS!)

**Need Help?** Check logs in Plesk Node.js settings or contact support.
