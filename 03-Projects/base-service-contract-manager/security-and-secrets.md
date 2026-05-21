---
title: Security and Secrets — Base Service Contract Manager
project: base-service-contract-manager
created: 2026-05-10
updated: 2026-05-21
tags: [security, secrets, project]
---

# Security and Secrets — Base Service Contract Manager

> ⚠️ **For global credential and security rules, see:**
> - [Global Security Rules](../../07-Reference/security-and-secrets.md)
> - [Credential Rotation Runbook](../../06-Runbooks/credential-rotation-and-secret-cleanup.md)
>
> This file contains **only project-specific notes**. It does not override global rules.

---

## Project Credential Files

| File | Contains | Location |
|------|---------|---------|
| `servicem8.json` | ServiceM8 API key | `~/.openclaw/workspace/.credentials/` |
| `servicem8_oauth.json` | ServiceM8 OAuth token | `~/.openclaw/workspace/.credentials/` |
| Portal SQLite DB | SM8 data mirror (no secrets) | `/tmp/portal.db` |

---

## ServiceM8 API Key

**Location:** `~/.openclaw/workspace/.credentials/servicem8.json`

The ServiceM8 API key is **read-only**. Write operations (sending emails, SMS, publishing documents) require OAuth.

**Scope:** Read access to all job, client, invoice, and communication data.

**If compromised:** Revoke via ServiceM8 dashboard → Settings → API → Regenerate Key. Then update the credential file and restart portal sync.

---

## ServiceM8 OAuth Token

**Location:** `~/.openclaw/workspace/.credentials/servicem8_oauth.json`

The OAuth token auto-refreshes when expired. Required for:
- Sending emails/SMS via `jobCommunication` endpoint
- Publishing documents
- Managing templates

**If expired:** OAuth auto-refresh should handle it. If manual re-auth needed, delete `servicem8_oauth.json` and re-authenticate via the SM8 web app.

---

## Portal Database

The portal SQLite database (`/tmp/portal.db`) contains a mirror of ServiceM8 data. It is synced every 1 minute via `/root/portal/scripts/sync-sm8.js`.

**No secrets in the portal DB.** The DB contains job data, client names, invoice amounts — all of which are non-secret operational data.

---

## SC Portal Credentials

The SC Portal (`dashboard.baselifts.co.uk`) uses Clerk for authentication.

### Clerk Authentication
| File | Contains | Location |
|------|---------|----------|
| `clerk-sally.json` | Clerk publishable key + secret key | `~/.openclaw/workspace/.credentials/` |

**Clerk publishable key** is used by Next.js at runtime (via `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`). **Clerk secret key** is used server-side by Clerk SDK.

If Clerk auth breaks: check `.env.local` in the portal directory — it must have real Clerk keys, not placeholders. See [portal env audit lesson](../../05-Learnings/portal-env-audit.md).

### Vercel API Token
| File | Contains | Location |
|------|---------|----------|
| `vercel-sally.json` | Vercel API token | `~/.openclaw/workspace/.credentials/` |

Used for deployments only.

**Clerk keys are stored at:**
```
~/.openclaw/workspace/.credentials/clerk-sally.json
```

The `.env.local` in the portal directory (`~/.openclaw/workspace-sally/portal/`) must reference these keys via `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`. Never hardcode Clerk keys in `.env.local` — always load from the credentials file or use the credentials store.

---

## No Secrets in This Project

This project does not store any secrets in wiki files, git, Telegram, or memory files.

## Complete Credential Index

All secrets for this project:

| File | Contains | Used By |
|------|---------|---------|
| `servicem8.json` | ServiceM8 API key | Portal sync, SM8 API scripts |
| `servicem8_oauth.json` | ServiceM8 OAuth token | Portal email/SMS sending |
| `clerk-sally.json` | Clerk publishable + secret key | Portal authentication |
| `vercel-sally.json` | Vercel API token | Portal deployments |

**All stored in:** `~/.openclaw/workspace/.credentials/`

---

## Portal-API Credential Loading

The portal-API server (`/root/portal-api/server.js`) loads the SM8 API key via `getSM8ApiKey()`:
1. `SERVICEM8_API_KEY` environment variable (preferred)
2. `~/.openclaw/workspace/.credentials/servicem8.json` → `apiKey` field

No hardcoded fallback. Fails clearly if key is missing.

**⚠️ Do not add hardcoded credentials to `/root/portal-api/server.js`.**

Credentials for the portal-api are also protected by:
- `.gitignore` entries: `.env`, `.env.*`, `ecosystem.config.js`, `.credentials/`, `*.key`, `*.pem`
- Credential file permissions: `600`

## Before Committing — Checklist

Run this before any commit or code change:

- [ ] No real API keys, passwords, or tokens in any file
- [ ] Credential values replaced with `[PLACEHOLDER]` format
- [ ] No hardcoded secrets in server.js, scripts, or portal code
- [ ] Secret scan clean (see below)
- [ ] `.gitignore` protects new credential files

**Quick secret scan:**
```bash
cd ~/OpenClaw-Wiki
grep -rEn "(password|api_key|apikey|secret|token|credential|auth|bearer|oauth).*[:=][\"']?\s*[A-Za-z0-9/+=]{16,}[\"']?" \
  --include="*.md" --include="*.json" --include="*.py" --include="*.sh" \
  . 2>/dev/null | grep -v "/.credentials/" | grep -v "/.git/"
```

**All placeholder values** (never use real values): `[SM8_API_KEY]`, `[QB_PASSWORD]`, `[GMAIL_APP_PASSWORD]`, `[SM8_OAUTH_TOKEN]`, `[VERCEL_API_TOKEN]`, etc.

---

## Related

- [Global Security Rules](../../07-Reference/security-and-secrets.md)
- [Credential Rotation Runbook](../../06-Runbooks/credential-rotation-and-secret-cleanup.md)

## Last Updated

`2026-05-11`
