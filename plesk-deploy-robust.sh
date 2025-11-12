#!/bin/bash

echo "🚀 AEMCO Contract Builder - Plesk Deployment"
echo "============================================"
echo ""

# Function to handle errors gracefully
handle_error() {
    echo "❌ Error on line $1: $2"
    exit 1
}

# Set error handling
trap 'handle_error $LINENO "$BASH_COMMAND"' ERR
set -e

echo "📌 Step 1: Stopping existing processes..."
# Try multiple ways to stop the app
pkill -f "node.*server/index.js" 2>/dev/null || echo "No processes to kill"
sleep 3

# Force kill if still running
ps aux | grep "node.*server/index.js" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 2

echo "📌 Step 2: Installing backend dependencies..."
npm install --no-audit --no-fund --silent --no-progress
echo "✅ Backend dependencies installed"

echo "📌 Step 3: Initializing settings..."
# Settings initialization (safe to run multiple times)
node server/init-settings.js 2>/dev/null || echo "Settings initialization completed (or already exists)"

echo "📌 Step 4: Building frontend..."
cd client
npm install --no-audit --no-fund --silent --no-progress
npm run build --silent
cd ..
echo "✅ Frontend built successfully"

echo "📌 Step 5: Starting application..."
# Start with proper environment
export NODE_ENV=production
export PORT=${PORT:-5000}

# Use absolute path for nohup output
touch app.log
chmod 644 app.log

# Start the app
nohup node server/index.js > app.log 2>&1 &
APP_PID=$!

echo "✅ Application started with PID: $APP_PID"

# Wait a moment and verify
sleep 5
if kill -0 $APP_PID 2>/dev/null; then
    echo "✅ Application is running successfully"
else
    echo "❌ Application failed to start - checking logs..."
    tail -20 app.log
    exit 1
fi

echo ""
echo "============================================"
echo "🎉 Deployment completed successfully!"
echo ""
echo "📊 Status:"
echo "   • Application PID: $APP_PID"
echo "   • Log file: app.log"
echo "   • Environment: $NODE_ENV"
echo "   • Time: $(date)"
echo ""
echo "🌐 Test your application:"
echo "   https://workspace.ahmed-essa.com"
echo ""
echo "📝 Next steps:"
echo "   1. Hard refresh browser (Ctrl+Shift+R)"
echo "   2. Test Settings page (/admin/settings)"
echo "   3. Test Profile page (/admin/profile)"
echo "   4. Toggle dark mode"
echo "============================================"
