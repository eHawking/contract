#!/bin/bash

echo "=============================================="
echo "  Quick Fix - Pull Updates and Rebuild"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Pull latest changes
echo "Step 1: Pulling latest changes from GitHub..."
git pull origin main
echo "✅ Updates pulled"
echo ""

# Rebuild frontend
echo "Step 2: Rebuilding frontend..."
cd client
npm run build
cd ..
echo "✅ Frontend rebuilt"
echo ""

# Update database
echo "Step 3: Updating database..."
node server/update-database.js
echo ""

echo "=============================================="
echo "  Fix Complete!"
echo "=============================================="
echo ""
echo "Start the application:"
echo "  NODE_ENV=production node server/index.js &"
echo ""
echo "Or restart via Plesk Node.js settings"
echo ""
