# OpenClaw Memory Cleanup Project

## Objective

Reduce oversized OpenClaw memory/bootstrap files so they no longer get truncated during OpenClaw bootstrap, without losing important project memory.

## Current Active Oversized Files

- `/root/.openclaw/workspace/MEMORY.md`
- `/root/.openclaw/workspace-sally/MEMORY.md`

## Non-negotiable Rule

Do not truncate or delete memory until full details have been preserved in the OpenClaw Wiki.

## Migration Stages

### Stage 1 — Preserve

- [x] Archive `/root/.openclaw/MEMORY.md`
- [x] Archive `/root/.openclaw/workspace/MEMORY.md`
- [x] Archive `/root/.openclaw/workspace-sally/MEMORY.md`
- [x] Save checksums
- [ ] Commit archives to wiki
- [ ] Confirm archives are recoverable

### Stage 2 — Classify

Review memory/bootstrap files and classify sections into:

- keep in startup memory
- move to project file
- move to procedure
- move to learning
- move to runbook
- move to reference
- obsolete, only if confirmed by Justin

### Stage 3 — Migrate

Create or update wiki files for detailed memory.

Likely destinations:

- `03-Projects/serviceM8/`
- `03-Projects/openclaw-agent-routing/`
- `03-Projects/openclaw-memory-cleanup/`
- `04-Procedures/`
- `05-Learnings/`
- `06-Runbooks/`
- `07-Reference/`

### Stage 4 — Replace with Pointers

Replace bulky sections in memory/bootstrap files with concise links or pointers to the wiki files.

### Stage 5 — Validate

Run `openclaw doctor`.

Success means memory/bootstrap truncation is reduced or gone, all migrated information exists in wiki files, and agents still have enough startup context to find full project memory.
