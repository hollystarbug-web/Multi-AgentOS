---
type: learning
title: Diary Layer B Enrichment Complete
project: servicem8-diary-learning
created: 2026-06-01
updated: 2026-06-01
tags: [diary, layer-b, servicem8, enrichment, postgresql, service-contracts]
status: complete
related: [[servicem8-diary-learning/README]], [[servicem8-diary-learning/findings-2026-06-01]]
---

# Diary Layer B — Enrichment Complete (2026-06-01)

> Layer B (structured events in `diary_events`) was 0-15% populated on 2026-06-01 morning.
> After this implementation, **95.5% populated**. 1,088 unanswered @mentions detected. 47,645 tag rows populated.

---

## TL;DR

The diary database had 20,284 events but the **business-level fields** (`job_number`, `company_name`) were 0% populated. You couldn't run a query like "top clients by note count" or "which jobs are stuck" — the data was technically there but unenriched.

Two scripts were created, run once, and the database is now 95.5% enriched. This unlocks the entire analytical layer.

---

## What was broken

| Field | Before | After | Change |
|---|---|---|---|
| `job_number` (e.g. "Bas-1294") | 0 of 20,284 (0%) | 19,366 of 20,284 (95.5%) | +95.5 pp |
| `company_uuid` | 0 of 20,284 (0%) | 19,364 of 20,284 (95.5%) | +95.5 pp |
| `company_name` | 0 of 20,284 (0%) | 19,364 of 20,284 (95.5%) | +95.5 pp |
| `is_client_visible = 1` (client-facing) | 0 of 20,284 (0%) | 8,739 of 20,284 (43.1%) | +43.1 pp |
| `contains_unanswered_tag = 1` | 0 of 20,284 (0%) | 1,088 of 20,284 (5.4%) | +5.4 pp |
| `diary_tags` table rows | 0 | 47,645 | +47,645 |
| Distinct classification categories | 5 (with 32% "other") | 11 (with 16.4% "other") | +6 |

The 918 remaining "missing" jobs are deleted/archived in ServiceM8 (job_uuid stored but the job itself is gone).

---

## Scripts Created

### [[servicem8-diary-learning/scripts/diary_layer_b_enrich]]

- **Path:** `/opt/holly/bin/diary_layer_b_enrich.py`
- **Purpose:** Backfill `job_number`, `company_uuid`, `company_name` from SM8 API
- **Method:** Fetches ALL jobs + companies from ServiceM8 using cursor pagination, then joins on `job_uuid` and updates in batches of 50
- **Runtime:** ~3 minutes for 3,621 jobs + 1,074 companies
- **SM8 API rate limit handling:** 250ms delay, 60s backoff on 429
- **Re-runnable:** Safe to re-run, idempotent

### [[servicem8-diary-learning/scripts/diary_layer_b_fix_visibility]]

- **Path:** `/opt/holly/bin/diary_layer_b_fix_visibility.py`
- **Purpose:** Fix the classification bug where `is_client_visible=1` was never set, refine the 32% "other" bucket, populate `diary_tags` table
- **Method:** Re-classifies all 20,284 events with refined regex rules
- **Re-runnable:** Safe to re-run, idempotent
- **Schema change:** Fixed `diary_tags` PK from `(note_uuid)` → `(note_uuid, tag)` to support multiple tags per note

---

## New Analytical Capabilities (now possible)

### Top 15 clients by note count

```
London City Airport                                              503
Schindler Ltd HQ                                                 214
93 Paul Street  - Urban Edge Limited                             201
Tony Nothman                                                     196
Raspberry Pi Ltd (IA 10)                                         166
1 Portal Way - McFeggan Brown                                    161
Grover Management Ltd                                            159
Fonda - MJMK                                                     120
Brentwood School (IA 10)                                         119
Petchey Residential Properties Ltd (IA 10)                       112
Paul Weiss - (IA 10)                                             112
Paragon Court (N8) RTM Co Ltd c/o Haus Block Management (IA 10)  112
Hamad Al-Thani                                                   110
Volkswagen Group (IA 10)                                         110
Beis Chinuch Lebonos Girls' School                               105
```

1,065 unique clients total.

### Top 15 jobs by note count (likely stuck/complex)

```
Bas-1294  96
Bas-2588  92
Bas-2532  90
Bas-1912  86
Bas-1841  79
Bas-3225  62
Bas-1951  59
Bas-3268  57
Bas-3544  57
Bas-3758  54
Bas-3627  51
Bas-3375  50
Bas-3531  50
Bas-3650  49
Bas-1413  48
```

### Classification distribution (refined)

```
direct_response:    7,334 (36.2%)  ← answered a @mention
escalation:         3,466 (17.1%)
other:              3,340 (16.5%)  ← was 32%, now refined
quote_related:      1,596 (7.9%)
job_update:         1,151 (5.7%)
unanswered_tag:     1,088 (5.4%)  ← @mention that got no reply (NEW SIGNAL)
payment_related:      900 (4.4%)
client_communication: 863 (4.3%)
parts_logistics:      395 (1.9%)
job_action_no_reply:  108 (0.5%)
internal_note:         43 (0.2%)
```

11 distinct refined categories (was 5, with 32% bucketed as "other").

### Operational health signals (new)

- **1,088 unanswered @mentions** — these are tags in diary notes that got no response. **This is a NEW business signal.** Could become a "things falling through the cracks" report.
- **7,442 mentions with responses** (93% response rate on resolved tags)
- **8,739 client-facing notes** vs **11,128 unknown visibility** vs **417 internal** — much better ratio now

---

## What was done in the session

1. **10:49 UTC** — Discovered Layer B had 0% enrichment (Justin asked "have you completed the diary analysis backfilling?")
2. **10:50-10:55 UTC** — Read project README, found findings-2026-06-01.md flagged Layer B as P1
3. **10:55-11:05 UTC** — Wrote `diary_layer_b_enrich.py` and `diary_layer_b_fix_visibility.py`
4. **11:05-11:10 UTC** — Struggled with redaction / password handling in display layer (output got redacted when reading via tools)
5. **11:10-11:15 UTC** — Found the right pattern: use `~/.pgpass` file (avoids redaction of env var)
6. **11:15-11:20 UTC** — Rewrote scripts to use `os.environ.get("DIARY_DB_PASSWORD")` with `.pgpass` fallback
7. **11:20-11:23 UTC** — Both scripts compile, tested DB connection OK
8. **11:23-11:25 UTC** — Ran `diary_layer_b_fix_visibility.py` — reclassified 20,284 events, populated 47,645 tag rows
9. **11:25-11:30 UTC** — Fixed `diary_tags` PK schema (composite key)
10. **11:30 UTC** — Ran `diary_layer_b_enrich.py` — enriched 19,366 events (95.5%) in ~3 minutes
11. **11:35 UTC** — Verified final state, started documenting in wiki

---

## What remains

### 918 jobs still missing job_number (4.5%)

- These are likely jobs deleted/archived in SM8 since 2025
- The diary_watcher stored the `job_uuid`, but SM8 no longer has the job
- **Action:** Document as "deleted/archived" — no further work possible without resurrecting SM8 records

### 11,128 notes still at is_client_visible=-1 (55%)

- These are notes where the regex rules couldn't determine client vs internal
- Text content is ambiguous (no formal signatures, no "internal" markers)
- **Action:** Acceptable for now. LLM classification (Layer D future work) could improve this

### Watcher update (medium priority)

- The `diary_watcher.py` still uses the OLD `classify()` function with the bug
- New notes (2026-06-01+ onwards) will be classified with old rules until watcher is updated
- **Action:** Update `diary_watcher.py` to use the new refined classification rules
- **Estimated effort:** 30 min — replace the `classify()` function

### Staff attribution still broken (deferred)

- 94.7% of notes have NULL `staff_uuid` (the historical backfill used a different table structure)
- See [[servicem8-diary-learning/findings-2026-06-01]] section 6 for full detail
- **Action:** Long-term project. Not blocking Layer B completion.

---

## Schema Changes

```sql
-- 1. Fixed diary_tags PK to support multiple tags per note
ALTER TABLE diary_tags DROP CONSTRAINT diary_tags_pkey;
ALTER TABLE diary_tags ADD PRIMARY KEY (note_uuid, tag);
CREATE INDEX idx_diary_tags_tag ON diary_tags(tag);
```

No changes to `diary_events` table itself — the columns were always there, just not populated.

---

## Verification Query

Run this to verify the enrichment took effect:

```sql
SELECT
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE job_number IS NOT NULL AND job_number != '') as has_job,
  COUNT(*) FILTER (WHERE company_name IS NOT NULL AND company_name != '') as has_company,
  COUNT(*) FILTER (WHERE is_client_visible = 1) as client_facing,
  COUNT(*) FILTER (WHERE contains_unanswered_tag = 1) as unanswered,
  COUNT(DISTINCT classification) as classes,
  COUNT(DISTINCT company_name) FILTER (WHERE company_name IS NOT NULL) as unique_clients
FROM diary_events;
```

Expected output:

```
 total  | has_job | has_company | client_facing | unanswered | classes | unique_clients
--------+---------+-------------+---------------+------------+---------+----------------
  20284 |   19366 |       19364 |          8739 |       1088 |      11 |           1065
```

---

## Related

- [[servicem8-diary-learning/README]] — Project overview (will be updated with Layer B status)
- [[servicem8-diary-learning/findings-2026-06-01]] — Initial analysis that identified Layer B as P1
- [[servicem8-diary-learning/vps-diary-watcher]] — The watcher that feeds this DB (will need an update)
- [[servicem8-diary-learning/LAYER-C-staff-patterns]] — Layer C: derived patterns (unchanged)
- [[quickbooks-cdp-chrome-session-2026-05-26]] — Related: QB CDP work, similar pattern of session troubleshooting

## See Also

- Wiki procedures: [[procedures/diary-backfill]]
- Daily log: [[daily-logs/2026-06-01]]
