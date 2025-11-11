#!/bin/bash

echo "=============================================="
echo "  Restarting AEMCO Contract Builder"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Stop existing processes
echo "Stopping existing processes..."
pkill -f "node.*server/index.js"
sleep 2
echo "✅ Stopped"
echo ""

# Start the application
echo "Starting application..."
echo ""
NODE_ENV=production PORT=3000 node server/index.js
