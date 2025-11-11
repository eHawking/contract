#!/bin/bash

echo "=============================================="
echo "  Deploying New Features"
echo "  AEMCO Contract Builder v2.0"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Stop existing application
echo "Step 1: Stopping application..."
pkill -f "node.*server/index.js"
sleep 2
echo "✅ Stopped"
echo ""

# Create uploads directories
echo "Step 2: Creating uploads directories..."
mkdir -p uploads
mkdir -p uploads/profiles
chmod -R 755 uploads
echo "✅ Uploads directories created"
echo ""

# Install/update dependencies
echo "Step 3: Updating dependencies..."
npm install
echo "✅ Backend dependencies updated"
echo ""

# Rebuild frontend
echo "Step 4: Rebuilding frontend..."
cd client
npm install
npm run build
cd ..
echo "✅ Frontend rebuilt"
echo ""

# Update database schema
echo "Step 5: Updating database schema..."
node server/update-database.js
echo ""

# Start application
echo "Step 6: Starting application..."
echo ""
echo "Choose start method:"
echo "1) Manual start (foreground)"
echo "2) Background start with nohup"
echo "3) Skip (restart via Plesk)"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
  1)
    echo "Starting in foreground (Ctrl+C to stop)..."
    NODE_ENV=production node server/index.js
    ;;
  2)
    nohup NODE_ENV=production node server/index.js > logs/app.log 2>&1 &
    echo "✅ Started in background"
    echo "View logs: tail -f logs/app.log"
    ;;
  3)
    echo "⚠️  Remember to restart via Plesk Node.js settings"
    ;;
  *)
    echo "Invalid choice. Please restart manually."
    ;;
esac

echo ""
echo "=============================================="
echo "  Deployment Complete!"
echo "=============================================="
echo ""
echo "New Features Available:"
echo "✅ Admin Settings Management"
echo "✅ Company Logo Upload"
echo "✅ Email Configuration (SMTP)"
echo "✅ Gemini AI Integration"
echo "✅ Profile Management"
echo "✅ Profile Photo Upload"
echo "✅ Password Change"
echo ""
echo "Next Steps:"
echo "1. Login as admin: https://workspace.ahmed-essa.com"
echo "2. Go to Settings → Configure company details"
echo "3. Upload company logo"
echo "4. Configure email settings (optional)"
echo "5. Set up Gemini AI (optional)"
echo "6. Update your profile"
echo ""
echo "See NEW_FEATURES.md for complete documentation"
echo "=============================================="
