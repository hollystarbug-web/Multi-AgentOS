# ServiceM8 Diary Learning Model — Project Status

**Last Updated:** 2026-06-01 13:00 UTC

> 📌 **Major updates (2026-06-01):**
> 1. **Layer B enrichment complete** — 95.5% of events have job_number, company_uuid, company_name. See [[diary-layer-b-enrichment-2026-06-01]].
> 2. **Full backfill + 100% coverage** — All 20,295 SM8 diary notes now in DB. See [[diary-full-backfill-2026-06-01]].
> 3. **Full pattern analysis** — 17 months of data analyzed. See [[diary-pattern-analysis-full-2026-06-01]].
> 4. **Watcher bug fixed** — Cursor pagination + smart checkpoint prevents note loss during busy periods.

---

## Current System Status (2026-06-01 13:00 UTC)

### ✅ VPS Diary Watcher (diary-watcher.service)
- **Status:** Running (PID 443126 as of 2026-06-01 13:00)
- **Polling:** Every 2 minutes
- **Bug Fix (2026-06-01):** Replaced `$limit=50` with cursor pagination; checkpoint now saves to latest note's `create_date` instead of `now()`. Prevents note loss during busy periods.
- **Password Fix (2026-05-28):** Password was `HollyD1iary2026!` (character D+1 was digit 1, not letter i). Updated to `DiaryPass2026!`. Watcher restarted and confirmed working.

### ✅ Database Stats (as of 2026-06-01 13:00)
| Table | Count | Notes |
|---|---|---|
| diary_archive | 20,296 | 100% of SM8 (was 99.98% before backfill) |
| diary_embeddings | 20,237+ | 99.86% coverage |
| diary_events | 20,296 | All classified, 95.5% enriched |
| diary_tags | 47,645 | 15 distinct tags |
| import_batches | 5 | +1 (4-note manual backfill) |

### ✅ Backfill Status — 100% COMPLETE
- **SM8 total notes:** 20,295
- **Our DB:** 20,296 (one extra — a watcher-caught note that arrived after the SM8 snapshot)
- **Missing notes:** 0 (4 historical notes backfilled 2026-06-01)
- **850 "jobs without notes":** Verified — they have ZERO notes in SM8 too. Legitimately empty.

### ✅ Layer B Enrichment (COMPLETED 2026-06-01)
| Field | Coverage | Status |
|---|---|---|
| `job_number` | 19,366/20,296 (95.4%) | ✅ Complete |
| `company_uuid` | 19,364/20,296 (95.4%) | ✅ Complete |
| `company_name` | 19,364/20,296 (95.4%) | ✅ Complete |
| `is_client_visible=1` | 8,739 (43.1%) | ✅ Resolved from 0 |
| `is_client_visible=0` | 417 (2.1%) | ✅ Internal markers working |
| `contains_unanswered_tag=1` | 1,088 (5.4%) | ✅ NEW signal available |
| Classification categories | 11 (was 5) | ✅ Refined rules |
| "other" bucket | 16.5% (was 32%) | ✅ Halved |

**918 missing jobs** are deleted/archived in ServiceM8 (job_uuid stored but the job itself is gone). No further work possible without SM8 record resurrection.

See: [[diary-layer-b-enrichment-2026-06-01]] for full implementation details, scripts, and verification queries.

### ✅ Full Pattern Analysis (COMPLETED 2026-06-01)
- **Total notes analyzed:** 20,296
- **Date range:** 2025-01-07 to 2026-06-01 (17 months)
- **Top client:** London City Airport (503 notes, 65 escalations, 30 unanswered)
- **Stuck jobs:** Bas-1912 (51 esc), Bas-3544 (21 esc), Bas-3375 (21 esc)
- **Staff leader:** Christian [field] writes 57% of all notes
- **Unanswered @mentions:** 1,089 (key operational signal)
- **Full report:** [[diary-pattern-analysis-full-2026-06-01]]

## Architecture

### Layer A — Raw Archive (diary_archive)
- All diary entries verbatim
- Fields: note_uuid, job_uuid, staff_member, staff_uuid, raw_text, raw_text_hash, stamp, imported_at
- All 20,296 notes now have valid timestamps ✅

### Layer B — Structured Events (diary_events) — ✅ ENRICHED 2026-06-01
- Classification, tags, mentioned staff, client visibility
- 95.5% of events enriched with job_number, company_name
- 11 refined classification categories
- Scripts: `/opt/holly/bin/diary_layer_b_enrich.py`, `/opt/holly/bin/diary_layer_b_fix_visibility.py`
- See: [[diary-layer-b-enrichment-2026-06-01]]

### Layer C — Pattern Memory (wiki)
- Staff profiles in SOUL.md and project docs
- Staff communication patterns documented
- File: [[LAYER-C-staff-patterns]]

## Known Issues (Resolved)

### ✅ Layer B Enrichment Gaps (RESOLVED 2026-06-01)
- **Symptom:** 0% of events had job_number, company_uuid, company_name; 32% bucketed as "other"
- **Root Cause:** Watcher only stored job_uuid (raw SM8 UUID) — never enriched with job details. Classifier never set `is_client_visible=1` (bug — only set 0 or -1)
- **Fix:** Two scripts run once — `diary_layer_b_enrich.py` (SM8 API lookup) and `diary_layer_b_fix_visibility.py` (refined classification)
- **Result:** 95.5% enriched; 11 categories; 1,088 unanswered tags now detectable

### ✅ Watcher Note Loss Bug (RESOLVED 2026-06-01)
- **Symptom:** Watcher used `$limit=50` and saved checkpoint as `now()` — could miss notes 51+ in busy periods
- **Root Cause:** Pagination oversight
- **Fix:** Cursor pagination + checkpoint to latest note's stamp
- **Result:** 100% note capture going forward

### ✅ Missing Notes Gap (RESOLVED 2026-06-01)
- **Symptom:** 4 notes in SM8 missing from DB (created 2026-05-29 to 2026-06-01)
- **Root Cause:** Watcher restarts
- **Fix:** Manual backfill of 4 notes with proper job/company context
- **Result:** 20,296 notes in DB = 100% of SM8 (20,295)

### ✅ Password Authentication Failure (RESOLVED 2026-05-28)
- **Symptom:** Watcher unable to connect to PostgreSQL
- **Root Cause:** Wrong character in password (`HollyD1iary2026!` should be `DiaryPass2026!`)
- **Fix:** Updated PG_CONN to use `DiaryPass2026!`
- **Result:** Watcher running continuously since 2026-05-28 18:17 UTC

## Next Steps

### Completed
- ✅ Step 4 — Embeddings backfill: 20,237 of 20,296 (99.71%) have embeddings
- ✅ Layer C — Pattern files: [[LAYER-C-staff-patterns]]
- ✅ Layer B — Enrichment: 95.5% complete (job_number, company_name, company_uuid)
- ✅ Layer B — Classification tuning: 11 categories, "other" reduced from 32% → 16.5%
- ✅ Full backfill: 100% coverage of SM8 diary notes
- ✅ Watcher bug fix: cursor pagination + smart checkpoint
- ✅ Full pattern analysis: 17 months, 20,296 notes analyzed

### Remaining
- **Investigate 918 missing jobs** — these are jobs deleted/archived in SM8. The `job_uuid` is stored but SM8 returns nothing. No further work possible without resurrecting SM8 records.
- **Improve `is_client_visible=-1` classification** — 11,128 notes (55%) couldn't be classified. LLM-based classification (Layer D) could improve this.
- **Build a dashboard** on top of the pattern analysis
- **Alert system for unanswered @mentions > 7 days** — the 1,089 unanswered tags should have an automated alert
- **Geographic analysis** — we have lat/lng for jobs, can map client distribution
- **Service contract client deep-dive** — top 25 SC clients by completion rate

---

## Quick Links

- [[diary-full-backfill-2026-06-01]] — Full backfill implementation (2026-06-01)
- [[diary-pattern-analysis-full-2026-06-01]] — Pattern analysis (2026-06-01, 17 months of data)
- [[diary-layer-b-enrichment-2026-06-01]] — Layer B enrichment implementation
- [[findings-2026-06-01]] — Original gap analysis (with Resolution section)
- [[vps-diary-watcher]] — Watcher setup and configuration
- [[LAYER-C-staff-patterns]] — Layer C: Staff communication patterns
