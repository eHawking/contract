set -e

# Stop running app (with error handling for permissions)
echo "Stopping existing Node.js processes..."
pkill -f "node.*server/index.js" 2>/dev/null || echo "No existing processes to kill or permission denied"

# Wait a moment for processes to stop
sleep 2

# Kill any remaining processes (try different approach)
ps aux | grep "node.*server/index.js" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || echo "No processes to force kill"

# Backend deps
echo "Installing backend dependencies..."
npm install --no-audit --no-fund --silent

# Ensure default settings exist (safe to run multiple times)
echo "Initializing settings..."
node server/init-settings.js 2>/dev/null || echo "Settings initialization skipped (may already exist)"

# Build frontend
echo "Building frontend..."
cd client
npm install --no-audit --no-fund --silent
npm run build
cd ..

# Start app in background
echo "Starting application..."
export NODE_ENV=production
nohup node server/index.js > app.log 2>&1 &

# Wait and verify
sleep 3
if pgrep -f "node.*server/index.js" > /dev/null; then
    echo "✅ Application started successfully"
else
    echo "❌ Application failed to start - check app.log"
fi

echo "✅ Deploy completed at $(date)"
