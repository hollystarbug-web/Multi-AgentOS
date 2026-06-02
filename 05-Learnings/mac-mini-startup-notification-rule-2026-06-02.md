# Global Notification Rule: Mac Mini Startup (2026-06-02)

**Set by:** Justin Howard, 2026-06-02 08:59 UTC
**Owner:** Holly (main agent)
**Status:** ✅ Live

## Rule

Whenever the **Mac Mini** is ever started (boot, wake from sleep, or network restoration), a message MUST be sent to **all three channels** with the exact body:

> `restart detected on MacMini - you must add developer mode to Chrome for CDP and other automation actions ASAP!!`

## Channels

| # | Channel | Target | How |
|---|---------|--------|-----|
| 1 | Telegram direct (Holly/Justin) | `5722920571` | `openclaw message send --channel telegram --target 5722920571` |
| 2 | WhatsApp direct (Justin) | `+447703664722` (bot's own number) | `openclaw message send --channel whatsapp --account default --target 447703664722` |
| 3 | WhatsApp group Holly_Updates | `120363425162893462@g.us` | `openclaw message send --channel whatsapp --account default --target 120363425162893462@g.us` |

## Why this exists

After every Mac Mini restart, **Chrome's Developer Mode / remote debugging** has to be re-enabled so CDP automation on port 9222 keeps working. ServiceM8, QuickBooks, and any other browser automation breaks without it. The rule makes sure Justin gets a ping the moment the Mac Mini comes back, so the developer-mode step is not forgotten.

## Implementation

### Detection script
- **Path:** `/root/.openclaw/workspace/scripts/macmini-startup-watch.sh`
- **State file:** `/root/.openclaw/workspace/state/macmini-state.json`
- **Log file:** `/root/.openclaw/workspace/state/macmini-watch.log`
- **Detection method:** ICMP ping, Tailscale IP `100.91.33.1` first, fallback to LAN `10.0.0.6`
- **Trigger condition:** State transition from non-`up` to `up` (down→up, or unknown→up on first run)

### Cron job
- **Job ID:** `2a3f00c8-8c08-49cb-b561-1ab969dbfb85`
- **Schedule:** `*/5 * * * *` (every 5 minutes)
- **Session target:** `isolated` (background agentTurn — does NOT wake the main Telegram session)
- **Delivery:** `none` (silent unless the script itself decides to send)
- **Timeout:** 60s
- **Model:** `minimax_m3/MiniMax-M3`

## Operational notes

- **WhatsApp not linked = WhatsApp sends fail.** The script logs the failure and continues. Telegram still gets notified. Once Justin re-links WhatsApp, the WhatsApp half of the rule resumes working automatically — no code change needed.
- **No false-positive spamming.** The script only fires on a true state transition (was-not-up → is-up). Steady-state "Mac Mini stays up" or steady-state "Mac Mini stays down" produce no notifications.
- **First-run safeguard.** The very first run of the script records the current state as `first_seen` and does NOT fire a notification. Subsequent transitions do fire.
- **State file is authoritative.** If the cron stops and is later restarted, the state file persists. If the state file is deleted (catastrophic), the next run treats it as `unknown` and records the current state without firing.

## How to test

```bash
# Manual run
bash /root/.openclaw/workspace/scripts/macmini-startup-watch.sh

# Force a "down" state to simulate a restart (then the next run will fire)
echo '{"state":"down","last_change":"2026-06-02T00:00:00Z","last_check":"2026-06-02T00:00:00Z"}' > /root/.openclaw/workspace/state/macmini-state.json
bash /root/.openclaw/workspace/scripts/macmini-startup-watch.sh
```

## Related

- Permanent rule stored in `/root/.openclaw/workspace/MEMORY.md` → "Global Notification Rule: Mac Mini Startup"
- Mac Mini / Chrome CDP architecture: see `/root/.openclaw/workspace/TOOLS.md` → "⚠️ PERMANENT BROWSER RULE — Chrome ONLY for QB and SM8"
