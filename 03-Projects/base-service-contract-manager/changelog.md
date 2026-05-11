---
title: Changelog
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [changelog, history]
---

# Changelog — Base Service Contract Manager

## 2026-05-11

### Security Fix — Removed Hardcoded SM8 API Key from portal-api
**Who:** Holly (per Justin security audit)
**Issue:** `/root/portal-api/server.js` had a hardcoded SM8 API key fallback (`smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7`) on line 88. Even though the key was read-only, hardcoding any secret in code violates credential rules.
**Fix:**
- Replaced hardcoded fallback with `getSM8ApiKey()` function — loads from `SERVICEM8_API_KEY` env var first, then `~/.openclaw/workspace/.credentials/servicem8.json`
- Fails cleanly with clear error if neither source available — never prints the key
- Fixed credential file permissions from `644` to `600`
- Updated `/root/portal-api/.gitignore` to protect: `.env`, `.env.*`, `ecosystem.config.js`, `.credentials/`, `*.key`, `*.pem`
- Backed up original: `/root/portal-api/server.js.bak-20260511075839`
- Restarted `portal-api` PM2 — verified responding correctly at port 3001
**Files:** `/root/portal-api/server.js`, `/root/portal-api/.gitignore`

### Wiki Cleanup — Security Documentation Organised
**Who:** Holly
**Change:** Organised security docs per Justin's required structure:
- Created `07-Reference/security-and-secrets.md` (global credential rules)
- Created `06-Runbooks/credential-rotation-and-secret-cleanup.md` (rotation runbook)
- Updated project `security-and-secrets.md` to link to global files
- Updated `00-Index.md` with links
**Commit:** `6d0bd2d`

---

## 2026-05-10

### Bug Fix — sc-forms INSERT Failure (Critical)
**Who:** Holly (direct)
**Issue:** `POST /api/sc-form` in VPS API (`/root/portal-api/server.js`) had a parameter count mismatch. The VALUES clause provided 29 values but the table definition had fewer columns. The SM8 job was created but the portal DB record was never saved. Every Step 1 submission silently failed — no sc_forms record was ever created for any job.
**Impact:** Jobs appeared in SM8 but NOT in the portal pipeline. The DVB Capital Assets II LLC job (Bas-4529) was manually recovered.
**Fix:** Corrected VALUES clause in `server.js`. Restarted PM2 `portal-api`. Verified with curl test.
**Files:** `/root/portal-api/server.js` (INSERT in `POST /api/sc-form`)
**Recovery:** Manually inserted `scf_dvb_bas4529` into `/tmp/portal.db`

### Wiki Setup — OpenClaw Wiki
**Who:** Holly
**Change:** Initialized OpenClaw wiki on VPS at `~/OpenClaw-Wiki/` with full project structure. Linked `~/.openclaw/procedures` and `~/.openclaw/learnings` as symlinks to wiki subdirectories.
**GitHub:** Pushed to `hollystarbug-web/openclaw-wiki` via HTTPS PAT (PAT subsequently revoked). SSH deploy key (`openclaw_wiki_github`) now authorized for future pushes.

---

## 2026-05-05

### PERMANENT BROWSER RULE Established
**Who:** Justin + Holly
**Decision:** Chrome is the permanent, authoritative browser for ServiceM8 and QuickBooks. Safari WebDriver is NOT to be used for QB or SM8 automation.
**Why:** Chrome has the logged-in sessions for both. Safari WebDriver is exclusive (one session at a time) — not reliable.
**Chrome CDP tunnel:** `http://localhost:9222` via Mac Mini reverse SSH tunnel, managed by LaunchAgent `com.holly.chrome-debug.plist`. Auto-restarts on Mac Mini boot.

---

## 2026-05-01

### Wiki Setup Started (LEARNINGS.md Accidentally Overwritten)
**Who:** Holly
**Issue:** During wiki setup, LEARNINGS.md was accidentally overwritten mid-session. Restored immediately from backup `/root/.openclaw/backups/20260504_063027/workspace/LEARNINGS.md`. Critical rules (SQLite/SM8 architecture, Justin-only-deletes) re-added.
**Lesson:** Always backup before bulk file operations.

---

## 2026-04-30

### ServiceM8 Browser Automation — agent-browser CLI
**Who:** Holly
**Discovery:** `agent-browser` CLI on Mac Mini at `/opt/homebrew/lib/node_modules/agent-browser/bin/agent-browser-darwin-arm64` provides high-level browser automation (snapshot, click, fill, eval, screenshot) over Chrome CDP.
**Key finding:** Chrome is already logged into ServiceM8 as Justin Howard on Mac Mini. Session active. No manual login needed.
**Chrome tab:** `8B77F0A5A19CC9D32B7090C06EB4996C` (ServiceM8 Dispatch Board)
**Navigation:** Always use eval with s_auth token — `agent-browser open <url>` loses session token.

---

## 2026-04-29

### Chrome DevTools CDP — Fully Operational
**Who:** Holly
**Problem:** Chrome on Mac Mini was rejecting WebSocket CDP connections from VPS with 403 Forbidden.
**Fix:** `--remote-allow-origins=*` flag permanently set via LaunchAgent `com.holly.chrome-debug.plist`.
**Scripts created:** `qb_cdp_bank_balance.py`, `qb_cdp_vat_extract.py`, `qb_cdp_so_dd.py`

### Mac Mini SSH Access — Permanent Reverse Tunnel
**Who:** Holly + Justin
**Setup:** Reverse SSH tunnel: Mac Mini port 22 → VPS port 2222. LaunchAgent `com.holly.vps-tunnel.plist` keeps tunnel alive 24/7.
**From VPS:** `ssh -p 2222 holly@127.0.0.1` reaches Mac Mini terminal.
**Auth:** Key-based. VPS root key registered in Mac Mini `~/.ssh/authorized_keys`.

### Safari WebDriver — Available
**Who:** Holly
**Setup:** Safari WebDriver at `http://localhost:9225` (tunneled from Mac Mini). LaunchAgent `com.holly.safari-tunnel.plist` + watchdog cron (every 15 min).
**Use:** Safari-specific tasks only. NOT for SM8 or QB.

### QB CDP Login — Working
**Who:** Holly
**Discovery:** QB sign-in has a pre-filled email BUTTON (not a text field). Must click the button first, then fill password. QB password step says "Continue" not "Sign in".
**Credentials:** Stored in `~/.openclaw/workspace/.credentials/quickbooks-debt-recovery.json`

---

## 2026-04-28

### Critical Deployment Fix — /root/portal Was 11 Commits Behind
**Who:** Holly
**Issue:** The local VPS portal at `/root/portal` was 11 commits behind workspace-sally/portal. Nginx was proxying to the local portal instead of Vercel, so all changes to workspace-sally/portal weren't reaching dashboard.baselifts.co.uk.
**Fix:** Pulled workspace-sally/portal into /root/portal. Rebuilt: `cd /root/portal && npm run build`. PM2 restarted portal on port 3000.
**Rule established:** After any portal commit in workspace-sally, MUST pull into /root/portal and rebuild. Sally workspace commits do NOT auto-deploy to the custom domain — they need syncing to /root/portal.

### DB Path Bug — portal-api vs portal Using Different DBs
**Who:** Holly
**Issue:** `portal-api` (PM2 `portal-api`, port 3001) was using `/var/lib/portal/portal.db`. `portal` (Next.js, port 3000) was using `/tmp/portal.db`. Step 1 saved job_description to VPS DB (`/tmp/portal.db` via portal-api). Step 2 read from portal's own API which pointed to wrong DB path.
**Fix:** Changed portal-api to use `/tmp/portal.db`. Both now share the same database.

### Lead Source Dropdown — Simplified to 2 Options
**Who:** Holly + Justin
**Decision:** Only 2 lead source options:
1. Impact Automation (base)
2. Impact Automation 10% (adds AI team badge + "Code: IA-10")

---

## 2026-04-25

### Full SC Workflow Walkthrough with Justin
**Who:** Holly + Justin
**Key confirmations:**
- SC v7 form fields: lifts_covered, visits_per_year, full_day_rate, per_hour_rate, minimum_call_out (5 fields as SM8 checklist/task)
- **Signed contract PDF goes to ORIGINAL job diary, NOT renewal diary** — critical for Step 4 detection logic
- CPI rate: 3.3% (March 2026, ONS) — confirmed current rate
- 6-week renewal window, 2-month cancellation notice

### Chrome Automation Attempted — ServiceM8 Blocks Chrome
**Discovery:** ServiceM8 detects Chrome automation. Safari on Mac Mini is logged in and should be used for SM8 UI operations.
**Working approach:** Badge + task/checklist via SM8 REST API (API key works for these). Complex UI → Safari WebDriver.

### Sally Build Status (end of 2026-04-25):
- 4-tab dashboard layout ✅
- SQLite schema (sc_forms + approval_queue) ✅
- Labour rates card ✅
- API routes (sc-form, approval-queue, renewals-window, awaiting-payment, active-contracts) ✅

---

## 2026-04-24

### SC Portal Build Brief — Project Started
**Who:** Holly + Justin
**Source document:** `New_automated_Service_Contract_Process_Desired.docx` (Justin, via Telegram)
**Spec written:** `SC-PORTAL-WORKFLOW-SPEC-v1.md`
**Briefed to:** Sally

**7-Step SC Lifecycle defined:**
1. New Contract → create job in SM8
2. Contract & Invoice → SC v7 checklist fields, submit for approval
3. Approve Email → human reviews, approve and send
4. Invoice Send → track quote accepted + contract received
5. Initiate or Chase → PAID: INITIATE | NOT PAID: PLEASE CHASE
6. Contract Renewal → 6-week window, RENEW creates renewal job
7. Renewal Approval → human reviews, approve and send

### Dashboard Metric Definitions Confirmed
- **Live Contracts** = `payment_received === 1` only (invoice paid = live)
- **Quoted Not Paid** = invoice sent, not paid (outstanding)
- **Active** = paid + active jobs

### CPI Rate: 3.3% (March 2026)
**Source:** ONS, released April 22, 2026
**URL:** https://www.ons.gov.uk/economy/inflationandpriceindices

---

## SC Exclusion List

117 job IDs excluded from SC calculations. See `docs/ServiceM8_API.md` appendix. These are excluded from standard invoice aging/debt chasing. Applied in `db.ts` KPI calculations.

---

## Last Updated

`2026-05-10`
