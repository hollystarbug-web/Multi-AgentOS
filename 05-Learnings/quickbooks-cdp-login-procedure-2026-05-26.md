# QuickBooks CDP Login — Complete Procedure

> Created: 2026-05-26  
> Updated: 2026-05-26  
> Status: ✅ **RESOLVED — 2026-05-26 11:45 UTC**

## Overview

All QB morning cron jobs (Bank Balance, VAT, SO/DD) extract data via Chrome DevTools Protocol (CDP) from a Chrome browser running on the Mac Mini. This requires a QB tab to be open in Chrome with a valid session.

## Architecture

```
VPS (localhost:9222)
    ↓ SSH reverse tunnel (port 9222)
Mac Mini Chrome --remote-debugging-port=9222
    ↓ Chrome profile: /Users/holly/openclaw-chrome-profile
    ↓ Separate from Justin's regular Chrome profile
QB tab (https://qbo.intuit.com)
```

**Two Chrome instances on Mac Mini:**
- **Debug Chrome** (PID 688, LaunchAgent-managed, port 9222) — automation uses this
- **Regular Chrome** (PID 412, Justin's normal browser) — has QB session but NO debug port

These are SEPARATE profiles. Cookies are NOT shared.

## Cron Jobs That Need QB

| Job | Time | Script | What it does |
|-----|------|--------|--------------|
| Holly Bank Balance | 9:35am Mon-Fri | `qb_cdp_bank_balance.py` | Reads Metro Bank + Revolut balances |
| Holly VAT Estimate | 9:40am Mon-Fri | `qb_cdp_vat_extract.py` | Reads VAT liability from QB |
| Holly SO/DD | 9:45am Mon-Fri | `qb_cdp_so_dd.py` | Reads standing orders + direct debits |
| SO/DD Monthly Extraction | 8:30am 1st of month | `so-dd-monthly-extractor.py` | Saves SO/DD data to file |
| SO/DD Daily Report | 9:04am Mon-Fri | `so-dd-daily-report.py` | Sends formatted report to WhatsApp |
| QB Human Keepalive | Every 25 min | `qb_human_keepalive.py` | Keeps QB session alive |

## How to Log In to QB in Debug Chrome (Manual — One Time)

The debug Chrome profile (`/Users/holly/openclaw-chrome-profile`) does NOT have QB cookies. You need to log in once, then Chrome will remember the session.

**Steps:**

1. On Mac Mini, open the debug Chrome window (the one with the blue dot icon, or the one that auto-starts via LaunchAgent)

2. Navigate to: `https://qbo.intuit.com`

3. Log in with:
   - Email: `debt_recovery@baselifts.co.uk`
   - Password: `ADrianmole1375!` (see `~/.credentials/quickbooks-debt-recovery.json`)

4. If Intuit asks "This was me" — click Yes

5. Keep that tab open. Do NOT close Chrome.

6. The session should now persist and the cron jobs will work.

**NOTE:** If you close Chrome completely, the LaunchAgent will restart it automatically, but the QB session will be gone. You will need to log in again.

## Why Can't We Automate the Login?

Intuit's sign-in page uses:
1. **React with controlled inputs** — password field is `readonly`, managed by React state
2. **Browser-managed autofill** — email/password are filled by Chrome's credential manager, not visible as editable DOM fields
3. **Bot protection (iovation/h.online-metrix.net)** — Intuit runs threat detection that flags automated login attempts

Attempts to automate:
- `Runtime.evaluate` with JS value setters → blocked by React state
- `Input.dispatchKeyEvent` keyboard simulation → field not focused (React virtual DOM)
- Copying cookies between Chrome profiles → profiles are incompatible (different Chrome instances)

## Permanent Fix Options

### Option A: Dedicated Chrome Profile for Automation (Recommended)

Chrome has a built-in profile system. Create a dedicated automation profile:

1. On Mac Mini, open Chrome (regular one)
2. Go to: `chrome://settings/manageProfile`
3. Click "Add" → Create a new profile named "Automation" → Chrome icon
4. In this new profile, log into QB: `https://qbo.intuit.com`
5. Note the profile's data directory path
6. Update the LaunchAgent plist to use that profile's directory

This lets Justin use Chrome normally while automation uses a separate profile with its own QB session.

### Option B: Share Regular Chrome Profile

**⚠️ Risk:** Quitting Chrome disrupts Justin's session.

```bash
# On Mac Mini — quit all Chrome
osascript -e 'quit app "Google Chrome"'

# Update LaunchAgent to use regular Chrome profile:
# Edit ~/Library/LaunchAgents/com.holly.chrome-debug.plist
# Change: --user-data-dir=/Users/holly/openclaw-chrome-profile
# To:     --user-data-dir=/Users/holly/Library/Application\ Support/Google/Chrome
# Then:   launchctl load ~/Library/LaunchAgents/com.holly.chrome-debug.plist
```

### Option C: Use Chrome Profiles Feature

Chrome's Profiles feature lets multiple Chrome windows run with different profiles simultaneously, all with debug port. This is the cleanest approach — Justin uses Profile 1, automation uses Profile 2.

## If Cron Jobs Start Failing Again

Symptoms:
- Bank Balance/VAT/SO/DD WhatsApp reports stop arriving
- Script output contains "session expired" or redirects to sign-in page

**Quick fix:**
1. On Mac Mini, open debug Chrome
2. Go to `https://qbo.intuit.com`
3. Log in if needed
4. Done — crons will resume automatically

**To diagnose:**
```bash
# Check Chrome tabs (from VPS)
curl http://localhost:9222/json

# Check if QB tab exists
python3 /root/.openclaw/workspace/scripts/qb_cdp_bank_balance.py 2>&1 | tail -5

# Check keepalive log
tail -20 /tmp/qb_keepalive.log
```

## QB Credentials

| Field | Value |
|-------|-------|
| Email | `debt_recovery@baselifts.co.uk` |
| Password | `ADrianmole1375!` |
| URL | `https://qbo.intuit.com` |
| Company | Base Lift Services Ltd |
| Realm ID | `9130348199249446` |

Stored in: `~/.credentials/quickbooks-debt-recovery.json`

## OAuth API (Alternative to CDP)

QB also has a REST API. OAuth tokens are expired as of 2025 — would need re-auth. The API approach would be cleaner long-term but requires a manual OAuth flow.

Credentials stored in: `~/.credentials/quickbooks-api.json`
