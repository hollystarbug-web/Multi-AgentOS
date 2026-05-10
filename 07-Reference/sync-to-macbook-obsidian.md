---
title: Sync to MacBook Obsidian
created: 2026-05-10
tags: [obsidian, sync, macbook]
---

# Sync to MacBook Obsidian

## Architecture

```
Hetzner VPS (canonical)
  └── ~/OpenClaw-Wiki/          ← Source of truth
        │
        │  Git push (cron or manual)
        ▼
MacBook Pro Obsidian Vault      ← Justin's working copy
```

## Sync Method

**Git is the preferred sync method.**

1. VPS commits changes to the Git repo in `~/OpenClaw-Wiki/`
2. Justin's MacBook Pro pulls the changes into his local Obsidian vault
3. Justin opens the vault in Obsidian on his MacBook Pro

## Git Repo Location on VPS

The Git repo for `~/OpenClaw-Wiki/` is initialized at `~/OpenClaw-Wiki/.git/`

## Agent Commit Rule

Agents should commit meaningful wiki/project changes when:
- New procedures are created
- Decisions are made and logged
- Bugs are documented
- Status is updated

Commit message format: brief description of what changed.

## MacBook Pro Setup (Justin's side)

1. Clone the Git repo to a local folder
2. Open that folder as a vault in Obsidian
3. Set up a Git sync tool (e.g., Obsidian Git plugin, or use terminal)

## IMPORTANT

- **Mac mini is NOT used for Obsidian.** It is only for execution tasks.
- The canonical vault lives on the VPS at `~/OpenClaw-Wiki/`
- Justin's MacBook Pro has a synced copy for viewing/editing in Obsidian

## Last Updated

`2026-05-10`
