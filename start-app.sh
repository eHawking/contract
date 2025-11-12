#!/bin/bash

echo "=============================================="
echo "  Quick Fix - Start Application Correctly"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Kill any existing processes
echo "Stopping existing processes..."
pkill -f "node.*server/index.js"
sleep 2
echo "✅ Stopped"
echo ""

# Start application correctly
echo "Starting application in background..."
NODE_ENV=production nohup node server/index.js > logs/app.log 2>&1 &
echo $! > app.pid
echo "✅ Application started with PID: $(cat app.pid)"
echo ""

echo "=============================================="
echo "  Application Status"
echo "=============================================="
echo ""
echo "✅ Application is running in background"
echo "📁 Logs: ~/workspace.ahmed-essa.com/logs/app.log"
echo "🆔 PID: $(cat app.pid)"
echo ""
echo "🌐 Visit: https://workspace.ahmed-essa.com"
echo ""
echo "Monitor logs:"
echo "  tail -f ~/workspace.ahmed-essa.com/logs/app.log"
echo ""
echo "Check if running:"
echo "  ps aux | grep node"
echo ""
echo "Stop application:"
echo "  pkill -f 'node.*server/index.js'"
echo ""
echo "=============================================="
