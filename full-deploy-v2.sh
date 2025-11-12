#!/bin/bash

echo "=============================================="
echo "  AEMCO Contract Builder - Full Deployment"
echo "  v2.0 with Modern UI/UX & AI Features"
echo "=============================================="
echo ""

cd ~/workspace.ahmed-essa.com || exit 1

# Step 1: Stop existing processes
echo "Step 1: Stopping existing processes..."
pkill -f "node.*server/index.js"
sleep 2
echo "✅ Processes stopped"
echo ""

# Step 2: Backup current setup
echo "Step 2: Backing up current setup..."
cp -r . ../workspace.ahmed-essa.com.backup.$(date +%Y%m%d_%H%M%S) 2>/dev/null || echo "No previous backup to create"
echo "✅ Backup created"
echo ""

# Step 3: Pull latest code
echo "Step 3: Pulling latest code from GitHub..."
git pull origin main
echo "✅ Code updated"
echo ""

# Step 4: Install dependencies
echo "Step 4: Installing dependencies..."
npm install
cd client
npm install
cd ..
echo "✅ Dependencies installed"
echo ""

# Step 5: Create required directories
echo "Step 5: Creating directories..."
mkdir -p uploads/profiles
chmod -R 755 uploads
echo "✅ Directories created"
echo ""

# Step 6: Build frontend
echo "Step 6: Building frontend..."
cd client
npm run build
cd ..
echo "✅ Frontend built"
echo ""

# Step 7: Update database
echo "Step 7: Updating database schema..."
node server/update-database.js
echo ""

# Step 8: Configure environment (if .env doesn't exist)
if [ ! -f ".env" ]; then
    echo "Step 8: Creating environment configuration..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your database credentials:"
    echo "   nano ~/workspace.ahmed-essa.com/.env"
    echo ""
    echo "Required variables:"
    echo "  DB_HOST=localhost"
    echo "  DB_PORT=3306"
    echo "  DB_NAME=aemco_contracts"
    echo "  DB_USER=your_db_user"
    echo "  DB_PASSWORD=your_db_password"
    echo "  JWT_SECRET=your-secret-key"
    echo "  CLIENT_URL=https://workspace.ahmed-essa.com"
    echo ""
    read -p "Press Enter after configuring .env to continue..."
else
    echo "✅ Environment configuration exists"
fi

# Step 9: Test database connection
echo "Step 9: Testing database connection..."
node -e "
const { pool } = require('./server/database');
(async () => {
  try {
    const conn = await pool.getConnection();
    console.log('✅ Database connection successful');
    conn.release();
    process.exit(0);
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.log('Please check your .env configuration');
    process.exit(1);
  }
})();
"
if [ $? -ne 0 ]; then
    echo "❌ Database connection failed. Please check your .env file."
    exit 1
fi
echo ""

# Step 10: Start application
echo "Step 10: Starting application..."
echo ""
echo "Choose startup method:"
echo "1) Background (recommended for production)"
echo "2) Foreground (for testing, Ctrl+C to stop)"
echo "3) Skip (configure via Plesk Node.js settings)"
echo ""
read -p "Select option (1-3): " choice

case $choice in
  1)
    echo "Starting in background..."
    nohup NODE_ENV=production node server/index.js > logs/app.log 2>&1 &
    echo "✅ Application started in background"
    echo "View logs: tail -f ~/workspace.ahmed-essa.com/logs/app.log"
    ;;
  2)
    echo "Starting in foreground (Ctrl+C to stop)..."
    NODE_ENV=production node server/index.js
    ;;
  3)
    echo "⚠️  Remember to start via Plesk Node.js settings"
    ;;
  *)
    echo "Invalid choice. Starting in background by default..."
    nohup NODE_ENV=production node server/index.js > logs/app.log 2>&1 &
    echo "✅ Application started in background"
    ;;
esac

echo ""
echo "=============================================="
echo "  🎉 DEPLOYMENT COMPLETE!"
echo "=============================================="
echo ""
echo "🚀 New Features Available:"
echo "✅ Modern Dark/Light Theme Toggle"
echo "✅ Welcome Modal on First Login"
echo "✅ Enhanced Profile Management"
echo "✅ Contract Preview Modal"
echo "✅ Improved UI/UX Design"
echo "✅ AI-Powered Content Generation"
echo "✅ Company Logo Upload"
echo "✅ Email Configuration"
echo "✅ Professional Status Badges"
echo ""
echo "🌐 Access your application:"
echo "   https://workspace.ahmed-essa.com"
echo ""
echo "👤 Default Admin Login:"
echo "   Email: admin@ahmed-essa.com"
echo "   Password: Admin@123456"
echo ""
echo "⚙️  Configure Settings:"
echo "   - Go to Admin → Settings"
echo "   - Upload company logo"
echo "   - Configure email settings"
echo "   - Enable AI features"
echo ""
echo "📋 Next Steps:"
echo "   1. Change default admin password"
echo "   2. Configure company settings"
echo "   3. Set up email notifications"
echo "   4. Enable Gemini AI (optional)"
echo "   5. Test contract creation"
echo ""
echo "=============================================="
