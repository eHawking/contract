#!/bin/bash

echo "🚀 AEMCO Contract Builder - Deployment Script"
echo "=============================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Stop running application
echo "📌 Step 1: Stopping application..."
pkill -f "node.*server/index.js"
sleep 2
echo -e "${GREEN}✓ Application stopped${NC}"
echo ""

# Step 2: Pull latest code
echo "📌 Step 2: Pulling latest code from GitHub..."
git fetch origin
git reset --hard origin/main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Code updated successfully${NC}"
else
    echo -e "${RED}✗ Failed to pull code${NC}"
    exit 1
fi
echo ""

# Step 3: Install backend dependencies
echo "📌 Step 3: Installing backend dependencies..."
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Backend dependencies install had issues${NC}"
fi
echo ""

# Step 4: Initialize settings
echo "📌 Step 4: Initializing default settings..."
node server/init-settings.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Settings initialized${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Settings initialization had issues (might already exist)${NC}"
fi
echo ""

# Step 5: Rebuild frontend
echo "📌 Step 5: Rebuilding frontend..."
cd client
rm -rf dist node_modules/.vite
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install frontend dependencies${NC}"
    exit 1
fi

npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend built successfully${NC}"
else
    echo -e "${RED}✗ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 6: Verify build
echo "📌 Step 6: Verifying build..."
if [ -d "client/dist" ] && [ -f "client/dist/index.html" ]; then
    echo -e "${GREEN}✓ Build files exist${NC}"
    echo "   Files in dist:"
    ls -lh client/dist/ | head -10
else
    echo -e "${RED}✗ Build files missing${NC}"
    exit 1
fi
echo ""

# Step 7: Start application
echo "📌 Step 7: Starting application..."
export NODE_ENV=production
nohup node server/index.js > app.log 2>&1 &
sleep 3

# Check if process started
if pgrep -f "node.*server/index.js" > /dev/null; then
    echo -e "${GREEN}✓ Application started successfully${NC}"
    echo "   Process ID: $(pgrep -f 'node.*server/index.js')"
else
    echo -e "${RED}✗ Failed to start application${NC}"
    echo "   Check app.log for errors"
    exit 1
fi
echo ""

# Step 8: Test endpoints
echo "📌 Step 8: Testing endpoints..."
sleep 2
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/settings/public)
if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✓ API is responding (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠ API response: HTTP $HTTP_CODE${NC}"
fi
echo ""

echo "=============================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "📋 Next Steps:"
echo "  1. Visit your website"
echo "  2. Hard refresh: Ctrl+Shift+R"
echo "  3. Login and test Settings page"
echo "  4. Test Profile page"
echo "  5. Toggle dark mode"
echo ""
echo "📊 Quick Checks:"
echo "  • View logs: tail -f app.log"
echo "  • Check process: ps aux | grep node"
echo "  • Stop app: pkill -f 'node.*server/index.js'"
echo ""
echo "🌐 Website: https://workspace.ahmed-essa.com"
echo "=============================================="
