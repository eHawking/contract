#!/bin/bash

echo "=============================================="
echo "  AEMCO Contract Builder - Complete Fix"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Navigate to project directory
cd ~/workspace.ahmed-essa.com || {
    echo -e "${RED}❌ Error: Could not find workspace.ahmed-essa.com directory${NC}"
    echo "Please ensure the project is in ~/workspace.ahmed-essa.com"
    exit 1
}

echo -e "${GREEN}✅ Found project directory${NC}"
echo ""

# Step 1: Check Node.js
echo "=============================================="
echo "Step 1: Checking Node.js"
echo "=============================================="
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js installed: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi
echo ""

# Step 2: Kill existing processes
echo "=============================================="
echo "Step 2: Stopping existing Node.js processes"
echo "=============================================="
pkill -f "node.*server/index.js" && echo -e "${GREEN}✅ Stopped existing processes${NC}" || echo -e "${YELLOW}⚠️  No processes to stop${NC}"
sleep 2
echo ""

# Step 3: Check and create .env file
echo "=============================================="
echo "Step 3: Checking environment configuration"
echo "=============================================="
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found, creating from template...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo -e "${RED}⚠️  IMPORTANT: Edit .env and configure your database credentials!${NC}"
        echo "Required variables:"
        echo "  - DB_USER"
        echo "  - DB_PASSWORD"
        echo "  - DB_NAME"
        echo "  - JWT_SECRET (generate a random 32+ character string)"
    else
        echo -e "${RED}❌ .env.example not found${NC}"
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi
echo ""

# Step 4: Install backend dependencies
echo "=============================================="
echo "Step 4: Installing backend dependencies"
echo "=============================================="
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Failed to install backend dependencies${NC}"
    exit 1
fi
echo ""

# Step 5: Install and build frontend
echo "=============================================="
echo "Step 5: Building frontend"
echo "=============================================="
cd client || exit 1

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install frontend dependencies${NC}"
        exit 1
    fi
fi

echo "Building frontend..."
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend built successfully${NC}"
    if [ -d "dist" ]; then
        echo -e "${GREEN}✅ dist folder created${NC}"
    else
        echo -e "${RED}❌ dist folder not found after build${NC}"
    fi
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..
echo ""

# Step 6: Update server/index.js with fixed version
echo "=============================================="
echo "Step 6: Updating server configuration"
echo "=============================================="
cd server

# Backup original
if [ ! -f index.js.backup ]; then
    cp index.js index.js.backup
    echo -e "${GREEN}✅ Created backup: index.js.backup${NC}"
fi

# Create updated index.js
cat > index.js << 'EOFINDEX'
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const { testConnection } = require('./database');

// Import routes
const authRoutes = require('./routes/auth');
const contractRoutes = require('./routes/contracts');
const templateRoutes = require('./routes/templates');
const providerRoutes = require('./routes/provider');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve static files (frontend build) - MUST be before API routes
if (process.env.NODE_ENV === 'production') {
  const distPath = path.join(__dirname, '..', 'client', 'dist');
  console.log('Serving static files from:', distPath);
  
  // Serve static assets with correct MIME types
  app.use(express.static(distPath, {
    setHeaders: (res, filepath) => {
      if (filepath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript');
      } else if (filepath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css');
      }
    }
  }));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/users', userRoutes);

// Serve index.html for all other routes (SPA fallback)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const indexPath = path.join(__dirname, '..', 'client', 'dist', 'index.html');
    res.sendFile(indexPath);
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
  });
}

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
async function startServer() {
  try {
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('⚠️  Database connection failed. Server starting anyway...');
    }

    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🚀 AEMCO Contract Builder Server');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📍 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 API: http://localhost:${PORT}/api`);
      console.log(`❤️  Health: http://localhost:${PORT}/health`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\nCompany: AHMED ESSA CONSTRUCTION & TRADING (AEMCO)');
      console.log('Address: 6619, King Fahd Road, Dammam, 32243, Saudi Arabia');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

startServer();
EOFINDEX

echo -e "${GREEN}✅ Updated server/index.js${NC}"
cd ..
echo ""

# Step 7: Set correct permissions
echo "=============================================="
echo "Step 7: Setting file permissions"
echo "=============================================="
chmod -R 755 .
chmod 644 .env 2>/dev/null
echo -e "${GREEN}✅ Permissions set${NC}"
echo ""

# Step 8: Test database connection
echo "=============================================="
echo "Step 8: Testing database connection"
echo "=============================================="
node -e "require('./server/database').testConnection().then(() => process.exit(0)).catch(() => process.exit(1))"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database connection successful${NC}"
else
    echo -e "${RED}❌ Database connection failed${NC}"
    echo -e "${YELLOW}Please check your .env file and database credentials${NC}"
fi
echo ""

# Step 9: Check if database is initialized
echo "=============================================="
echo "Step 9: Checking database initialization"
echo "=============================================="
echo "If database tables don't exist yet, run:"
echo "  node server/setup-database.js"
echo ""
read -p "Do you want to initialize/setup the database now? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    node server/setup-database.js
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Database initialized${NC}"
    else
        echo -e "${RED}❌ Database initialization failed${NC}"
    fi
fi
echo ""

# Step 10: Create logs directory
echo "=============================================="
echo "Step 10: Creating logs directory"
echo "=============================================="
mkdir -p logs
touch logs/combined.log
touch logs/err.log
touch logs/out.log
chmod -R 755 logs
echo -e "${GREEN}✅ Logs directory ready${NC}"
echo ""

# Final summary
echo "=============================================="
echo "  ✅ Setup Complete!"
echo "=============================================="
echo ""
echo "Your application is ready. Next steps:"
echo ""
echo "Option 1: Restart via Plesk (Recommended)"
echo "  1. Go to Plesk → Domains → workspace.ahmed-essa.com"
echo "  2. Click 'Node.js'"
echo "  3. Verify settings:"
echo "     - Node.js: Enabled"
echo "     - Application mode: production"
echo "     - Application startup file: server/index.js"
echo "     - Environment variable NODE_ENV: production"
echo "  4. Click 'Restart App'"
echo ""
echo "Option 2: Start manually (for testing)"
echo "  cd ~/workspace.ahmed-essa.com"
echo "  NODE_ENV=production node server/index.js"
echo ""
echo "Option 3: Use PM2 (for production)"
echo "  npm install -g pm2"
echo "  pm2 start ecosystem.config.js"
echo "  pm2 save"
echo ""
echo "Test your site at: https://workspace.ahmed-essa.com"
echo ""
echo "Default admin login:"
echo "  Email: admin@ahmed-essa.com"
echo "  Password: Admin@123456"
echo ""
echo -e "${RED}⚠️  Remember to change the admin password after first login!${NC}"
echo ""
echo "View logs:"
echo "  tail -f logs/combined.log"
echo ""
echo "=============================================="
