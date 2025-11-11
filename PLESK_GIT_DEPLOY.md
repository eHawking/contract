# Deploy from GitHub to Plesk Server

## 🚀 Quick Deployment Instructions

### Method 1: Using Git on Plesk (Recommended)

SSH into your Plesk server and run:

```bash
# Navigate to your domain directory
cd ~

# Remove old directory if exists
rm -rf workspace.ahmed-essa.com

# Clone from GitHub
git clone https://github.com/eHawking/contract.git workspace.ahmed-essa.com

# Navigate to project
cd workspace.ahmed-essa.com

# Run automated deployment
bash deploy-new-features.sh
```

### Method 2: Step-by-Step Manual Deployment

```bash
# 1. Clone repository
git clone https://github.com/eHawking/contract.git workspace.ahmed-essa.com
cd workspace.ahmed-essa.com

# 2. Install backend dependencies
npm install

# 3. Install frontend dependencies and build
cd client
npm install
npm run build
cd ..

# 4. Setup environment
cp .env.example .env
nano .env
# Edit database credentials and other settings

# 5. Create uploads directories
mkdir -p uploads/profiles
chmod -R 755 uploads

# 6. Setup database
node server/setup-database.js

# 7. Update database for new features
node server/update-database.js

# 8. Start application
NODE_ENV=production node server/index.js &

# Or configure via Plesk Node.js settings
```

### Method 3: Using Plesk Git Extension

1. **Login to Plesk**
2. Go to **Git** in your domain settings
3. Click **Add Repository**
4. Enter:
   - Repository URL: `https://github.com/eHawking/contract.git`
   - Branch: `main`
   - Deployment mode: `Manual`
5. Click **OK**
6. Click **Pull Updates** to deploy
7. Run post-deployment commands:
   ```bash
   cd ~/workspace.ahmed-essa.com
   npm install
   cd client && npm install && npm run build && cd ..
   node server/update-database.js
   ```

---

## 🔄 Updating Your Deployed Application

When you make changes and push to GitHub:

```bash
# SSH into server
cd ~/workspace.ahmed-essa.com

# Pull latest changes
git pull origin main

# Update dependencies if package.json changed
npm install
cd client && npm install && cd ..

# Rebuild frontend
cd client && npm run build && cd ..

# Update database if schema changed
node server/update-database.js

# Restart application
pkill -f "node.*server/index.js"
NODE_ENV=production node server/index.js &

# Or restart via Plesk Node.js settings
```

---

## 📋 Post-Deployment Checklist

After pulling from GitHub:

- [ ] Environment variables configured (`.env`)
- [ ] Database setup completed
- [ ] Frontend built successfully
- [ ] Uploads directories created with proper permissions
- [ ] Application started and accessible
- [ ] Login tested with default admin credentials
- [ ] Settings configured (logo, company details)
- [ ] SSL/HTTPS working correctly

---

## 🔧 Environment Configuration

Create `.env` file with your settings:

```bash
# Copy example
cp .env.example .env

# Edit with nano or vi
nano .env
```

Required variables:
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aemco_contracts
DB_USER=your_db_user
DB_PASSWORD=your_db_password
JWT_SECRET=your-secret-key
CLIENT_URL=https://workspace.ahmed-essa.com
```

---

## 🎯 Quick Commands Reference

```bash
# Pull updates
git pull origin main

# Check status
git status

# View commit history
git log --oneline

# Discard local changes
git reset --hard origin/main

# Check current branch
git branch

# View remote URL
git remote -v
```

---

## 🐛 Troubleshooting

### Error: "Permission denied"
```bash
chmod +x *.sh
```

### Error: "Directory not empty"
```bash
rm -rf workspace.ahmed-essa.com
git clone https://github.com/eHawking/contract.git workspace.ahmed-essa.com
```

### Frontend not updating
```bash
cd ~/workspace.ahmed-essa.com/client
rm -rf dist node_modules
npm install
npm run build
```

### Database errors
```bash
# Re-run database setup
node server/setup-database.js
node server/update-database.js
```

---

## 📞 Need Help?

Contact: ahmed.Wasim@ahmed-essa.com

---

**Repository:** https://github.com/eHawking/contract.git  
**Branch:** main  
**Live Site:** https://workspace.ahmed-essa.com
