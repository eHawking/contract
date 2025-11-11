#!/bin/bash

echo "=============================================="
echo "  Alternative: Deploy Static Files Directly"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Build frontend
echo "Building frontend..."
cd client
npm run build
cd ..
echo "✅ Frontend built"
echo ""

# Copy dist files to root for direct Apache serving
echo "Copying static files to root..."
cp -r client/dist/* ./ 2>/dev/null || {
    echo "Creating files in root..."
    cp client/dist/index.html ./index.html
    mkdir -p assets
    cp -r client/dist/assets/* ./assets/
}
echo "✅ Static files copied to root"
echo ""

# Create .htaccess that serves static files directly
cat > .htaccess << 'HTACCESS'
# Serve index.html for root
DirectoryIndex index.html

# Proper MIME types
<IfModule mod_mime.c>
    AddType application/javascript .js .mjs
    AddType text/css .css
    AddType application/json .json
</IfModule>

# Enable RewriteEngine for API proxy
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
    
    # Serve static files directly (don't proxy these)
    RewriteCond %{REQUEST_FILENAME} -f
    RewriteRule ^ - [L]
    
    # Proxy only /api/ requests to Node.js
    RewriteRule ^api/(.*)$ http://127.0.0.1:3000/api/$1 [P,L]
</IfModule>

# Security headers
<IfModule mod_headers.c>
    <FilesMatch "\.(js|mjs)$">
        Header set Content-Type "application/javascript"
    </FilesMatch>
    <FilesMatch "\.css$">
        Header set Content-Type "text/css"
    </FilesMatch>
</IfModule>
HTACCESS

echo "✅ .htaccess configured for static + API proxy"
echo ""

# Set permissions
chmod 644 index.html
chmod 644 .htaccess
chmod -R 755 assets
echo "✅ Permissions set"
echo ""

echo "=============================================="
echo "  Deployment Complete!"
echo "=============================================="
echo ""
echo "Static files are now served directly by Apache."
echo "API requests to /api/* are proxied to Node.js on port 3000."
echo ""
echo "Start Node.js backend:"
echo "  cd ~/workspace.ahmed-essa.com"
echo "  NODE_ENV=production node server/index.js &"
echo ""
echo "Or use Plesk Node.js to manage it."
echo ""
echo "Test your site: https://workspace.ahmed-essa.com"
echo ""
