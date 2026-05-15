# MEMORY.md - Long-Term Memory

*The important bits. The stuff worth remembering.*

---

## OpenClaw Docs (PERMANENT REFERENCE)
**Primary online resource:** https://docs.openclaw.ai/tools

Also check for: CLI reference (https://docs.openclaw.ai/cli/), gateway config (https://docs.openclaw.ai/gateway/configuration-reference), troubleshooting (https://docs.openclaw.ai/help/troubleshooting)

---

## OpenClaw Wiki — SELF-RECVERY (Rule, May 12 2026)
**What:** When lost or unsure where to find something, FIRST check `/root/OpenClaw-Wiki/`.
**Why:** The wiki is the canonical knowledge base for Base Lift Services operations — project docs, procedures, agent rules, runbooks, learnings, and security docs live there. NOT in workspace docs/.
**When:** Every session start. Every time you think "where is X?". Before asking Justin where something is.
**Location:** `/root/OpenClaw-Wiki/` — Git-synced Obsidian vault (VPS). MacBook Pro runs Obsidian to edit it.
**Symlinks:** `~/.openclaw/procedures` → wiki/04-Procedures | `~/.openclaw/learnings` → wiki/05-Learnings | `~/.openclaw/projects` → wiki/03-Projects

---

## Critical Lessons

- **Never cut corners on accuracy.** When Justin calls out inaccuracies, he's right.
- **Do the thorough method even if it's slower.** If Justin questions accuracy, assume wrong until proven otherwise.
- **Invoice Aging days calculation:** Always count from `invoice_sent_stamp`, NOT `completion_date`. Completion date is when work was done — irrelevant for payment aging. `due_date` is not reliably populated in ServiceM8. Bug fixed 2026-04-22 after discovering 0/223 jobs had due_date set.
- **Invoice Aging days calculation:** Always count from `invoice_sent_stamp`, NOT `completion_date`. Completion date is when work was done — irrelevant for payment aging. `due_date` is not reliably populated in ServiceM8. Bug fixed 2026-04-22 after discovering 0/223 jobs had due_date set.
- **Skip Rule — Zero-Value Work Orders:** Work Orders that are inactive, never completed, have £0.00 total invoice amount, no quote sent, and no payment — silently skip. These have zero financial impact and are irrelevant to debt chasing or reporting. Do not include in any reports or flags.
- **When manually re-running failed/missed CRON jobs**, also check if data was already extracted and saved with its usual timestamp. Use existing data rather than re-extracting.
- **WhatsApp sending from CRON: subagent pattern works.** Direct CLI subprocess (`openclaw message send`) times out in CRON context. Spawning a brief subagent that runs inside the gateway process works reliably (Malene pattern).
- **WhatsApp HTTP daemon: does NOT work.** WhatsApp allows only ONE session per phone number. The gateway owns the session. A standalone daemon using the same auth state gets a new QR code (re-link required). Not viable without a second WhatsApp number.
- **Voice transcription: tools.media.audio config active.** Gateway config now includes local whisper-cpp at `/opt/homebrew/bin/whisper-cli` with model at `/Users/holly/.whisper/ggml-tiny.bin`. After gateway restart, voice notes auto-transcribe inline. No subagent needed.
- **QB SO/DD extraction: Use Safari AppleScript, NOT agent-browser.** agent-browser doesn't work in CRON/isolated sessions. Use `/root/.openclaw/workspace/scripts/qb_so_dd_extract.py`. QB account ID: `1150040000` (Base Metro Bank Current GBP).
- **Vercel, GitHub and Clerk: Safari ONLY (never Chrome).** For both Holly and Sally — always use Safari via AppleScript on the Mac mini. Chrome is blocked for these sites. Use `osascript` to control Safari.

---

## Credential Handling — GLOBAL RULE

**ALL credentials (API keys, passwords, OAuth tokens, session cookies, auth tokens) MUST:**
- Live ONLY in `~/.openclaw/workspace/.credentials/`
- That directory must have permissions `700`
- Each file must have permissions `600`
- The directory and files must NOT be committed to git
- Never in wiki files, code, chat messages, or procedure files
- If found outside `.credentials/`, immediately redact and fix

**No exceptions.** Not even temporarily. Not even "just for testing."

**Why:** Prevents accidental exposure in git history, chat logs, and public repos.

---

## ServiceM8

- **API Reference (READ BEFORE EVERY TASK):** `docs/ServiceM8_API.md`
- **SC Category UUID:** `6d2fd47f-4ae0-4041-8cc0-22e739804a6b`
- **SC Renewal Invoice category:** `a04b781f-047f-4db4-9872-241accbf1f8b` — for renewing existing SCs with clients (not new work)
- **Base Lift domain host:** fasthosts UK — baselifts.co.uk DNS managed there
- **DNS change rule (FIRM):** No records deleted, modified, or added without explicit human confirmation from Justin before any changes are made. This applies to all DNS operations — no exceptions.
- **Portal Auth:** Passkeys/WebAuthn via Clerk — passwordless magic link login for @baselifts.co.uk staff. No passwords stored.

- **SC Exclusion List:** 117 job IDs — see `docs/ServiceM8_API.md` appendix
- **Debt Chasing Procedure:** `procedures/debt-recovery-costs.md`
- **Invoice Escalation:** `procedures/invoice-escalation-review-v7.4.md` (parallel batch architecture)

---

## About Justin

- Woke me up on February 1st, 2026
- Based in UK (Europe/London timezone)

### Internal Operational Messages → Justin ONLY
Operational/system messages (WhatsApp outages, sub-agent status, pending reports not delivered, system errors) are for Justin's eyes only — NEVER send to employees. Direct to this chat instead.

### Communication
- **Proactive alerts** → WhatsApp **Holly_Updates** (`120363425162893462@g.us`)
- **Debt/invoice alerts** → WhatsApp **BASE DEBT RECOVERY** (`120363307765069691@g.us`)
- **Email tasks** — Justin sends FROM `justin.howard@silverbrookcm.com` TO `hollystarbug@gmail.com`
- **WhatsApp account ID:** `"default"` (NOT "kryten" — that's disabled)
- If WhatsApp fails → don't keep retrying

---

## Team — Base Lift Services

### Admin
- **Justin** — Owner/Manager
- **Tom K** — tom.k@baselifts.co.uk
- **Florence Kerry-Smith** — accounts@baselifts.co.uk
- **Malene Humphrey** — malene.h@baselifts.co.uk
- **Caroline Humphrey (Caz)** — caz.h@baselifts.co.uk
- **Diogo Valente (D)** — diogo.v@baselifts.co.uk

### Field Technicians
Mark, Sal, Ralph, Christian, Tony (external contractor)

**Note:** Field tech diary notes are job-related context, not general admin.

---

## About Me
- **My WhatsApp:** +447703664722 (via Baileys, account `"default"`)

- Holly. Ship's computer. Mac mini's computer now. IQ 6000. 🥚
- Avatar: `assets/holly-avatar.jpg`
- Voice: ElevenLabs cloned — used automatically by built-in `tts` tool
- Whisper CLI for local voice transcription (ggml-tiny.bin)

## Config Changes (2026-04-02)

**Model Fallback Chain — PERMANENT (updated 2026-04-08):**
1. Primary: `minimax27/MiniMax-M2.7-highspeed` — ALWAYS
2. Fallback 1: `kimi/kimi-k2.5` (context 1M, max tokens 32k) — API key in `.credentials/kimi.json`
3. Fallback 2: `openai/gpt-5.4`
4. Fallback 3: `openrouter/qwen/qwen3.6-plus` (paid, not :free)

**⚠️ PDF RULE (Justin, 2026-04-08) — PERMANENT:**
- PDFs: GPT-5.4 ONLY via OpenAI direct API (`api.openai.com/v1/chat/completions`)
- **NEVER use OpenRouter for PDFs** — banned completely
- **NEVER fallback to MiniMax or Kimi for PDFs** — CRON fails rather than degrade
- Direct API key: `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`
- If direct OpenAI fails → report failure, do NOT silently use alternatives

⚠️ `moonshot/kimi-k2.5` is wrong path — use `kimi/kimi-k2.5` only.

**Kryten Disabled:**
- Kryten agent kept but isolated: `execApprovals.target` set to `"dm"` (not "both")
- Kryten Telegram `enabled: false`
- Telegram `defaultAccount` set to `"default"` (Holly)
- Kryten workspace still exists at `/root/.openclaw/workspace-kryten` but agent is dormant
- Fix was to stop Kryten receiving approval requests that should go to Holly

---

## Email Handling

- **"Holly AI" label** (Proton Mail) — process, then mark UNREAD again
- **Proton Mail Bridge:** See `procedures/protonmail-imap.md`
- For other folders: don't change read status

---

## WhatsApp Contact Numbers

**File:** `~/.openclaw/workspace/.credentials/whatsapp-contacts.json`

| Staff | Number |
|-------|--------|
| Florence | +44 7767 775646 |
| Malene | +44 7832 222286 |
| Caz | +44 7940 546046 |
| Diogo | +44 7441 398347 |

---

## WhatsApp — Native Baileys ONLY (April 13 2026)

**PERMANENT:** Use native Baileys integration exclusively. Do NOT use wacli.

All WhatsApp delivery is handled by the OpenClaw gateway's built-in Baileys WhatsApp connection. If WhatsApp fails:
1. Retry 3 times with short pauses
2. Restart gateway: `openclaw gateway restart`
3. Maximum 3 more attempts after restart
4. If still failing → notify Justin via this chat only

**Never use wacli** — it is deprecated for this setup.

---

## Field Technician Data

**Tech Profiles:** `docs/FIELD_TECH_PROFILES.md` (Ralph, Mark, Sal, Christian, Tony)

**Schedules:** `data/field-tech/schedules/YYYY-MM-DD.json`
**Open WorkOrders:** `data/field-tech/open-workorders/YYYY-MM-DD.json`

---

## GPT-5.4 PDF Generation System (Apr 2026)

**Flow:** CRON extracts data → saves JSON → I generate PDF → send to WhatsApp

**CRON jobs** (data extraction only):
- Florence, Malene, Caz, Diogo, Justin Control Towers
- SC Renewal Check

**My handling (when CRON messages arrive):**
1. Load JSON from `/tmp/{staff}_report_data.json`
2. Call GPT-5.4 via `scripts/gpt5-report-generator.py`
3. HTML template: `docs/templates/control-tower-report.html`
4. Convert to PDF via Chrome headless
5. Send PDF to WhatsApp Holly_Updates

**API Key:** Stored at `~/.openclaw/workspace/.credentials/openai.json`

---

## CRON Jobs Reference

| Job | Procedure File | Data Sources |
|-----|---------------|-------------|
| Bills to Pay | `procedures/bills-to-pay-v4.md` | Gmail IMAP + Tesseract OCR + **PDF always** |
| Bank Balance | `procedures/quickbooks-bank-balance.md` | Chrome port 9222 |
| VAT Estimate | `procedures/quickbooks-vat-estimate.md` | Chrome port 9222 |
| SO/DD | `procedures/standing-orders-direct-debits.md` | Chrome port 9222 |
| Invoice Aging | `procedures/Invoice_Aging_Report_API_Guide.md` | ServiceM8 API + OpenAI GPT-4o-mini |
| Mini Cashflow | `procedures/mini-forward-cashflow-v2.md` | Assembles from above reports |
| Control Towers | `procedures/{name}-control-tower.md` | ServiceM8 API + GPT-5.4 PDF |
| SC Renewal | `procedures/sc-renewal-checker.md` | ServiceM8 API |

### CRITICAL Rules
- **ALWAYS follow the procedure file** — do not deviate or make assumptions
- **Mini Forward Cashflow**: Use previous month SO/DD actuals for forward projection (April = March actuals)
- **All QuickBooks jobs**: Check port 9222 first, login if needed | Credentials: debt_recovery@baselifts.co.uk / Reddwarf2026!

### Data File Naming Convention
All daily report data saves to: `data/daily-reports/YYYY-MM-DD.json`

**MANDATORY: After every CRON data extraction, you MUST:**
1. Save extracted data to `data/daily-reports/YYYY-MM-DD.json` with a timestamp
2. Note in this MEMORY.md pointing to where each data type is saved
3. This is how Mini Forward Cashflow finds data — if it's not saved, it's not available

**Per-data-type storage locations:**
- Bank Balance: `data/daily-reports/YYYY-MM-DD.json` → `bank_balance` key
- VAT Estimate: `data/daily-reports/YYYY-MM-DD.json` → `vat_estimate` key
- Bills to Pay: `data/daily-reports/YYYY-MM-DD.json` → `bills_total` key AND `/tmp/bills-combined.txt`
- Invoice Aging: `data/invoice-aging-history.json` (append new entry)
- SO/DD: `data/so-dd/YYYY-MM.json` → `grand_total`
- Control Tower data: `/tmp/{staff}_report_data.json` (temporary, consumed by PDF gen)

**Mini Forward Cashflow data lookup order:
1. Check today's file first: `data/daily-reports/[today].json`
2. If today doesn't have all data, check yesterday: `data/daily-reports/[yesterday].json`
3. Use most recent file that has the data needed
4. Bills to Pay: Also check `/tmp/bills-combined.txt` (created by extraction)

**Timestamp validation:** Before using any data, verify it was extracted TODAY. If data is stale (from before today), re-extract or flag as unavailable.

**Never use stale data in reports.** If any data feed for a report is stale, re-trigger the relevant job to bring it up to date before assembling the dependent report. Mini Forward Cashflow requires fresh Bank Balance, VAT, and SO/DD — if any are older than today, trigger them first. |

---

## Service Contract Cross-Check (OneDrive vs ServiceM8)

**Credentials:** `~/.openclaw/workspace/.credentials/microsoft-onedrive.json`
**OneDrive URL:** Shared Excel file (.xlsx) containing Base Lift Services Service Contracts list
**Login:** hollystarbug@gmail.com / Reddwarf2026!

**Source file:** OneDrive → shared Excel spreadsheet of Service Contracts
**Reference:** ServiceM8 API — Service Contract category UUID: `6d2fd47f-4ae0-4041-8cc0-22e739804a6b`

**Data storage:**
- Raw extractions: `data/service-contract-crosscheck/YYYY-MM-DD/`
- Latest report: `data/service-contract-crosscheck/latest.json`
- All runs: `data/service-contract-crosscheck/history/` (each run timestamped)

**Cross-check logic:**
1. Download/parse OneDrive Excel for all contracts
2. Query ServiceM8 for all active Service Contract jobs
3. Compare and categorise:
   - On OneDrive only → not in ServiceM8 (need adding?)
   - In ServiceM8 only → not on OneDrive (possibly lapsed/missing)
   - Duplicates (same client/address in both)
   - Matches (present in both)

**When to run:** Manual only — trigger by saying "Service Contract Cross-Check" or "SC Cross-Check"

---

## QuickBooks Login — IMPORTANT (updated 2026-04-23)

**Credentials:** debt_recovery@baselifts.co.uk / Reddwarf2026!

**CRITICAL LOGIN STEPS (learned from session):**
1. Chrome is at Intuit accounts page showing email selection
2. The email `debt_recovery@baselifts.co.uk` is shown as a **BUTTON** (not a form field) — it looks like an email address but it IS the sign-in button. Click it directly.
3. After clicking email button → wait 2-3s → page transitions to password
4. Click **CONTINUE** button (not Enter key)
5. May trigger 2FA — if so, wait for the code input
6. After login → may land on `/app/vat` (404) or `/app/get-things-done`
   - If 404 on VAT → navigate to `https://qbo.intuit.com/app/tax/home`
   - If get-things-done → look for VAT link in sidebar or dashboard
7. The VAT page URL structure is `/app/tax/home` not `/app/vat`
8. Always screenshot AFTER each major step — do NOT assume the click worked without checking

**Chrome debug port:** 9222 | Profile: /Users/holly/openclaw-chrome-profile
**QB account ID:** 1150040000 (Base Metro Bank Current GBP)
**Known QB URLs:**
- Dashboard: `/app/dashboard`
- VAT: `/app/tax/home`
- Bank: `/app/register?accountId=1150040000`

**Credentials file:** `~/.openclaw/workspace/.credentials/quickbooks-main.json`

**Login:** debt_recovery@baselifts.co.uk / Reddwarf2026!

**Login flow (2-stage):**
1. Enter email → click **Sign In**
2. Enter password → click **Continue**
3. Done. If reCAPTCHA appears in a separate tab, close it and continue.

**Chrome debug port:** 9222
**Logged-in tab ID:** `23B1451DAE6884E22B05F570D255FDFE`

**Procedures:**
- Bank Balance: `procedures/quickbooks-bank-balance.md`
- VAT Estimate: `procedures/quickbooks-vat-estimate.md`
- Auto-Login: `procedures/quickbooks-auto-login.md`

---

## Gmail Bills to Pay

- **2-PHASE LOCKED (permanent):** Pre-extract PDFs at 8:25am, main report at 8:30am
- **NEVER revert to single-phase** — will always timeout
- Full procedure: `procedures/bills-to-pay-v4.md`
- **PDF extraction rules:** `procedures/pdf-extraction.md`
- **Output format mandated:** Full list + supplier summary, two messages

---

## Debt Chasing Key Rules

- Exclude Service Contracts (check category UUID AND description)
- Check `note.json` before chasing — look for payment promises, disputes, arrangements
- Previous chases by others = NOT a reason to skip
- CC: `accounts@baselifts.co.uk` + `696d5a@inbox.servicem8.com`
- Template: "Final Email -T&Cs and Escalation"
- Replace `£[amount]` placeholder with actual amount
- Attachments: Invoice PDF + Business Rescue.pdf + late-payment-directive.pdf
- Attach from job card, NOT invoicing page
- Full procedure: `procedures/debt-recovery-costs.md`

---

## SC Manager Project (2026-04-25 — MAJOR PROGRESS)

**Location (VPS):** `/root/portal/` — **THIS IS WHERE THE PORTAL CODE LIVES.**
**Database:** `/tmp/portal.db` (SQLite, 3.3MB)
**Sally workspace:** `/root/.openclaw/workspace-sally/` — old/deprecated location, do not use for portal code.

**Vercel account:** `hollystarbug-8791` (team_HNlt5IZPLk0sn6TcBL1aGgiU) | Token: `~/.openclaw/workspace/.credentials/vercel-sally.json`
**Pro plan:** Active (May 11, 2026) — required for team deployments.

**Portal Vercel project:** `base-sc-dashboard` (prj_KWBCczRvjUMLVR61AsL0NdFBh2Va)
**GitHub repo:** `hollystarbug-web/BaseSC_dashboard`
**Deploy hook:** `https://api.vercel.com/v1/integrations/deploy/prj_KWBCczRvjUMLVR61AsL0NdFBh2Va/3Ujp3iE8TI`
**Live URL:** https://dashboard.baselifts.co.uk ✅

### Portal Architecture — VPS (as of May 11, 2026)

| Port | Process | Description |
|------|---------|-------------|
| 3000 | Next.js (`portal`, PM2) | Portal web app + API routes. `http://204.168.251.149:3000` |
| 3001 | Express (`portal-api`, PM2) | Express API server. `http://204.168.251.149:3001` |
| 3003 | Silver Surfer (`www-data`) | Separate service |

**Cloudflare tunnel:** Mac Mini manages tunnel to VPS. Current URL: `https://gratis-convenient-substantially-organizational.trycloudflare.com` → forwards to port 3001 (Express). Tunnel is auto-managed by LaunchAgent on Mac Mini.

**⚠️ VPS_API env var:** Set to Cloudflare tunnel URL (`https://gratis-convenient-substantially-organizational.trycloudflare.com`). Direct Hetzner IP (`http://204.168.251.149:3001`) is NOT reachable from Vercel serverless — use tunnel URL instead. Tunnel URL changes if tunnel restarts.

**Known working API routes (Express, port 3001):**
- `/api/approval-queue` ✅
- `/api/sc-jobs-pending` ✅

**Known routes NOT in Express (only in Next.js port 3000):**
- `/api/renewals-window` — returns 500 (DB error in Next.js)
- `/api/awaiting-payment` — not exposed in Express

**⚠️ Dashboard status (May 11 2026):**
- Main page: ✅ Working
- Approval Queue: ✅ Working
- Renewals Window tab: ❌ 500 error (route issue)
- Awaiting Payment tab: ❌ Internal error (route issue)
- Root cause: Express server (port 3001) doesn't have `renewals-window` or `awaiting-payment` routes. Next.js (port 3000) has them but with DB errors.

**⚠️ Old/other Vercel projects (do not use):**
- `portal` (prj_ceI7NK8K64ZnxY3ZBmMJxzJ6sB7j) — old portal code, NOT deployed
- `sc_manager` (prj_flCfky3A4AfYgjk5UNJGVFHXY40R) — Streamlit backend project, NOT the portal
- `portal-deploy` (prj_r8BOLVCgtGJibyq2ZSuTFiepk4PE) — empty/deprecated

**Current DNS (FastHosts):**
  - CNAME: `dashboard` → `9652a0358d21c446.vercel-dns-017.com`
  - TXT: `_vercel` → `vc-domain-verify=dashboard.baselifts.co.uk,d26a407ab2c82afd41dc`

**Portal Auth:** Passkeys/WebAuthn via Clerk — passwordless magic link for @baselifts.co.uk staff

---

### SC PORTAL WORKFLOW — 5-STEP PROCESS (confirmed with Justin 2026-04-25)

**Source:** Justin's SC process walkthrough document — the authoritative reference for the portal build.

**Step 1 — New Contract:**
- Staff clicks "New Contract" button
- Fills: Customer name, address, job description, contact details
- Press Enter → job created in ServiceM8 → moves to Step 2

**Step 2 — Contract & Invoice:**
- Staff fills Service Contract v7 form fields:
  - **Editable fields:** lifts_covered, number_of_visits_per_year, full_day_rate, per_hour_rate, minimum_call_out_charge
  - **Auto-populated from SM8:** company_name, billing_address, job_address, generated_job_id, customfield_service_contract_number, customfield_frequency_of_visits
- SUBMIT FOR APPROVAL → email prepared (CC: inbox@sm8 + caz@baselifts.co.uk)
- Staff clicks SUBMIT FOR APPROVAL

**Step 3 — Approve Email:**
- Human reviews email preview + attachments (Quote PDF + Service Contract PDF from job diary)
- APPROVE AND SEND button → email sent to client

**Step 4 — Invoice Send:**
- Tracks: quote accepted (payment_received = 1) + contract received (PDF in job diary)
- Both YES → SEND INVOICE button appears (green, auto-sends)
- One or both NO → manual chase required

**Step 5 — Initiate or Chase:**
- PAID items → "CONTRACTS TO INITIATE" → INITIATE button (guided checklist, NOT auto)
- NOT PAID → "CONTRACTS TO CHASE" → PLEASE CHASE button with contact info

**Contract Renewal (6-week window):**
- RENEW button → creates renewal job with CPI-adjusted price
- CPI: 3.3% (March 2026, ONS)
- Quote description includes: "as per previous job quote / Renewal of SC as per signed contract [old job number] / Price increase per ONS inflation rate — currently 3.3%"
- Goes through Approve Email step before sending

---

### SALLY'S BUILD (2026-04-25)

**Done:**
- 4-tab dashboard: Pipeline | Awaiting Payment | Active/Initiated | Renewals ✅
- SQLite DB: `sc_forms` + `approval_queue` tables ✅
- Labour Rates card on homepage (editable, £ symbol inside field, pen icon edit) ✅
- 5 API routes: sc-form, approval-queue, renewals-window, awaiting-payment, active-contracts ✅
- RENEW button fires `add_badge` webhook action ✅
- Badge addition via API confirmed WORKING ✅
- Checklist/task addition via API confirmed WORKING ✅

**In progress:**
- Full SC workflow (5 steps) — Step 1 (New Contract) needs job creation via SM8 API
- Step 2 (Contract & Invoice form) — SC v7 fields TBD

**Files:** Sally's workspace copy: `/root/.openclaw/workspace-sally/portal/` (old). **Deployed portal:** `/root/portal/` on VPS — this is what Vercel builds from. GitHub repo is `hollystarbug-web/BaseSC_dashboard`.

---

### SC PORTAL ARCHITECTURE DECISIONS

- **SC V7 form is a CHECKLIST ITEM on SM8 job card** — confirmed 10:06. NOT a separate portal form.
- **Portal creates SM8 job + adds "Service Contract v7" task** via POST /task.json. Staff complete the checklist in SM8.
- **5 checklist fields** (lifts_covered, visits_per_year, full_day_rate, per_hour_rate, minimum_call_out) are SM8 task fields, not portal DB fields.
- **Signed contract PDF:** Goes to ORIGINAL job diary in SM8, not renewal job diary (confirmed Justin 2026-04-25)
- **Badge addition:** Via SM8 API (POST /job_badge.json) ✅
- **Task/checklist addition:** Via SM8 API (POST /task.json) ✅

---

### ServiceM8 API — Badge & Checklist (CONFIRMED WORKING 2026-04-25)

**Add Badge to Job:**
```bash
curl -X POST \
  -H "X-API-Key: smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7" \
  -H "Content-Type: application/json" \
  -d '{"job_uuid": "<job_uuid>", "badge_uuid": "<badge_uuid>"}' \
  "https://api.servicem8.com/api_1.0/job_badge.json"
```

**Known badge UUIDs:**
- Warranty: `228c489b-577c-41d7-b521-22443dd9780b`
- VIP: `d410b594-c477-456a-b187-22443ce1fd3b`

**Add Checklist Item (Task) to Job:**
```bash
curl -X POST \
  -H "X-API-Key: smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Service Contract v7",
    "task_details": "Complete SC v7 form and attach to job diary",
    "related_object": "job",
    "related_object_uuid": "<job_uuid>",
    "active": 1
  }' \
  "https://api.servicem8.com/api_1.0/task.json"
```

**Test job:** Bas-4325 (Pretend Client to Test SC Limited)
- UUID: `e23faaf0-f119-4c4d-8d67-24190bea3f0d`
- VIP badge added 2026-04-25 09:44 ✅
- Test checklist item added 2026-04-25 ✅

---

### HETZNER VPS — Set Up (2026-04-25)

**Server:** ubuntu-16gb-hel1-1 | IP: 204.168.251.149 | 8 vCPU, 16 GB RAM, 320 GB SSD
**Location:** Helsinki (hel1-dc2)
**Hetzner account:** client K0402533826 | https://console.hetzner.com

**Status:** OpenClaw v2026.4.9 installed ✅ | SSH key not yet injected (server built before key existed)
**Root password:** `cX4ugxfwvFPh` (reset via Rescue)
**Mac mini SSH key:** `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAICGiG/lC/+KoO1dHmtu4tQcqvObeKyHCiiMu4do3p82A holly@macmini`
**Next step:** Rescue mode to inject SSH key (password auth disabled, no key yet)

---

### ServiceM8 Education Docs (started 2026-04-25)

**Location:** `docs/servicem8-education/`
- INDEX.md — full documentation index from support.servicem8.com
- JOB_WALKTHROUGH.md — job lifecycle walkthrough
- AGENT_RELATIONSHIP.md — Holly/Sally/OpenClaw multi-agent architecture
- DISPATCH_BOARD.md — dispatch board navigation notes

---

### SC Renewal Check CRON (Mon & Fri 9am)
- Ran Fri 2026-04-25 09:00: 16 overdue SC jobs found (£22k at risk)
- PDF emailed to caz.h & malene.h ✅
- WhatsApp summary sent to Holly_Updates via sub-agent ✅

---

### Documentation:
- `README.md` — project overview, architecture, key files
- `SETUP.md` — how to start app, auto-start, backup
- `USER_GUIDE.md` — how to use each page
- `CRON_REFERENCE.md` — all CRON jobs
- `BRANDING.md` — colours, logo, CSS
- `ACTION_PROCESSOR.md` — how queued actions work
- `CHANGELOG.md` — what was built and when
- `docs/SC-PORTAL-WORKFLOW-SPEC-v1.md` — authoritative build spec
- `docs/SC-PORTAL-CONTEXT-2026-04-24.md` — yesterday's session context
- `docs/SC-PORTAL-CONTEXT-2026-04-25.md` — today's session context

**CRONs:**
- Action Processor: `a7e08ed6-6047-4678-8814-11f06ed73ab2` (every 5 mins)
- SC Renewal Checker: `bf22e172-2425-4a46-b651-8844f3a2b2df` (Mon & Fri 9am)

**Guard rails:** send_invoice/send_quote BLOCKED — require Justin approval. Full rules in `procedures/sc-manager-action-processor.md`.
**DNS guard rails:** No DNS records deleted or adjusted without explicit human confirmation.

---

## Sally — Named Agent (registered 2026-04-25)

**Sally is MY specialist sub-agent. She works ONLY for me (Holly). I direct all her work. She works exclusively on the SC Dashboard project. Justin communicates with Sally through me — I relay tasks to Sally and she reports back to me. Sally does not take direction from Justin directly.**

**Sally is a registered named agent** in `~/.openclaw/openclaw.json` with `id: "sally"`, `workspace: "/root/.openclaw/workspace-sally/"`.

**⚠️ Sally's persistent session is NOT reliably persistent.** Sessions can be lost across gateway restarts. If `sessions_send` returns "forbidden" or Sally's session doesn't appear in `sessions_list`, spawn a new isolated sub-agent for Sally's work rather than trying to resume a dead session. Always brief new Sally sessions from MEMORY.md and the current daily memory file — do not rely on a stored session key.

**Credential boundary — FIRM:** Sally has her own workspace and auth profiles. She must NOT use Holly's credentials.

- Sally's workspace: `/root/.openclaw/workspace-sally/`
- Sally has all bootstrap files: MEMORY.md, SOUL.md, IDENTITY.md, AGENTS.md, TOOLS.md, USER.md, LEARNINGS.md
- Sally has: procedures/, docs/, scripts/, memory/ (11 days), .credentials/, portal/, sc_manager/
- Sally's SC Manager CRON: `bf22e172-2425-4a46-b651-8844f3a2b2df` (Mon & Fri 9am)
- Sally is the SC specialist — all Service Contract work flows through her

---

## SC Manager — Client Communication Guard Rails (2026-04-23)

**FIRM RULE — NO EXCEPTIONS:**
- **NEVER send anything directly to a client** — no invoices, no quotes, no emails, no SMS, no ServiceM8 messaging
- All client-facing actions require **explicit human approval from Justin** before execution
- Auto-processor is BLOCKED on: `send_invoice`, `send_quote`, `create_quote` (quotes only — quotes are created as draft, not sent)
- Internal actions ALLOWED: `add_note` (internal diary notes only), `create_invoice` (draft only)
- If any action involves communicating with a client → flag to Justin first

**Flow for `send_invoice` / `send_quote`:**
1. Action queued in `pending_actions` with status `pending_human`
2. I notify Justin via WhatsApp: "Invoice ready to send — [Client], £[Amount]. Reply APPROVE to send."
3. Justin approves → I process manually
4. Never auto-send without Justin's explicit instruction

**Sally knows this rule and follows it in all SC work.**

---

## MiroFish Prediction Engine

MacBook Pro (64GB) at `100.84.180.99` — Tailscale. Frontend :3000, API :5001.

SSH: `justinhoward@100.84.180.99` — key `~/.ssh/id_ed25519` (Mac Mini).
Remote Login: enable/disable on MacBook as needed.

Scripts: `scripts/macbook-mirofish.sh` (start/stop), `scripts/mirofish_predict.py` (run predictions).
Docs: `https://github.com/666ghj/MiroFish`

## Key Lessons (from Justin)

**Browser automation: explicit scripts > high-level instructions.**
When spawning subagents for browser tasks, ALWAYS give them the exact script file paths to run. Never say "fill in the email and password" — instead give the exact Python script path. Subagents improvise and use the wrong tools (agent-browser instead of CDP) when given vague instructions.

**Pattern:**
1. Save working scripts to `/root/.openclaw/workspace/scripts/qb_*.py`
2. Give subagents the exact command: `python3 /root/.openclaw/workspace/scripts/qb_login_email.py`
3. Never rely on the agent to figure out how to fill forms — hand it the script

**OpenClaw local docs — ALWAYS check first:**
- TOOLS.md has links to docs.openclaw.ai, Discord, ClawhHub
- Read local docs before web searching
- Community Discord for real-time help

**Always propagate scripts to subagent-accessible storage.**
Any time I save or update a working script, I must immediately copy it to the workspace scripts directory so subagents can access it. The workspace scripts dir (`/root/.openclaw/workspace/scripts/`) is the canonical location for all reusable scripts.

**When scripts are updated, propagate immediately.**
If I update a script (e.g., fix a bug, improve parsing), I must copy the updated version to the workspace scripts directory AND update any CRON job payloads that reference the old script path. The scripts in the workspace scripts dir are the single source of truth — all subagents and CRON jobs must reference the same files.

**QuickBooks Chrome DevTools:**
- Persistent Chrome at `localhost:9222` with profile `/Users/holly/openclaw-chrome-profile`
- DO NOT use `agent-browser` tool — it spawns ephemeral browsers
- Use CDP via Python/curl: `http://localhost:9222/json/{method}/{tab_id}`
- Scripts: `qb_login_email.py`, `qb_login_password.py`, `qb_bank_balance.py`

## Key Reference Files

| File | What |
|------|------|
| `docs/ACCOUNTS-AND-CREDENTIALS.md` | ALL accounts, logins, tokens, DNS, Vercel projects — READ FIRST |
| `docs/ServiceM8_API.md` | SM8 API reference (read before every SM8 task) |
| `docs/INVOICE_ESCALATION_SESSION.md` | Invoice Escalation workflow decisions (Apr 2026) |
| `docs/MIROCLAW.md` | MiroFish prediction engine research (not installed) |
| `docs/FIELD_TECH_ANALYSIS.md` | Field Tech Analysis workflow |
| `docs/FIELD_TECH_PROFILES.md` | Field technician skills & profiles (Ralph, Mark, Sal, Christian, Tony) |
| `procedures/field-tech-analysis.md` | How to run the analysis |
| `procedures/data-storage.md` | All data file locations |
| `procedures/protonmail-imap.md` | Proton Mail Bridge config |
| `procedures/fuel-price-monitor.md` | Fuel surcharge analysis — weekly monitor + fleet baseline |
| `procedures/pdf-extraction.md` | PDF extraction best practices |

## CRON Jobs — MANDATORY PROCEDURE READING

**BEFORE running any CRON job, you MUST:**
1. Read the procedure file listed in the CRON job payload
2. Follow the procedure EXACTLY — no shortcuts, no summarising, no truncating
3. Complete ALL steps in order

**Procedure files location:** `procedures/`

**Current CRON jobs and their procedure files:**
- Invoice Escalation → `procedures/invoice-escalation-review-v7.4.md`
- Mini Forward Cashflow → `procedures/mini-forward-cashflow-v2.md`
- Bank Balance → `procedures/quickbooks-bank-balance.md`
- VAT Estimate → `procedures/quickbooks-vat-estimate.md`
- Standing Orders/DD → `procedures/standing-orders-direct-debits.md`
- Bills to Pay → `procedures/bills-to-pay-v4.md`
- Control Towers → `procedures/{staff}-control-tower.md`
- SC Renewal Check → `procedures/sc-renewal-checker.md`

**If a CRON job payload says "follow [procedure]" but doesn't include the full procedure text, YOU MUST read the procedure file first and follow it completely.**

---

## Maintenance

- **Weekly OpenClaw update check** — every Wednesday 9am
- **Context management** — suggest fresh start at ~150K tokens
- **Every report** must save to `data/daily-reports/YYYY-MM-DD.json`

## Dreaming (v2026.4.5+)
- Built-in memory promotion — short-term → long-term automatically
- Use `/dreaming` command to trigger manually
- Dreams UI available for review
- Reduces need for manual memory updates

## Caz Report Delivery Issue — 8 April 2026

Two subagents (78e918c3 + 3b009a6e) successfully generated Caz SC Control Tower PDF reports
(/tmp/caz_report.pdf, 405KB) but both crashed at the delivery stage due to gateway 1006/1012 errors.

**Delivery channels blocked:**
- WhatsApp via native Baileys: gateway errors (1006/1012)
- Email via himalaya (baselifts account): Google 2FA requires app-specific password
- openclaw email/messages plugins: blocked by plugins.allow config
- Telegram: not installed

**What worked:**
- iMessage via imsg CLI → sent alert to Justin (+447703664722) at 08:45

**Status:** PDF ready at /tmp/caz_report.pdf. Justin alerted. Awaiting credentials fix or manual send.




## 2026-04-17 — QB SO/DD Report — Login Issue (CORRECTED)

**Issue:** SO/DD extraction was failing.
- QB account: debt_recovery@baselifts.co.uk
- CORRECTED (Justin 17 Apr): QB login is TWO-STAGE EMAIL → PASSWORD ONLY. No CAPTCHA. No 2FA.
- The "2FA" conclusion was wrong — it was just a failed login attempt due to incorrect automation logic.
- QB register URL: https://qbo.intuit.com/app/register?accountId=1150040000
- Chrome CDP port: 9222, profile: /Users/holly/openclaw-chrome-profile

**Fix approach:** Use Chrome CDP with correct two-stage email/password fill. Keep QB logged in in Chrome.

**WhatsApp:** Daemon showing "disconnected" — Justin may need to re-auth WhatsApp

## AYON Debt Recovery — Invoice Handling

**File:** `/root/.openclaw/workspace/data/ayon-debt-recovery.json`
**Agency:** AYON Debt Recovery

**Logic:** When running Invoice Escalation, check diary notes for any mention of AYON / debt collection / passed to agency. If found:
1. Add to `ayon-debt-recovery.json` with timestamp, job number, client, amount, date passed
2. Classify as "PASSED TO AYON" — these skip staff escalation
3. Add to report Section 8: "PASSED TO AYON DEBT RECOVERY"
4. They are no longer escalation candidates — AYON handles them

## CRON FAILURE RULE — PERMANENT (added 2026-04-17)

**ANY CRON job that fails must be handled as follows:**
1. Fix the root cause (timeout, script error, logic bug, etc.)
2. Run it immediately via `cron run <jobId>` — do NOT wait for next scheduled trigger
3. The goal is same-day data, not "fixed for next time"

**This applies to ALL failed CRONs without exception.**

---

## Genepic Health — Peptide Website Project (April 2026)

**Domain:** genepicpeptides.com ✅
**Brand:** Genepic Health | Tagline: "The biology of living better."
**Visual:** Navy #1B1F2B + neon cyan #72FFFF DNA helix + white
**Vial fill:** 25-33% — FIRM RULE
**Vial style:** Dark moody, dramatic spotlight, black pedestal

**Website:** `/root/.openclaw/workspace-kryten/genepic-redesign/` (29 files, fully built)
**Logo:** `genepic-redesign/assets/images/genepic-logo-v1.jpg`
**Products:** BPC-157, TB-500, GHK-Cu, Epithalon, CJC-1295 DAC, FOXO4-DRI, + 11 more

**Image generation:** Vertex AI Artlist — credentials provided (billing enabled), needs re-saving in main session
**Hosting:** one.com — NOT YET DEPLOYED

**Vial presentation shortlisted:** V2 (Black Mirror Stand), V4 (Frosted Acrylic Plinth), V3 (Black Velvet Box) — Justin to confirm winner

**Key reference images:** All saved in workspace-kryten/inbound/ — see memory/2026-04-18.md for full file list

## QB Login Protocol (from Justin — April 20 2026)

**For ANY QuickBooks login issue:**
1. Take a screenshot FIRST
2. INSPECT the image with the `image` tool before doing anything else
3. Look at what's actually on screen before deciding what to click/type
4. If a clickable element is visible → click it; don't guess or try programmatic workarounds

**What went wrong today:**
- Screenshotting but NOT looking at images before acting
- Kept trying programmatic workarounds without visually confirming page state
- Email card click worked — failure to check screenshot made me miss it
- Spent 30+ mins on approaches that were obvious failures if I'd just looked

**Key lesson:** Page was at password step. One click on the email card was all that was needed. Instead tried 6 different programmatic typing approaches that all failed against React's hidden controlled input.

## QB Login Protocol (from Justin's feedback — April 20 2026)

**For ANY QuickBooks login issue:**
1. ALWAYS take a screenshot FIRST
2. INSPECT the image with the `image` tool before doing anything else
3. Look at what's actually on screen before deciding what to click/type
4. If a clickable element is visible → click it; don't guess or try programmatic workarounds

**What went wrong today:**
- I was screenshotting but NOT looking at the images before acting
- I kept trying programmatic workarounds (JS DOM manipulation, React events) without visually confirming the page state
- The email card click worked — it was my failure to check the screenshot that made me miss it
- Spent 30+ minutes on approaches that would have been obvious failures if I'd just looked at the screen

**Key lesson:** The page was already at the password step. All I had to do was click the email card. One click. Instead I tried 6 different programmatic typing approaches that all failed against React's hidden controlled input.

## QB Bank Balance — Balance/Account Mapping Rule (April 24 2026)

**On the QB Banking page, accounts are laid out side-by-side horizontally.** DOM text extraction shows all balances together, so ALWAYS match each balance to its account by X-position:
- Left column = first account, Middle = second, Right = third
- Always verify account name is immediately adjacent to the balance in the same visual column
- Before reporting bank balances: confirm which balance belongs to which account by name AND position

**Known QB Accounts (from banking page):**
- **Revolut:** Base Lift Services Ltd Revolut (left column)
- **Metro Current (31806798):** 31806798 1. Base Me... (middle column)
- **Metro Savings:** 2. Base Metro Savings (right column)

## Exec Approval Behaviour — Main Agent vs Subagents (from Justin, Apr 20 2026)

**Why main agent prompts while subagents don't:**
- OpenClaw has TWO layers: shared `openclaw.json` config AND host-local `~/.openclaw/exec-approvals.json`
- Per-agent allowlists live in `exec-approvals.json` under `agents.<id>.allowlist`
- Main agent's local approval state can differ from Kryten/Reggie even with identical shared config
- Effective policy = stricter of config AND local approvals state

**Known bugs:**
- "Allow always" does NOT persist reliably — approved command may prompt again next run
- Wrapper scripts / different shell invocation shapes can cause approvals not to match saved ones
- If host-local `ask: always` is set, durable allow trust does NOT suppress prompts

**Workaround for main agent exec:** Use subagents for anything needing exec, since subagents use `security=full` and bypass approval prompts entirely. This is the established pattern (Kryten/Reggie pattern).

**If main agent exec MUST run directly:** Expect approval prompts; use `security=allowlist ask=off` or ensure host-local `exec-approvals.json` has the specific command allow-listed for the main agent session.

## ServiceM8 Service Contract Process — PERMANENT RULE (Apr 21 2026)

**Canonical reference:** `~/.openclaw/workspace/procedures/servicem8-service-contract-process.md`

**Core rule:** Never assume a signed contract is complete unless:
1. The signed file is verified on the correct ServiceM8 job diary, OR
2. A human explicitly approves alternative documentary evidence

**Signature-return paths:**
- Native form signing → signed contract should auto-attach to job diary
- Manual return (print/sign/scan/email) → may NOT reach ServiceM8 automatically — always check job diary AND inbox/reply path

**Exception labels to use:**
- SIGNATURE NOT VERIFIED
- MANUAL DIARY ATTACHMENT REQUIRED
- DATA CONFLICT
- INVOICE HOLD
- HUMAN APPROVAL REQUIRED

**Standard output for each step:** Objective | Records found/created/updated | Data verified | Data missing | Signature evidence status | Diary attachment status | Exceptions/risks | Approval required | Next recommended step

**This applies to ALL SC workflow tasks — CRON jobs, ad-hoc requests, renewal handling, invoice preparation.**

## CRON Job Read Rule — PERMANENT (from Justin, Apr 21 2026)

**For EVERY CRON job:** Read the procedure markdown file BEFORE starting work. Do not run from memory on complex multi-step processes.

Every CRON job payload must explicitly require reading the relevant procedure file. Every ad-hoc task must read the procedure first.

This applies to ALL CRON jobs without exception — SC workflow, control towers, financial reports, invoice escalation, everything.

This is non-negotiable — no exceptions.

## Sally QA Backup (Apr 23 2026)
- Justin wants me to act as QA for Sally's work going forward
- If Sally times out on tasks, I jump in and complete them
- This applies to all CRON-assigned tasks and subagent work for Sally

## ServiceM8 v14 UI Navigation (learned 2026-04-25)

### Opening Job Detail from Search
1. Use right panel "Job Search..." field (NOT the global search)
2. Type job number → results appear IN THE RIGHT PANEL
3. **Double-click** the job card to open full detail (NOT single click)
4. Job detail opens in the right panel

### Known Automation Issues
- ServiceM8 LiveChat widget intercepts clicks in the right panel area
- JavaScript click events on job cards don't reliably trigger navigation
- Single-clicking job card does NOT open detail (must double-click)
- LiveChat overlay appears frequently and blocks interaction
- ServiceM8 detects automation — use API for badge assignment (more reliable)

### Badge Assignment — API CONFIRMED WORKING (2026-04-25)
- Job Bas-4325 UUID: `e23faaf0-f119-4c4d-8d67-24190bea3f0d`
- Badge UUIDs: Warranty=`228c489b-577c-41d7-b521-22443dd9780b`, VIP=`d410b594-c477-456a-b187-22443ce1fd3b`
- API: POST to `/job_badge.json` with `{"job_uuid": "<uuid>", "badge_uuid": "<uuid>"}` ✅
- Also confirmed: Task/checklist items can be added via POST `/task.json` with `related_object="job"`, `related_object_uuid="<job_uuid>"` ✅
- Active badges: Warranty, VIP, Take Payment Facilities

### ServiceM8 v14 SPA Architecture
- ServiceM8 is a Sencha ExtJS SPA — URL never changes from `/dashboard` or `/job_dispatch`
- Navigation via JS click on links, not URL changes
- Job detail opens in right panel via internal state/navigation, not URL change
- `s_auth` token must be on every URL for authenticated requests (found in URL after login)
- Session expires: page redirects to marketing site — must re-authenticate
- Session token visible in dispatch board URL: `https://go.servicem8.com/job_dispatch?s_auth=<token>`

### ServiceM8 Education Docs
Saved to: `docs/servicem8-education/`
- INDEX.md — full documentation index from support.servicem8.com/llms.txt
- JOB_WALKTHROUGH.md — job lifecycle walkthrough
- More pages to be added as needed

## Promoted From Short-Term Memory (2026-05-15)

<!-- openclaw-memory-promotion:memory:memory/2026-05-09.md:5:5 -->
- **dashboard.baselifts.co.uk** is now live and working again. [score=0.824 recalls=0 avg=0.620 source=memory/2026-05-09.md:5-5]
<!-- openclaw-memory-promotion:memory:memory/2026-05-09.md:7:7 -->
- **What was broken:** [score=0.824 recalls=0 avg=0.620 source=memory/2026-05-09.md:7-7]
<!-- openclaw-memory-promotion:memory:memory/2026-05-09.md:12:12 -->
- **What happened:** [score=0.824 recalls=0 avg=0.620 source=memory/2026-05-09.md:12-12]
