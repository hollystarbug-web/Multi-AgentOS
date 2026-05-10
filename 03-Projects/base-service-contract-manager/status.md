---
title: Base Service Contract Manager — Status
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [project, status]
---

# Base Service Contract Manager — Status

## Current State

**Date:** 2026-05-10
**Build phase:** Core workflow functional, polish and monitoring pending

---

## System Health

| Component | Status | Notes |
|-----------|--------|-------|
| Portal UI (dashboard.baselifts.co.uk) | ✅ Online | Served via nginx → local /root/portal port 3000 (PM2) |
| Portal API (VPS:3001) | ✅ Online | PM2 process `portal-api` (26 restarts — monitoring) |
| SQLite DB (/tmp/portal.db) | ✅ Healthy | WAL mode, shared by portal + API |
| SM8 Sync (1-min cron) | ⚠️ Partial | Syncs SC jobs; renewal jobs fetched live by portal |
| Clerk Auth | ⚠️ Session may expire | Requires re-login if session stale |
| Chrome CDP (Mac Mini) | ✅ Live | Tab 8B77F0A5A19CC9D32B7090C06EB4996C |
| QB CDP | ✅ Live | Tab 6D8251B13C4D77646C82F7B2DBF7279B |

---

## What's Working

### Complete
- **4-tab dashboard layout** — Pipeline, Awaiting Payment, Active/Initiated, Renewals
- **Dashboard metrics** — Live Contracts, Annual Revenue, Renewals Due, Invoices Unpaid, Quotes Sent Unanswered
- **Labour rates card** — stored in portal_settings
- **New Contract** → creates SM8 job via API
- **Contract & Invoice** (SC v7 form) → saves to portal DB, moves to approval queue
- **Approve Email** → human reviews and sends via SM8
- **Invoice Send** — tracks quote accepted (payment_received=1) + contract received
- **Initiate SC** — creates recurring job via SM8 API
- **Renewals window** — lists contracts due within 6 weeks
- **Stale Quotes** — detects quotes older than 45 days
- **SM8 API integration** — direct API calls for live data, SQLite mirror for speed
- **SC sync cron** — sm8_jobs, sm8_companies, sm8_company_contacts synced every ~1 min
- **SM8 OAuth** — email/SMS sending via OAuth token (auto-refreshes)

### Partial
- **Renewals list** — shows contracts in renewal window but RENEW flow not fully end-to-end verified
- **SC Exclusion List** — applied in db.ts KPIs, may not be applied in all list queries
- **Diary attachment detection** — portal checks for contract PDF in SM8 job diary (Step 4 detection)
- **Signed contract PDF** — goes to ORIGINAL job diary, not renewal diary (confirmed with Justin)

---

## What's Broken

### Critical (Fixed — Needs Verification)
- **sc-forms INSERT bug** — `POST /api/sc-form` had wrong number of parameter placeholders. Fixed in `/root/portal-api/server.js`. PM2 restarted. Bas-4529 (DVB Capital Assets II LLC) manually recovered. Needs end-to-end test with a real new contract.
- **Git drift** — `/root/portal` was 2 commits behind `workspace-sally/portal`. Synced 2026-05-10. Fixed job_address bugs in buildClientList and getInitiateJobs. Rebuilt and PM2 restarted.

### Security Issues
- **ecosystem.config.js with secrets** — File containing Clerk keys, SM8 OAuth credentials was found as untracked file in `/root/portal`. DELETED and added to `.gitignore`. ⚠️ Secrets may be in git history of this repo. Needs security review.

### Unverified
- **End-to-end new contract flow** — Step 1 → Step 2 → Submit → Approve Email → Invoice Send has not been tested live with a real client
- **RENEW button flow** — creates renewal job with CPI price; needs testing
- **INITIATE checklist** — creates recurring job in SM8; needs testing
- **Please Chase flow** — contact info displayed, email triggered
- **Badge counts** on tab buttons — may not be live-counting correctly
- **portal-api restarts** — 26 restarts counted; may be normal (cron overlapping) or may indicate instability

---

## Current Blockers

1. **No live end-to-end test** — full SC workflow has not been tested with a real client from New Contract → Initiate
2. **SC v7 field storage** — Stored in portal DB only. SM8 task fields not required. ✅ ANSWERED 2026-05-10
3. **approval_queue schema** — `invoicing_address` column exists in production DB. ✅ VERIFIED 2026-05-10

---

## Next Safest Action

1. **Test the full SC workflow with a real or test client** — starting with New Contract and working through to Initiate or Chase. This will validate the entire flow and expose any remaining bugs.
2. **Clarify SC v7 field storage** — portal DB vs SM8 task fields
3. **Add renewal category to sync script** — or verify portal live fetches are sufficient
4. **Fix `invoicing_address` column** in `server.js` schema

---

## Metrics (Last Check: 2026-05-10)

| Metric | Value |
|--------|-------|
| Live Contracts | 163 |
| Annual Revenue | £77,419 |
| Renewals Invoice Due | 6 |
| Invoices Unpaid | 32 |
| Quotes Sent Unanswered | 15 |

---

## Last Updated

`2026-05-10`
