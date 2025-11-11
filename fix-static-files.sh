#!/bin/bash

echo "=============================================="
echo "  Fixing Static File MIME Type Issues"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Stop any running processes
echo "Stopping Node.js processes..."
pkill -f "node.*server/index.js"
sleep 2
echo "✅ Stopped"
echo ""

# Create proper .htaccess with static file handling
echo "Creating proper .htaccess..."
cat > .htaccess << 'HTACCESS'
# Disable Passenger for this directory
PassengerEnabled off

# Enable RewriteEngine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Serve static files directly from client/dist
    RewriteCond %{REQUEST_URI} ^/assets/
    RewriteCond %{DOCUMENT_ROOT}/client/dist%{REQUEST_URI} -f
    RewriteRule ^(.*)$ /client/dist/$1 [L]

    # Don't proxy existing files
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [L]

    # Don't proxy existing directories
    RewriteCond %{REQUEST_FILENAME} -d
    RewriteRule ^ - [L]

    # Proxy API and all other requests to Node.js
    RewriteRule ^(.*)$ http://127.0.0.1:3000/$1 [P,L,QSA]
</IfModule>

# Proper MIME types
<IfModule mod_mime.c>
    AddType application/javascript .js .mjs
    AddType text/css .css
    AddType application/json .json
    AddType image/svg+xml .svg
    AddType font/woff .woff
    AddType font/woff2 .woff2
    AddType font/ttf .ttf
    AddType font/eot .eot
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    
    # Set proper content-type for JS and CSS
    <FilesMatch "\.(js|mjs)$">
        Header set Content-Type "application/javascript"
    </FilesMatch>
    <FilesMatch "\.css$">
        Header set Content-Type "text/css"
    </FilesMatch>
</IfModule>

# Cache control for static assets
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/svg+xml "access plus 1 year"
</IfModule>

# Disable directory browsing
Options -Indexes +FollowSymLinks
HTACCESS

echo "✅ .htaccess updated"
echo ""

# Create symbolic link for easier static file access
echo "Creating symlink for dist folder..."
ln -sf ~/workspace.ahmed-essa.com/client/dist ~/workspace.ahmed-essa.com/dist 2>/dev/null || echo "Symlink already exists or failed"
echo ""

# Verify dist folder has files
echo "Checking dist folder..."
if [ -d "client/dist" ]; then
    FILE_COUNT=$(ls -1 client/dist 2>/dev/null | wc -l)
    if [ "$FILE_COUNT" -gt 0 ]; then
        echo "✅ client/dist has $FILE_COUNT items"
        ls -lh client/dist/
    else
        echo "⚠️  client/dist is empty, rebuilding..."
        cd client
        npm run build
        cd ..
        echo "✅ Rebuilt frontend"
    fi
else
    echo "❌ client/dist not found!"
    exit 1
fi
echo ""

# Set proper permissions
echo "Setting permissions..."
chmod -R 755 client/dist
chmod 644 .htaccess
echo "✅ Permissions set"
echo ""

# Create web.config for IIS (if needed)
cat > web.config << 'WEBCONFIG'
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <staticContent>
      <mimeMap fileExtension=".js" mimeType="application/javascript" />
      <mimeMap fileExtension=".mjs" mimeType="application/javascript" />
      <mimeMap fileExtension=".css" mimeType="text/css" />
      <mimeMap fileExtension=".json" mimeType="application/json" />
    </staticContent>
  </system.webServer>
</configuration>
WEBCONFIG
echo "✅ web.config created (for IIS compatibility)"
echo ""

echo "=============================================="
echo "  Testing Application Startup"
echo "=============================================="
echo ""
echo "Starting Node.js to verify it works..."
timeout 5 NODE_ENV=production node server/index.js 2>&1 | head -20 || true
echo ""

echo "=============================================="
echo "  Configuration Complete!"
echo "=============================================="
echo ""
echo "Next steps:"
echo ""
echo "1. Go to Plesk → Node.js → Restart App"
echo ""
echo "2. OR start manually for testing:"
echo "   cd ~/workspace.ahmed-essa.com"
echo "   NODE_ENV=production node server/index.js &"
echo ""
echo "3. Clear browser cache completely (Ctrl+Shift+Delete)"
echo ""
echo "4. Test: https://workspace.ahmed-essa.com"
echo ""
echo "5. Check if assets load:"
echo "   curl -I https://workspace.ahmed-essa.com/assets/index-BSc8Pmn-.css"
echo "   (Should show: Content-Type: text/css)"
echo ""
echo "=============================================="
