---
title: ServiceM8 Diary Learning Model — Project Overview
project: servicem8-diary-learning
created: 2026-05-14
updated: 2026-05-15
tags: [project, servicem8, diary, machine-learning, knowledge-base]
status: in-progress
owner: Holly (main agent)
---

# ServiceM8 Diary Learning Model

## Project Goal

Build a persistent learned understanding of how staff interact via ServiceM8 job diaries — so future diary analyses are accurate, staff coaching is evidence-based, and reports distinguish **communication** from **action**.

---

## Background / Context

**Problem identified (2026-05-14):**
- Daily Caz Control Tower report said "Caz responded" to 66 jobs
- Manual review showed Caz **acted** on jobs but **did not reply** to the person who tagged her
- Malene properly responded to Florence's question; Caz left Florence hanging
- My classification logic was wrong: "staff member touched job" ≠ "staff member responded"

**Root cause:** My reports conflated job actions with direct communications. The diary contains both types of entries, but I wasn't distinguishing them.

---

## System Architecture

### Three-Layer Design

```
SERVICE M8 API
      │
      ▼
┌─────────────────┐
│  LAYER A        │ ← Raw archive (all entries, untouched)
│  diary_archive  │   raw_text_hash for verification
└────────┬────────┘
         │ parsed & classified
         ▼
┌─────────────────┐
│  LAYER B        │ ← Structured events (one row per entry, queryable)
│  diary_events   │   tags, classification, thread analysis
└────────┬────────┘
         │ patterns emerge over time
         ▼
┌─────────────────┐
│  LAYER C        │ ← Pattern memory (learned intelligence)
│  memory/        │   staff profiles, rules, anti-patterns,
│  diary-patterns │   coaching guidance
└─────────────────┘
```

### Layer Details

**Layer A — Raw Archive**
- All diary entries from SM8, stored verbatim
- Fields: entry_uuid, job_uuid, staff_uuid, timestamp, raw_text
- Purpose: court of record, exact wording verification
- Storage: PostgreSQL `diary_archive` table

**Layer B — Structured Events**
- Each diary entry parsed and classified
- Fields: entry_uuid, job_uuid, staff_uuid, timestamp, classification, tags, thread_position, reply_target
- Purpose: fast structured queries ("show me all unanswered tags this week")
- Storage: PostgreSQL `diary_events` table

**Layer C — Pattern Memory**
- Learned intelligence: staff profiles, rules, anti-patterns, coaching guidance
- Not query output — interpretive understanding that informs reasoning
- Purpose: informs analysis before looking at specific entries
- Storage: Markdown files in wiki (`/root/OpenClaw-Wiki/03-Projects/servicem8-diary-learning/`)

### Interaction Classifications

| Type | Description |
|------|-------------|
| **Response** | Directly answers a question or addresses someone who tagged them |
| **Update** | Status change, job action — not addressing anyone |
| **Internal Note** | Private note not visible to client |
| **Client Communication** | Note to or from the client directly |
| **Escalation** | Flagging something to Justin or another staff member |
| **Action Only** | Touched job without any communication |

### Anti-Patterns to Detect

- Staff tagged, next entry is different staff → escalation pattern
- Client-facing tag unanswered for >4 hours → risk of client dissatisfaction
- Internal note with no classification → needs manual review
- Staff acted but left tag unanswered → coaching opportunity

---

## Staff Profiles (Initial, to be refined)

| Staff | Known Tendency |
|-------|--------------|
| Caz | Acts on jobs, may not reply to tags. Thorough on SCs. |
| Malene | Properly responds to questions, direct communication |
| Diogo | Tends to update without replying |
| Florence | Asks questions, chases, flags |
| Justin | Reviews, escalates, approves |

---

## Related Workstream: VPS Diary Watcher

See: [VPS Diary Watcher](./vps-diary-watcher.md)

Parallel systemd service that provides the real-time data pipeline for this project.

---

## Next Steps

1. **VPS Diary Watcher** — confirm status after create_date fix (see VPS Diary Watcher doc)
2. **Layer A + B population** — bulk extraction of historical diary entries into PostgreSQL
3. **Classification logic** — build parser that classifies each diary entry type
4. **Layer C pattern files** — create wiki files for staff profiles, rules, anti-patterns
5. **Backfill** — VPS Diary Watcher only captures new notes; historical (~8 months) needs bulk import

---

## Context Source

Full conversation from 2026-05-14 saved in DOCX attachment:
`Yesterdays_context_on_diary_learning_model---7899cc54-def0-41ca-8ce1-51bbb2dcdc21.docx`
