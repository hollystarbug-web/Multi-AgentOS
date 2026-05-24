# Wiki Discipline — 2026-05-24

## Rule: The Wiki Is The Single Source of Truth — Never Rely On Memory Alone

**What:** Any operational knowledge, lesson, decision, rule, or procedure must be written to the wiki at `/root/OpenClaw-Wiki` before the session ends. Never trust session context alone. **Why:** Session context is lost on restart. The wiki persists across restarts and is synced to GitHub. **When:** Every time you learn something, make a decision, fix a bug, or complete a non-trivial task.

---

## Rule: Always Push Wiki Changes to GitHub

**What:** After any significant wiki edit, run `git add . && git commit -m "[description]" && git push` from `/root/OpenClaw-Wiki`. **Why:** Local storage can be lost. GitHub is the durable backup. **When:** After creating or updating any learning, procedure, project page, or daily log.

---

## Rule: Credentials Live In `.credentials/` — Never Hardcode

**What:** All passwords, tokens, API keys, and secrets must be stored in `~/.openclaw/workspace/.credentials/` as JSON files. Read from those files in scripts and procedures. **Why:** Hardcoded credentials end up in logs, commits, and forgotten. Centralised credentials can be rotated in one place. **When:** Every time you need a credential.

---

## Rule: Write Learnings In Rule Format, Not Narrative

**What:** Learning entries must follow the format: `## [Topic] — [Date]` + `### Rule: [One-line name]` + `**What:** X. **Why:** Y. **When:** Z. **Why:** Because narrative entries ("I fixed a bug today") don't transfer to future sessions. Rule-format entries do. **When:** Every time you write a learning entry.

---

## Rule: Read LEARNINGS.md Before Any Recurring Task

**What:** Before starting any task you've done before (invoice aging, debt chasing, morning briefing, etc.), read `~/.openclaw/workspace/LEARNINGS.md` and the relevant procedure. **Why:** LEARNINGS.md is the index into wiki learnings. It prevents repeating the same mistakes. **When:** Every recurring task.
