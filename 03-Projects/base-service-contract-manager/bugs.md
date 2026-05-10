---
title: Bugs
project: Base Service Contract Manager
created: 2026-05-10
tags: [bugs, issues]
---

# Bugs — Base Service Contract Manager

## Known Bugs

### Bug #001 — sc-forms INSERT failure (FIXED)
**Date:** 2026-05-10
**Severity:** Critical
**Status:** Fixed

**Description:** The VPS API's `POST /api/sc-form` INSERT prepared statement had a parameter count mismatch. The VALUES clause had only 14 placeholders but the table has 29 columns. SQLite threw `RangeError: Too few parameter values were provided`.

**Root Cause:** The original INSERT statement was missing the `company_uuid` placeholder and had incorrect parameter mapping. The prepared statement failed silently because the SM8 job was created before the INSERT.

**Fix Applied:**
- Corrected VALUES clause in `/root/portal-api/server.js`
- Restarted portal-api PM2 service
- Verified INSERT now works: `curl POST /api/sc-form` returns `{"success":true,...}`

**Recovery:** Manually inserted missing `sc_forms` record for Bas-4529 (DVB Capital Assets II LLC) into `/tmp/portal.db`.

---

## Resolved

_(To be populated as bugs are discovered and fixed)_

## Last Updated

`2026-05-10`
