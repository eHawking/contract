# 🚀 Quick Deployment Guide

## Why Settings and Profile Pages Aren't Updated

The pages are showing **old code** because your server still has the **old frontend build**. You need to **rebuild the frontend** on your server.

---

## ⚡ Quick Deploy (Recommended)

### Option 1: Automated Deployment Script

SSH into your server and run:

```bash
cd ~/workspace.ahmed-essa.com
chmod +x deploy.sh
./deploy.sh
```

**This script will:**
1. ✅ Stop the old app
2. ✅ Pull latest code
3. ✅ Install dependencies
4. ✅ Initialize settings
5. ✅ Rebuild frontend
6. ✅ Start new app
7. ✅ Test endpoints

**Time:** ~5 minutes

---

## 🔧 Manual Deployment

If the script doesn't work, run these commands one by one:

```bash
# 1. Navigate to project
cd ~/workspace.ahmed-essa.com

# 2. Stop application
pkill -f "node.*server/index.js"

# 3. Pull latest code
git pull origin main

# 4. Initialize settings (creates default values)
node server/init-settings.js

# 5. Install backend dependencies
npm install

# 6. Rebuild frontend
cd client
rm -rf dist node_modules/.vite
npm install
npm run build
cd ..

# 7. Start application
NODE_ENV=production nohup node server/index.js > app.log 2>&1 &

# 8. Verify it's running
ps aux | grep node
```

---

## ✅ After Deployment

### 1. Clear Browser Cache
**Important:** Your browser has cached the old version.

**Windows/Linux:**
```
Press: Ctrl + Shift + Delete
Select: Cached images and files
Click: Clear data
```

**Or Hard Refresh:**
```
Press: Ctrl + Shift + R
```

**Mac:**
```
Press: Cmd + Shift + Delete
Or: Cmd + Shift + R
```

### 2. Test the Pages

Visit your website: **https://workspace.ahmed-essa.com**

1. **Login** with admin account
2. **Navigate to Settings** (`/admin/settings`)
   - Should see dark mode styling
   - Should load company data
   - Should have 3 tabs (Company, Email, AI)
3. **Navigate to Profile** (`/admin/profile`)
   - Should see dark mode styling
   - Should load your profile data
   - Should have 2 tabs (Profile, Password)
4. **Toggle Dark Mode**
   - Click moon/sun icon in sidebar
   - Page should turn dark
   - Reload - should stay dark

---

## 🐛 Troubleshooting

### Issue: "Failed to load settings"

**Solution 1: Initialize Settings**
```bash
cd ~/workspace.ahmed-essa.com
node server/init-settings.js
```

**Solution 2: Check Database**
```bash
mysql -u your_user -p contract_builder
SHOW TABLES;
SELECT * FROM settings LIMIT 5;
```

If settings table is empty or missing:
```bash
node server/update-database.js
node server/init-settings.js
```

---

### Issue: Pages Still Look Old

**Solution: Force Rebuild**
```bash
cd ~/workspace.ahmed-essa.com/client
rm -rf dist node_modules package-lock.json
npm install
npm run build

# Check if build succeeded
ls -la dist/
# Should see index.html and assets folder

# Restart server
cd ..
pkill -f node
NODE_ENV=production node server/index.js &
```

---

### Issue: "Failed to load profile"

**Check if profile route exists:**
```bash
cd ~/workspace.ahmed-essa.com
grep -r "router.get.*profile" server/routes/
```

**Test API directly:**
```bash
# Get your token from browser (F12 → Application → Local Storage → token)
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/profile
```

---

### Issue: App Won't Start

**Check logs:**
```bash
cd ~/workspace.ahmed-essa.com
cat app.log
# or
tail -50 app.log
```

**Common errors:**
- **Port in use:** `pkill -f node` then restart
- **Missing dependencies:** `npm install` in root and client
- **Database error:** Check MySQL is running: `systemctl status mysql`

---

### Issue: Dark Mode Not Showing

This means the **old frontend** is still being served.

**Fix:**
```bash
cd ~/workspace.ahmed-essa.com

# Verify you have latest code
git log -1
# Should show: "Add deployment script and settings initialization"

# If not, pull again
git pull origin main

# Force rebuild
cd client
rm -rf dist
npm run build
cd ..

# Hard restart
pkill -f node
sleep 2
NODE_ENV=production node server/index.js &
```

**Then:** Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 📊 Verification Checklist

After deployment, verify these:

- [ ] Server is running: `ps aux | grep node`
- [ ] Build files exist: `ls -la client/dist/index.html`
- [ ] API responds: `curl http://localhost:5000/api/settings/public`
- [ ] Settings page loads
- [ ] Settings page has dark mode
- [ ] Profile page loads
- [ ] Profile page has dark mode
- [ ] Theme toggle works
- [ ] Welcome modal appears on login
- [ ] Data loads correctly

---

## 🔄 Quick Commands Reference

```bash
# Stop app
pkill -f "node.*server/index.js"

# Start app
cd ~/workspace.ahmed-essa.com && NODE_ENV=production node server/index.js &

# View logs
tail -f ~/workspace.ahmed-essa.com/app.log

# Check if running
ps aux | grep node

# Pull latest
cd ~/workspace.ahmed-essa.com && git pull origin main

# Full rebuild
cd ~/workspace.ahmed-essa.com/client && rm -rf dist && npm run build
```

---

## 📞 Still Having Issues?

### Check These:

1. **Server Status**
   ```bash
   systemctl status mysql
   ps aux | grep node
   ```

2. **File Permissions**
   ```bash
   cd ~/workspace.ahmed-essa.com
   ls -la deploy.sh
   # Should be executable (chmod +x deploy.sh)
   ```

3. **Network**
   ```bash
   curl -I http://localhost:5000
   # Should return 200 OK
   ```

4. **Browser Console** (F12)
   - Look for red errors
   - Check Network tab for failed requests
   - Verify API calls are returning 200

---

## ✨ Expected Results

### Settings Page Should Show:
- **Light Mode:** White background, blue buttons
- **Dark Mode:** Dark gray background, softer colors
- **Data:** Company name, address, phone, etc.
- **Tabs:** Company Details, Email Settings, AI Settings
- **Save Button:** Blue button in top-right

### Profile Page Should Show:
- **Light Mode:** White card with profile fields
- **Dark Mode:** Dark card with light text
- **Data:** Your name, email, phone
- **Tabs:** Profile Information, Change Password
- **Photo:** Upload button and current photo

---

## 🎉 Success!

Once deployed, you should see:
- ✅ Modern, beautiful UI
- ✅ Working dark mode toggle
- ✅ Settings load and save
- ✅ Profile loads and saves
- ✅ Smooth animations
- ✅ Professional appearance

**Enjoy your upgraded contract builder!** 🚀
