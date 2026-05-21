---
title: Bugs
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-21
tags: [bugs, issues]
---

# Bugs — Base Service Contract Manager

## Known Bugs

### Bug #001 — sc-forms INSERT Failure (FIXED 2026-05-10)
**Date:** 2026-05-10
**Severity:** Critical
**Status:** Fixed
**Found by:** Holly during DVB Capital Assets II LLC (Bas-4529) investigation

**Description:** The VPS API's `POST /api/sc-form` INSERT prepared statement in `/root/portal-api/server.js` had a parameter count mismatch. SQLite threw `RangeError: Too few parameter values were provided`.

**Root Cause:** Missing `company_uuid` placeholder and incorrect parameter mapping. SM8 job created but portal DB record never saved.

**Fix Applied:**
- Corrected VALUES clause in `/root/portal-api/server.js` — aligned to match all 29 table columns
- Restarted PM2 `portal-api` service

---

### Bug #002 — portal-api Used Wrong DB Path (FIXED 2026-04-28)
**Date:** 2026-04-28
**Severity:** Critical
**Status:** Fixed
**Found by:** Holly during debugging

**Description:** `portal-api` was using `/var/lib/portal/portal.db`. `portal` (Next.js) was using `/tmp/portal.db`. Step 1 saved `job_description` via the API to the wrong DB — Step 2 read from the portal's own DB which had no record.

**Fix Applied:**
- Changed `portal-api` to use `/tmp/portal.db` (same as portal)
- Rebuilt and restarted both PM2 processes

---

### Bug #003 — Portal Used Wrong DB (Empty /tmp/portal.db) (FIXED 2026-05-21)
**Date:** 2026-05-21
**Severity:** Critical
**Status:** Fixed
**Found by:** Holly during Step 3 "item not found" debugging

**Description:** The Next.js portal was using `/tmp/portal.db` (ephemeral, empty on every reboot) instead of `/root/portal.db` (the shared database used by portal-api). This caused Step 3 "Approve and Send Email" to fail with "Item not found" because the approval queue items existed in `/root/portal.db` but the portal was looking in `/tmp/portal.db`.

**Root Cause:** The portal's PM2 ecosystem config did not have `DATABASE_URL` set. It defaulted to `/tmp/portal.db`.

**Fix Applied:**
- Created/updated `/root/.openclaw/workspace-sally/portal/ecosystem.portal.config.js` with `DATABASE_URL=/root/portal.db`
- Rebuilt and restarted PM2 `portal` process

**Files affected:**
- `/root/.openclaw/workspace-sally/portal/ecosystem.portal.config.js` (created)

**Lesson:** Portal (Next.js) and portal-api must use the same database file. Always verify `DATABASE_URL` in PM2 ecosystem config.

---

### Bug #004 — Approval Queue List Only Returned pending_review (FIXED 2026-05-21)
**Date:** 2026-05-21
**Severity:** Medium
**Status:** Fixed
**Found by:** Holly during "item not found" investigation

**Description:** The portal-api's `GET /api/approval-queue` handler was hardcoded to `WHERE status = 'pending_review'`. Once an item was sent (status='sent'), it disappeared from the list. This made it impossible to see send history and caused confusion when trying to verify sent items.

**Fix Applied:**
- Changed query to `WHERE status != 'rejected'` in `/root/portal-api/server.js`
- Restarted PM2 `portal-api` service

**Files affected:**
- `/root/portal-api/server.js` (line 258)

---

### Bug #005 — MC001 Minimum Call-Out Charge Wrongly Shown as Billable Line Item (FIXED 2026-05-21)
**Date:** 2026-05-21
**Severity:** Medium
**Status:** Fixed
**Found by:** Justin during portal testing

**Description:** The ApproveEmailTab.tsx (Step 3) was displaying "MC001 Minimum Call-Out Charge" as a product line item in the quote summary table. Additionally, the send route was pushing this as a jobMaterial item to SM8. The minimum call-out charge is a T&Cs/fee structure term, NOT a billable product — it should not appear as a line item in quotes or invoices.

**Fix Applied:**
1. Removed MC001 row from ApproveEmailTab.tsx Step 3 display (lines 360-367 removed)
2. Removed Minimum Call-Out Charge push from `/api/approval-queue/send/route.ts` (lines 190-200 removed)

**Files affected:**
- `/root/.openclaw/workspace-sally/portal/components/ApproveEmailTab.tsx`
- `/root/.openclaw/workspace-sally/portal/app/api/approval-queue/send/route.ts`

---

### Bug #006 — Job Description Wrong Default (FIXED 2026-05-21)
**Date:** 2026-05-21
**Severity:** Low
**Status:** Fixed
**Found by:** Justin during portal testing

**Description:** When an SC form was submitted without a job description, the SM8 job was created with `job_description = "Service Contract — {company_name}"`. Justin requires it to be exactly "NEW SERVICE CONTRACT".

**Fix Applied:**
- Changed sc-form route fallback from `Service Contract — ${company_name}` to `"NEW SERVICE CONTRACT"`
- File: `/root/.openclaw/workspace-sally/portal/app/api/sc-form/route.ts`

---

## Open Bugs (Unresolved as of 2026-05-21)

### Open Bug #007 — Premature Email Firing on Step 1
**Date:** 2026-05-21
**Severity:** High
**Status:** Open
**Found by:** Justin during testing

**Description:** Email appears to be sent before Step 2 is complete. The trigger location is unknown and needs investigation.

**Impact:** Premature emails to customers before SC form is fully filled.

**Next step:** Trace the email sending logic in Step 1 and Step 2 submission flow.

---

### Open Bug #008 — Invoice Number Display Anomaly in Step 3
**Date:** 2026-05-21
**Severity:** Medium
**Status:** Open — needs clarification
**Found by:** Justin during testing

**Description:** Justin reported "step 3 - invoice numbers displayed are anomalous - should be from the data entered at step 2". Need to clarify exactly what was shown vs what was expected.

**Next step:** Ask Justin for screenshot of anomalous display vs expected values.

---

### Open Bug #009 — Labour Rates Auto-Fill Timing Issue
**Date:** 2026-05-21
**Severity:** Low
**Status:** Open (low priority)
**Found by:** Justin during testing

**Description:** Labour rates (Full Day Rate, Per Hour Rate, Minimum Callout) were not visible when Justin loaded Step 2, even though they were saved correctly to the database (verified: Bas-4644 record had correct values matching portal_settings).

**Root Cause:** The form submitted before the async portal_settings fetch completed. The loading guard was added but may need further UX hardening.

**Next step:** Low priority — data saves correctly. Consider adding a loading spinner or disabling form until settings load.

---

### Open Bug #010 — Lead Source Options Missing in SC Form
**Date:** 2026-05-21
**Severity:** Low
**Status:** Open
**Found by:** Justin

**Description:** The SC form Step 2 doesn't have a lead source dropdown. Manual config needed in portal-settings.

**Next step:** Add lead source options to portal-settings and update SCFormTab to show dropdown.

---

## Last Updated

`2026-05-21`
