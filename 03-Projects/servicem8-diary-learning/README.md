# ServiceM8 Diary Learning Model — Project Status

**Last Updated:** 2026-06-01 11:35 UTC

> 📌 **Major update (2026-06-01):** Layer B enrichment is **complete**. See [[diary-layer-b-enrichment-2026-06-01]] for full details.
>
> 95.5% of events now have `job_number`, `company_uuid`, `company_name` (was 0% before).
> 11 refined classification categories (was 5 with 32% "other").
> 1,088 unanswered @mentions detected (new business signal).
> 47,645 tag rows in `diary_tags` table (was 0).

---

## Current System Status (2026-06-01)

### ✅ VPS Diary Watcher (diary-watcher.service)
- **Status:** Running (PID 2397247 as of 2026-05-28 16:55)
- **Polling:** Every 2 minutes
- **Password Fix (2026-05-28):** Password was `HollyD1ary2026!` (character D+1 was digit 1, not letter i). Updated to `DiaryPass2026!`. Watcher restarted and confirmed working.
- **Last Poll:** 2026-05-28T16:19:21 (before password fix), resumed after restart

### ✅ Database Stats (as of 2026-06-01)
| Table | Count | Notes |
|---|---|---|
| diary_archive | 20,284 | All with valid timestamps ✅ |
| diary_embeddings | 20,237 | 99.86% coverage |
| diary_events | 20,284 | All classified, 95.5% enriched ✅ |
| diary_tags | 47,645 | 15 distinct tags (was 0 before) ✅ |
| import_batches | 4+ | Backfill runs |

### ✅ Layer B Enrichment (COMPLETED 2026-06-01)
| Field | Coverage | Status |
|---|---|---|
| `job_number` | 19,366/20,284 (95.5%) | ✅ Complete |
| `company_uuid` | 19,364/20,284 (95.5%) | ✅ Complete |
| `company_name` | 19,364/20,284 (95.5%) | ✅ Complete |
| `is_client_visible=1` | 8,739 (43.1%) | ✅ Resolved from 0 |
| `is_client_visible=0` | 417 (2.1%) | ✅ Internal markers working |
| `contains_unanswered_tag=1` | 1,088 (5.4%) | ✅ NEW signal available |
| Classification categories | 11 (was 5) | ✅ Refined rules |
| "other" bucket | 16.5% (was 32%) | ✅ Halved |

**918 missing jobs** are deleted/archived in ServiceM8 (job_uuid stored but the job itself is gone). No further work possible without SM8 record resurrection.

See: [[diary-layer-b-enrichment-2026-06-01]] for full implementation details, scripts, and verification queries.

**Gap closed:** Historical notes from 2025-01-07 to 2026-05-14 fully captured. NULL stamp issue (19,198 records) resolved by fetching all SM8 notes and updating timestamps.

### ⚠️ Embeddings Gap
- **20,237 of 20,284 notes** have embeddings (99.86%)
- **47 notes** without embeddings — empty text notes
- To re-generate embeddings for missing notes:
  ```bash
  python3 /opt/holly/bin/diary_backfill_embeddings.py  # to write
  ```

## Architecture

### Layer A — Raw Archive (diary_archive)
- All diary entries verbatim
- Fields: note_uuid, job_uuid, staff_member, staff_uuid, raw_text, raw_text_hash, stamp, imported_at
- All 20,284 notes now have valid timestamps ✅

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

### ✅ Password Authentication Failure (RESOLVED 2026-05-28)
- **Symptom:** Diary watcher failing with "password authentication failed for user holly"
- **Root Cause:** PostgreSQL password changed; diary_watcher.py had old password
- **Fix:** Updated diary_watcher.py password from `HollyD1ary2026!` to `DiaryPass2026!`, restarted service
- **Command:** `sudo systemctl restart diary-watcher`

### ✅ NULL Timestamps (RESOLVED 2026-05-28)
- **Symptom:** 19,198 notes with NULL stamp field
- **Root Cause:** Original watcher code used wrong timestamp field (stamp instead of create_date)
- **Fix:** Script `/opt/holly/bin/diary_fix_null_stamps.py` fetched all SM8 notes and updated stamps
- **Result:** 20,139 of 20,139 notes now have valid timestamps

### ✅ Historical Backfill (COMPLETED 2026-05-28)
- **Gap:** 2025-01-07 to 2026-05-14 (16 months)
- **Result:** All 20,139 notes captured; 0 new notes remain
- **Script:** `/opt/holly/bin/diary_backfill.py`
- **Duration:** ~2 minutes for full backfill

## Scheduled Tasks

### Daily Backfill CRON (3 AM)
- **Script:** `/opt/holly/bin/diary_backfill_cron.sh`
- **Schedule:** `0 3 * * *` (daily at 3 AM)
- **Lock:** `/root/.openclaw/diary/backfill.lock`
- **Complete Flag:** `/root/.openclaw/diary/backfill_complete.flag`

### Live Watcher (2-minute polling)
- **Service:** `diary-watcher.service` (systemd)
- **Poll interval:** 120 seconds
- **Checkpoint table:** `polling_checkpoint`
- **Log:** `journalctl -u diary-watcher -f`

## Staff Profiles

| Name | UUID | Pattern |
|---|---|---|
| Justin Howard | 9e0a6b5e-35a0-4993-b7fd-2244331f852b | Reviews, escalates, approves |
| Caz Howorth | 23b9df50-18dc-4a54-8f37-2244319c50fb | Acts, may not reply to tags |
| Malene Hansen | c87abc87-7665-40ef-8183-225a7efdb49b | Properly responds |
| Diogo Vasquez | f3e00f8a-7ddb-4424-a928-228a7c0ce26b | Updates without replying |
| Tom K | a5ec4657-d449-4853-b019-228a732c78fb | — |
| Mark [field] | 03c1b612-9646-4d76-bf6f-2283799b667b | — |
| Ralph [field] | d794f9d7-d705-49dc-8348-22c16dcbb7eb | — |
| Sal [field] | 2d500cac-afe8-4949-8b8d-22bcb84bbfeb | — |
| Christian [field] | f021825d-569e-4ebc-88b0-22443ce798ab | — |
| Tony [contractor] | 3cf9afaf-259c-4ce4-9eff-23b8e2b2b75b | — |

## Next Steps

### Completed
- ✅ Step 4 — Embeddings backfill: 20,237 of 20,284 (99.86%) have embeddings
- ✅ Layer C — Pattern files: [[LAYER-C-staff-patterns]]
- ✅ Layer B — Enrichment: 95.5% complete (job_number, company_name, company_uuid)
- ✅ Layer B — Classification tuning: 11 categories, "other" reduced from 32% → 16.5%

### Remaining
- **Update `diary_watcher.py` to use refined classification rules** — new notes (2026-06-01+) still get old buggy classification. 30 min effort.
- **Staff attribution backfill** — 94.7% of notes have NULL `staff_uuid` (the historical backfill used a different table structure). Long-term project, not blocking Layer B.
- **Investigate 918 missing jobs** — these are jobs deleted/archived in SM8. The `job_uuid` is stored but SM8 returns nothing. No further work possible without resurrecting SM8 records.
- **Improve `is_client_visible=-1` classification** — 11,128 notes (55%) couldn't be classified. LLM-based classification (Layer D) could improve this.

---

## Quick Links

- [[diary-layer-b-enrichment-2026-06-01]] — Layer B enrichment implementation (2026-06-01)
- [[findings-2026-06-01]] — Initial Layer B gap analysis (2026-06-01)
- [[vps-diary-watcher]] — Watcher setup and configuration
- [[LAYER-C-staff-patterns]] — Layer C: Staff communication patterns
- [[gbrain-resolver]] — How `gbrain` resolves skills (related)

---

## Step 4 — Embeddings Backfill (2026-05-28)

**Issue discovered:** Ollama `/api/embeddings` does NOT support batch prompts — `prompt` must be a single string. All scripts were using `prompt: [text1, text2, ...]` which returned 400 errors.

**Scripts fixed:**
- `diary_watcher.py` — individual Ollama calls (was batch, now single)
- `diary_backfill.py` — individual Ollama calls (was batch, now single)
- `diary_fix_null_stamps.py` — individual Ollama calls (was batch, now single)
- `diary_embeddings_backfill.py` — individual Ollama calls (rewritten)

**Embeddings backfill status (2026-05-28 18:21):**
- Running: `diary_embeddings_backfill.py` (PID 2928327)
- Notes to process: 1,130
- Progress: 100+ embeddings stored
- Target: 100% coverage (20,139 notes)

## Layer C — Staff Patterns

Written: `LAYER-C-staff-patterns.md`

Documents:
- Staff communication profiles (Justin, Caz, Malene, Diogo, Tom K, Florence)
- Response time expectations
- Anti-patterns to flag
- Coaching guidance

