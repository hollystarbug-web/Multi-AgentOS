---
title: OpenClaw Wiki — Base Lift Services
created: 2026-05-10
tags: [index, wiki, base-lift-services]
---

# OpenClaw Wiki

Canonical knowledge base for Base Lift Services operations, maintained by Holly (OpenClaw AI) on the Hetzner VPS.

> **Sync:** This vault is synced to Justin's MacBook Pro via Git. Open in Obsidian there. The Mac mini is for execution tasks only — never for wiki hosting.

## Wiki Structure

```
00-Index.md          ← You are here
01-Architecture.md   ← System architecture and design decisions
02-Agent-Rules.md   ← Holly's operating rules
03-Projects/        ← Active project files
04-Procedures/      ← Repeatable workflows
05-Learnings/       ← Rules derived from experience
06-Runbooks/        ← Step-by-step operational guides
07-Reference/       ← Cheat sheets, maps, quick lookups
08-Daily-Logs/      ← Daily session logs (YYYY-MM-DD.md)
```

## Quick Links

- **ServiceM8 Diary Learning:** [03-Projects/servicem8-diary-learning/README.md](03-Projects/servicem8-diary-learning/README.md)
  - **Layer B Enrichment (2026-06-01):** [05-Learnings/diary-layer-b-enrichment-2026-06-01.md](05-Learnings/diary-layer-b-enrichment-2026-06-01.md)
  - **Layer B Findings:** [03-Projects/servicem8-diary-learning/findings-2026-06-01.md](03-Projects/servicem8-diary-learning/findings-2026-06-01.md)
  - **Layer C Staff Patterns:** [03-Projects/servicem8-diary-learning/LAYER-C-staff-patterns.md](03-Projects/servicem8-diary-learning/LAYER-C-staff-patterns.md)
- **Base Service Contract Manager:** [03-Projects/base-service-contract-manager/README.md](03-Projects/base-service-contract-manager/README.md)
- **Active procedures:** [04-Procedures/](04-Procedures/)
- **Today's status:** [03-Projects/base-service-contract-manager/status.md](03-Projects/base-service-contract-manager/status.md)
- **Today's daily log:** [08-Daily-Logs/2026-06-01.md](08-Daily-Logs/2026-06-01.md)
- **Holly's rules:** [02-Agent-Rules.md](02-Agent-Rules.md)
- **Security & secrets:** [07-Reference/security-and-secrets.md](07-Reference/security-and-secrets.md)
- **Credential rotation:** [06-Runbooks/credential-rotation-and-secret-cleanup.md](06-Runbooks/credential-rotation-and-secret-cleanup.md)
- **Sync to Obsidian:** [07-Reference/sync-to-macbook-obsidian.md](07-Reference/sync-to-macbook-obsidian.md)

## Machine Roles

| Machine | Role |
|---------|------|
| Hetzner VPS (this vault) | OpenClaw brain, canonical wiki, cron jobs |
| Justin's MacBook Pro | Obsidian viewer/editor (synced vault via SMB to Mac Mini) |
| Mac Mini (100.91.33.1) | GUI/browser execution node + Obsidian vault sync target |

## Last Updated

`2026-06-01 12:50 UTC` — Layer B enrichment complete (95.5% populated); three-tier git sync set up (VPS → GitHub → Mac Mini → Obsidian).
