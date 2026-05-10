---
title: Channel Mappings
created: 2026-05-10
tags: [channels, telegram, whatsapp]
---

# Channel Mappings

## WhatsApp Accounts

| Account | Number | Method | Account ID |
|---------|--------|--------|------------|
| **Holly (main)** | +447703664722 | Baileys native | `default` |
| Kryten | +351914324426 | Baileys native | `kryten` |

### Critical Rule — WhatsApp Account Mapping

**⚠️ FIRM RULE: Do not cross-send between identities.**

- Holly (main) must use `accountId: "default"` for all WhatsApp messages in cron jobs
- Never use "kryten" account for Holly's tasks
- When in doubt, always specify `accountId: "default"` explicitly

**Location of this rule in MEMORY.md:** `TOOLS.md` → "WhatsApp (Native Connection Only)"

## Telegram Accounts

| Account | Chat ID | Notes |
|---------|---------|-------|
| Justin | 5722920571 | Primary authorized sender |
| Holly (main) | via OpenClaw gateway | Outbound replies route to this chat |

## Alert Channels

| Purpose | Channel | Notes |
|---------|---------|-------|
| Proactive alerts to Justin | WhatsApp Holly_Updates | `120363425162893462@g.us` |
| Debt chase reports | WhatsApp BASE DEBT RECOVERY | `120363307765069691@g.us` |

## Cross-Channel Rules

- Telegram is primary for task assignment and back-and-forth
- WhatsApp for proactive alerts (no user input required)
- Email via Gmail for formal communications

## Last Updated

`2026-05-10`
