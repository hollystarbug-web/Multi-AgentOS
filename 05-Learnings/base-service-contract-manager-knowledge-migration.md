---
title: SC Manager Knowledge Migration — Lessons for Preventing Memory Loss
created: 2026-05-10
tags: [learnings, knowledge, memory, project-management]
---

# Lesson: How to Prevent Knowledge Loss in Long-Running Multi-Agent Projects

## Context

After the Base Service Contract Manager was in active build from 2026-04-24 to 2026-05-10, a migration was performed to consolidate all scattered knowledge into the OpenClaw wiki. This learning file captures the patterns that caused knowledge loss and the rules that prevent it.

---

## What Went Wrong

### Pattern 1: Session Memory Replaces Durable Documentation

**What happened:** Decisions, bug fixes, and design rules were discussed in Telegram sessions and sub-agent sessions. They were not written to durable files. When sessions ended, the knowledge was lost or had to be rediscovered.

**Examples from this project:**
- The INSERT bug root cause (portal-api vs portal DB path mismatch) was found on April 28 but not written to the wiki
- The `/root/portal` sync rule was established on April 28 but not in the wiki until May 10
- SC v7 field confirmation (Justin, April 25) was in session memory only until May 10

**Rule that would have prevented it:**
> Every decision, bug, or design rule discovered during a session MUST be written to the wiki within the same session before it ends.

---

### Pattern 2: Sub-Agent Workspace Is Durable; Session Is Not

**What happened:** Sally's workspace (`~/.openclaw/workspace-sally/`) had useful files, but Sally's session context was not durable. When Sally's session ended, work was lost unless it was in the workspace files.

**Rule:**
> All meaningful work must result in a file in the workspace, not just a session transcript. Session transcripts are not reliable sources of truth.

**Consequence for this project:** Sally's session had "done" markers but the continuity between sessions was poor. Sally was spawned fresh multiple times, each time needing to be re-briefed.

---

### Pattern 3: Wiki Files Were Started But Not Maintained

**What happened:** The wiki was initialized on May 1 and May 5, but `status.md`, `changelog.md`, `decisions.md`, and `bugs.md` were started without being completed. They contained placeholder content that was not kept current.

**Rule:**
> A wiki file that is not kept current is worse than no wiki file — it creates false confidence. Either maintain it or delete the placeholder.

**Better approach:** Don't create a wiki file until there's actual content to put in it.

---

### Pattern 4: Two Codebases (workspace-sally + /root/portal) Without Clear Sync

**What happened:** Sally built in `~/.openclaw/workspace-sally/portal/`. The production portal ran from `/root/portal/`. These were not kept in sync automatically. Changes to workspace-sally didn't reach production.

**Rule:**
> When two deployment targets exist, document the sync process explicitly and make it a step in every build procedure. Don't leave manual sync as an optional step.

---

### Pattern 5: Schema Assumptions Were Not Verified

**What happened:** Sally built a SQLite schema (`clients`, `sc_jobs`, `visits`, etc.) that was never deployed. The actual production schema is different (`sc_forms`, `approval_queue`). The old schema sat in Sally's workspace for 17 days without being marked as obsolete.

**Rule:**
> Any schema that is not the production schema must be explicitly marked as OBSOLETE in its first line, with a comment pointing to the correct schema.

---

### Pattern 6: Critical Files Were Overwritten

**What happened:** LEARNINGS.md was accidentally overwritten on May 1 during wiki setup. All critical rules were lost and had to be restored from backup.

**Rule:**
> LEARNINGS.md should be immutable (chattr +i on Linux). No agent should modify it without first backing it up.

---

### Pattern 7: Open Questions Were Tracked in Session Memory

**What happened:** 8 open questions were raised by Sally on April 24. They were not in the wiki. Several remained unanswered for 17 days because there was no persistent tracking of "waiting on Justin."

**Rule:**
> All open questions must be in the wiki at `open-questions.md`, with a "waiting on" tag. Session memory is not a tracking system.

---

## What Worked Well

1. **Daily memory files** in `memory/YYYY-MM-DD.md` were the primary durable record. The May 10 migration relied heavily on reading these files.

2. **MEMORY.md** promoted entries from daily notes to long-term memory, but only a small fraction of project knowledge made it there.

3. **LEARNINGS.md** was the most consistently maintained file, but it was overwritten once and some entries were too vague to be actionable.

4. **Sally's workspace files** (SC-PORTAL-CONTEXT-2026-04-24.md, etc.) were comprehensive and accurate — these were the best sources during migration.

5. **Git history** in `/root/portal/` provided a record of what was built and when.

---

## Prevention Rules for Future Projects

### Setup Phase
- [ ] Create wiki files on day 1, not day N
- [ ] Mark any test/obsolete schemas as OBSOLETE immediately
- [ ] Set immutable flags on critical files (LEARNINGS.md, credentials)

### During Build
- [ ] After every meaningful decision: update decisions.md
- [ ] After every bug: update bugs.md immediately (not at the end)
- [ ] After every session: update changelog.md
- [ ] After every session: review open-questions.md
- [ ] Commit and push wiki after every session
- [ ] Never let a session end without writing the key decisions to files

### Sub-Agent Management
- [ ] New sub-agent workspace: write a FOCUS.md with current priorities
- [ ] Sub-agent must confirm: "read wiki, understood status, ready to work"
- [ ] Sub-agent must write findings to workspace files before session ends
- [ ] Never rely on sub-agent session memory for critical information

### Multi-Deployment
- [ ] Document every deployment target explicitly
- [ ] Document every sync step explicitly (manual or automatic)
- [ ] After every deployment: verify the right version is running

---

## Template: End-of-Session Wiki Update

Before ending any session on this project, write:

```
## Session Summary — YYYY-MM-DD

### Decisions Made
- [list]

### Bugs Found
- [list with severity]

### Open Questions (now in wiki)
- [list with waiting_on tag]

### Files Modified
- [list]

### Next Steps
- [list]
```

---

## Template: Opening a New Session on This Project

1. Read `status.md` — what's working and broken
2. Read `decisions.md` — what has been decided
3. Read `open-questions.md` — what's waiting on Justin
4. Read `bugs.md` — what's known to be broken
5. Check git log on `/root/portal/` — what changed since last session
6. Check git log on `~/OpenClaw-Wiki/` — what wiki changes since last session
7. Then begin work

---

## Related Files

- Base Service Contract Manager: `~/OpenClaw-Wiki/03-Projects/base-service-contract-manager/`
- This lesson: `~/OpenClaw-Wiki/05-Learnings/`
- LEARNINGS.md: `~/.openclaw/workspace/LEARNINGS.md`

---

## Last Updated

`2026-05-10`
