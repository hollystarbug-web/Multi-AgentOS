---
title: Memory Strategy
created: 2026-05-10
tags: [memory, strategy, wiki]
---

# Memory Strategy

## Core Principle

**Telegram is not durable memory. The wiki is the durable project record.**

Full detail goes into project files, procedures, or learnings. MEMORY.md only gets concise startup-critical facts and pointers.

## Memory Hierarchy

| Layer | What goes here | Location |
|-------|---------------|----------|
| Telegram | Ephemeral — questions and answers | Not durable |
| MEMORY.md | Startup-critical facts, pointers | `~/.openclaw/MEMORY.md` |
| Daily logs | Session-by-session record | `~/OpenClaw-Wiki/08-Daily-Logs/YYYY-MM-DD.md` |
| Learnings | Rules from experience | `~/OpenClaw-Wiki/05-Learnings/` |
| Procedures | Repeatable workflows | `~/OpenClaw-Wiki/04-Procedures/` |
| Project files | Decisions, status, specs | `~/OpenClaw-Wiki/03-Projects/<project>/` |

## MEMORY.md Rule

**Before removing or compressing anything from MEMORY.md, first save the full original detail into a learning or project file.**

MEMORY.md is for:
- Startup-critical facts (machine roles, IP addresses, service ports)
- Pointers to where to find more detail
- Critical rules that must survive context loss

MEMORY.md is NOT for:
- Detailed decision logs
- Task histories
- Procedure documentation
- Reusable knowledge

## Decision Logging

Decisions go into `decisions.md` in the relevant project folder. Include the reasoning, not just the outcome.

## Current State

Current state goes into `status.md` in the relevant project folder.

## Work History

Work history goes into `changelog.md` in the relevant project folder.

## Learnings

Rules derived from experience go into `~/OpenClaw-Wiki/05-Learnings/`.

Format:
```
## [Topic] — [Date]

### Rule: [One-line name]
**What:** Do X. **Why:** Because Y. **When:** Every time Z.
```

## Daily Logs

After each significant session, save key outcomes to `~/OpenClaw-Wiki/08-Daily-Logs/YYYY-MM-DD.md`.

## Last Updated

`2026-05-10`
