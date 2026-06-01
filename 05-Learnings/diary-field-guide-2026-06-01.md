---
type: learning
title: Diary Field Guide — 17 Months of Operations
project: servicem8-diary-learning
created: 2026-06-01
updated: 2026-06-01
tags: [diary, field-guide, learnings, operations, base-lift-services]
status: complete
data_source: 20,298 diary notes, 17 months, all staff
related: [[diary-comprehensive-analysis-2026-06-01]], [[diary-pattern-analysis-full-2026-06-01]]
audience: Justin + Base Lift team
---

# Diary Field Guide — 17 Months of Operations

> 📌 **What this is:** The practical, human-readable "what we learned" from analyzing every diary note Christian, Malene, Sal, Justin, Diogo, Caz, Ralph, and Tom have written since ServiceM8 went live.
>
> **TL;DR:** We've been writing diary notes for 17 months. Here's what the data tells us about how we actually work.

---

## Who We Are (Data Version)

| Staff | Role | Notes written | Communication style |
|---|---|---|---|
| **Christian [field]** | The client voice | 11,586 (57%) | Long (258 chars avg), starts with "hi", formal 51% |
| Malene Hansen | The ops coordinator | 2,056 (10%) | Routes everything to @Florence (26% of notes) |
| Sal [field] | The alarmist (or the busiest) | 757 (4%) | 38% "escalation" rate, "followed up" is his catchphrase |
| Justin Howard | The quote machine | 603 (3%) | 67 chars avg (shortest), 45% of notes are quote_related |
| Diogo Vasquez | The survey lead | 356 (2%) | Routes to @Florence/@Tom, escalates often |
| Caz Howorth | The service contract manager | 290 (1%) | "Service" is her #1 word, fastest @mention responder |
| Ralph [field] | The field engineer | 238 (1%) | "Attended", "carried", "replaced" — pure visit reports |
| Tom K | The service coordinator | (less data) | |
| Tony [contractor] | External | (less data) | |
| Mark [field] | Field | (less data) | |
| 9 staff total named | | | 19% of notes have no staff attribution (historical) |

### The Christian Problem

**Christian writes 57% of all diary notes.** That's a single point of failure. If Christian goes on holiday for 2 weeks:
- 57% of institutional memory is gone
- No one is there to write client-facing notes
- The diary's "voice" disappears

**Mitigation:** Distribute client communication more evenly. Caz, Malene, and Diogo should pick up more of Christian's direct_responses.

---

## How We Actually Spend Our Time

### By activity (classification)

| Activity | % of notes | What it looks like |
|---|---|---|
| `direct_response` | 36% | Replying to a tagged @mention |
| `escalation` (false positive) | 17% | Routine coordination mis-classified as escalation |
| `other` | 16% | Logistics, no clear pattern (16% — improvement target) |
| `quote_related` | 8% | Quote sent/received |
| `unanswered_tag` | 5% | @mention with no reply (1,089 notes!) |
| `job_update` | 6% | Status updates |
| `payment_related` | 4% | Invoice, payment chasing |
| `client_communication` | 4% | Direct client contact |
| `parts_logistics` | 2% | Parts orders |
| `internal_note` | 0.2% | Private notes |

### The 1,089 unanswered @mentions

**1,089 notes have @mentions that NEVER got a reply.** That's 5% of all notes — "things falling through the cracks."

Most common pattern: Someone @mentions @Florence, she never responds. These are usually:
- Automated supplier notifications ("SHORTS system, dear Florence")
- "Remittance received" emails
- Status check pings

**Caz's response time: 18 minutes (median). Malene's: 5,590 minutes (93 hours).**

If Caz is available, route @mentions to her.

---

## The "Escalation" Lie

**93% of notes currently classified as "escalation" are NOT real escalations.**

The watcher flags any note with words like "urgent", "issue", or with an @mention. But reading actual content:

- **77% are routine coordination** — just an @mention with a routine action ("@Malene please send SC for X")
- **5% are service contract requests** — "send SC quote for Y"
- **3% are parts status checks** — "have you received this part?"
- **Only 7% are REAL escalations** — actual problems, complaints, urgent client requests

**This means when you see "3,466 escalations", only ~250 are real.**

**Action:** Update the classification logic. A note is a REAL escalation if it contains:
- "urgent" / "asap" / "complaint" / "frustrated" / "angry" / "unhappy" / "ridiculous"
- "breakdown" / "trapped" / "stranded" / "out of service" / "emergency"
- "debt collector" / "legal" / "solicitor"
- Client complaint phrases

A note is NOT an escalation if it just has "please can you" + a routine action.

---

## The 5 Most "Stuck" Jobs in the System

These jobs have had the most escalations. **They're not necessarily bad — they're chronic problems.**

| Job | Client | Notes | Esc | Span | Why it's stuck |
|---|---|---|---|---|---|
| **Bas-1912** | Volkswagen Group | 86 | 51 | 308d | Dordon Lift project — long-running quote/install |
| Bas-3544 | Raspberry Pi | 57 | 21 | 90d | Internal quote loop, lots of back-and-forth |
| Bas-2563 | Second Home Ltd | 35 | 26 | 161d | Decommission job, awaiting client decisions |
| Bas-3375 | The Exchange | 50 | 21 | 59d | New lift project, client slow to provide info |
| Bas-3184 | Paragon Design | 44 | 16 | 52d | Quote/install coordination |

### The early warning rule

> **If a job's first 5 notes contain 30%+ escalations, it's 100% going to be stuck.**

This is the single most useful insight from the data. It means we can catch stuck jobs early.

**Implementation:** A daily SQL query that scans recent new jobs and flags them.

---

## The 8 Clients We Should Be Worried About (Tier A)

These are the only 8 "high volume + high escalation" clients:

| Client | Why they need attention |
|---|---|
| Raspberry Pi Ltd | 166 notes, 31% esc rate — needs account review |
| Fonda - MJMK | 120 notes, 25% esc — restaurant group, lots of coordination |
| Petchey Residential | 112 notes, 20% esc — property management |
| Paul Weiss | 112 notes, 24% esc — only 7 jobs, 16 notes/job! |
| Paragon Court (N8) | 112 notes, 24% esc — RTM company |
| Hamad Al-Thani | 110 notes, 24% esc — private client |
| **Volkswagen Group** | **110 notes, 50% esc** — the standout problem |
| Brooklands Museum | 103 notes, 20% esc — heritage property |

**Volkswagen Group is the priority.** 50% of their notes are escalations. They have a single job (Bas-1912) that's been escalating for 308 days.

---

## The Ghost Quote Pile (807 Quotes, No Payment)

**807 quotes have been sent, but never had a payment recorded.** Of these:
- 510 have NO escalation either — silent failures
- 15 are over 290 days old

### The 15 oldest ghost quotes (review these NOW)

| Job | Company | Days since quote |
|---|---|---|
| Bas-1017 | Rounce & Evans Property Management | 378 |
| Bas-1577 | Paul Weiss | 348 |
| Bas-1207 | Burnham-on-Sea Holiday Village | 342 |
| Bas-1452 | GPF Lewis PLC | 324 |
| Bas-1926 | Jenny's Bistro Cafe | 315 |
| Bas-1672 | 65 Duke of York Square | 308 |
| Bas-1679 | Sintel | 304 |
| Bas-1076 | Oxygen Freejumping - Acton | 302 |
| Bas-1424 | HMS Property Management | 302 |
| Bas-1128 | Pensford Primary School | 298 |
| Bas-1782 | Blenheim Heights Management | 297 |
| Bas-1506 | Netflix - 30 Berners St | 295 |
| Bas-1155 | Consultus Group | 293 |
| Bas-1871 | New Image Architects | 291 |
| Bas-1853 | Belstead Brook Hotel | 289 |

**These are potential lost revenue.** A monthly "ghost quote review" cron would catch these.

---

## When We Work (and When We Don't)

### By hour (UTC)
- **Peak: 9-10am and 1-3pm** (mid-morning + post-lunch)
- **Lunch dip: 11am-12pm** (people actually take lunch)
- **Off-hours: 22:00-06:00** (almost no activity)

### By day of week
- **Mon-Thu: 80% of all activity** (4,000+ notes/day)
- **Wed is peak** (4,479 notes)
- **Fri is 24% lighter** (3,307 notes) — natural catch-up day
- **Weekends: 0.3%** (essentially zero)

**Insight:** Friday afternoon is the natural "catch up" time. If the team is behind, that's the time to use.

---

## The Communication Style Guide (Who Writes What)

### Christian [field] — The Client Voice
- **Long messages** (258 chars avg)
- **Formal greetings** ("hi", "good morning", "dear") 51% of the time
- **Frequent @mentions** (70% of notes have one)
- **Lots of "please can you"** (41% of notes)
- **Style:** Client-facing, polite, full sentences
- **Sample:** "Hi Tom, I hope you're well. Thank you again for your submission for the Dordon Lift project. I'm just seeking..."

### Justin Howard — The Quote Machine
- **Shortest messages** (67 chars avg)
- **Starts with "base"** 45% of the time (signature: "Base Lift Services Ltd")
- **45% of his notes are quote_related**
- **Style:** Email forwarder, terse, action-oriented
- **Sample:** "base Christian [field] sent: ..."

### Malene Hansen — The Ops Coordinator
- **Starts with "@florence"** 26% of the time
- **Routes everything** to Florence
- **89 unanswered @mentions** — she gets ghosted a lot
- **Style:** Coordination, task routing, ops
- **Sample:** "@Florence I have created the service jobs - They want dates for the jobs up front..."

### Sal [field] — The Field Worker
- **Starts with "followed"** 12% of the time
- **"followed up with her today"** is his catchphrase
- **38% of his notes are "escalations"** (the highest rate)
- **Style:** Status updates, follow-ups, action confirmations
- **Sample:** "followed up with her today @Caz @Malene @Justin @Florence"

### Diogo Vasquez — The Survey Lead
- **Routes to @Florence/@Tom** (60% of notes have @mentions)
- **Mostly escalations and direct_responses**
- **Style:** Action-driven, internal coordination
- **Sample:** "Tried calling Paul, no answer. Chased via email again"

### Caz Howorth — The Service Contract Manager
- **Starts with "service"** 24% of the time
- **Fastest @mention responder** (18 min median!)
- **Style:** Service contract focus
- **Sample:** "Service Team: Re: Seaview Heights..."

### Ralph [field] — The Pure Engineer
- **Starts with "attended"** 33% of the time
- **Zero questions, zero please, zero formal greetings**
- **"attended", "carried", "replaced", "fitted"** are his words
- **Style:** Visit reports, mechanical, no fluff
- **Sample:** "Attended site, carried out LOLER inspection, replaced broken contactor"

---

## The 5 Things We Should Do Differently

### 1. Stop classifying routine coordination as "escalation"
Update `diary_watcher.py` to distinguish real escalations from routine @mentions.

### 2. Build a "stuck job early warning" job
Daily SQL query: any new job with 30%+ escalations in first 5 notes → flag for review.

### 3. Investigate Volkswagen Group
50% escalation rate on 110 notes. They need a dedicated review.

### 4. Review the 15 oldest ghost quotes
These are 290+ days of potential lost revenue. A simple "have we followed up?" check would catch them.

### 5. Distribute the note-taking load
Christian is 57% of all notes. Caz, Malene, Diogo should pick up more of the client communication.

---

## What's Next

This field guide is the synthesis. For the full data, see:

- [[diary-comprehensive-analysis-2026-06-01]] — Full 8-dive analysis (24KB)
- [[diary-pattern-analysis-full-2026-06-01]] — Initial SQL stats (15KB)
- [[diary-full-backfill-2026-06-01]] — Backfill details
- [[diary-watcher-bugfix-2026-06-01]] — Watcher fix

For operational actions:

- **P0 this week:** Review 15 ghost quotes, fix classification, investigate VW
- **P1 this month:** Build stuck-job early warning, review cold clients, fix Malene notifications
- **P2 this quarter:** Distribute note load, geographic analysis, predictive model

---

*Generated 2026-06-01 13:00 UTC by direct SQL analysis of 20,298 diary notes.*
*Data window: 2025-01-07 to 2026-06-01 (17 months).*
*For: Justin, Christian, Malene, Sal, Diogo, Caz, Ralph, Tom, and the rest of the Base Lift team.*
