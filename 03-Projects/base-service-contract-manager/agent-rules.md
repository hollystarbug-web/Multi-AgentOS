---
title: Agent Rules
project: Base Service Contract Manager
created: 2026-05-10
tags: [agent-rules, sally]
---

# Agent Rules — Base Service Contract Manager

These rules apply to all agents working on this project.

## Critical Constraints

### SC Client Communication — FIRM RULE
- **NEVER** send anything directly to a client — no invoices, quotes, emails, SMS
- All client-facing actions require Justin's explicit approval first
- Internal actions allowed without approval: `add_note`, `create_invoice` (draft only)

### Never Delete ServiceM8 Records
- **NEVER** delete ServiceM8 records (ever)
- Justin does all deletions personally
- This is immutable until Justin says otherwise

### SC Portal Design Rules
- SQLite for speed, SM8 as source of truth
- All data originates in SM8 and syncs TO SQLite — never the other way
- Portal DB (`/tmp/portal.db`) is a cache — SM8 is master
- Never write directly to SM8 through the portal DB

## Sally — SC Specialist

Sally is the SC Specialist sub-agent. Holly directs Sally's work and QA checks everything.

### Sally's Workspace
- Location: `/root/.openclaw/workspace-sally/`
- Dedicated to SC Portal build and maintenance
- Works under Holly's direction

### Sally's Sessions
- Sessions are NOT reliably persistent
- If Sally's session is gone: spawn a new sub-agent rather than trying to resume
- Always give Sally context about the current issue and design rules

### Sally's CRON
- SC Renewal Check: runs Mon & Fri 9am
- Job ID: `bf22e172-2425-4a46-b651-8844f3a2b2df`

## Last Updated

`2026-05-10`
