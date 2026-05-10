# Codex Computer Use — Mac Mini Desktop Control

## System Architecture Rule (CRITICAL)

- OpenClaw runs on the VPS (brain)
- Codex Computer Use runs on the Mac Mini (execution node)

Agents must:
- NEVER attempt to run GUI or desktop control tasks on the VPS
- ALWAYS route Computer Use tasks to the Mac Mini via Codex

If unsure → STOP and ask Justin

## Overview

**What it is:** OpenAI Codex running on the Mac Mini with **Computer Use** enabled — a full desktop automation mode that gives Codex vision of the screen and the ability to move the mouse, click, type, and control any application.

**When to use it:** When you need to do something that `agent-browser` can't — interacting with native macOS apps, navigating complex multi-window workflows, or when you need Codex's reasoning to figure out where to click rather than targeting specific elements.

**When NOT to use it:** Routine single-step browser tab work — use `agent-browser` instead. Codex is heavier and slower.

---

## Apps Available on the Mac Mini

The Mac Mini desktop has these apps agents can direct Codex to use:

| App | How to open | Notes |
|-----|------------|-------|
| **Google Chrome** | Dock or `open -a "Google Chrome"` | Main browser — ServiceM8, QuickBooks, Gmail, SC Portal |
| **ServiceM8** | Dock or `open -a "ServiceM8"` | Native macOS app (not the web app) |
| **Calendar** | Dock or `open -a Calendar` | icalBuddy also available via CLI |
| **Obsidian** | Dock or `open -a Obsidian` | Note-taking vault |
| **ServiceM8 Web App** | Chrome → go.servicem8.com | Same as native app but web version |
| **QuickBooks Online** | Chrome → qbo.intuit.com | Browser only |
| **SC Portal** | Chrome → base-sc-dashboard.vercel.app | Service Contract dashboard |
| **Gmail** | Chrome → gmail.com | Debt recovery and comms |
| **Screen Sharing** | System Preferences → Sharing | Codex uses this for vision |

**Credentials for apps:** See the Login Reference section below.

**Note:** Codex sees whatever is currently displayed on the Mac Mini screen. If you need a specific app open, tell Codex to open it first.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                          VPS (me)                           │
│                                                             │
│   Codex CLI ──ssh──> Mac Mini:100.91.33.1                  │
│                        │                                    │
│                        ├── Chrome (debug: 9222)              │
│                        │    └── agent-browser tool             │
│                        │                                     │
│                        └── Screen Sharing (VNC: 5900)         │
│                             │                                │
│                             └── VNC tunnel ───> VPS:5900     │
│                                  (persistent LaunchAgent)     │
└─────────────────────────────────────────────────────────────┘
```

- **Mac Mini:** `holly@100.91.33.1` (Tailnet)
- **Codex binary:** `/Applications/Codex.app/Contents/MacOS/Codex`
- **Chrome debug:** Port 9222 — `agent-browser` uses this
- **VNC tunnel:** VPS `localhost:5900` ↔ Mac Mini Screen Sharing (port 5900)
  - LaunchAgent: `com.holly.vnc-tunnel.plist`
  - Auth: `vnc_tunnel_key` — Mac Mini SSH key for `root@100.87.207.10`
  - **Status:** ✅ LIVE — test: `python3 -c "import socket; s=socket.socket(); s.connect(('127.0.0.1',5900)); print(s.recv(50)); s.close()"`

---

## The Two Tools — Which to Use

| Task | Tool |
|------|------|
| ServiceM8 form filling, job card clicks | `agent-browser` |
| QuickBooks web form filling | `agent-browser` |
| Complex multi-step navigation needing reasoning | Codex Computer Use |
| Native macOS app control | Codex Computer Use |
| Read a screen that agent-browser can't parse | Codex Computer Use |
| Any task needing full desktop vision | Codex Computer Use |

---

## Connecting to the Mac Mini

All connections go through SSH to `holly@100.91.33.1` from the VPS.

```bash
# Basic SSH access
ssh holly@100.91.33.1

# Run a single command
ssh holly@100.91.33.1 "ps aux | grep Chrome"
```

---

## Tool 1: agent-browser (Chrome Tab Control)

**For:** ServiceM8, QuickBooks, and any browser-based web app.

**Chrome is already running** on the Mac Mini with debug port 9222 open. Chrome tab you want is identified by a **Tab ID**.

### Get the Tab ID You Need

```bash
ssh holly@100.91.33.1 \
  "curl -s http://localhost:9222/json | python3 -c '
import sys, json
data = json.load(sys.stdin)
for t in data:
    url = t.get("url","")
    id_ = t.get("id","")
    if "servicem8" in url.lower() or "quickbooks" in url.lower() or "qbo" in url.lower() or "gmail" in url.lower():
        print(f"ID: {id_}")
        print(f"URL: {url[:120]}")
        print()
'"
```

### Connect and Use

```bash
# 1. Connect to a specific Chrome tab
ssh holly@100.91.33.1 \
  "/opt/homebrew/bin/agent-browser connect 'ws://localhost:9222/devtools/page/<TAB_ID>'"

# 2. See the UI
ssh holly@100.91.33.1 "/opt/homebrew/bin/agent-browser snapshot"

# 3. Click something
ssh holly@100.91.33.1 "/opt/homebrew/bin/agent-browser click @<ref>"

# 4. Type into a field
ssh holly@100.91.33.1 "/opt/homebrew/bin/agent-browser fill @<ref> 'text here'"

# 5. Press a key
ssh holly@100.91.33.1 "/opt/homebrew/bin/agent-browser press Enter"

# 6. Screenshot
ssh holly@100.91.33.1 "/opt/homebrew/bin/agent-browser screenshot /tmp/output.png"

# 7. Copy screenshot back to VPS
scp holly@100.91.33.1:/tmp/output.png /tmp/
```

### ⚠️ ServiceM8 Navigation Rule

ServiceM8 uses an `s_auth` session token in the URL. **Never use `agent-browser open <url>`** — it loses the token and logs you out. Instead:

```bash
# Get the s_auth token from the current live tab
S_AUTH=$(ssh holly@100.91.33.1 \
  "curl -s http://localhost:9222/json | python3 -c '
import sys, json, re
data = json.load(sys.stdin)
for t in data:
    if t.get("id","") == "<TAB_ID>":
        m = re.search(r"s_auth=([a-f0-9]+)", t.get("url",""))
        if m: print(m.group(1))
'")

# Navigate by setting window.location.href (keeps the token)
ssh holly@100.91.33.1 \
  "/opt/homebrew/bin/agent-browser eval \"window.location.href='https://go.servicem8.com/...?s_auth=${S_AUTH}'\""
```

---

## Tool 2: Codex Computer Use (Full Desktop Control)

**For:** Everything else — native apps, complex multi-step workflows, screen reading, any app on the Mac Mini desktop.

### How It Works

Codex Computer Use connects to the Mac Mini's **Screen Sharing** (VNC) service. It gets screenshots of the desktop, reasons about what to do, then executes mouse/keyboard actions via VNC.

### Invocation — Run on Mac Mini via SSH

Codex runs **on the Mac Mini** via SSH from the VPS. The Mac Mini has Codex installed at `/Applications/Codex.app`.

```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'your instruction here' \
    --ask-for-approval never"
```

**Always use `--ask-for-approval never`** when running headless via SSH. Without it, Codex waits for human approval on every action.

### Useful Codex Tasks

**Open and use a web app:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'open Google Chrome and navigate to https://qbo.intuit.com. Log in with debt_recovery@baselifts.co.uk and Reddwarf2026!. Click on Banking, then click the first account to expand it.' \
    --ask-for-approval never"
```

**Read data from a screen:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'open QuickBooks Online and navigate to the VAT dashboard. Read all the VAT figures shown — collected, paid, and balance due. Report what you see.' \
    --ask-for-approval never"
```

**Fill in a form in a web app:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'navigate to the ServiceM8 job for Bas-1264. Open the job card and fill in the completion notes field with: Inspection completed, all lifts serviceable, certificates issued.' \
    --ask-for-approval never"
```

**Interact with a native macOS app:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'open the Calendar app and check what meetings are scheduled for today between 2pm and 5pm. List each one with the title and time.' \
    --ask-for-approval never"
```

**Handle a login screen:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'look at the screen. If there is a login page for any app, log in using the appropriate credentials. If ServiceM8 is on the login screen, use justin.howard@silverbrookcm.com and Reddwarf2026!. If QuickBooks, use debt_recovery@baselifts.co.uk and Reddwarf2026!.' \
    --ask-for-approval never"
```

**Download and save a file:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'navigate to the ServiceM8 job for Bas-1264. Find and download the signed job card PDF to the Downloads folder. Confirm the file was saved and its name.' \
    --ask-for-approval never"
```

**Interact with email:**
```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'open Gmail in Chrome and find the most recent email from accounts@baselifts.co.uk. Read the subject and first few lines, then flag it with a star.' \
    --ask-for-approval never"
```

### Getting Codex Output Back to the VPS

Codex runs on the Mac Mini and prints output over SSH. For longer sessions, redirect to a file:

```bash
ssh holly@100.91.33.1 \
  "/Applications/Codex.app/Contents/MacOS/Codex \
    --search 'your instruction here' \
    --ask-for-approval never" > /tmp/codex-output.txt 2>&1

# Then read it back
cat /tmp/codex-output.txt
```

### Codex Settings

- `--ask-for-approval never` — **Always use this** when running headless via SSH
- `--provider codex` — Use OpenAI Codex (default)
- `--no-credits` — Don't check credit balance

### What Codex Can See and Do

Codex sees whatever is displayed on the Mac Mini's screen via Screen Sharing. It can:
- Move the mouse cursor anywhere on screen
- Click, double-click, right-click
- Type text into any field
- Scroll windows
- Open applications from the Dock
- Switch between apps
- Read on-screen text (OCR via vision)
- Download and save files
- Navigate multi-step workflows

### Caveats

- Codex sees what Screen Sharing shows — if windows overlap or things are off-screen, it may miss them
- Codex is slow — it takes screenshots between every action, reasons, then acts
- For simple single-step browser tasks, `agent-browser` is faster
- Codex actions go through VNC — there's no programmatic output like element references; it reasons visually

---

## Common Workflows

### When to Use Codex vs agent-browser

| Situation | Use |
|-----------|-----|
| You know the exact URL and just need to fill a form | `agent-browser` — fast and precise |
| You need to find something first (search, locate a button) | Codex — visual reasoning |
| The session has expired (login screen) | Codex — can handle login UI |
| Multiple apps need coordinating | Codex — can switch between apps |
| You need to read data from a screen | Codex — can OCR and report |
| Working with a native macOS app | Codex only |
| Simple click a known element | `agent-browser` — faster |

### Login Reference

| App | Username | Password |
|-----|----------|----------|
| ServiceM8 | justin.howard@silverbrookcm.com | Reddwarf2026! |
| QuickBooks | debt_recovery@baselifts.co.uk | Reddwarf2026! |
| Gmail/Chrome | justin.howard@silverbrookcm.com | Reddwarf2026! |
| DocuSign | justin.howard@silverbrookcm.com | Reddwarf2026! |

---

## Useful One-Liners

```bash
# Check which Chrome tabs are open (filter by URL keyword)
ssh holly@100.91.33.1 "curl -s http://localhost:9222/json | python3 -m json.tool | grep -E 'id|url' | grep -A1 servicem8"

# Check if Mac Mini is reachable
ping -c 1 100.91.33.1

# Check if Chrome debug port is responding
curl -s --max-time 3 http://localhost:9222/json/version

# Check if Codex is running
ssh holly@100.91.33.1 "ps aux | grep -i codex | grep -v grep | head -3"

# Check VNC tunnel status
ssh holly@100.91.33.1 "launchctl list | grep vnc"

# Check VNC tunnel is live from VPS
python3 -c "import socket; s=socket.socket(); s.connect(('127.0.0.1',5900)); print('VNC OK:', s.recv(20)); s.close()"

# Restart VNC tunnel if needed
ssh holly@100.91.33.1 "launchctl stop com.holly.vnc-tunnel && launchctl start com.holly.vnc-tunnel"

# Restart Screen Sharing if needed
ssh holly@100.91.33.1 "launchctl stop com.apple.screensharing.agent && launchctl start com.apple.screensharing.agent"
```

---

## Key Tab IDs (Known — verify before use)

| Tab | ID | Notes |
|-----|-----|-------|
| ServiceM8 Dispatch Board | `8B77F0A5A19CC9D32B7090C06EB4996C` | May need re-login |
| ServiceM8 (live job) | `F0D4482D07C664EF428E77EC0FCF8698` | Has valid session |

Run this to get current tabs:
```bash
ssh holly@100.91.33.1 "curl -s http://localhost:9222/json | python3 -c '
import sys, json
for t in json.load(sys.stdin):
    print(t.get("id","")[:40], "-", t.get("url","")[:80])
'"
```

---

## Troubleshooting

**Codex browser-use plugin reinstall loop:**
- The `bundled_plugin_reinstall_uninstall_requested pluginId=browser-use reason=forced` message on every startup is **normal expected behavior** — browser-use is marked `INSTALLED_BY_DEFAULT` in the marketplace and is reinstalled on each launch
- The plugin IS working if you see: `[browser-use-native-pipe-server] browser-use native pipe listening pipePath=/tmp/codex-browser-use/...sock`
- Verify pipe server is active: `ssh holly@100.91.33.1 'ls /tmp/codex-browser-use/*.sock | xargs -I{} python3 -c "import socket; s=socket.socket(socket.AF_UNIX,socket.SOCK_STREAM); s.connect(\"{}\"); print(1)"' 2>/dev/null | grep 1`

**VNC tunnel down (VPS can't reach Mac Mini screen):**
- Check tunnel process: `ssh holly@100.91.33.1 "launchctl list | grep vnc"`
- If missing: `ssh holly@100.91.33.1 "launchctl load /tmp/com.holly.vnc-tunnel.plist"`
- Check tunnel log: `ssh holly@100.91.33.1 "cat /tmp/vnc-tunnel.log"`
- Test: `python3 -c "import socket; s=socket.socket(); s.connect(('127.0.0.1',5900)); print(s.recv(50)); s.close()"`

**agent-browser won't connect:**
- Check Chrome is running on Mac Mini: `ssh holly@100.91.33.1 "ps aux | grep Chrome"`
- Check debug port: `curl -s http://localhost:9222/json/version`
- Get a fresh tab ID — old ones become stale

**Codex is slow or unresponsive:**
- Screen Sharing may be overloaded — try again
- Check Codex process: `ssh holly@100.91.33.1 "ps aux | grep -i codex | grep -v grep"`

**Any app shows login screen:**
- Use Codex to log in manually — it can handle any login UI
- Reference the login table above for credentials

**Screen Sharing not responding:**
- `ssh holly@100.91.33.1 "launchctl stop com.apple.screensharing.agent && launchctl start com.apple.screensharing.agent"`

**Codex Computer Use remote connection stuck on `disconnected`:**
- Codex Computer Use connects to remote hosts via SSH to run VNC screen sharing
- The `hetzner-browser` and `hetzner-screen` aliases are discovered from `~/.ssh/config`
- Both must point to reachable IPs — currently using Tailscale IP `100.87.207.10`
- Test connectivity: `ssh holly@100.91.33.1 'ssh -o BatchMode=yes hetzner-browser "echo OK"'`
- The remote connection is for Codex Computer Use only — `agent-browser` does NOT use it
- If remote connection fails, Codex Computer Use (full desktop vision) won't work, but browser-use (Chrome tab control) still does
