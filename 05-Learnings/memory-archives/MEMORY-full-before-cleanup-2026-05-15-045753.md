# MEMORY.md

## Wiki Pointer

OpenClaw durable project records are maintained in **~/OpenClaw-Wiki/** on the VPS. Justin opens a synced copy on the MacBook Pro in Obsidian. The Mac mini is for execution tasks, not wiki hosting.

For Base Service Contract Manager: read `~/OpenClaw-Wiki/03-Projects/base-service-contract-manager/README.md` and `status.md` before acting.

Keep MEMORY.md concise; full detail belongs in wiki project/procedure/learning files.

## General

- OpenClaw internet searches: follow procedures/internet-check.md
- Credentials: stored in credentials/ folder
- Scripts: when a script is saved for any job, copy it to scripts/ for sub-agents to use; update sub-agent script storage whenever scripts are revised

## Context Management Rules (2026-04-23)

**CRITICAL — Session Preservation Protocol:**

- Heartbeat is every **30 minutes** (updated from 15 min)
- **Every heartbeat AND every session start:** Check context usage via `session_status`
- **>85% context used:** Immediately save all session state to markdown files
- **>95% context:** Prioritize saving state over new work
- Save to: current `memory/YYYY-MM-DD.md` + update MEMORY.md
- Include: task status, decisions, file changes, conclusions, pending items, next steps

This prevents data loss and enables accurate session resumption after reset.
