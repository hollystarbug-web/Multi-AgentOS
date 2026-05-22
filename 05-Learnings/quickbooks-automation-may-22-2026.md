# QuickBooks Browser Automation — Learnings (May 22, 2026)

*Last updated: 2026-05-22*

## QB Login Protocol — ONE OR TWO STEPS

**The login flow is simple:**
1. Click the account card (email pre-selected from browser memory)
2. Password is ALREADY FILLED IN (•••••••••••••) — just click Continue
3. If "This was me" appears — click it
4. Navigate to Banking — done!

**⚠️ CRITICAL: CDP JavaScript `.click()` does NOT work on Intuit's React SPA.**
Calling `.click()` via CDP Runtime.evaluate JS does not trigger React's synthetic event handlers. The URL may change to include `iux_redirect_reason=UNAUTHENTICATED` but the password field does not appear.

**✅ Solution: Use Playwright Python.** Playwright's `.click()` properly dispatches React-compatible events.
```python
card = page.locator("button").filter(has_text=QB_EMAIL).first
await card.click(timeout=5000)
```

## Running Playwright on Mac Mini via SSH

**Playwright version:** 1.58.0 (Python), 1.59.1 (CLI) — installed at `/usr/bin/playwright`

**To avoid SSH timeout:** Run Playwright scripts in background with `nohup` and `&`.
```bash
# Copy script to Mac Mini
scp qb_relogin.py holly@100.91.33.1:/tmp/

# Run in background
ssh holly@100.91.33.1 "cd /tmp && python3 qb_relogin.py > /tmp/qb_relogin.log 2>&1 &"
sleep 30
ssh holly@100.91.33.1 "cat /tmp/qb_relogin.log"
```

## Bank Balance Extraction — Direct CDP Approach

**Script:** `/root/.openclaw/workspace/scripts/check_bank_balance.py`

**Uses direct CDP via Python websocket** (no Playwright needed — faster and more reliable).

```python
import json, urllib.request, ssl, websocket, base64

# Connect to Chrome on Mac Mini via localhost:9222 tunnel
data = urllib.request.urlopen("http://127.0.0.1:9222/json", timeout=10).read()
tabs = json.loads(data)
# Find banking tab: /app/banking in URL
banking_tab = next(t for t in tabs if "/app/banking" in t.get("url", ""))
# Use websocket to get page text and find "Bank: £" figures
```

**⚠️ OLD SCRIPT BUG:** `qb_cdp_bank_balance.py` filters for tabs with URL exactly `https://qbo.intuit.com` — this NEVER matches any tab since all QB tabs have paths like `/app/banking`. Always returns £0.00.

**Bank accounts:**
- Revolut: 3. Base Lift Services Ltd Revolut
- Metro Current: 31806798 1. Base Metro Bank Current
- Metro Savings: 2. Base Metro Bank Savings

**Report "Bank:" figures, NOT "Posted:".**
- "Bank:" = actual bank balance (from bank feed)
- "Posted:" = QB reconciled amount (can be very different)

**Total bank balance (May 22, 2026):** £108,014.12

## Chrome Keepalive

**Script:** `/root/.openclaw/workspace/scripts/chrome-keepalive.py` — runs every 5 minutes via cron.

**Logic:**
1. Connect to Chrome via CDP (`http://localhost:9222`)
2. Find QB tab with `qbo.intuit.com` in URL (excluding sign-in) — click Home to verify session alive
3. If "sign-in" detected → use Playwright re-login (`qb_relogin.py`)
4. Find SM8 tab — reload it to prevent session timeout

**SM8 tab note:** SM8 tab is NOT always open. Keepalive will report "SM8: tab not found" if SM8 is closed — this is fine.

## Chrome CDP Endpoint

**Endpoint:** `http://localhost:9222` (on VPS) → Mac Mini Chrome at `localhost:9222`

**Test:** `curl http://localhost:9222/json/version` → Chrome version info if live

**Playwright connection:**
```python
browser = await p.chromium.connect_over_cdp("http://localhost:9222")
context = browser.contexts[0]
print(f"Tabs: {len(context.pages)}")
```

## QB Credentials

- **Email:** `debt_recovery@baselifts.co.uk`
- **Password:** `Reddwarf2026!`
- **2FA:** SMS to +351 Portuguese number

## Related Files

- `/root/.openclaw/workspace/scripts/check_bank_balance.py` — direct CDP bank balance
- `/root/.openclaw/workspace/scripts/chrome-keepalive.py` — keepalive + re-login
- `/root/.openclaw/workspace/scripts/qb_relogin.py` — Playwright re-login script
- `/root/.openclaw/workspace/scripts/qb_cdp_vat_extract.py` — VAT extraction
- `/root/.openclaw/workspace/scripts/qb_cdp_so_dd.py` — SO/DD extraction

## Key LEARNINGS Rules

### Rule: CDP JS click on React elements does NOT work
**What:** Don't use CDP `Runtime.evaluate` with `.click()` for React elements on Intuit's sign-in page. **Why:** React uses synthetic event handlers that CDP JS clicks don't trigger. **When:** Any time trying to click buttons on QB/Intuit sign-in page via CDP.
