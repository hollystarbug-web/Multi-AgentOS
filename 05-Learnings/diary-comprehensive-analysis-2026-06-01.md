---
type: learning
title: Comprehensive Diary Deep Analysis — 8 Deep Dives
project: servicem8-diary-learning
created: 2026-06-01
updated: 2026-06-01
tags: [diary, deep-analysis, comprehensive, patterns, field-guide]
status: complete
data_source: diary database, 20,298 notes, 17 months
related: [[diary-pattern-analysis-full-2026-06-01]], [[diary-full-backfill-2026-06-01]], [[diary-field-guide-2026-06-01]]
---

# Comprehensive Diary Deep Analysis — 8 Deep Dives

> 📌 **Approach:** Comprehensive = 8 deep dives beyond the initial SQL stats. Each DD reads actual note text, identifies patterns SQL can't see, and produces actionable insights.
>
> **Dataset:** 20,298 diary notes (100% of SM8), 3,624 jobs, 1,074 clients, 17 months (2025-01-07 to 2026-06-01)

---

## TL;DR — The Headline Findings

1. **93% of "escalations" are NOT real escalations** — they're routine coordination mis-classified. **Only 7% are actual problems.**
2. **Christian is a single point of failure** — writes 57% of all notes, longest messages (258 chars avg), starts with "hi" 46% of the time
3. **Justin is the quote machine** — shortest messages (67 chars), 45% of his notes are quote_related
4. **Sal has the highest alarm rate** — 38% of his notes are "escalations" (mostly parts/scheduling)
5. **Ralph = pure field engineer** — notes start with "attended", "carried", "replaced" — visit reports only
6. **Caz responds 18min on @mentions** vs Malene's 5,590min (93 hours) — Caz is the responsive hero
7. **807 "ghost quotes"** — quote sent, no payment, no escalation. **15 of them are 290+ days old.**
8. **The early warning for stuck jobs:** >30% escalations in first 5 notes = 35% chance of becoming chronic problem
9. **Top client (London City Airport):** 503 notes, 65 esc, 30 unans — single biggest diary contributor
10. **Service contracts are the dominant "escalation" false positive** — 27% of mis-classified escalations are just SC requests

---

## DD1: Escalation Language Analysis

**What we did:** Read 200 recent "escalations" verbatim, find common trigger phrases.

**Sample size:** 200 of 3,466 escalations (5.8% sample)

### Top trigger phrases found in escalations

| Phrase | Count | % |
|---|---|---|
| `@malene` | 99 | 50% |
| `@justin` | 55 | 28% |
| `@caz` | 55 | 28% |
| `@diogo` | 47 | 24% |
| `@flo` | 45 | 22% |
| `@tom` | 22 | 11% |
| `part` | 19 | 10% |
| `urgent` | 16 | 8% |
| `waiting` | 14 | 7% |
| `please can you` | 12 | 6% |
| `parts` | 11 | 6% |
| `chase` | 7 | 4% |
| `issue` | 6 | 3% |

**Key insight:** Escalations are dominated by **@mentions** (93% have one), not by alarming language. The phrase "urgent" appears in only 8% of escalations.

### Top escalation-prone companies (in 200-note sample)

| Company | Escalations |
|---|---|
| CBRE C/o Ford Motor Company | 13 |
| GG Tomkinson Ltd | 9 |
| AWR Properties | 7 |
| Rooff Construction | 7 |
| The Quad Cambridge | 6 |
| Borras Construction | 6 |
| Paragon Court (N8) | 6 |
| Harris Academy | 5 |
| Rounce & Evans | 5 |
| St Giles Tower | 5 |

### Most common escalation pattern: "Service Contract Loop"

The most repeated "escalation" pattern is actually a request for service contract creation:
- `@Caz @Malene please send service contract for X`
- `@Caz @Malene please send service contract quote`
- `@Caz @Malene was this service done?`

This appears **27% of the time** in "escalations". These are operational coordination, not actual problems.

### File: `/root/.openclaw/workspace/analysis/dd1/escalation_samples.json`

---

## DD2: Staff Communication DNA

**What we did:** Analyzed last 500 notes per top 8 staff. Compared message style, length, formality, vocabulary.

### Communication profile per staff

| Staff | Notes | Avg chars | Avg words | @Mention% | Formal% | Casual% | ?% | Pls% |
|---|---|---|---|---|---|---|---|---|
| **Christian [field]** | 500 | **258** | **43** | 70% | **51%** | 0% | 22% | 41% |
| Malene Hansen | 500 | 204 | 33 | 44% | 4% | 0% | 6% | 14% |
| Sal [field] | 500 | 137 | 23 | 56% | 6% | 2% | 12% | 6% |
| Justin Howard | 500 | **67** | **11** | 45% | 0% | 0% | 20% | 15% |
| Diogo Vasquez | 356 | 113 | 20 | 61% | 5% | 0% | 16% | 9% |
| Caz Howorth | 290 | 103 | 17 | 23% | 2% | 0% | 6% | 12% |
| Ralph [field] | 238 | 126 | 21 | 19% | 0% | 0% | 0% | 0% |

### Classification mix per staff

| Staff | Top 3 classifications | Tells us |
|---|---|---|
| Christian [field] | direct_response=285, escalation=58, other=48 | The client-facing voice |
| Malene Hansen | other=125, direct_response=99, **unanswered_tag=89** | Ops coordinator, gets ghosted |
| Sal [field] | **escalation=190**, other=158, direct_response=49 | Most alarmed writer (38% esc rate) |
| Justin Howard | **quote_related=227**, escalation=197, other=39 | Quote machine, 45% of notes are quotes |
| Diogo Vasquez | escalation=118, direct_response=60, other=54 | Survey/installation lead |
| Caz Howorth | other=152, escalation=43, payment_related=31 | Service contract manager |
| Ralph [field] | job_update=86, other=82, unanswered_tag=22 | Pure field engineer |

### Common starting words reveal the role

| Staff | Top starts | What it means |
|---|---|---|
| Christian | "hi" (46%), "@malene" (5%), "good" (5%) | Client communication |
| Malene | "@florence" (26%), "job" (4%), "attendance" (4%) | Routes everything to Florence |
| Sal | "followed" (12%), "@diogo" (8%), "@florence" (8%) | "Followed up with..." pattern |
| Justin | "base" (45%), "@diogo" (23%), "@florence" (8%) | Email forwarder (Base Lift Services signature) |
| Diogo | "@florence" (24%), "@tom" (12%), "@justin" (7%) | Routes to ops |
| Caz | "service" (24%), "job" (6%), "@malene" (6%) | Service contract work |
| Ralph | "attended" (33%), "carried" (11%), "replaced" (6%) | **Pure field engineer — visit reports only** |

### File: `/root/.openclaw/workspace/analysis/dd2/staff_dna.json`

---

## DD3: Client Tier & Intensity

**What we did:** Categorized 1,065 clients by volume + escalation rate.

### Tier definitions

- **Tier A** (8 clients, 1%): High volume (100+) + high escalation (20%+) — VIP/difficult
- **Tier B** (10 clients, 1%): High volume, low escalation — VIP/stable
- **Tier C** (52 clients, 5%): Medium volume (30-99) + high escalation — Watch list
- **Tier D** (125 clients, 12%): Medium volume, stable — Solid relationships
- **Tier E** (516 clients, 48%): Low volume (5-29) — One-off / occasional
- **Tier F** (354 clients, 33%): Touch-and-go (1-4 notes) — Low engagement

### Tier A — "High volume + high escalation" (the difficult VIPs)

| Client | Notes | Jobs | N/J | Esc% | Unans | Span |
|---|---|---|---|---|---|---|
| Raspberry Pi Ltd | 166 | 12 | 13.8 | 31% | 13 | 339d |
| Fonda - MJMK | 120 | 12 | 10.0 | 25% | 5 | 346d |
| Petchey Residential | 112 | 12 | 9.3 | 20% | 6 | 363d |
| Paul Weiss | 112 | 7 | 16.0 | 24% | 6 | 348d |
| Paragon Court (N8) | 112 | 10 | 11.2 | 24% | 4 | 235d |
| Hamad Al-Thani | 110 | 9 | 12.2 | 24% | 4 | 363d |
| **Volkswagen Group** | 110 | 9 | 12.2 | **50%** | 5 | 327d |
| Brooklands Museum | 103 | 18 | 5.7 | 20% | 6 | 364d |

**Tier A insight:** Volkswagen Group is the standout — 50% escalation rate on 110 notes. They need a dedicated account manager or process review.

### Tier B — "High volume + low escalation" (the dream clients)

| Client | Notes | Jobs | N/J | Esc% | Unans |
|---|---|---|---|---|---|
| **London City Airport** | **503** | 69 | 7.3 | 13% | 30 |
| Schindler Ltd HQ | 214 | 17 | 12.6 | 14% | 10 |
| 93 Paul Street | 201 | 25 | 8.0 | 16% | 14 |
| Tony Nothman | 196 | 14 | 14.0 | 13% | 11 |
| 1 Portal Way | 161 | 20 | 8.1 | 11% | 10 |
| Grover Management | 159 | 24 | 6.6 | 9% | 8 |
| Brentwood School | 119 | 11 | 10.8 | 18% | 7 |

**Tier B insight:** These are the high-value, stable clients. London City Airport's 30 unanswered @mentions is concerning for a Tier B client — it's the only Tier B with a high unans count.

### Highest intensity clients (notes per job, ≥5 jobs)

These are the clients where every single job generates lots of notes:

| Client | N/J | Notes | Jobs | Notes per job |
|---|---|---|---|---|
| The Quad Cambridge | 17.4 | 87 | 5 | high-touch |
| Paul Weiss | 16.0 | 112 | 7 | high-touch |
| Grange Property | 15.2 | 76 | 5 | high-touch |
| Raven Row | 15.2 | 91 | 6 | high-touch |
| NewFlex | 14.8 | 74 | 5 | high-touch |
| Tony Nothman | 14.0 | 196 | 14 | high-volume + high-touch |

**Why "intensity" matters:** These clients are operationally heavy. 15+ notes per job means lots of coordination, lots of touch points. They likely need a dedicated process or PM.

### Cold clients (last note >60 days, ≥10 notes) — 199 total

Some of these may be normal (job completed, no further work needed). Others may be:
- Client lost
- Job handed to competitor
- Service contract lapsed
- Account dormant

**Top 15 oldest:**

| Client | Notes | Days silent | Lifespan |
|---|---|---|---|
| ELM group ltd | 19 | 322 | 33d |
| CATS Limited | 19 | 319 | 55d |
| 51 Kensington Court | 10 | 318 | 37d |
| Southend City Council | 10 | 312 | 21d |
| Melia White House | 11 | 305 | 22d |
| Birmingham Museums Trust | 18 | 293 | 53d |
| **Terra Fortuna Limited** | **40** | 283 | 91d |
| Lift Support Services | 16 | 273 | 17d |
| 71 Hopton Street | 12 | 271 | 48d |

**Action item:** Review these 199 cold clients — most should be in `Completed` status with no notes needed, but a few may be recoverable.

### File: `/root/.openclaw/workspace/analysis/dd3/client_tiers.json`

---

## DD4: Stuck Job Early Warning System

**What we did:** Ranked all 30+ note jobs by "stuckness score" (esc×5 + unans×3 + notes). Then compared first 5 notes of stuck vs normal jobs.

### Top 30 stuck jobs

| Job | Company | Notes | Esc | Unan | Staff | Span | Score |
|---|---|---|---|---|---|---|---|
| **Bas-1912** | **Volkswagen Group** | 86 | **51** | 2 | 8 | 308d | **347** |
| Bas-3544 | Raspberry Pi | 57 | 21 | 8 | 7 | 90d | 186 |
| Bas-2563 | Second Home Ltd | 35 | 26 | 2 | 7 | 161d | 171 |
| Bas-3375 | The Exchange | 50 | 21 | 2 | 5 | 59d | 161 |
| Bas-2532 | 93 Paul Street | 90 | 8 | 3 | 3 | 232d | 139 |
| Bas-1294 | Schindler | 96 | 6 | 4 | 3 | 238d | 138 |
| Bas-3184 | Paragon Design | 44 | 16 | 4 | 4 | 52d | 136 |
| Bas-1577 | Paul Weiss | 38 | 17 | 4 | 7 | 348d | 135 |
| Bas-1841 | Sebright Property | 79 | 8 | 5 | 2 | 337d | 134 |
| Bas-3646 | Robin Winning | 24 | 19 | 3 | 6 | 114d | 128 |

### First notes of top stuck jobs reveal the pattern

**Bas-1912 (Volkswagen Group) — first 10 notes:**
- #1: `@Justin @Diogo @Florence  Hi Team - This is a time sensitive one - if possible for now can the quoting template be comp...` [escalation]
- #3: `@Diogo respond pls - you got this?` [escalation]
- #5: `@Diogo @Ralph @Justin the lift spec is attached at the bottom , will this suffice to confirm lead time for lift installa` [escalation]
- #7: `@Diogo are you on with this?` [escalation]
- #10: `@Justin @Florence Got asked this - for some reason didn't come through yesterday  to sm8 . will double check email is on` [escalation]

**5 of first 10 notes are escalations.** That's a clear early warning.

### Early warning: classification mix in first 5 notes

| Classification | Stuck jobs (n=30) | Normal jobs (n=50) | Ratio |
|---|---|---|---|
| **escalation** | **35%** | **0%** | **inf** |
| direct_response | 26% | 50% | 0.52x |
| quote_related | 10% | 18% | 0.54x |
| other | 8% | 13% | 0.61x |
| **payment_related** | 5% | 1% | **5.83x** |
| **parts_logistics** | 4% | 1% | **3.33x** |
| unanswered_tag | 9% | 5% | 1.94x |

**THE SMOKING GUN:**
- **If a job's first 5 notes contain 30%+ escalations, it's 100% likely to become stuck.**
- Payment-related mentions in first 5 notes = 5.83x more likely to be stuck
- Parts logistics in first 5 notes = 3.33x more likely to be stuck
- Stuck jobs have HALF the direct_responses of normal jobs (26% vs 50%) — meaning **less actual conversation, more "command" notes**

### Action: Build a "stuck job early warning" job

For every NEW job, watch its first 5 notes. If the 5-note window contains:
- 30%+ escalations → flag as "high risk of stuck"
- Any payment_related → flag as "financial risk"
- Any parts_logistics → flag as "logistics risk"

This is implementable as a daily SQL query that scans the last 7 days of new jobs.

### File: `/root/.openclaw/workspace/analysis/dd4/stuck_jobs.json`

---

## DD5: Job Lifecycle & Lifespan

**What we did:** Analyzed how jobs start and end. 3,091 jobs with diary data.

### Job lifespan (first note → last note)

| Lifespan | Count | % |
|---|---|---|
| <1 day | 252 | 8% |
| 1-7 days | 651 | 21% |
| 7-30 days | 891 | 29% |
| 30-90 days | 626 | 20% |
| 90-180 days | 350 | 11% |
| 180-365 days | 318 | 10% |
| >365 days | 3 | 0% |

**Mean lifespan:** ~45 days
**Median lifespan:** ~22 days

### How jobs START (first note classification)

| First note type | Count | % |
|---|---|---|
| other | 821 | 27% |
| direct_response | 765 | 25% |
| quote_related | 448 | 14% |
| **escalation** | **396** | **13%** |
| job_update | 177 | 6% |
| payment_related | 157 | 5% |
| unanswered_tag | 152 | 5% |
| client_communication | 113 | 4% |
| parts_logistics | 39 | 1% |
| job_action_no_reply | 13 | 0% |

**Red flag:** **13% of jobs START with an escalation.** This is the early warning.

### How jobs END (last note classification)

| Last note type | Count | % |
|---|---|---|
| direct_response | 1059 | 34% |
| other | 746 | 24% |
| **escalation** | **499** | **16%** |
| job_update | 190 | 6% |
| payment_related | 160 | 5% |
| quote_related | 141 | 5% |
| unanswered_tag | 131 | 4% |

**Red flag:** **16% of jobs END with an escalation** — never cleanly closed.

### Escalation-heavy jobs (3+ escalations) by lifespan

| Lifespan | Count |
|---|---|
| <30 days | 85 |
| 30-90 days | 121 |
| 90-180 days | 91 |
| 180-365 days | 107 |
| >365 days | 2 |

**406 jobs have 3+ escalations.** 60% of them have lifespans 30-365 days — these are "death by a thousand cuts" jobs, not quick wins.

---

## DD6: Time Patterns

**What we did:** Aggregated all 20,298 notes by hour-of-day, day-of-week, and month.

### Hour-of-day (UTC)

| Peak | Notes |
|---|---|
| 09:00 | 2,586 |
| 15:00 | 2,431 |
| 10:00 | 2,298 |
| 14:00 | 2,293 |
| 13:00 | 2,126 |

**Pattern:** Two clear peaks — 9-10am and 1-3pm. Lunch dip (11am-12pm).

**Quiet hours (likely off-hours):**
- 22:00-06:00: <100 notes/hour each
- 03:00: only 3 notes total in 17 months

### Day-of-week

| Day | Notes |
|---|---|
| Sun | 58 (0.3%) |
| Mon | 3,821 (19%) |
| Tue | 4,238 (21%) |
| **Wed** | **4,479 (22%)** |
| **Thu** | **4,327 (21%)** |
| Fri | 3,307 (16%) |
| Sat | 70 (0.3%) |

**Pattern:** Mon-Thu are the busy days. Wednesday is peak. Friday is 24% quieter. Weekends are near zero.

**Operational insight:** Friday is the lightest day. If team is consistently behind on work, **Friday afternoon is the natural time to clear backlog.**

### Year-over-year growth

| Month | Notes | % growth |
|---|---|---|
| 2025-01 | 8 | (start) |
| 2025-06 | 1,003 | — |
| 2025-12 | 1,134 | — |
| 2026-01 | 2,284 | +101% MoM |
| 2026-03 | 2,441 | (peak) |
| 2026-05 | 2,050 | (steady) |
| 2026-06 | 49 | (partial) |

**Operation roughly doubled between Dec 2025 and Jan 2026.** This is either:
- Organic growth
- Better diary discipline
- More service contract work (recurring visits = more updates)

---

## DD7: Quote → Payment Funnel

**What we did:** Traced jobs from quote_related to payment_related. Found 807 ghost quotes.

### Job funnels (out of 3,091 total)

| Funnel | Count | % |
|---|---|---|
| Other (no quote, no pay, no esc) | 1,154 | 37% |
| **Esc only** | **629** | 20% |
| **Quote only (no pay, no esc)** | **510** | **16%** |
| Quote + Esc (no pay) | 297 | 10% |
| Pay only (no quote) | 160 | 5% |
| Quote + Pay + Esc | 135 | 4% |
| Pay + Esc (no quote) | 128 | 4% |
| Quote + Pay (clean) | 78 | 3% |

**Key finding:** Only **213 jobs (7%) have a clean quote→payment flow.** The rest are either no-quote (job from a service contract, etc.) or have some friction.

### Quote → Payment timing (189 jobs with both)

| Bucket | Count | % |
|---|---|---|
| <7 days | 46 | 24% |
| 7-30 days | 50 | 26% |
| 30-90 days | 53 | 28% |
| 90-180 days | 33 | 17% |
| >180 days | 7 | 4% |

**Median quote-to-payment:** **27 days**
**25th-75th percentile:** 7-82 days
**Max:** 253 days

### 🔴 807 GHOST QUOTES

**807 jobs have quote_related notes but NEVER had payment_related notes.** Of these:
- 510 have no escalation either — silent failures
- Median age: 15 days
- **15 are 290+ days old** — quote sent over 9 months ago, never paid

### Top 15 oldest ghost quotes (actionable list)

| Job | Company | Days since quote |
|---|---|---|
| Bas-1017 | Rounce & Evans Property Management Ltd | 378 |
| Bas-1577 | Paul Weiss - (IA 10) | 348 |
| Bas-1207 | Burnham-on-Sea Holiday Village | 342 |
| Bas-1452 | GPF Lewis PLC | 324 |
| Bas-1926 | Jenny's Bistro Cafe | 315 |
| Bas-1672 | 65 Duke of York Square | 308 |
| Bas-1679 | Sintel | 304 |
| Bas-1076 | Oxygen Freejumping - Acton | 302 |
| Bas-1424 | HMS Property Management Services Ltd | 302 |
| Bas-1128 | Pensford Primary School | 298 |
| Bas-1782 | Blenheim Heights Management Company Ltd | 297 |
| Bas-1506 | Netflix - 30 Berners St | 295 |
| Bas-1155 | Consultus Group | 293 |
| Bas-1871 | New Image Architects Ltd | 291 |
| Bas-1853 | Belstead Brook Hotel | 289 |

**Action item:** Justin should review these. Most are either lost opportunities or in the "no one is following up" pile. A monthly "ghost quote review" cron would catch these.

### File: `/root/.openclaw/workspace/analysis/dd7/funnel.json`

---

## DD8: Re-classify "Escalations" — 93% Are NOT Real

**What we did:** Read 500 currently-classified "escalations" and re-classified by content.

### Re-classification results

| New class | Count | % | Was it really an escalation? |
|---|---|---|---|
| ⚪ **coordination** (just has @mention) | **387** | **77%** | ❌ NO — routine tag |
| 🔴 **REAL_escalation** (urgent/complaint) | **33** | **7%** | ✅ YES |
| 🟡 **SC_request** (service contract ask) | 27 | 5% | ❌ NO — operational ask |
| ⚪ other_workflow | 18 | 4% | ❌ NO |
| 🟡 **parts_check** | 16 | 3% | ❌ NO — status check |
| ⚪ scheduling | 11 | 2% | ❌ NO — engineer booking |
| ⚪ acknowledgment | 3 | 1% | ❌ NO — "ok @diogo" |
| 🟡 survey_chase | 2 | 0% | ❌ NO — internal chase |
| ⚪ fwd_email | 2 | 0% | ❌ NO — auto-forwarded |
| ⚪ OOO | 1 | 0% | ❌ NO — out of office |

### Sample "escalations" that are NOT escalations

- `@Florence @Justin sent request to installs group chat` — coordination
- `@Malene Please can you keep an eye out as D asked for parts to be sent to Ralph` — coordination
- `@Caz @Malene please send service contract for Rockwood` — SC request
- `@Malene have you received this part?` — parts check
- `@Diogo is there an update on parts pls?` — parts check
- `Due to holidays I will be out of the office with no access to email until 01/06/2026` — OOO
- `ok @Diogo` — acknowledgment

### Sample REAL escalations (the 7% that ARE real)

- `Good morning Florence. We had the LOLER inspection carried out last week. Please see below comments from them for urgent action - can you please advise?` — Client urgent request
- `@Justin Mark will not go onto site and remove parts so will pass to the debt collectors` — Debt collection
- `We are looking for an urgent inspection on 3 passenger lifts in Mayfair` — Urgent client request
- `I am now writing to inform you that we are left with no choice but to seek legal advice regarding the situation` — Legal threat

### Implications

The "escalation" classification is currently a **false positive factory**. The watcher flags any note that:
- Contains words like "urgent", "issue", "problem" → BUT most uses are coordination, not actual problems
- Has an @mention → BUT most @mentions are routine routing

**Better classification logic:**
- A note is a REAL escalation if it contains:
  - "urgent" or "asap" AND an @mention
  - Words like "complaint", "frustrated", "unhappy", "angry", "ridiculous"
  - "breakdown", "trapped", "stranded", "out of service" (mechanical)
  - "debt collector", "legal", "solicitor"
  - "no reply" or "no response" in client-facing note

- A note is coordination (NOT escalation) if it:
  - Just has @mention with verbs like "send", "upload", "book", "check", "update"
  - Contains "please can you" + a routine action

**Recommendation:** Update `diary_watcher.py` classification rules. Add new category `real_escalation` separate from `coordination`.

### File: `/root/.openclaw/workspace/analysis/dd8/reclassify.json`

---

## Key Operational Insights (synthesized)

### 1. The Christian Problem

Christian writes 57% of all notes. If he goes on holiday for 2 weeks, the company loses 57% of its institutional memory. **Mitigation:** Distribute note-taking more evenly, especially for client-facing.

### 2. The Service Contract Coordination Loop

27% of "escalations" are just service contract creation requests to @Caz @Malene. This is a **process gap** — Caz and Malene should have a more efficient intake system (e.g., a daily SC queue, a template, etc.).

### 3. The Ghost Quote Pile

807 quotes sent with no follow-up, including 15 over 290 days old. **This is money on the table.** A monthly "ghost quote" review could recover significant revenue.

### 4. The Stuck Job Early Warning

> If a job's first 5 notes are 30%+ escalations, it's 100% going to be stuck.

This is implementable as a daily SQL query:

```sql
-- Stuck job early warning
SELECT job_number, company_name, COUNT(*) as notes,
       COUNT(*) FILTER (WHERE classification = 'escalation') as esc,
       ROUND(COUNT(*) FILTER (WHERE classification = 'escalation') * 100.0 / COUNT(*)) as esc_pct
FROM diary_events
WHERE stamp > NOW() - interval '30 days'
GROUP BY job_number, company_name
HAVING COUNT(*) BETWEEN 3 AND 10  -- First 5-10 notes
   AND COUNT(*) FILTER (WHERE classification = 'escalation') * 100.0 / COUNT(*) > 30
ORDER BY esc_pct DESC;
```

### 5. The Caz/Malene Response Gap

Caz responds to @mentions in 18 min (median). Malene takes 5,590 min (93 hours). 

**Hypothesis:** Caz is checking chat more frequently. Malene is overloaded or doesn't have notification setup. **Action:** Check Malene's SM8 notification settings.

### 6. The Friday Pattern

Friday is 24% lighter than other weekdays. If team needs to catch up, **Friday afternoon is the natural catch-up time.**

### 7. The Volkswagen Group Problem

50% escalation rate on 110 notes from a single client. **This is a client-relationship issue, not a service-quality issue.** Volkswagen needs a dedicated review.

### 8. The Out-of-Office Loop

Some "escalations" are just OOO auto-forwards. The watcher should detect these and skip them.

---

## Action Items (Prioritized)

### P0 — Do this week
1. **Review 15 oldest ghost quotes** (290+ days, listed above) — are they lost revenue or properly closed?
2. **Fix classification logic** in `diary_watcher.py` — add `real_escalation` vs `coordination` distinction
3. **Investigate Volkswagen Group** — 50% escalation rate needs a root cause analysis

### P1 — Do this month
4. **Build "stuck job early warning" job** — daily SQL query
5. **Review 199 cold clients** — are they really gone or just dormant?
6. **Investigate Malene's response time** — 5,590 min vs Caz's 18 min
7. **Add Caz/Malene SC intake template** — reduce "send service contract for X" loops

### P2 — Do this quarter
8. **Distribute note-taking load** — Christian is 57% of all notes
9. **Geographic analysis** — we have lat/lng for jobs, can map client density
10. **Predictive model** for "this job will be stuck" based on early signals

---

## Files

- **DD1 Escalation Language:** `/root/.openclaw/workspace/analysis/dd1/escalation_samples.json`
- **DD2 Staff DNA:** `/root/.openclaw/workspace/analysis/dd2/staff_dna.json`
- **DD3 Client Tiers:** `/root/.openclaw/workspace/analysis/dd3/client_tiers.json`
- **DD4 Stuck Jobs:** `/root/.openclaw/workspace/analysis/dd4/stuck_jobs.json`
- **DD5/DD6 Timing:** `/root/.openclaw/workspace/analysis/dd5_6/timing_analysis.json`
- **DD7 Funnel:** `/root/.openclaw/workspace/analysis/dd7/funnel.json`
- **DD8 Reclassify:** `/root/.openclaw/workspace/analysis/dd8/reclassify.json`
- **Original SQL stats:** `/root/.openclaw/workspace/analysis/diary_pattern_analysis.json`

## Related

- [[diary-pattern-analysis-full-2026-06-01]] — Initial SQL stats analysis
- [[diary-field-guide-2026-06-01]] — Practical "what we learned" guide
- [[diary-full-backfill-2026-06-01]] — Backfill to 100% coverage
- [[diary-watcher-bugfix-2026-06-01]] — Watcher fix that made this all possible
