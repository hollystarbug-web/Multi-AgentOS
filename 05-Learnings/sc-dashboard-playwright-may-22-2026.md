# SC Dashboard & ServiceM8 Playwright Automation — Learnings (May 22, 2026)

*Last updated: 2026-05-22*

---

## Rule: ServiceM8 OAuth Refresh Tokens Are Single-Use
**What:** SM8 OAuth refresh tokens can only be used ONCE. After refresh, a new refresh token is issued and the old one is invalidated. **Why:** OAuth 2.0 security spec — refresh token rotation. **When:** Every time you need to refresh the SM8 access token. **How:** Store the new refresh_token immediately after every refresh. **File:** `~/.openclaw/workspace/.credentials/servicem8_oauth.json`

**Current status (2026-05-22):** Refresh token `105878-euw2-4457bfd0a1ab343525bef1e8918cafb7a1dd5430` was used once at 13:54:35 UTC and is now EXHAUSTED. Need new OAuth authorization to get fresh refresh_token.

---

## Rule: SM8 Form Response PDF Cannot Be Generated via API
**What:** The SM8 API (`POST /platform_produce_document`) only supports built-in templates (Quote, Work Order, Invoice). It CANNOT generate PDFs for custom forms like SC V7. **Why:** SM8's document platform doesn't have a custom form PDF template. **When:** Trying to generate SC V7 Form Response PDF for Smart Attachment. **Solution:** Use Playwright Web UI — click "Generate PDF" link in the job diary, which triggers SM8's internal PDF generation.

---

## Rule: Playwright Must Use Chrome CDP Connection for Existing Session
**What:** When automating SM8 via Playwright on the Mac Mini, connect to the EXISTING Chrome session via CDP rather than launching a new browser. **Why:** Chrome is already logged into SM8 as `justin.h@baselifts.co.uk` — launching a fresh browser would require re-authentication. **How:**
```javascript
// Get WebSocket URL from Chrome CDP
const http = require('http');
const targets = await new Promise((resolve) => {
  http.get('http://localhost:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve(JSON.parse(data)));
  }).on('error', () => resolve([]));
});
const wsUrl = targets[0].webSocketDebuggerUrl;
const browser = await chromium.connectOverCDP(wsUrl);
```

---

## Rule: Node Path on Mac Mini Is `/opt/homebrew/Cellar/node@22/22.22.2_1/bin/node`
**What:** The node binary on the Mac Mini is at `/opt/homebrew/Cellar/node@22/22.22.2_1/bin/node` — NOT `/opt/homebrew/bin/node`. **Why:** Homebrew installs versioned Cellar formulae. The `@22` is part of the path. **When:** Any time running node scripts via SSH on the Mac Mini. **How:** Use the full path. Example:
```bash
NODE_PATH=/opt/homebrew/lib/node_modules /opt/homebrew/Cellar/node@22/22.22.2_1/bin/node /tmp/script.js arg1
```

**⚠️ SSH execSync issue:** When running via PM2/Node.js `execSync`, SSH commands to Mac Mini may fail silently even when the path is correct. The SSH key at `/root/.ssh/id_ed25519` has no passphrase but may not be accessible to the PM2 process in some contexts. Test SSH commands manually before relying on them in code.

---

## Rule: ServiceM8 PRONUNCIATION — "Service Mate"
When using TTS/voice, pronounce "ServiceM8" as "Service Mate" (written form remains ServiceM8).

---

## SC Dashboard Bug Fixes (May 22, 2026)

### Bug: Step 2 Material Push Over-Inflation
**What:** Step 2 was pushing `quantity: visitsPerYear` with `price: annualValue` and `displayed_amount: annualValue * 1.20`. SM8 calculates `displayed_amount = quantity × price × 1.20`, causing massive over-inflation. **Fix:** `quantity: 1`, `price: annualValue`, `displayed_amount: annualValue * 1.20`.

### Bug: Step 3 VAT Double-Count
**What:** `displayed_amount` (tax-inclusive) was summed, then 20% VAT extracted and added again. **Fix:** Display `displayed_amount` directly as-is. SM8 returns `displayed_amount` and `price` as STRINGS — always use `parseFloat(String(...))`.

### Bug: Step 1 Client Search Returns No Results
**What:** `DATABASE_URL` PM2 env var pointed to `/root/portal.db` (40KB, no data) instead of `/tmp/portal.db` (3.3MB, 4481 companies). **Fix:** Change the env var path.

### Bug: portal-api annual_value Wrong Formula
**What:** `visits_per_year × full_day_rate` (wrong). **Fix:** `visits_per_year × price_per_service`.

---

## Playwright SM8 Email Workflow (as taught by Justin)

### Prerequisites
- Chrome browser on Mac Mini, logged into ServiceM8 as `justin.h@baselifts.co.uk`
- Job must have SC V7 form submitted and be in "Quote" status
- Chrome CDP port 9222 accessible via tunnel

### Workflow Steps
1. `page.goto('https://go.servicem8.com/job_dispatch')`
2. Search for job number in "Job Search..." textbox
3. `jobLink.dblclick()` to open job
4. In job diary: `page.getByRole('link', { name: 'Generate PDF' }).click()` — **CRITICAL: creates Form Response + PDF**
5. `page.keyboard.press('Escape')` to close PDF preview
6. `page.getByRole('button', { name: 'Billing' }).click()`
7. `page.getByRole('button', { name: 'Send Quote' }).click()`
8. `page.getByRole('button', { name: 'Email Templates' }).click()`
9. `page.getByRole('link', { name: 'New Service Contract Quote' }).click()`
10. `page.locator('.AttachmentIcon').first().click()` — **attaches Smart PDF**
11. CC: `page.getByRole('textbox', { name: 'CC:' }).fill('696d5a@inbox.servicem8.com')`
12. `page.getByRole('button', { name: 'Send', exact: true }).click()`

### Smart Attachment
The `.AttachmentIcon` click attaches the SM8-generated Form Response PDF as a Smart Attachment. This is what makes the email "Smart" — the attachment is linked to the SM8 record and can be re-sent from within SM8.

---

## portal-api vs portal Architecture

| Component | Location | Port | Description |
|---|---|---|---|
| portal (Next.js) | `/root/.openclaw/workspace-sally/portal/` | 3000 | Frontend UI |
| portal-api (Express) | `/root/portal-api/server.js` | 3001 | Database + SM8 API calls |

**Key files:**
- `portal/lib/db.ts` — local SQLite (portal's own DB)
- `portal/lib/network-db.ts` — calls to portal-api
- `portal-api/server.js` — central DB + SM8 OAuth/API

**Approval queue flow:**
1. User submits Step 2 → portal calls `POST /api/sc-form-existing` → portal-api stores data + creates SM8 job
2. Portal syncs approval queue from portal-api via `GET /api/approval-queue`
3. User clicks "Approve & Send" → portal calls `POST /api/approval-queue/send`
4. portal-api fetches job details from SM8, portal triggers Playwright workflow

---

## SC Form字段 — Service Contract V7 Form UUIDs

Form UUID: `ce793bdc-d51b-4639-8313-22d9d48d342b`

| Field | UUID Prefix | Notes |
|---|---|---|
| Service Contract Type | `9a64dbf0` | |
| Visits per year | `c7189074` | |
| Price Per Service | `e1a7dc38` | |
| Price Per LOLER | `bac04ff0` | |
| Lifts Covered | `05f9537e` | |
| Full Day Rate | `0ce1527b` | |
| Per Hour Rate | `ad73d56c` | |
| Minimum Call Out | `5c9602bd` | |
| Total to Invoice per Annum | `b3657c79` | |
| Base Lift Staff Member | `67ba6721` | Hardcode "Justin Howard" |
| Date | `3d4f1468` | Use UK local time, not UTC |

---

## OAuth Token Refresh (How To)

```bash
# Current credentials (from ~/.openclaw/workspace/.credentials/servicem8_oauth.json)
CLIENT_ID="710225"
CLIENT_SECRET="c48a192540c04ba3b9b423b5b111348b"
REFRESH_TOKEN="<current_refresh_token>"

# Refresh
curl -s -X POST "https://go.servicem8.com/oauth/access_token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "grant_type=refresh_token&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}&refresh_token=${REFRESH_TOKEN}"

# Response:
# {"access_token": "...", "refresh_token": "...", "expires_in": 3600, ...}

# ⚠️ Save BOTH the new access_token AND new refresh_token immediately
# The new refresh_token is valid for ~90 days; the old one is immediately invalidated
```

---

## Key Credentials

| Service | Username | Password | Notes |
|---|---|---|---|
| ServiceM8 (OAuth) | `justin.h@baselifts.co.uk` | `ADrianmole1375!` | Updated May 2026 |
| ServiceM8 (API Key) | — | `smk-4457bf-21f2dd1536e86602-edd07adc8873e535` | Fallback when OAuth fails |
| Mac Mini SSH | `holly@100.91.33.1` | SSH key (no passphrase) | `/root/.ssh/id_ed25519` |

---

## Portal Rebuild Checklist

After any portal code change:
```bash
cd /root/.openclaw/workspace-sally/portal && npm run build 2>&1 | tail -5
pm2 restart portal
sleep 3
pm2 describe portal | grep "status\|uptime"
pm2 logs portal --nostream --lines 3
```

---

## Related Files

| File | Description |
|---|---|
| `/root/.openclaw/workspace-skills/servicem8-send-quote-email/SKILL.md` | Playwright SM8 email skill |
| `/root/.openclaw/workspace/scripts/sm8-send-quote-email.js` | Playwright script (VPS) |
| `/tmp/sm8-send-quote-email.js` | Playwright script (Mac Mini) |
| `/root/.openclaw/workspace-sally/portal/app/api/approval-queue/send/route.ts` | Portal endpoint that triggers Playwright |
| `/root/.openclaw/workspace/.credentials/servicem8_oauth.json` | SM8 OAuth tokens |
| `/root/.openclaw/workspace/.credentials/servicem8.json` | SM8 API key + credentials |

---

## Open Items

1. **OAuth refresh** — need new authorization from Justin to get fresh refresh_token
2. **Playwright end-to-end test** — not yet confirmed working (node path + SSH issues)
3. **"Make SC live/active"** — Justin flagged this before email send, not yet implemented
4. **Billing address → SM8 invoice** — fields exist but not wired to Step 3
5. **LOLER-only pricing validation** — through Steps 2 and 3
