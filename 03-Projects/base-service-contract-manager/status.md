---
title: Base Service Contract Manager — Status
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-21
tags: [project, status]
---

# Base Service Contract Manager — Status

## Current State

**Date:** 2026-05-21
**Build phase:** Core workflow functional, active bug fixing and testing in progress

---

## System Health

| Component | Status | Notes |
|-----------|--------|-------|
| Portal UI (dashboard.baselifts.co.uk) | ✅ Online | PM2 process `portal` (port 3000) |
| Portal API (VPS:3001) | ✅ Online | PM2 process `portal-api` (port 3001) |
| SQLite DB (/root/portal.db) | ✅ Healthy | WAL mode, shared by portal + portal-api |
| SM8 Sync (1-min cron) | ✅ Active | sm8_jobs, sm8_companies, sm8_company_contacts synced |
| Clerk Auth | ✅ Online | dashboard.baselifts.co.uk |
| Chrome CDP (Mac Mini) | ✅ Live | Tab for ServiceM8 |
| QB CDP | ✅ Live | Tab for QuickBooks |

---

## What's Working

### Complete (as of 2026-05-21)
- **4-tab dashboard layout** — Pipeline, Awaiting Payment, Active/Initiated, Renewals
- **Dashboard metrics** — Live Contracts, Annual Revenue, Renewals Due, Invoices Unpaid, Quotes Sent Unanswered
- **Labour rates card** — stored in portal_settings, auto-fills SC form
- **New Contract** → creates SM8 job via API
- **Contract & Invoice** (SC v7 form) → saves to portal DB, moves to approval queue
- **Approve Email** → human reviews and sends via SM8 (OAuth)
- **Invoice Send** — tracks quote accepted (payment_received=1) + contract received
- **Initiate SC** — creates recurring job via SM8 API
- **Renewals window** — lists contracts due within 6 weeks
- **Stale Quotes** — detects quotes older than 45 days
- **SM8 API integration** — direct API calls for live data, SQLite mirror for speed
- **SM8 OAuth** — email/SMS sending via OAuth token (auto-refreshes)
- **SC form labour rates auto-fill** — Full Day Rate, Per Hour Rate, Minimum Callout pre-filled from portal_settings
- **Email To/BCC routing** — customer email → To, staff emails → BCC

### Partially Working
- **Renewals list** — shows contracts in renewal window but RENEW flow not fully end-to-end verified
- **Diary attachment detection** — portal checks for contract PDF in SM8 job diary
- **Signed contract PDF** — goes to ORIGINAL job diary, not renewal diary

---

## What's Broken / Open Issues

### Critical — Needs End-to-End Test
- **Full SC workflow not tested live** — Step 1 → Step 2 → Step 3 → Approve Email has NOT been tested end-to-end with a real client submission since the 2026-05-21 fixes

### Open Bugs (as of 2026-05-21)
1. **Premature email firing on Step 1** — Email may be sent before Step 2 is complete. Trigger location unknown.
2. **Invoice number display anomaly in Step 3** — Justin reported anomalous invoice numbers. Needs clarification.
3. **Lead source options missing** — SC form doesn't have lead source dropdown in portal.
4. **Labour rates auto-fill timing** — Fast submissions may submit before portal_settings loads (data saves correctly, UX issue only).
5. **SO/DD = 0** — Monthly extraction cron was never activated. April 2026 data extracted manually.

### Known Fixes Applied 2026-05-21
- ✅ MC001 Minimum Call-Out row removed from Step 3 display
- ✅ Minimum Call-Out no longer pushed to SM8 as jobMaterial billing item
- ✅ Job description default → "NEW SERVICE CONTRACT" in SM8 job creation
- ✅ Approval queue list now shows all non-rejected items (was only pending_review)
- ✅ Portal database URL fixed to /root/portal.db (was using /tmp/portal.db — empty)
- ✅ Email To/BCC routing added to send endpoint
- ✅ Labour rates auto-fill from portal_settings deployed

---

## Key File Locations

| File | Path |
|------|------|
| Portal Next.js | `/root/.openclaw/workspace-sally/portal/` |
| Portal PM2 ecosystem | `/root/.openclaw/workspace-sally/portal/ecosystem.portal.config.js` |
| Portal build artifacts | `/root/.openclaw/workspace-sally/portal/.next/` |
| Portal-api (Node.js) | `/root/portal-api/` |
| Portal-api PM2 config | `/root/portal-api/ecosystem.config.js` |
| Portal-api server | `/root/portal-api/server.js` |
| Shared database | `/root/portal.db` |
| Portal send route | `portal/app/api/approval-queue/send/route.ts` |
| Portal SCFormTab | `portal/components/SCFormTab.tsx` |
| Portal ApproveEmailTab | `portal/components/ApproveEmailTab.tsx` |

---

## PM2 Processes

```bash
pm2 list
# portal        — Next.js portal (port 3000) — restart after portal rebuild
# portal-api    — Node.js API (port 3001)    — restart after server.js change
```

**Portal rebuild required after any source code change:**
```bash
cd /root/.openclaw/workspace-sally/portal && npm run build
pm2 restart portal
```

---

## Key SM8 UUIDs and IDs

| Item | UUID/ID |
|------|---------|
| SC Category | `6d2fd47f-4ae0-4041-8cc0-22e739804a6b` |
| SM8 Tax (20% VAT) | `37cceef7-eb33-4468-ad83-228947c20b5b` |
| QB Register Account ID | `1150040000` |
| QB SO/DD Account | `31806798` (Metro Current) |
| SM8 API Key | `smk-4457bf-21f2dd1536e86602-edd07adc8873e535` |
| SM8 OAuth | `~/.openclaw/workspace/.credentials/servicem8_oauth.json` |

---

## Metrics (Last Check: 2026-05-21)

| Metric | Value |
|--------|-------|
| Live Contracts | ~163 |
| Annual Revenue | ~£77k |
| Renewals Due | ~6 |
| Invoices Unpaid | ~32 |
| Quotes Sent Unanswered | ~15 |

---

## Next Steps (When Justin Returns)

1. **Full end-to-end test** — Create a real SC form (Step 1 → Step 2 → Step 3) and test "Approve and Send Email"
2. **Verify job_description** — Check SM8 job card shows "NEW SERVICE CONTRACT"
3. **Clarify invoice number anomaly** — Justin reported Step 3 invoice numbers were wrong
4. **Investigate premature email** — Email fires on Step 1 submission before Step 2
5. **Set up SO/DD monthly cron** — Monthly extraction cron needs activating
6. **Add lead source dropdown** — Portal SC form needs lead source options

---

## Last Updated

`2026-05-21`
