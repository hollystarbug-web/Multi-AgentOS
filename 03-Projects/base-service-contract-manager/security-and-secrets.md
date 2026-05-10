---
title: Security and Secrets
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
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

**If you need to reference a credential in documentation, use a placeholder: `[SERVICE_NAME_KEY]`, `[SERVICE_NAME_PASSWORD]`. Never write the actual value.**

## Credentials Location

All credentials are stored in:
- `~/.openclaw/workspace/.credentials/`

**Never commit credentials to Git. Never paste them in Telegram.**

## Credentials Inventory

| Service | Credentials Location | Notes |
|---------|---------------------|-------|
| ServiceM8 API Key | `~/.openclaw/workspace/.credentials/servicem8.json` | Read-only key |
| ServiceM8 OAuth | `~/.openclaw/workspace/.credentials/servicem8_oauth.json` | Auto-refreshes |
| QuickBooks | Browser session (Chrome on Mac Mini) | Credentials in `~/.openclaw/workspace/.credentials/quickbooks-debt-recovery.json` |
| Gmail | Browser session (Chrome on Mac Mini) | |
| DocuSign | Browser session | 2FA via authenticator app |
| Mac Mini SSH | SSH key + password | Credentials in `~/.openclaw/workspace/.credentials/` |
| VPS root | Password in credentials folder | |

## API Keys (Read-Only)

### ServiceM8 API Key
**Location:** `~/.openclaw/workspace/.credentials/servicem8.json`
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

- VPS root: Password-based — credentials in `~/.openclaw/workspace/.credentials/`
- Mac Mini: SSH key auth — see `~/.ssh/` for keys

## Secret Redaction

Before backing up memory files, sensitive data is redacted:
- `memory.before-secret-redaction.*.tar.gz`
- `memory-dreams.before-secret-redaction.*.tar.gz`

## If You Find a Secret

If you accidentally commit a secret to any repo:
1. **Do not wait** — the secret is compromised the moment it's in git
2. **Revoke the credential immediately** in the service's dashboard
3. **Rotate it** — generate a new credential
4. **Remove from git** — use BFG or git filter-branch
5. **Force-push** the cleaned history

## Last Updated

`2026-05-10`
