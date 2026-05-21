# CloakBrowser + ServiceM8 Web UI Automation Briefing

**Date:** 2026-05-20  
**Author:** Holly (tested), Sally (documented for project)  
**Status:** Testing in progress — full end-to-end not yet complete

---

## What is CloakBrowser?

- **Stealth Chromium browser** — passes Cloudflare/reCAPTCHA v3 (score 0.9)
- Drop-in Playwright/Puppeteer replacement
- Free and open source
- **Install:** `npm install -g cloakbrowser playwright-core`
- Binary auto-downloads ~140-206MB on first launch
- **Locations:**
  - VPS (Linux x64): `~/.cloakbrowser/`
  - Mac Mini (darwin-arm64): `~/.cloakbrowser/`
- **Usage:** ESM module — scripts must be `.mjs` files or use `"type": "module"` in package.json
  ```javascript
  import { launch } from 'cloakbrowser';
  const browser = await launch({ headless: false });
  const page = await browser.newPage();
  await browser.close();
  ```

---

## ServiceM8 Login Credentials

| Field | Value |
|-------|-------|
| **URL** | https://go.servicem8.com |
| **Login method** | Email + password ONLY (NO SSO/Google) |
| **Email** | justin.h@baselifts.co.uk |
| **Password** | `ADrianmole1375!` (from `.credentials/servicem8.json`) |
| **API Key** | `smk-4457bf-21f2dd1536e86602-edd07adc8873e535` |

---

## Critical Navigation Rules

### ⚠️ ALWAYS JS-click sidebar links — NEVER page.goto()

ServiceM8 has aggressive **bot detection** that fires on `page.goto()` to specific app pages (returns marketing/404 redirect). Always navigate via JavaScript clicks on sidebar links:

```javascript
// ✅ CORRECT — JS click bypasses bot detection
const links = Array.from(document.querySelectorAll('a'));
const hist = links.find(a => /history/i.test(a.textContent) && a.href.includes('dbo_display_v2'));
hist.click();

// ❌ WRONG — triggers bot detection
await page.goto('https://go.servicem8.com/dbo_display_v2?...');
```

### ⚠️ Human-like timing is essential

ServiceM8 actively detects and kicks out automation. Must behave like a human:

- **Wait for page to be FULLY loaded** before every click (not just `networkidle`)
- **Random delay between actions:** 1500-3000ms
- **Human typing speed:** 80-200ms per character with random pauses
- **Click in natural positions** within elements, not dead center
- If bot detection fires (404/marketing redirect), wait longer and retry

```javascript
const pause = (ms) => new Promise(r => setTimeout(r, ms));

async function typeLikeHuman(page, locator, text) {
  await page.locator(locator).click();
  await page.locator(locator).fill('');
  for (const char of text) {
    await page.keyboard.type(char, { delay: 80 + Math.random() * 120 });
    await pause(30 + Math.random() * 50);
  }
}

async function clickLikeHuman(page, locator) {
  const el = page.locator(locator).first();
  if (await el.count() === 0) return false;
  await el.waitFor({ state: 'visible', timeout: 15000 });
  const box = await el.boundingBox();
  if (!box || box.width === 0 || box.height === 0) { await el.click(); return true; }
  const x = box.x + box.width * (0.2 + Math.random() * 0.6);
  const y = box.y + box.height * (0.2 + Math.random() * 0.6);
  await page.mouse.click(x, y);
  return true;
}
```

### ⚠️ UUIDs are API only — Web UI uses Job Numbers

- **UUIDs** are for API calls only
- **Web UI** uses job numbers (e.g., `Bas-4628`, `Bas-4629`)
- Direct URLs like `/job/{uuid}` trigger bot detection
- Never use UUIDs in ServiceM8 web UI URLs

### ⚠️ ServiceM8 Sidebar Links — Hidden vs Visible Elements

ServiceM8 sidebar has TWO elements for some links: one hidden (`visibility: hidden`, rect = 0) and one visible. Always use JS click to bypass Playwright visibility checks.

---

## Complete Workflow: New Job → Service Contract → Checklist → Email

### STEP 1: Create new job with type "Service Contract"

1. Click "New Job" in sidebar (via JS click)
2. In job form, set **Job Category** to "Service Contract"
   - Category UUID: `6d2fd47f-4ae0-4041-8cc0-22e739804a6b`
3. Fill required fields (address, client, etc.)
4. Save job

### STEP 2: Add "Service Contract v7" checklist item

1. Open job panel: find `input[value="Open Job"]` inside the table row — click IT (not the whole row)
   ```javascript
   const rows = document.querySelectorAll('tr');
   for (const row of rows) {
     if (row.textContent.includes('Bas-XXXX')) {
       const btn = row.querySelector('input[value="Open Job"]');
       if (btn) { btn.click(); return; }
     }
   }
   ```
2. Find "Checklist" section in job panel
3. Click to expand/add new item
4. Fill `input[name="ext-comp-1120"]` (placeholder "New Item") with: `Service Contract v7` or `B7`
5. Press Enter to add

### STEP 3: Fill the checklist form

1. Click on the new checklist item text (the DIV) to open the form
2. Fill out the form fields
3. Save/submit

### STEP 4: Create invoice (via API)

> **⚠️ API Limitation:** `POST /jobinvoice.json` returns `{"errorCode":400,"message":"jobinvoice is not an authorised object type"}`. Invoices are auto-generated when job is completed with line items.

Methods to trigger invoice creation (one of these):
- Update job via API: `status="Completed"`, `total_invoice_amount=X`, `ready_to_invoice=1`
- Or mark job completed via web UI

### STEP 5: Navigate to invoice page in web UI

1. From job panel, click "Billing" button (class: `JobDispatchButton_NewInvoice`)
2. Or navigate to Invoicing section in sidebar
3. Find the invoice for the completed job

### STEP 6: Click "Send Email to Client"

In invoice view, click "Email" or "Send Email" button. Email popup opens.

### STEP 7: Email popup — Smart Attachments

The email popup has a **right panel** with "Smart Attachments" section:

| Client type | Smart Attachments shows |
|-------------|------------------------|
| **New client, only SC job** | Only the Service Contract form |
| **Existing client with other business** | ALL prior attachments (floor plans, quotes, etc.) PLUS forms |

- Smart attachment = **form generates a LINK** in the email (not a PDF)
- The invoice is **auto-attached** when emailing from invoice page

### STEP 8: Select email template

1. Click "Email Templates" button
2. Select: **"New Service Contract"**

### STEP 9: Send

Click "Send".

---

## ServiceM8 Email Dialog Structure

The email dialog is an ExtJS `x-window` with class `email-form`. Key elements:

- `Send` button — sends the email
- `Attach File` button — opens file picker
- `Email Templates` button — opens template selector
- `Smart Attachments` panel — collapsible section (class `x-panel-header`) showing attachment options with checkboxes
- Contact selector
- Subject and message body fields

---

## Testing Rules — CRITICAL

> **⚠️ LEARNED THE HARD WAY (2026-05-20):** Holly sent test emails to a real client (Daisy Airstone at Highstone Group) by using an existing job instead of creating a dummy company. This must NEVER happen again.

### Rule: Test data ONLY — never touch real clients in tests

- **Create a new dummy company** with Justin's details for ALL testing
- **Never use existing real clients** for automation tests
- Real clients that already have business with Base Lift will show all their prior attachments in Smart Attachments
- Using real client data in tests = risk of sending test content to real clients

### Rule: Send test emails to Justin's address only

- Test emails must only ever be sent to: `justin.howard@mac.com`
- Never to any other email address

### Rule: Dummy test client naming convention

- Company name: `Silverbrook Test CloakB 1`, `Silverbrook Test CloakB 2`, etc.
- Contact: Justin Howard
- Email: justin.howard@mac.com

---

## Known Working Scripts

All scripts are in `/root/servicem8-cloakbrowser/`:

| Script | Purpose | Status |
|--------|---------|--------|
| `sm8-workflow.mjs` | Login + navigate to jobs list | ✅ Working |
| `sm8-open-job-btn.mjs` | Finds and clicks Open Job button | ✅ Working |
| `sm8-checklist.mjs` | Adds checklist item | ✅ Working |
| `sm8-checklist-fill.mjs` | Adds item + fills form | ✅ Working |
| `sm8-email-popup-deep-dive.mjs` | Explores email dialog structure | ✅ Working |
| `sm8-invoice-email-explore.mjs` | Explores invoicing page | ⚠️ Needs refinement |

---

## Still To Test (planned for this evening)

1. ✅ Creating a NEW client (dummy) via web UI
2. ✅ Creating a new job for that dummy client with type "Service Contract"
3. ⬜ Completing the full checklist + fill form workflow
4. ⬜ Creating an invoice via API (method TBD)
5. ⬜ Navigating to invoice page
6. ⬜ Sending email with smart attachment (form = link)
7. ⬜ Selecting "New Service Contract" template
8. ⬜ Verifying email sent successfully

---

## ServiceM8 API Notes

### Key Endpoints

```
Job list (all):     GET /api_1.0/job.json?$filter=active%20eq%201&cursor=-1
Job details:        GET /api_1.0/job/{uuid}.json
Unpaid invoices:    GET /api_1.0/job.json?$filter=invoice_sent%20eq%201%20and%20payment_received%20eq%200
Create job:         POST /api_1.0/job.json
Update job:         POST /api_1.0/job/{uuid}.json
Categories:         GET /api_1.0/category.json
```

### Important UUIDs

| Item | UUID |
|------|------|
| Service Contract category | `6d2fd47f-4ae0-4041-8cc0-22e739804a6b` |

### Job Status Values

Valid: `Quote`, `Work Order`, `Unsuccessful`, `Completed`  
Invalid: "In Progress", "Scheduled", "Active"

### Cursor Pagination

```bash
# First request
curl -s -H "X-API-Key: $KEY" "https://api.servicem8.com/api_1.0/job.json?cursor=-1"

# Check response header x-next-cursor for more pages
# If header exists, use that value as next cursor
# Repeat until no x-next-cursor header
```

### API Limitation

**`POST /jobinvoice.json` is NOT authorized** — returns:
```json
{"errorCode":400,"message":"jobinvoice is not an authorised object type"}
```

Invoices are auto-generated when a job is completed with line items. Direct invoice creation via API is not possible.

---

## Hard Rules Summary

| Rule | Description |
|------|-------------|
| Email + password only | Never SSO for ServiceM8 |
| Correct password | `ADrianmole1375!` — read from credentials file |
| JS-click sidebar links | Never `page.goto()` to app pages |
| Human-like timing | Random delays, natural movement |
| UUIDs = API only | Web UI uses job numbers (e.g., Bas-4628) |
| Test data only | Dummy client, send to justin.howard@mac.com only |
| No real client contacts | Never use existing clients in tests |

---

## Next Steps for Sally

1. **Read LEARNINGS.md** sections on CloakBrowser + ServiceM8 before starting
2. **Create dummy company** via web UI: `Silverbrook Test CloakB X`
3. **Create new job** for dummy company, type: "Service Contract"
4. **Add checklist** "Service Contract v7" and fill form
5. **Test invoice creation** via API (update job fields)
6. **Navigate to invoice page** in web UI
7. **Test email popup** with smart attachment and "New Service Contract" template
8. **Verify email** sent to justin.howard@mac.com
9. **Document findings** in LEARNINGS.md immediately after each test

---

*Last updated: 2026-05-20 by Sally*
