#!/bin/bash

echo "=============================================="
echo "  Fixing Plesk Live Website Configuration"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Stop any manual processes
echo "Stopping manual Node.js processes..."
pkill -f "node.*server/index.js"
sleep 2
echo "✅ Stopped"
echo ""

# Create/update .htaccess for Apache proxy
echo "Creating .htaccess for Apache proxy..."
cat > .htaccess << 'HTACCESS'
# Enable RewriteEngine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Don't rewrite files or directories that exist
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    
    # Proxy API requests to Node.js
    RewriteRule ^api/(.*)$ http://127.0.0.1:3000/api/$1 [P,L]
    
    # Proxy all other requests to Node.js
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L]
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
</IfModule>

# Disable Directory Browsing
Options -Indexes

# MIME Types
AddType application/javascript .js
AddType text/css .css
AddType application/json .json
HTACCESS

echo "✅ .htaccess created"
echo ""

# Create app.js for Phusion Passenger if needed
echo "Creating app.js for Passenger..."
cat > app.js << 'APPJS'
#!/usr/bin/env node
require('./server/index.js');
APPJS

chmod +x app.js
echo "✅ app.js created"
echo ""

# Create restart.txt for Passenger
touch tmp/restart.txt 2>/dev/null
echo "✅ Restart trigger created"
echo ""

echo "=============================================="
echo "  Configuration Complete!"
echo "=============================================="
echo ""
echo "IMPORTANT: Now configure Plesk Node.js settings:"
echo ""
echo "1. Go to Plesk Control Panel"
echo "2. Navigate to: Domains → workspace.ahmed-essa.com"
echo "3. Click 'Node.js'"
echo "4. Set these EXACT settings:"
echo ""
echo "   ✅ Enable Node.js: YES"
echo "   ✅ Node.js version: 24.11.0"
echo "   ✅ Document root: httpdocs"
echo "   ✅ Application mode: production"
echo "   ✅ Application root: (current directory path)"
echo "   ✅ Application startup file: server/index.js"
echo ""
echo "5. Add Environment Variables (if not present):"
echo "   NODE_ENV = production"
echo "   PORT = 3000"
echo ""
echo "6. Click 'Enable Node.js' or 'Apply'"
echo "7. Click 'Restart App'"
echo ""
echo "8. Wait 10 seconds, then test:"
echo "   https://workspace.ahmed-essa.com"
echo ""
echo "=============================================="
echo ""
echo "If still white screen, check logs:"
echo "  tail -f logs/combined.log"
echo "  tail -f logs/err.log"
echo ""
