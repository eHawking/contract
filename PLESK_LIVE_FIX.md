# Plesk Live Website Fix - White Screen Issue

## 🚨 Problem
Website shows white screen because Plesk/Apache isn't properly configured to serve the Node.js application.

## ✅ Solution

### Step 1: Run the Fix Script on Server

```bash
cd ~/workspace.ahmed-essa.com
bash fix-plesk-live.sh
```

This will:
- Stop manual Node.js processes
- Create proper `.htaccess` for Apache proxy
- Create `app.js` for Passenger compatibility
- Set up restart triggers

---

### Step 2: Configure Plesk Node.js Settings

**CRITICAL: Follow these EXACT steps in Plesk:**

1. **Login to Plesk Control Panel**

2. **Navigate to:**
   - Domains → workspace.ahmed-essa.com → Node.js

3. **Configure Node.js Settings:**

   ```
   ☑️ Enable Node.js: YES (must be checked!)
   
   Node.js version: 24.11.0
   
   Document root: httpdocs (or leave default)
   
   Application mode: production
   
   Application root: /var/www/vhosts/ahmed-essa.com/workspace.ahmed-essa.com
                     (or your actual path shown in Plesk)
   
   Application startup file: server/index.js
   
   Application URL: / (leave empty or just /)
   ```

4. **Add Environment Variables (scroll down):**
   
   Click "+ Add Variable" for each:
   ```
   NODE_ENV = production
   PORT = 3000
   ```
   
   Verify ALL your .env variables are also added here:
   - DB_HOST
   - DB_USER
   - DB_PASSWORD
   - DB_NAME
   - JWT_SECRET
   - CLIENT_URL
   - etc.

5. **Click "Enable Node.js"** (big button at top)

6. **Wait 5 seconds**

7. **Click "Restart App"** (button in the same section)

---

### Step 3: Verify Apache Modules (If Admin Access)

In Plesk, go to: **Tools & Settings → Apache Web Server**

Ensure these modules are enabled:
- ☑️ proxy_module
- ☑️ proxy_http_module
- ☑️ rewrite_module
- ☑️ headers_module

---

### Step 4: Test the Website

1. **Clear browser cache** (Ctrl + Shift + Delete)
2. **Visit:** https://workspace.ahmed-essa.com
3. **You should see the login page**

---

## 🔍 Troubleshooting White Screen

### Check 1: Verify Node.js is Running in Plesk

In Plesk Node.js settings, you should see:
```
Status: Running ✅
```

If it says "Stopped" or shows an error, check the logs.

### Check 2: View Application Logs

```bash
cd ~/workspace.ahmed-essa.com
tail -50 logs/combined.log
tail -50 logs/err.log
```

### Check 3: Check Plesk Error Logs

In Plesk:
- Go to: Domains → workspace.ahmed-essa.com → Logs
- Click "Error Log"
- Look for recent errors

Or via command line:
```bash
tail -50 /var/www/vhosts/ahmed-essa.com/logs/error_log
```

### Check 4: Verify Static Files

```bash
ls -la ~/workspace.ahmed-essa.com/client/dist/
```

Should show:
```
index.html
assets/
```

If `dist` folder is empty, rebuild:
```bash
cd ~/workspace.ahmed-essa.com/client
npm run build
```

### Check 5: Test Node.js Manually

```bash
cd ~/workspace.ahmed-essa.com
NODE_ENV=production node server/index.js
```

Should show the AEMCO banner. If you see errors, fix them first.

Press Ctrl+C to stop, then restart via Plesk.

### Check 6: Verify .htaccess

```bash
cat ~/workspace.ahmed-essa.com/.htaccess
```

Should contain proxy rules. If not, run `fix-plesk-live.sh` again.

---

## 🎯 Common Issues & Solutions

### Issue: "Application Stopped" in Plesk

**Solution:**
1. Check logs for errors
2. Verify all environment variables are set
3. Ensure database connection works
4. Click "Restart App" in Plesk

### Issue: Still White Screen After All Steps

**Solution:**
```bash
# Clear everything and restart
cd ~/workspace.ahmed-essa.com
pkill -f node

# Rebuild frontend
cd client
rm -rf dist
npm run build
cd ..

# Create restart trigger
mkdir -p tmp
touch tmp/restart.txt

# Restart in Plesk
# Go to Plesk → Node.js → Restart App
```

### Issue: "502 Bad Gateway"

**Solution:**
- Node.js app isn't running
- Check Plesk Node.js status
- Restart App in Plesk

### Issue: CSS/JS Files Not Loading

**Solution:**
```bash
# Check MIME types in .htaccess
# Run fix-plesk-live.sh again
bash ~/workspace.ahmed-essa.com/fix-plesk-live.sh
```

---

## ✅ Final Checklist

- [ ] Node.js enabled in Plesk
- [ ] Application startup file: `server/index.js`
- [ ] Application mode: `production`
- [ ] Environment variables added in Plesk
- [ ] NODE_ENV = production
- [ ] PORT = 3000
- [ ] App status shows "Running" in Plesk
- [ ] .htaccess file exists
- [ ] client/dist folder exists with files
- [ ] Database connection works
- [ ] Clicked "Restart App" in Plesk
- [ ] Cleared browser cache
- [ ] Tested https://workspace.ahmed-essa.com

---

## 📞 Quick Commands

```bash
# Check if app is running
ps aux | grep "node.*server/index.js"

# View logs
tail -f ~/workspace.ahmed-essa.com/logs/combined.log

# Restart via Plesk trigger
touch ~/workspace.ahmed-essa.com/tmp/restart.txt

# Test manually
cd ~/workspace.ahmed-essa.com
NODE_ENV=production node server/index.js
```

---

## 🚀 Expected Result

After following all steps, visiting https://workspace.ahmed-essa.com should show:

✅ **Login page with full styling**  
✅ **AEMCO branding**  
✅ **All CSS and JavaScript loaded**

Login with:
- Email: `admin@ahmed-essa.com`
- Password: `Admin@123456`

**Change password immediately after first login!**
