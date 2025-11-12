set -e

# Stop running app (ignore if not running)
pkill -f "node.*server/index.js" || true

# Backend deps
npm install --no-audit --no-fund --silent

# Ensure default settings exist (safe to run multiple times)
node server/init-settings.js || true

# Build frontend
cd client
npm install --no-audit --no-fund --silent
npm run build
cd ..

# Start app in background
export NODE_ENV=production
nohup node server/index.js > app.log 2>&1 &

echo "✅ Deploy completed at $(date)"
