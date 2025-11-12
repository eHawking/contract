#!/usr/bin/env bash
# AEMCO workspace auto diagnose and fix script
# Usage: bash scripts/repair.sh [-y] [--domain https://workspace.ahmed-essa.com]

set -Eeuo pipefail

AUTO_YES=false
DOMAIN="http://localhost:3000"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Colors
NC='\033[0m'; RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[0;33m'; BLUE='\033[0;34m'
log() { echo -e "${BLUE}[*]${NC} $*"; }
ok() { echo -e "${GREEN}[OK]${NC} $*"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
err() { echo -e "${RED}[ERR]${NC} $*"; }
confirm() { if $AUTO_YES; then return 0; fi; read -r -p "${1:-Proceed?} [y/N] " ans; [[ "$ans" =~ ^[Yy]$ ]]; }

# Parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes) AUTO_YES=true; shift ;;
    --domain) DOMAIN="$2"; shift 2 ;;
    *) warn "Unknown arg: $1"; shift ;;
  esac
done

log "Project root: $ROOT_DIR"
log "Target API domain: $DOMAIN"

# 0) Basic tooling
if ! command -v node >/dev/null 2>&1; then err "Node.js not found"; exit 1; fi
if ! command -v npm >/dev/null 2>&1; then err "npm not found"; exit 1; fi
if ! command -v git >/dev/null 2>&1; then warn "git not found; skipping pull"; GIT_OK=false; else GIT_OK=true; fi

ok "Node $(node -v), npm $(npm -v) detected"

# 1) Show current git status and optionally pull latest
if $GIT_OK; then
  log "Git HEAD: $(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')"
  if confirm "Pull latest from origin/main?"; then
    git fetch --all || warn "git fetch failed"
    git pull --rebase || warn "git pull failed (continuing)"
  fi
fi

# 2) Install dependencies (root and client)
if confirm "Install server dependencies (npm install)?"; then
  npm install || err "npm install failed"
fi
if confirm "Install client dependencies (npm install in client)?"; then
  (cd client && npm install) || err "client npm install failed"
fi

# 3) Ensure DB schema and seed
log "Running database setup (idempotent)"
node server/setup-database.js || warn "setup-database.js reported an issue (continuing)"
node server/setup-migrations.js || warn "setup-migrations.js reported an issue (continuing)"

# 4) Quick DB connectivity and settings check via Node
log "Testing DB connectivity and app_settings availability"
node - <<'NODE'
const { pool } = require('./server/database');
(async () => {
  const c = await pool.getConnection();
  try {
    const [row] = await c.query('SELECT 1 as ok');
    console.log('[OK] DB ping:', row);
    const [settings] = await c.query('SELECT id, company_name FROM app_settings WHERE id=1');
    if (!settings) {
      console.log('[WARN] app_settings missing default row (id=1)');
      process.exitCode = 0;
    } else {
      console.log('[OK] app_settings row exists:', settings);
    }
  } catch (e) {
    console.error('[ERR] DB test failed:', e.message);
    process.exitCode = 0;
  } finally {
    c.release();
  }
})();
NODE

# 5) Ensure uploads directories and permissions
log "Ensuring uploads directories"
mkdir -p uploads/logos uploads/avatars || true
chmod -R 755 uploads || true
ok "uploads/ ready"

# 6) Build client (optional)
if confirm "Build client for production (vite build)?"; then
  (cd client && npm run build) || warn "client build failed"
fi

# 7) Basic API smoke tests
log "Smoke testing endpoints on $DOMAIN"
HEALTH_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$DOMAIN/health" || echo 000)
PUB_CODE=$(curl -s -o /dev/null -w '%{http_code}' "$DOMAIN/api/settings/public" || echo 000)

if [[ "$HEALTH_CODE" == "200" ]]; then ok "/health -> 200"; else err "/health -> $HEALTH_CODE"; fi
if [[ "$PUB_CODE" == "200" ]]; then ok "/api/settings/public -> 200"; else err "/api/settings/public -> $PUB_CODE"; fi

# 8) Hints to restart app when running under Plesk
cat <<TIP

${YELLOW}If you are running under Plesk NodeJS:${NC}
- Open Domains → workspace.ahmed-essa.com → Node.js → click "Restart App" to load latest code and env.
- Ensure Environment Variables are set: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, JWT_SECRET, CLIENT_URL.
- After restart, re-run: curl -i $DOMAIN/api/settings/public

TIP

log "Done. Review messages above. If /api/settings/public is not 200 after restart, check Node app logs for 'Settings /public error' and share the stack."
