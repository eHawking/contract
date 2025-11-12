#!/bin/bash

echo "🚀 AEMCO Contract Builder - Plesk Deployment"
echo "============================================"

# Stop existing processes
echo "📌 Stopping existing processes..."
pkill -f "node.*server/index.js" 2>/dev/null || echo "No processes to kill"

# Wait for processes to stop
sleep 2

# Force kill remaining processes
ps aux | grep "node.*server/index.js" | grep -v grep | awk '{print $2}' | xargs kill -9 2>/dev/null || true
sleep 1

# Install backend dependencies
echo "📌 Installing backend dependencies..."
npm install --no-audit --no-fund --silent --no-progress

# Initialize settings
echo "📌 Initializing settings..."
node server/init-settings.js 2>/dev/null || echo "Settings already initialized"

# Build frontend
echo "📌 Building frontend..."
cd client
npm install --no-audit --no-fund --silent --no-progress
npm run build --silent
cd ..

# Start application
echo "📌 Starting application..."
export NODE_ENV=production
export PORT=5000

# Start in background
nohup node server/index.js > app.log 2>&1 &
APP_PID=$!

echo "✅ Application started with PID: $APP_PID"

# Verify it's running
sleep 5
if kill -0 $APP_PID 2>/dev/null; then
    echo "✅ Application is running successfully"
    echo "🌐 Test at: https://workspace.ahmed-essa.com"
    echo "🎉 Deployment completed at $(date)"
else
    echo "❌ Application failed to start"
    tail -10 app.log
    exit 1
fi
