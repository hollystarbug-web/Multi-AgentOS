---
title: Bugs
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [bugs, issues]
---

# Bugs — Base Service Contract Manager

## Known Bugs

### Bug #001 — sc-forms INSERT failure (FIXED)
**Date:** 2026-05-10
**Severity:** Critical
**Status:** Fixed
**Found by:** Holly during DVB Capital Assets II LLC (Bas-4529) investigation

**Description:** The VPS API's `POST /api/sc-form` INSERT prepared statement in `/root/portal-api/server.js` had a parameter count mismatch. The VALUES clause provided the wrong number of values compared to the column list. SQLite threw `RangeError: Too few parameter values were provided`.

**Root Cause:** The original INSERT statement was missing the `company_uuid` placeholder and had incorrect parameter mapping. The prepared statement failed silently because the SM8 job was created before the INSERT — so the SM8 API call succeeded but the portal DB record was never saved.

**Impact:** Every Step 1 submission since the portal was built failed silently. No `sc_forms` record was ever created for any job. Jobs appeared in SM8 but not in the portal pipeline.

**Fix Applied:**
- Corrected VALUES clause in `/root/portal-api/server.js` — aligned to match all 29 table columns
- Restarted PM2 `portal-api` service
- Verified INSERT now works: `curl POST /api/sc-form` returns `{"success":true,...}`

**Recovery:**
- Manually inserted missing `sc_forms` record for Bas-4529 (DVB Capital Assets II LLC) into `/tmp/portal.db`
- Job now appears in portal Step 2 queue

**Files affected:** `/root/portal-api/server.js`

---

### Bug #002 — portal-api Used Wrong DB Path (FIXED)
**Date:** 2026-04-28
**Severity:** Critical
**Status:** Fixed
**Found by:** Holly during debugging

**Description:** `portal-api` (PM2 `portal-api`, port 3001) was using `/var/lib/portal/portal.db`. `portal` (Next.js, port 3000) was using `/tmp/portal.db`. Step 1 saved `job_description` via the API to the wrong DB path. Step 2 read from the portal's own API which pointed to the other DB — so `job_description` was always empty in Step 2.

**Fix Applied:**
- Changed `portal-api` to use `/tmp/portal.db` (same as portal)
- Rebuilt and restarted both PM2 processes

---

### Bug #003 — /root/portal 11 Commits Behind (FIXED)
**Date:** 2026-04-28
**Severity:** High
**Status:** Fixed
**Found by:** Holly

**Description:** The local VPS portal at `/root/portal` was 11 commits behind workspace-sally/portal. Nginx was proxying to the local portal instead of Vercel, so all changes to workspace-sally/portal weren't reaching dashboard.baselifts.co.uk.

**Fix Applied:**
- Pulled workspace-sally/portal into /root/portal
- Rebuilt: `cd /root/portal && npm run build`
- PM2 restarted portal on port 3000

**Rule:** After any portal commit in workspace-sally, MUST pull into /root/portal and rebuild.

---

## Unverified / Potential Issues

### Issue #004 — approval_queue Schema Inconsistency
**Date:** 2026-05-10
**Severity:** Medium
**Status:** Unverified

**Description:** `server.js` (VPS API) creates `approval_queue` table without `invoicing_address` column. `db.ts` (Next.js) adds it via ALTER TABLE migration. If the VPS API server was started before the migration ran, the column may be missing in production.

**Action needed:** Verify `invoicing_address` column exists in `/tmp/portal.db`:
```sql
PRAGMA table_info(approval_queue);
```
If missing: `ALTER TABLE approval_queue ADD COLUMN invoicing_address TEXT DEFAULT '';`

---

### Issue #005 — Renewals Not Synced to SQLite
**Date:** 2026-05-10
**Severity:** Low
**Status:** Unverified

**Description:** `sync-sm8.js` only syncs SC category jobs (`6d2fd47f-...`) to `sm8_jobs` table. SC Renewal Invoice category jobs (`a04b781f-...`) are not synced. Portal fetches renewal jobs live from SM8 API at request time.

**Potential issue:** If SM8 API is slow or rate-limited, renewal jobs may be missed.

**Action needed:** Verify portal live fetches are sufficient for all renewal use cases. Consider adding renewal category to sync script if needed.

---

## Resolved

_(All bugs above are resolved)_

## Last Updated

`2026-05-10`
