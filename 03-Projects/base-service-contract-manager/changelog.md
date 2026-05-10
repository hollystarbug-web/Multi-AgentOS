---
title: Changelog
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [changelog, history]
---

# Changelog — Base Service Contract Manager

## 2026-05-10

### Bug Fix — SC Portal sc-forms INSERT failure
**Issue:** The VPS API's `POST /api/sc-form` INSERT prepared statement had the wrong number of parameter placeholders. The VALUES clause provided only 14 values for 29 columns in the table.
**Impact:** SM8 job was created successfully but the portal's `sc_forms` record was never saved. Jobs appeared in SM8 but not in the portal pipeline.
**Fix:** Corrected VALUES clause in `/root/portal-api/server.js`. Restarted portal-api PM2 service.
**File:** `/root/portal-api/server.js`

**Affected jobs:** DVB Capital Assets II LLC (Bas-4529) — manually recovered by inserting missing sc_forms record.

### Wiki Setup
**Change:** Initialized OpenClaw wiki on VPS at `~/OpenClaw-Wiki/` with full project structure.
**Linked:** `~/.openclaw/procedures` and `~/.openclaw/learnings` now symlink to `~/OpenClaw-Wiki/04-Procedures` and `~/OpenClaw-Wiki/05-Learnings`.

---

## Earlier History

Earlier changelog entries to be documented from workspace memories and daily logs.

## Last Updated

`2026-05-10`
