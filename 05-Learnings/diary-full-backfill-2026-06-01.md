---
type: learning
title: Full Diary Backfill — 100% Coverage Achieved
project: servicem8-diary-learning
created: 2026-06-01
updated: 2026-06-01
tags: [diary, backfill, servicem8, completeness-audit, watcher-fix]
status: complete
data_source: diary database, ServiceM8 API
related: [[diary-pattern-analysis-full-2026-06-01]], [[diary-layer-b-enrichment-2026-06-01]]
---

# Full Diary Backfill — 2026-06-01

> 📌 **Outcome:** 100% of ServiceM8 diary notes now in the local diary database. 4 historical notes backfilled. Watcher bug fixed for ongoing capture.

---

## TL;DR

| What | Status |
|---|---|
| SM8 total notes | 20,295 |
| Our DB before | 20,291 |
| **Our DB after** | **20,295 (100%)** |
| Historical notes backfilled | 4 |
| Watcher bug fixed | ✓ (cursor pagination + smart checkpoint) |

The "850 jobs without notes" turned out to be a false alarm — those jobs have ZERO notes in SM8 too. Verified via direct API check on 2026-06-01.

---

## What Was Found

### Phase 1 — Gap Audit

Started with the assumption that 850 SM8 jobs were "missing" diary notes. Did a full audit:

- **Method:** For each of the 849 jobs without notes, queried SM8 `/note.json?related_object_uuid=...`
- **Concurrent workers:** 4 threads (to respect rate limits)
- **Result:** **849 of 849 have ZERO notes in SM8.** No backfill needed for those jobs.

### Phase 2 — Actual Notes Gap

Used a different method — fetched all 20,295 notes from SM8 with `$cursor=-1`, compared against DB:

- **SM8 notes:** 20,295
- **DB notes:** 20,291
- **Missing:** 4
- **All 4 were created between 2026-05-29 and 2026-06-01** — during watcher restart windows

### Phase 3 — Backfill the 4 Missing Notes

Wrote a one-off script to backfill the 4 missing notes:

```
ba6a221e (2026-05-29 13:46:38) - On Friday, May 29, 2026 at 8:29 PM <mpearson@pears
149af3ed (2026-05-29 15:30:58) - Hi Jon, We will actually be on site now around
6df4300a (2026-06-01 09:12:30) - @Florence just spoke to them and the items has not
759af6ab (2026-06-01 11:21:53) - Wrong button, arrow required with the same connect
```

All 4 were inserted into `diary_archive` and `diary_events` with proper job_number, company_uuid, staff attribution, and classification.

### Phase 4 — Watcher Bug Fix

Found and fixed a real bug in `/opt/holly/bin/diary_watcher.py`:

**Bug:** The watcher used `$limit=50` for the notes API, then saved the checkpoint as `datetime.now()`. If more than 50 new notes appeared in 2 minutes, the ones beyond 50 would be missed (because the checkpoint advanced past them).

**Fix:** Switched to cursor pagination (`$cursor=-1` + follow `x-next-cursor` header) with `$limit=1000`. Also changed the checkpoint logic to save the LATEST NOTE'S `create_date` instead of `now()` — this prevents skipping notes created between the latest note and the poll completion.

**Code change (in `poll()`):**
- Old: `$limit=50`, checkpoint = `now()`
- New: `$limit=1000` + cursor pagination, checkpoint = `max(note.create_date)`

**Tested:** Watcher restarted, immediately caught 1 new note. Working correctly.

### Phase 5 — Full Backfill Script (Created, Not Needed)

Wrote `/opt/holly/bin/diary_full_backfill.py` for the case where a full backfill IS needed (e.g., after a database loss or to re-import from a different SM8 account). It:

- Fetches ALL jobs from SM8 with cursor pagination
- For each job, fetches all notes
- Inserts into `diary_archive` and `diary_events` (with full classification logic)
- Skips notes that already exist (idempotent)
- Resumable (tracks progress in `import_batches`)
- Records job_number and company_uuid from the SM8 job record
- **Tested** on Bas-1294 (96 notes) — inserted 0 (all already in DB), confirming idempotency

This script is now available for future use but wasn't run for the full 3,941 jobs since we only had 4 missing notes.

---

## Verification Queries

```sql
-- 1. Are we 100% complete?
SELECT 
  (SELECT COUNT(*) FROM diary_events) as db_notes,
  -- Get SM8 count separately (it was 20,295 on 2026-06-01)
  20295 as sm8_notes_target,
  (20295 - (SELECT COUNT(*) FROM diary_events)) as gap;
-- Expected: gap = 0 (or near zero, since live watcher may add 1-2 per poll cycle)

-- 2. The 850 "missing" jobs are legitimately empty
-- (verified via direct API check, not in SQL)

-- 3. Watcher is running
-- systemctl status diary-watcher.service
-- Expected: active (running)

-- 4. No more "phantom" gaps
SELECT 
  COUNT(DISTINCT job_uuid) FILTER (WHERE job_number IS NULL OR job_number = '') as jobs_missing_number,
  COUNT(DISTINCT job_uuid) FILTER (WHERE company_uuid IS NULL OR company_uuid = '') as jobs_missing_company
FROM diary_events;
-- Expected: 0, 0 (post Layer B enrichment)
```

---

## Lessons Learned

### Rule: Always verify the "gap" is real

I started with the assumption that "850 jobs without notes" was a major backfill problem. The audit revealed that 100% of those jobs have ZERO notes in SM8 too. **Before doing hours of work, verify the gap is real.**

### Rule: Don't use `$limit=N` for polling

If a polling endpoint returns up to N items, and you advance your checkpoint to "now" after fetching, you'll miss items 51+ that arrived between your latest item and "now". Use cursor pagination and save checkpoint to the latest ITEM's timestamp, not the poll's completion time.

### Rule: Historical data quality differs from live data

The 4 missing notes were ALL from the last 4 days, not from 2025-2026 historical data. Historical data is more complete (from the original import) — recent data has more gaps (during restarts/deploys).

---

## Files

- **Backfill script:** `/opt/holly/bin/diary_full_backfill.py` (16.8KB, ready for future use)
- **Watcher fix:** `/opt/holly/bin/diary_watcher.py` (function `poll()` rewritten)
- **Systemd service:** `/etc/systemd/system/diary-watcher.service` (no change)
- **Watcher log:** `/root/.openclaw/diary/watcher.log`
- **Full backfill log:** `/root/.openclaw/diary/full_backfill.log` (created, unused)

## Related

- [[diary-pattern-analysis-full-2026-06-01]] — Full pattern analysis on 20,295 notes
- [[diary-layer-b-enrichment-2026-06-01]] — Job/company enrichment (95.5% complete)
- [[servicem8-diary-learning/README]] — Project status overview
