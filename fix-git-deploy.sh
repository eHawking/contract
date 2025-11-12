#!/bin/bash

echo "=============================================="
echo "  FIX: Proper Git Clone & Deploy"
echo "=============================================="
echo ""

# Go to home directory
cd ~

# Backup existing if it exists
if [ -d "workspace.ahmed-essa.com" ]; then
    echo "Backing up existing directory..."
    mv workspace.ahmed-essa.com workspace.ahmed-essa.com.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ Backup created"
fi

echo "Cloning from GitHub..."
git clone https://github.com/eHawking/contract.git workspace.ahmed-essa.com
echo "✅ Repository cloned"

# Navigate to project
cd workspace.ahmed-essa.com

echo "Setting up project..."
npm install
cd client && npm install && npm run build && cd ..
echo "✅ Project built"

echo "Creating directories..."
mkdir -p uploads/profiles
chmod -R 755 uploads
echo "✅ Directories ready"

echo "Updating database..."
node server/update-database.js
echo "✅ Database updated"

echo "Starting application..."
NODE_ENV=production node server/index.js &

echo ""
echo "=============================================="
echo "  DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "🌐 Access: https://workspace.ahmed-essa.com"
echo "👤 Admin: admin@ahmed-essa.com / Admin@123456"
echo "=============================================="
