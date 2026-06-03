#!/usr/bin/env bash
# Multi-AgentOS — one-command install
#
#   curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/install.sh | bash
#
# (The above URL points to a top-level shim that downloads and runs
# THIS file. If you want to call this script directly, use:
#   curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/multi-agent-os/install.sh | bash
# Both paths are equivalent.)
#
# What it does:
#   1. Checks for Node 20+ (offers to install via nvm if missing)
#   2. Clones the repo (or pulls if already cloned)
#   3. Runs npm install
#   4. Runs npm run setup (interactive wizard)
#   5. Prints next steps
#
# Idempotent — re-runs update in place.

set -e

REPO="${MULTI_AGENTOS_REPO:-hollystarbug-web/Multi-AgentOS}"
BRANCH="${MULTI_AGENTOS_BRANCH:-main}"
# Pin to a specific release tag (e.g. "v0.1.0"). Leave empty for the
# bleeding edge of `main`. The release script tags new versions.
VERSION="${MULTI_AGENTOS_VERSION:-}"
DIR="${MULTI_AGENTOS_DIR:-$HOME/Multi-AgentOS}"

# ── Colours ─────────────────────────────────────────────────────────────
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
CYAN='\033[0;36m'; BOLD='\033[1m'; RESET='\033[0m'
info()  { echo -e "${CYAN}▸${RESET} $*"; }
ok()    { echo -e "${GREEN}✓${RESET} $*"; }
warn()  { echo -e "${YELLOW}⚠${RESET} $*"; }
fail()  { echo -e "${RED}✗${RESET} $*"; exit 1; }
header(){ echo -e "\n${BOLD}${CYAN}━━━ $* ━━━${RESET}\n"; }

# ── 1. Node check ──────────────────────────────────────────────────────
header "Step 1 · Checking Node.js"
if ! command -v node >/dev/null 2>&1; then
  fail "Node.js is not installed. Install Node 20+ first:
        https://nodejs.org/  (or use nvm: https://github.com/nvm-sh/nvm)"
fi
NODE_VER=$(node -v | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VER" | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 20 ]; then
  fail "Node $NODE_VER is too old. Need 20+. Please upgrade."
fi
ok "Node v$NODE_VER"

if ! command -v npm >/dev/null 2>&1; then
  fail "npm not found. Install Node 20+ which includes npm."
fi
NPM_VER=$(npm -v)
ok "npm v$NPM_VER"

# ── 2. Clone or pull ──────────────────────────────────────────────────
header "Step 2 · Getting the code"
if [ -d "$DIR" ]; then
  info "Updating existing install at $DIR"
  cd "$DIR"
  if [ -n "$VERSION" ]; then
    info "Checking out v$VERSION"
    git fetch --tags origin
    git checkout "v$VERSION" 2>/dev/null || warn "tag v$VERSION not found, staying on $(git describe --tags --always)"
  else
    git pull --rebase --autostash origin "$BRANCH" 2>/dev/null || warn "git pull failed (offline? branch mismatch?)"
  fi
else
  info "Cloning $REPO into $DIR"
  git clone "https://github.com/$REPO.git" "$DIR"
  cd "$DIR"
  if [ -n "$VERSION" ]; then
    info "Checking out v$VERSION"
    git fetch --tags
    git checkout "v$VERSION" 2>/dev/null || warn "tag v$VERSION not found, staying on default"
  else
    git checkout "$BRANCH" 2>/dev/null || true
  fi
fi
ok "Code ready at $DIR"

# ── 3. Install deps ───────────────────────────────────────────────────
header "Step 3 · Installing dependencies"
npm install --no-audit --no-fund
ok "Dependencies installed"

# ── 4. Setup wizard ───────────────────────────────────────────────────
header "Step 4 · First-run setup"
if [ -f config.yaml ]; then
  info "config.yaml already exists — skipping setup wizard."
  info "  Run ${BOLD}npm run setup${RESET} any time to reconfigure."
else
  if [ -t 0 ]; then
    info "Running setup wizard (interactive)…"
    npm run setup
  else
    warn "No TTY — running setup with sensible defaults."
    warn "Re-run ${BOLD}npm run setup${RESET} interactively to customise."
    cp config.example.yaml config.yaml
  fi
fi

# ── 5. Done ───────────────────────────────────────────────────────────
header "🎉 Multi-AgentOS is ready"
ok "Installed at: $DIR"
ok "Version:      $(grep '"version"' $DIR/package.json | head -1 | sed 's/.*"version": "\(.*\)".*/\1/')"
ok "Config:       $DIR/config.yaml"
ok "Env:          $DIR/.env.local"
echo ""
info "To start the dashboard:"
echo "  cd $DIR && npm run dev"
echo ""
info "Then open (whichever matches how you reached this machine):"
echo "  - On THIS machine:                 ${BOLD}http://localhost:3000${RESET}"
echo "  - From a Tailscale tailnet device: ${BOLD}http://$(hostname -I 2>/dev/null | awk '{print $1}'):3000${RESET}  (or whatever this box's Tailscale IP is)"
echo "  - Tailnet auto-HTTPS:              ${BOLD}https://$(tailscale status --json 2>/dev/null | python3 -c 'import sys,json; print(json.load(sys.stdin).get("SelfHost",{}).get("DNSName","").rstrip("."))' 2>/dev/null || echo 'host.tailnet.ts.net')/maos${RESET}  (after \`tailscale serve\` is configured)"
echo ""
info "Useful commands:"
echo "  npm run setup          # re-run setup wizard"
echo "  npm run check-update   # see if a newer version is available"
echo "  npm run update         # pull the latest + reinstall"
echo "  npm run config:show    # print active config"
echo "  npm run config:validate# validate config against schema"
