#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy-to-vault.sh
# Sync the Agentic OS project + vault docs to /root/OpenClaw-Wiki on Hetzner VPS
#
# Usage:
#   bash deploy-to-vault.sh           # sync everything
#   bash deploy-to-vault.sh --docs    # sync vault docs only (no code)
#   bash deploy-to-vault.sh --code    # sync Next.js code only
# ─────────────────────────────────────────────────────────────────────────────

set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
VPS_HOST="100.87.207.10"            # Hetzner VPS Tailscale IP
VPS_USER="root"
VAULT_ROOT="/root/OpenClaw-Wiki"
PROJECT_PATH="${VAULT_ROOT}/03-Projects/Agentic-OS"

# Local paths (adjust if you move the project)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOCAL_DOCS="${SCRIPT_DIR}"
LOCAL_CODE="$(dirname "${SCRIPT_DIR}")/openclaw-os"

SSH_OPTS="-o StrictHostKeyChecking=accept-new -o ConnectTimeout=10"
RSYNC_OPTS="-avz --progress"

# Detect mode
MODE="all"
if [[ "${1:-}" == "--docs" ]]; then MODE="docs"; fi
if [[ "${1:-}" == "--code" ]]; then MODE="code"; fi

echo "╔══════════════════════════════════════════════╗"
echo "║  Agentic OS → OpenClaw-Wiki Deploy           ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Target : ${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}"
echo "  Mode   : ${MODE}"
echo ""

# ── Ensure remote directory structure exists ──────────────────────────────────
echo "→ Creating remote directories..."
ssh ${SSH_OPTS} "${VPS_USER}@${VPS_HOST}" \
  "mkdir -p ${PROJECT_PATH}/chats ${PROJECT_PATH}/journal ${PROJECT_PATH}/openclaw-os"

# ── Sync vault docs (README, ARCHITECTURE, TASKS, deploy script) ──────────────
if [[ "${MODE}" == "all" || "${MODE}" == "docs" ]]; then
  echo "→ Syncing vault documentation..."
  rsync ${RSYNC_OPTS} \
    --include="*.md" \
    --include="*.sh" \
    --exclude="*" \
    "${LOCAL_DOCS}/" \
    "${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/"
  echo "  ✓ Docs synced"
fi

# ── Sync Next.js code ─────────────────────────────────────────────────────────
if [[ "${MODE}" == "all" || "${MODE}" == "code" ]]; then
  if [[ ! -d "${LOCAL_CODE}" ]]; then
    echo "  ⚠ Code directory not found at: ${LOCAL_CODE}"
    echo "    Skipping code sync."
  else
    echo "→ Syncing Next.js app code..."
    rsync ${RSYNC_OPTS} \
      --exclude="node_modules/" \
      --exclude=".next/" \
      --exclude=".env.local" \
      --exclude="tsconfig.tsbuildinfo" \
      "${LOCAL_CODE}/" \
      "${VPS_USER}@${VPS_HOST}:${PROJECT_PATH}/openclaw-os/"
    echo "  ✓ Code synced"
  fi
fi

# ── Git commit on VPS ─────────────────────────────────────────────────────────
echo "→ Committing to git on VPS..."
ssh ${SSH_OPTS} "${VPS_USER}@${VPS_HOST}" bash <<'REMOTE'
  set -euo pipefail
  cd /root/OpenClaw-Wiki
  git add 03-Projects/Agentic-OS/
  if git diff --cached --quiet; then
    echo "  Nothing to commit — vault already up to date."
  else
    git commit -m "agentic-os: deploy $(date '+%Y-%m-%d %H:%M')"
    git push 2>/dev/null || echo "  (git push skipped — no remote configured)"
    echo "  ✓ Committed and pushed"
  fi
REMOTE

echo ""
echo "╔══════════════════════════════════════════════╗"
echo "║  ✅ Deploy complete                          ║"
echo "╚══════════════════════════════════════════════╝"
echo ""
echo "  Vault: ssh ${VPS_USER}@${VPS_HOST}"
echo "  Path : ${PROJECT_PATH}"
echo ""
