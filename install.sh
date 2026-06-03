#!/usr/bin/env bash
# Multi-AgentOS — top-level install shim
#
# The real install script lives in `multi-agent-os/install.sh` inside the
# repo. This shim downloads it and pipes it to bash so the published
#   curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/install.sh | bash
# command works without any extra steps.
#
# If you prefer, you can call the real script directly:
#   curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/multi-agent-os/install.sh | bash
#
# Both paths are equivalent and kept in sync.

set -e
REPO="hollystarbug-web/Multi-AgentOS"
BRANCH="${MULTI_AGENTOS_BRANCH:-main}"
URL="https://raw.githubusercontent.com/${REPO}/${BRANCH}/multi-agent-os/install.sh"

echo "▸ Fetching Multi-AgentOS installer from $URL"
exec curl -fsSL "$URL" | bash -s -- "$@"
