# QuickBooks CDP Chrome Session — Issue & Fix

> Status: **RESOLVED** — 2026-05-26  
> Affects: All QB CDP scripts (bank balance, VAT, SO/DD extraction)

## Problem

Chrome on the Mac Mini runs in TWO modes simultaneously:
1. **Regular Chrome** (`/Applications/Google Chrome.app`) — where QB is logged in
2. **Debug Chrome** (`--remote-debugging-port=9222`, LaunchAgent managed) — separate profile at `/Users/holly/openclaw-chrome-profile`

These are SEPARATE browser instances with SEPARATE profiles. Cookies are NOT shared.

All CDP scripts connect to `localhost:9222` (debug Chrome). But debug Chrome has NO Intuit/QB session cookies — so every navigation redirects to Intuit login.

Intuit's login page also has CSP protection that blocks standard JS-injection login automation. The password field is `readonly` (React-managed autofill), preventing `Input.dispatchKeyEvent` from working.

## Symptoms

```bash
$ python3 /root/.openclaw/workspace/scripts/qb_cdp_bank_balance.py
ERROR: Cannot reach Chrome. Is tunnel up?
# OR
# Script runs but always redirects to login page
```

## Fix — Open QB in Debug Chrome

On the Mac Mini, open Chrome (regular one) and navigate to:
```
https://qbo.intuit.com
```
Log in with: `debt_recovery@baselifts.co.uk` / `ADrianmole1375!`

Once logged in, the debug Chrome's profile will have the session cookies. CDP scripts will work automatically.

## Permanent Fix — Same Chrome Profile

To avoid needing two separate Chrome sessions:

1. Quit all Chrome:
```bash
osascript -e 'quit app "Google Chrome"'
```

2. Update LaunchAgent to use regular Chrome profile instead of separate one:
```xml
<!-- Change --user-data-dir from: -->
--user-data-dir=/Users/holly/openclaw-chrome-profile
<!-- To: -->
--user-data-dir=/Users/holly/Library/Application Support/Google/Chrome
```

3. LaunchAgent auto-restarts Chrome with debug flags AND regular profile.

**⚠️ Risk:** If Mac Mini is in active use, quitting Chrome disrupts Justin's session.

**Better approach:** Keep two Chrome instances but copy QB cookies from regular profile to debug profile. Or use Chrome's "Profiles" feature to have a dedicated automation profile that can run alongside regular Chrome.

## Scripts That Need QB Session

| Script | Purpose | Frequency |
|--------|---------|-----------|
| `qb_cdp_bank_balance.py` | Bank balances | Weekdays 9:35am |
| `qb_cdp_vat_extract.py` | VAT estimate | Weekdays 9:40am |
| `qb_cdp_so_dd.py` | SO/DD extraction | Weekdays 9:45am |
| `so-dd-monthly-extractor.py` | Monthly SO/DD | 1st of month |

## Chrome Tunnel Status

- VPS endpoint: `http://localhost:9222` (via reverse SSH tunnel)
- Mac Mini Chrome PID with debug: `688` (as of 2026-05-26)
- Debug profile: `/Users/holly/openclaw-chrome-profile`
