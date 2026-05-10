---
title: Security and Secrets
project: Base Service Contract Manager
created: 2026-05-10
tags: [security, secrets]
---

# Security and Secrets

## Storage Rules

**⚠️ NEVER store secrets, API keys, tokens, cookies, passwords, OAuth credentials, or sensitive logs in:**
- Wiki files (including this file)
- MEMORY.md
- Telegram messages
- Any file in ~/OpenClaw-Wiki/
- Any file in ~/.openclaw/workspace/

## Credentials Location

All credentials are stored in:
- `~/.openclaw/workspace/.credentials/`

**Never commit credentials to Git. Never paste them in Telegram.**

## Credentials Inventory

| Service | Credentials Location | Notes |
|---------|---------------------|-------|
| ServiceM8 API Key | `~/.openclaw/workspace/.credentials/servicem8.json` | `smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7` |
| ServiceM8 OAuth | `~/.openclaw/workspace/.credentials/servicem8_oauth.json` | Auto-refreshes |
| QuickBooks | Browser session (Chrome on Mac Mini) | |
| Gmail | Browser session (Chrome on Mac Mini) | justin.howard@silverbrookcm.com |
| DocuSign | Browser session | 2FA via authenticator app |
| Mac Mini SSH | Password: Reddwarf2026! | holly@100.91.33.1 |
| VPS root | Password in credentials folder | |

## API Keys (Read-Only)

### ServiceM8 API Key
**Key:** `smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7`
**Scope:** Read-only for fetching data. Write operations (email/sms) require OAuth.

## OAuth (Write Operations)

ServiceM8 OAuth credentials at `~/.openclaw/workspace/.credentials/servicem8_oauth.json`. Token auto-refreshes when expired.

Required for:
- `jobCommunication` (email/SMS sending)
- Publishing documents
- Managing templates

## Browser Sessions

ServiceM8 and QuickBooks are accessed via Chrome CDP on Mac Mini. Sessions are live in Chrome — no stored credentials needed for automation.

**Never close Chrome on Mac Mini** — closing Chrome ends the sessions.

## SSH Keys

- VPS root: Password-based
- Mac Mini: Password: Reddwarf2026!

## Secret Redaction

Before backing up memory files, sensitive data is redacted:
- `memory.before-secret-redaction.*.tar.gz`
- `memory-dreams.before-secret-redaction.*.tar.gz`

## Last Updated

`2026-05-10`
