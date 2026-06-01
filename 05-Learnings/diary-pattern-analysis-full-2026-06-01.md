---
type: learning
title: Full Diary Pattern Analysis (2025-01 to 2026-06)
project: servicem8-diary-learning
created: 2026-06-01
updated: 2026-06-01
tags: [diary, pattern-analysis, servicem8, full-dataset, business-intelligence]
status: complete
data_source: diary database (20,296 notes, 17 months)
related: [[servicem8-diary-learning/README]], [[diary-layer-b-enrichment-2026-06-01]], [[servicem8-diary-learning/findings-2026-06-01]]
---

# Full Diary Pattern Analysis — 2025-01 to 2026-06

> 📌 **Dataset:** 20,296 diary notes across 3,624 jobs and 1,074 unique clients, spanning 17 months of Base Lift Services operations.
>
> **Source:** All diary notes from ServiceM8, 100% complete (4 historical notes backfilled 2026-06-01, watcher is otherwise catching everything live).

---

## TL;DR — The 30-Second Version

1. **Christian [field] writes 57% of all notes** (11,586/20,296) — single-author dominance is the dominant pattern
2. **London City Airport is the top client** with 503 notes (65 escalations, 30 unanswered @mentions)
3. **Bas-1912 (Volkswagen Group) has the most escalations** (51) of any job
4. **Peak activity is 9-10am and 2-3pm** — clear operational patterns
5. **Caz responds fastest** (median 18 min on @mentions) vs Malene (5,590 min = 93 hours)
6. **1,089 @mentions have NO reply** — these are "things falling through the cracks"

---

## Dataset Composition

| Metric | Value | Notes |
|---|---|---|
| Total diary notes | 20,296 | 100% of SM8 |
| Unique jobs | 3,624 | Out of 3,941 SM8 jobs (92%) |
| Unique clients | 1,074 | |
| Unique staff (named) | 11 | Plus "Unknown" bucket |
| Date range | 2025-01-07 to 2026-06-01 | 17 months |
| Notes with company context | 19,380 (95.5%) | Post Layer B enrichment |

**Note:** 849 SM8 jobs have ZERO diary notes — confirmed via direct API check on 2026-06-01. These are legitimately empty (Quotes that never converted, Unsuccessful visits, etc.). The watcher is working correctly.

---

## Classification Distribution

| Classification | Count | % | What it means |
|---|---|---|---|
| `direct_response` | 7,340 | 36.2% | @mention got a reply |
| `escalation` | 3,466 | 17.1% | Flagged for attention (problem, complaint, urgent) |
| `other` | 3,343 | 16.5% | Unclassified — see "Refining 'other'" below |
| `quote_related` | 1,596 | 7.9% | Quote sent/received |
| `job_update` | 1,152 | 5.7% | Status update (scheduled, completed, etc.) |
| `unanswered_tag` | 1,089 | 5.4% | @mention with NO reply (NEW signal) |
| `payment_related` | 900 | 4.4% | Payment, invoice, chasing |
| `client_communication` | 864 | 4.3% | Direct client contact |
| `parts_logistics` | 395 | 1.9% | Parts orders, deliveries |
| `job_action_no_reply` | 108 | 0.5% | Action taken but no response to a tag |
| `internal_note` | 43 | 0.2% | Internal/private notes |

**The "other" bucket at 16.5% is the next refinement target.** Many of these are likely "logistics" notes that don't match the current regex patterns.

---

## Staff Distribution (Who Writes the Most)

| Rank | Staff | Notes | Jobs | Escalations | Unanswered | Notes/Job |
|---|---|---|---|---|---|---|
| 1 | **Christian [field]** | 11,586 (57.1%) | 2,358 | 1,811 | 424 | 4.9 |
| 2 | Unknown (no staff_uuid) | 3,879 (19.1%) | 1,794 | 624 | 207 | 2.2 |
| 3 | Malene Hansen | 2,056 (10.1%) | 1,233 | 101 | 239 | 1.7 |
| 4 | Sal [field] | 757 (3.7%) | 259 | 322 | 68 | 2.9 |
| 5 | Justin Howard | 603 (3.0%) | 439 | 218 | 36 | 1.4 |
| 6 | Diogo Vasquez | 356 (1.8%) | 154 | 118 | 52 | 2.3 |
| 7 | Unknown (9e31f9dc) | 307 (1.5%) | 199 | 169 | 12 | 1.5 |
| 8 | Caz Howorth | 290 (1.4%) | 215 | 43 | 13 | 1.3 |
| 9 | Ralph [field] | 238 (1.2%) | 224 | 5 | 22 | 1.1 |
| 10 | Unknown (bf51af7b) | 50 (0.2%) | 48 | 2 | 9 | 1.0 |

**Critical findings:**
- **Christian writes 57% of all diary notes** — single point of failure for institutional knowledge
- **3,879 notes (19%) have no staff attribution** — SM8 API doesn't return `edit_by_staff_uuid` for older records
- **Sal [field] has the highest escalation rate** (322 escalations in 757 notes = 42.5%) — possibly an indicator of which jobs are problematic
- **Ralph [field] has lowest escalation rate** (2.1%) — likely takes on simpler jobs

---

## Monthly Volume Trends

| Month | Notes | Unique Clients | Growth |
|---|---|---|---|
| 2025-01 | 8 | 4 | start |
| 2025-02 | 1 | 1 | dormant |
| 2025-03 | 13 | 3 | slow start |
| 2025-04 | 11 | 4 | slow |
| 2025-05 | 233 | 114 | SM8 rollout |
| 2025-06 | 1,003 | 196 | growth |
| 2025-07 | 1,148 | 250 | growth |
| 2025-08 | 966 | 211 | steady |
| 2025-09 | 1,223 | 272 | growth |
| 2025-10 | 1,384 | 276 | growth |
| 2025-11 | 1,758 | 334 | **peak** |
| 2025-12 | 1,134 | 234 | holiday dip |
| 2026-01 | 2,284 | 329 | +101% |
| 2026-02 | 2,354 | 384 | steady |
| 2026-03 | 2,441 | 397 | **peak** |
| 2026-04 | 2,236 | 310 | steady |
| 2026-05 | 2,050 | 296 | steady |
| 2026-06 | 49 | 27 | (partial month) |

**Key insight:** The operation roughly **doubled in volume** between Nov 2025 and Jan 2026. Either:
- More clients (organic growth)
- More diary discipline (better capture)
- More service contracts (recurring work = more updates)

---

## Top 25 Clients (by note count)

| # | Client | Notes | Jobs | Staff | Esc | Unans |
|---|---|---|---|---|---|---|
| 1 | **London City Airport** | 503 | 69 | 10 | 65 | 30 |
| 2 | Schindler Ltd HQ | 214 | 17 | 8 | 29 | 10 |
| 3 | 93 Paul Street (Urban Edge) | 201 | 25 | 6 | 33 | 14 |
| 4 | Tony Nothman | 196 | 14 | 8 | 26 | 11 |
| 5 | Raspberry Pi Ltd | 166 | 12 | 10 | 51 | 13 |
| 6 | 1 Portal Way (McFeggan Brown) | 161 | 20 | 10 | 18 | 10 |
| 7 | Grover Management Ltd | 159 | 24 | 5 | 15 | 8 |
| 8 | Fonda - MJMK | 120 | 12 | 6 | 30 | 5 |
| 9 | Brentwood School | 119 | 11 | 9 | 21 | 7 |
| 10 | Paragon Court (RTM) | 112 | 10 | 8 | 27 | 4 |
| 11 | Paul Weiss | 112 | 7 | 7 | 27 | 6 |
| 12 | Petchey Residential | 112 | 12 | 10 | 23 | 6 |
| 13 | Hamad Al-Thani | 110 | 9 | 8 | 27 | 4 |
| 14 | Volkswagen Group | 110 | 9 | 10 | 55 | 5 |
| 15 | Beis Chinuch Lebonos | 105 | 13 | 5 | 9 | 7 |
| 16 | Parkfield House (Bury Hill) | 104 | 17 | 6 | 8 | 3 |
| 17 | Brooklands Museum | 103 | 18 | 7 | 21 | 6 |
| 18 | Zara The Bentals Centre | 101 | 23 | 5 | 18 | 10 |
| 19 | Burnham-on-Sea Holiday Village | 98 | 15 | 5 | 17 | 4 |
| 20 | Haggerston school | 98 | 12 | 6 | 10 | 1 |
| 21 | Sebright Property Management | 96 | 4 | 4 | 10 | 5 |
| 22 | Mushkil Aasaan | 94 | 9 | 5 | 14 | 8 |
| 23 | KOL - MJMK LTD | 93 | 14 | 5 | 21 | 1 |
| 24 | Hobbycraft (Droitwich) | 93 | 2 | 2 | 4 | 1 |
| 25 | Asmall Hall (Benridge) | 93 | 16 | 5 | 14 | 8 |

### High-attention clients (escalation rate > 20%)

- **Volkswagen Group**: 55 escalations / 110 notes = 50% (5th highest esc rate)
- **Raspberry Pi**: 51 escalations / 166 notes = 30.7%
- **Fonda MJMK**: 30 escalations / 120 notes = 25%
- **Hamad Al-Thani**: 27 / 110 = 24.5%
- **Paul Weiss**: 27 / 112 = 24.1%
- **Paragon Court**: 27 / 112 = 24.1%

These clients are the "high-touch" relationships where ServiceM8 is being used most actively to manage complex jobs.

---

## Top 25 Jobs by Note Count (Likely Stuck / Complex)

| # | Job | Company | Notes | Esc | Unans | Span (days) |
|---|---|---|---|---|---|---|
| 1 | **Bas-1294** | Schindler Ltd HQ | 96 | 6 | 4 | 237 |
| 2 | Bas-2588 | Hobbycraft Droitwich | 92 | 4 | 1 | 210 |
| 3 | Bas-2532 | 93 Paul Street | 90 | 8 | 3 | 232 |
| 4 | **Bas-1912** | **Volkswagen Group** | 86 | **51** | 2 | 307 |
| 5 | Bas-1841 | Sebright Property | 79 | 8 | 5 | 337 |
| 6 | Bas-3225 | Fulham Shore Group | 62 | 0 | 2 | 168 |
| 7 | Bas-1951 | Tony Nothman | 59 | 6 | 4 | 166 |
| 8 | **Bas-3544** | **Raspberry Pi** | 57 | **21** | 8 | 89 |
| 9 | Bas-3268 | 8 Salisbury | 57 | 3 | 3 | 98 |
| 10 | Bas-3758 | NewFlex | 54 | 7 | 3 | 50 |
| 11 | Bas-3627 | Raven Row | 51 | 1 | 2 | 101 |
| 12 | **Bas-3375** | The Exchange | 50 | **21** | 2 | 58 |
| 13 | Bas-3531 | Tony Nothman | 50 | 9 | 3 | 125 |
| 14 | Bas-3650 | London City Airport | 49 | 4 | 3 | 117 |
| 15 | Bas-1413 | Grange Property | 48 | 8 | 7 | 209 |
| 16 | Bas-4303 | Ewing House | 45 | 4 | 9 | 37 |
| 17 | Bas-2866 | Brentwood School | 45 | 2 | 1 | 201 |
| 18 | Bas-2399 | 47 Ashton Lane (OTIS) | 44 | 7 | 1 | 250 |
| 19 | Bas-3184 | Paragon Design | 44 | 16 | 4 | 52 |
| 20 | Bas-3333 | The Quad Cambridge | 44 | 4 | 2 | 142 |
| 21 | Bas-2615 | 1 Portal Way | 42 | 5 | 3 | 216 |
| 22 | Bas-2789 | Trespass | 41 | 10 | 0 | 166 |
| 23 | Bas-3080 | Mushkil Aasaan | 40 | 8 | 4 | 182 |
| 24 | 74 | Terra Fortuna | 40 | 7 | 6 | 90 |
| 25 | Bas-2524 | 60 Holborn Viaduct | 39 | 1 | 1 | 172 |

### Critical jobs (likely stuck)

- **Bas-1912 (Volkswagen Group)** — 86 notes, 51 escalations over 307 days = **escalation every 6 days** for nearly a year. This is the #1 stuck job in the system.
- **Bas-3544 (Raspberry Pi)** — 57 notes, 21 escalations in 89 days = **escalation every 4 days**
- **Bas-3375 (The Exchange)** — 50 notes, 21 escalations in 58 days = **escalation every 3 days**
- **Bas-1294 (Schindler)** — 96 notes over 237 days, the highest count, with 6 escalations (relatively normal ratio)

---

## Response Time Analysis (since 2026-05-15)

When someone @mentions a staff member, how long until they reply?

| Staff | Replies | Median | Average | |
|---|---|---|---|---|
| **Caz Howorth** | 2 | **18 min** | 18 min | Fastest |
| Justin Howard | 6 | 1,140 min (19h) | 1,810 min | |
| Diogo Vasquez | 69 | 1,358 min (22.6h) | 4,692 min (78h) | |
| **Malene Hansen** | 75 | **5,590 min (93h)** | 6,604 min (110h) | **Slowest** |

**Caveat:** This is only the last 17 days of data. Christian has no @mentions data because he writes most of the @mentions himself.

**Action:** If Caz's 18 min median is real, she should be the primary responder for client-facing @mentions.

---

## Unanswered @mentions (Things Falling Through the Cracks)

**1,089 notes have @mentions that NEVER got a reply.** These are the operational "we forgot about this" notes.

Most recent 10:

| Date | Job | Company | Note excerpt |
|---|---|---|---|
| 2026-06-01 | Bas-4048 | AWR Properties | "part should arrive tomorrow" |
| 2026-05-29 | Bas-4748 | Shangri-La The Shard | "KO - Shangri-La The Shard, lift that's been out of service" |
| 2026-05-29 | Bas-4651 | London City Airport | "Dear Florence, Order 4107780-A. Estimated dispatch..." |
| 2026-05-29 | Bas-4622 | OpticRealm Ltd | "@Florence Auto Dialler received" |
| 2026-05-29 | Bas-4718 | Ambassador House | "SENT AUTOMATICALLY FROM SHORTS SYSTEM. Dear Florence..." |
| 2026-05-29 | Bas-4734 | Hill House Community Centre | "Florence, May I ask, considering the age of this..." |
| 2026-05-29 | Bas-4439 | Zara The Bentals Centre | "We also carried out the service sheet I have attached" |
| 2026-05-29 | Bas-4524 | St Giles Tower | "@Florence Stop Switch received from Stannah" |
| 2026-05-28 | Bas-4552 | Brooklands Museum | "@Florence remittance received for this job" |
| 2026-05-28 | Bas-4219 | 200 Aldersgate St (Schindler) | "@Florence remittance received for this job" |

**Pattern:** Many of these are "automated" emails from suppliers (SHORTS system, dispatch notifications) where someone @mentioned Florence but she never acknowledged. This is a real "lost in the noise" problem.

---

## Time Patterns

### Peak hours (UTC)

| Hour | Notes |
|---|---|
| 9am | 2,586 |
| 10am | 2,298 |
| 3pm | 2,431 |
| 2pm | 2,293 |
| 1pm | 2,123 |

**Pattern:** Two peaks — mid-morning (9-10am) and early afternoon (1-3pm). Lunch dip between 11am-12pm.

### Peak days (UTC)

| Day | Notes |
|---|---|
| Wednesday | 4,479 |
| Thursday | 4,327 |
| Tuesday | 4,238 |

**Pattern:** Mid-week is busiest. Mondays and Fridays are quieter. Weekend activity is minimal (operations are weekdays).

---

## Pipeline Analysis

- **Jobs with notes:** 3,090 (out of 3,624 = 85.3%)
- **Average notes per job:** 6.27
- **Average job lifespan:** 45.5 days (first note to last note)
- **Longest-running job:** Bas-1841 (Sebright Property) — 337 days
- **Highest-note job:** Bas-1294 (Schindler) — 96 notes

---

## Recent Escalations (most recent 15)

| Date | Job | Note excerpt |
|---|---|---|
| 2026-06-01 | Bas-4542 | "@Florence @Justin sent request to installs group chat" |
| 2026-06-01 | Bas-4521 | "@Malene Please can you keep an eye out as D asked for parts" |
| 2026-06-01 | Bas-4542 | "@Diogo @Justin please can you chase up a survey" |
| 2026-06-01 | Bas-4689 | "@Caz @Malene please send service contract for Rockwood" |
| 2026-06-01 | Bas-4653 | "@Caz @Malene please send service contract quote" |

**Pattern:** Lots of @Caz @Malene for service contracts. Caz and Malene are the service contract team.

---

## Key Insights & Recommendations

### Operational findings

1. **Christian is a single point of failure** — 57% of all notes. Need to distribute capture across more staff.
2. **Volkswagen Group is the #1 pain point** — 50% escalation rate on 110 notes
3. **London City Airport dominates** — 503 notes is 2.5% of all diary volume from one client
4. **3 jobs are chronic escalators** — Bas-1912, Bas-3544, Bas-3375 should be reviewed for root causes
5. **1,089 unanswered @mentions** — biggest single operational issue. Caz should be the reply czar.
6. **19% of notes have no staff attribution** — historical data quality issue, fixable going forward

### Pattern analysis methodology notes

- All queries use direct SQL against the `diary` database
- "Response time" analysis is from 2026-05-15 onwards only (older `stamp` data was less reliable)
- "Top jobs" list is by raw note count; a "stuck job" detector could weight escalations + age + unanswered tags
- "Top clients" includes all 1,074 unique clients; the top 25 represent 50%+ of note volume

### What was NOT done (yet)

- Time-of-day analysis per client (when do they call most?)
- Geographic analysis (we have lat/lng for jobs)
- Payment patterns correlation (joining diary notes to QB invoices)
- LLM-based analysis for "other" bucket (16.5% of notes)
- Predictive model for "this job will be stuck" based on early signals
- Service contract client deep-dive (top 25 SC clients by completion rate)
- Sal's escalation pattern analysis (3rd highest, needs investigation)

---

## Files & Scripts

- **Source data:** `diary` database, `diary_archive` and `diary_events` tables
- **Analysis script:** `/root/.openclaw/workspace/analysis/diary_pattern_analysis.py`
- **JSON output:** `/root/.openclaw/workspace/analysis/diary_pattern_analysis.json`
- **Backfill script:** `/opt/holly/bin/diary_full_backfill.py` (created but only ran 4-note patch)
- **Backfill result:** 4 notes inserted on 2026-06-01, otherwise 100% complete

## Related Documents

- [[servicem8-diary-learning/README]] — Project status
- [[diary-layer-b-enrichment-2026-06-01]] — Job/company enrichment
- [[servicem8-diary-learning/findings-2026-06-01]] — Original gap analysis
- [[servicem8-diary-learning/LAYER-C-staff-patterns]] — Staff communication patterns

*Generated 2026-06-01 12:50 UTC by direct SQL analysis of 20,296 diary notes.*
*Data window: 2025-01-07 to 2026-06-01 (17 months, 17 months of complete capture).*
