#!/bin/bash

echo "=============================================="
echo "  AEMCO Contract Builder - Diagnostics"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com 2>/dev/null || {
    echo "❌ Error: workspace.ahmed-essa.com directory not found"
    echo "Current directory: $(pwd)"
    echo "Home directory contents:"
    ls -la ~/ | grep ahmed
    exit 1
}

echo "✅ Project directory found"
echo ""

# Check Node.js
echo "=============================================="
echo "Node.js Information"
echo "=============================================="
if command -v node &> /dev/null; then
    echo "✅ Node.js version: $(node --version)"
    echo "✅ NPM version: $(npm --version)"
else
    echo "❌ Node.js not found"
fi
echo ""

# Check processes
echo "=============================================="
echo "Running Node.js Processes"
echo "=============================================="
ps aux | grep node | grep -v grep || echo "No Node.js processes running"
echo ""

# Check port 3000
echo "=============================================="
echo "Port 3000 Status"
echo "=============================================="
if command -v lsof &> /dev/null; then
    lsof -i :3000 || echo "✅ Port 3000 is available"
else
    netstat -tuln | grep 3000 || echo "✅ Port 3000 is available"
fi
echo ""

# Check .env file
echo "=============================================="
echo "Environment Configuration"
echo "=============================================="
if [ -f .env ]; then
    echo "✅ .env file exists"
    echo ""
    echo "Environment variables (masked):"
    cat .env | grep -v "^#" | grep -v "^$" | sed 's/=.*/=***/' || echo "Empty .env file"
else
    echo "❌ .env file not found"
fi
echo ""

# Check dependencies
echo "=============================================="
echo "Dependencies"
echo "=============================================="
if [ -d "node_modules" ]; then
    echo "✅ Backend node_modules exists"
else
    echo "❌ Backend node_modules not found - run: npm install"
fi

if [ -d "client/node_modules" ]; then
    echo "✅ Frontend node_modules exists"
else
    echo "❌ Frontend node_modules not found - run: cd client && npm install"
fi

if [ -d "client/dist" ]; then
    echo "✅ Frontend build (dist) exists"
    echo "   Files: $(ls -1 client/dist | wc -l)"
else
    echo "❌ Frontend dist not found - run: cd client && npm run build"
fi
echo ""

# Check database connection
echo "=============================================="
echo "Database Connection Test"
echo "=============================================="
if [ -f "server/database.js" ]; then
    node -e "require('./server/database').testConnection().then(() => {console.log('✅ Database connection successful'); process.exit(0)}).catch((err) => {console.log('❌ Database connection failed:', err.message); process.exit(1)})"
else
    echo "❌ server/database.js not found"
fi
echo ""

# Check logs
echo "=============================================="
echo "Recent Error Logs (last 20 lines)"
echo "=============================================="
if [ -f "logs/err.log" ]; then
    tail -20 logs/err.log || echo "No errors in log"
else
    echo "No error log file found"
fi
echo ""

if [ -f "logs/combined.log" ]; then
    echo "Recent Combined Logs (last 10 lines)"
    echo "----------------------------------------------"
    tail -10 logs/combined.log
else
    echo "No combined log file found"
fi
echo ""

# Check file structure
echo "=============================================="
echo "Project Structure"
echo "=============================================="
echo "Key files/directories:"
ls -lh server/index.js 2>/dev/null && echo "✅ server/index.js" || echo "❌ server/index.js missing"
ls -lh package.json 2>/dev/null && echo "✅ package.json" || echo "❌ package.json missing"
ls -lh .env 2>/dev/null && echo "✅ .env" || echo "❌ .env missing"
ls -d client/dist 2>/dev/null && echo "✅ client/dist/" || echo "❌ client/dist/ missing"
echo ""

# Test manual start
echo "=============================================="
echo "Quick Start Test"
echo "=============================================="
echo "Testing if app can start (will run for 3 seconds)..."
timeout 3 NODE_ENV=production node server/index.js 2>&1 | head -20
echo ""
echo "If you see the AEMCO banner above, the app works!"
echo ""

echo "=============================================="
echo "Summary & Recommendations"
echo "=============================================="
echo ""
echo "To fix issues:"
echo "1. If .env missing: cp .env.example .env && nano .env"
echo "2. If dependencies missing: npm install && cd client && npm install"
echo "3. If dist missing: cd client && npm run build"
echo "4. If database fails: Check credentials in .env"
echo "5. If port in use: pkill -f node"
echo ""
echo "To start application:"
echo "  bash restart-app.sh"
echo ""
echo "Or use the complete fix:"
echo "  bash fix-all.sh"
echo ""
