# Deployment Guide - AEMCO Contract Builder

## Server Requirements

- **Server**: Plesk
- **Domain**: https://workspace.ahmed-essa.com
- **Node.js Version**: 24.11.0
- **Database**: MariaDB 10.11.13

## Pre-Deployment Checklist

1. ✅ Node.js 24.11.0 installed on server
2. ✅ MariaDB 10.11.13 configured
3. ✅ Domain DNS configured and pointing to server
4. ✅ SSL certificate installed for HTTPS

## Step 1: Server Setup

### 1.1 Install Node.js via Plesk
1. Login to Plesk
2. Go to Tools & Settings > Updates
3. Install Node.js 24.11.0

### 1.2 Create Database
1. In Plesk, go to Databases
2. Create a new MariaDB database:
   - Database name: `aemco_contracts`
   - User: Create new user with strong password
   - Grant all privileges

## Step 2: Deploy Application

### 2.1 Upload Files
Upload all project files to your domain directory via:
- FTP/SFTP
- Git deployment
- Plesk File Manager

### 2.2 Configure Environment Variables

Create `.env` file in root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=production

# Database Configuration (Update with your values)
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=aemco_contracts

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRES_IN=7d

# Company Information
COMPANY_NAME=AHMED ESSA CONSTRUCTION & TRADING (AEMCO)
COMPANY_ADDRESS=6619, King Fahd Road, Dammam, 32243, Saudi Arabia
COMPANY_PHONE=+966 50 911 9859
COMPANY_EMAIL=ahmed.Wasim@ahmed-essa.com
COMPANY_WEBSITE=ahmed-essa.com

# Frontend URL
CLIENT_URL=https://workspace.ahmed-essa.com
```

### 2.3 Install Dependencies

```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2.4 Build Frontend

```bash
cd client
npm run build
cd ..
```

### 2.5 Setup Database

```bash
node server/setup-database.js
```

This will:
- Create all necessary tables
- Insert sample templates
- Create default admin user

**Default Admin Credentials:**
- Email: `admin@ahmed-essa.com`
- Password: `Admin@123456`

⚠️ **IMPORTANT**: Change the admin password immediately after first login!

## Step 3: Configure Plesk for Node.js

### 3.1 Node.js Settings in Plesk
1. Go to your domain in Plesk
2. Click on "Node.js"
3. Enable Node.js for this domain
4. Set Node.js version: 24.11.0
5. Set Application Root: `/httpdocs`
6. Set Application Startup File: `server/index.js`
7. Set Application Mode: `production`
8. Click "Enable Node.js"

### 3.2 Environment Variables in Plesk
Add all environment variables from `.env` file in Plesk Node.js settings

### 3.3 NPM Install via Plesk
Click "NPM Install" button in Plesk Node.js settings

## Step 4: Start Application

### Option A: Via Plesk
1. Go to Node.js settings
2. Click "Restart App"

### Option B: Via PM2 (Recommended for better process management)

```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start ecosystem.config.js

# Setup PM2 to restart on server reboot
pm2 startup
pm2 save
```

## Step 5: Configure Apache/Nginx Proxy

### For Apache (Most Plesk installations)
The `.htaccess` file is already configured. Ensure:
1. `mod_rewrite` is enabled
2. `mod_proxy` is enabled
3. `mod_proxy_http` is enabled

### For Nginx
Add this to your domain's nginx configuration:

```nginx
location / {
    try_files $uri $uri/ @nodejs;
}

location @nodejs {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_cache_bypass $http_upgrade;
}
```

## Step 6: Verify Deployment

1. Visit: https://workspace.ahmed-essa.com
2. You should see the login page
3. Test login with default admin credentials
4. Change admin password immediately
5. Test creating a contract template
6. Test creating a service provider
7. Test creating a contract

## Step 7: Security Hardening

### 7.1 Change Default Credentials
```sql
-- Login to MySQL and run:
UPDATE users 
SET email = 'your_admin_email@ahmed-essa.com',
    password = 'NEW_HASHED_PASSWORD'
WHERE id = 1;
```

Or use the "Change Password" feature in the application.

### 7.2 Firewall Configuration
- Ensure only port 443 (HTTPS) and 80 (HTTP) are open to public
- Port 3000 should NOT be accessible from outside
- Database port 3306 should NOT be accessible from outside

### 7.3 Regular Backups
Setup automated backups in Plesk:
1. Go to Backup Manager
2. Schedule daily backups
3. Include database and files

## Monitoring

### Check Application Status
```bash
pm2 status
pm2 logs
```

### View Logs
```bash
# Application logs
tail -f logs/combined.log

# Error logs
tail -f logs/err.log
```

### Check Database
```bash
mysql -u your_db_user -p aemco_contracts
```

## Troubleshooting

### Application Not Starting
1. Check Node.js version: `node --version`
2. Check environment variables
3. Check database connection
4. Review logs: `pm2 logs`

### Database Connection Issues
1. Verify database credentials in `.env`
2. Test connection: `mysql -u user -p -h localhost aemco_contracts`
3. Check MariaDB is running

### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process if needed
kill -9 PID
```

### Frontend Not Loading
1. Ensure build completed: Check `client/dist` folder exists
2. Verify static file serving in server
3. Check browser console for errors

## Performance Optimization

### Enable Gzip Compression
Add to `.htaccess`:
```apache
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### Enable Browser Caching
Add to `.htaccess`:
```apache
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>
```

## Maintenance

### Update Application
```bash
# Backup first!
git pull origin main  # If using Git
npm install
cd client && npm install && npm run build
pm2 restart all
```

### Database Backup
```bash
mysqldump -u user -p aemco_contracts > backup_$(date +%Y%m%d).sql
```

### Database Restore
```bash
mysql -u user -p aemco_contracts < backup_20240101.sql
```

## Support

For issues or questions:
- Email: ahmed.Wasim@ahmed-essa.com
- Phone: +966 50 911 9859

## License

Proprietary - AHMED ESSA CONSTRUCTION & TRADING (AEMCO)
