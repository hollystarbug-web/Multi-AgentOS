# ServiceM8 Mac Mini Codex Computer Use — Learnings

*Last updated: 2026-05-05*

---

## Quick Reference

- **Mac Mini SSH**: `holly@100.91.33.1` (Tailscale)
- **VPS**: `root@204.168.251.149` (Hetzner, ubuntu-16gb-hel1-1)
- **ServiceM8 credentials**: justin.howard@silverbrookcm.com / Reddwarf2026!
- **Chrome debug port**: localhost:9222 (Mac Mini)
- **agent-browser**: `/opt/homebrew/bin/agent-browser` (Mac Mini)
- **Codex binary**: `/Applications/Codex.app/Contents/MacOS/Codex`

---

## Known Working Approaches

### agent-browser (Chrome Tab Control)
- Chrome on Mac Mini has debug port 9222
- Use `agent-browser connect ws://localhost:9222/devtools/page/<TAB_ID>` to control a tab
- ServiceM8 login via Chrome works if Google session exists in Chrome profile

### Codex Computer Use
- Spawn via SSH: `ssh holly@100.91.33.1 "/Applications/Codex.app/Contents/MacOS/Codex --search 'task' --ask-for-approval never"`
- Codex sees the Mac Mini desktop via Screen Sharing (VNC)
- Currently Codex connects to `remote-ssh-discovered:hetzner-browser` (VPS) for remote desktop — this fails if VPS doesn't have Codex/Chrome

---

## ServiceM8 App State

- Native app stores session in: `~/Library/Containers/com.servicem8.desktop/Data/Library/Application Support/ServiceM8/`
- Session data includes: Cookies, Local Storage (LevelDB), Session Storage
- s_auth tokens found in Local Storage leveldb logs
- Login types: password, Google OAuth, Apple OAuth

---

## Session State

- ServiceM8 native app stores session in: `~/Library/Containers/com.servicem8.desktop/Data/Library/Application Support/ServiceM8/`
- Session storage: Cookies, Local Storage (LevelDB), Session Storage
- Session logs show: user_id `c1aa7a46-1ff4-4922-994c-e7e783c94730`
- Most recent s_auth token found: `eef1439cdcf17ae8c8d4aa59688e5bc1` (from session logs)
- App was actively used today (May 5) around 18:30 UTC
- **Session is IN the ServiceM8 app's embedded Chromium, NOT in Chrome browser**

## Failure Modes & Fixes

| Problem | Fix |
|---------|-----|
| "Invalid Password or Email" | Password may be outdated; try Google OAuth |
| Google OAuth consent screen | Chrome needs to be logged into the Google account first |
| ServiceM8 window blank/loading | App may be starting up or logged out |
| screencapture fails via SSH | macOS privacy blocks CLI screen capture over SSH |
| AppleScript can't read SM8 content | SM8 uses Chromium embedded — accessibility limited |
| Codex remote connection fails | VPS not set up as Codex remote host |
| ServiceM8 session only in native app | Chrome has separate session storage — can't reuse app session |

## Critical Architecture Finding (2026-05-05)

Codex Computer Use on Mac Mini tries to connect to `remote-ssh-discovered:hetzner-browser` (which points to VPS at 100.87.207.10) for full desktop vision. This connection fails because:
- VPS has Codex CLI binary but NOT the full Codex desktop app
- Codex Computer Use requires the full app with embedded runtime on the remote host
- The remote connection is for screen sharing/VNC access from the remote machine's display
- Without this working, Codex can't see the Mac Mini's screen

**ServiceM8 session is in the native app's embedded Chromium (Electron), NOT in Chrome browser.** Chrome tabs have separate cookie storage. The s_auth tokens from the app's session storage don't work in Chrome.
