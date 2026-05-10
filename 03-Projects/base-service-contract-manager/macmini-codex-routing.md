---
title: Mac Mini / Codex Routing
project: Base Service Contract Manager
created: 2026-05-10
tags: [mac-mini, codex, browser, automation]
---

# Mac Mini / Codex Routing

## Machine Roles

| Machine | Role |
|---------|------|
| Mac Mini (100.91.33.1) | GUI/browser execution node only |
| Hetzner VPS | OpenClaw brain, primary runtime |

**FIRM RULE:** Agents must not attempt GUI desktop automation on the VPS. Agents must not treat the Mac Mini as wiki/Obsidian host.

## Mac Mini Access

**SSH:** `holly@100.91.33.1`
**VNC:** VPS localhost:5900 → Mac Mini Screen Sharing
**Password:** Reddwarf2026!

## Browser Automation Options

### 1. agent-browser CLI (Chrome CDP)

**Binary:** `/opt/homebrew/lib/node_modules/agent-browser/bin/agent-browser-darwin-arm64`

**Use for:** Browser tab control — clicking, filling forms, navigating pages

**Chrome Tab IDs:**
- ServiceM8: `8B77F0A5A19CC9D32B7090C06EB4996C`
- QuickBooks: `6D8251B13C4D77646C82F7B2DBF7279B`

**Connect:** `agent-browser connect "ws://localhost:9222/devtools/page/<TAB_ID>"`

**Commands:** `snapshot` | `click @<ref>` | `fill @<ref> "text"` | `eval "js"` | `screenshot /tmp/file.png`

### 2. Codex Computer Use (Full Desktop Control)

**Use for:** Visual reasoning, native macOS apps, expired sessions, multi-app coordination

**Invocation:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'your instruction here' \
    --ask-for-approval never"
```

**Key flags:**
- `--ask-for-approval never` — Required for headless use
- `--provider codex` — Use OpenAI Codex (default)

### 3. Safari WebDriver (Safari Only)

**Use for:** Safari-specific tasks only

**Endpoint:** `http://localhost:9225`

**Status:** Running via LaunchAgent, watchdog restarts every 15 minutes

## Routing Decision Tree

```
Need browser control?
├── ServiceM8 or QuickBooks?
│   └── YES → Chrome via agent-browser CDP
│           └── Tab ID: 8B77F0A5A19CC9D32B7090C06EB4996C (SM8)
│               Tab ID: 6D8251B13C4D77646C82F7B2DBF7279B (QB)
├── Safari-specific task?
│   └── YES → Safari WebDriver at localhost:9225
└── Need full desktop visual control / native macOS?
    └── YES → Codex Computer Use via SSH to Mac Mini
```

## Navigation Tip

**For ServiceM8:** Always include `s_auth` token in URL. Get fresh token:
```bash
S_AUTH=$(curl -s http://localhost:9222/json | python3 -c "import sys,json; [print(re.search(r's_auth=([a-f0-9]+)', t['url']).group(1)) for t in json.load(sys.stdin) if '8B77F0A5A19CC9D32B7090C06EB4996C' in t.get('id','')])"
agent-browser eval "window.location.href='https://go.servicem8.com/...?s_auth=${S_AUTH}'"
```

**Never use:** `agent-browser open <url>` — loses s_auth token

## Chrome Keepalive

**Script:** `chrome-keepalive.py` — runs every 5 minutes, reloads SM8 and QB tabs
**Purpose:** Detects session expiry without re-logging in

## Last Updated

`2026-05-10`
