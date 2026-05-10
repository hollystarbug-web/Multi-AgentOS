---
title: Base Service Contract Manager — Status
project: Base Service Contract Manager
created: 2026-05-10
tags: [project, status]
---

# Base Service Contract Manager — Status

## Current State

**Date:** 2026-05-10

### Active Work

- **SC Portal Bug Fix:** Fixed a critical bug in the VPS API's `POST /api/sc-form` INSERT statement where the prepared statement had the wrong number of parameter placeholders. The INSERT was failing silently, causing the SM8 job to be created but the portal DB record to be missing.
  - **Fix:** Corrected the VALUES clause to match 29 table columns
  - **Fixed file:** `/root/portal-api/server.js`
  - **Restarted:** portal-api PM2 service
  - **Recovery:** Manually inserted missing sc_forms record for Bas-4529 (DVB Capital Assets II LLC)

- **Wiki Setup:** Initializing OpenClaw wiki on VPS at ~/OpenClaw-Wiki/

### Portal Health

| Component | Status |
|-----------|--------|
| Portal UI (dashboard.baselifts.co.uk) | ✅ Online |
| Portal API (VPS:3001) | ✅ Online |
| SQLite DB (/tmp/portal.db) | ✅ Healthy |
| SM8 Sync (1-min cron) | ✅ Running |
| Clerk Auth | ⚠️ Session may expire — requires re-login |

### Open Items

- [ ] Clerk auth session may need refreshing on portal — monitor
- [ ] DVB Bas-4529 needs SC v7 checklist filled in (lifts covered, rates, etc.)
- [ ] Wiki documentation for SC workflow needs to be written up

## Metrics (Last Check: 2026-05-10)

| Metric | Value |
|--------|-------|
| Live Contracts | 163 |
| Annual Revenue | £77,419 |
| Renewals Invoice Due | 6 |
| Invoices Unpaid | 32 |
| Quotes Sent Unanswered | 15 |

## Last Updated

`2026-05-10`
