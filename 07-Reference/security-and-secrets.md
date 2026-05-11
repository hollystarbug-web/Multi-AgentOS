---
title: Security and Secrets — Global Rules
category: reference
created: 2026-05-11
updated: 2026-05-11
tags: [security, secrets, global]
---

# Security and Secrets — Global Rules

> These rules apply to ALL OpenClaw agents, workspaces, wikis, memory files, procedures, scripts, and cron jobs. No exceptions.

---

## Cardinal Rules

### Secrets Are Never Stored In

- ❌ Wiki files (including this one)
- ❌ Telegram messages or group chats
- ❌ MEMORY.md or any memory/*.md file
- ❌ LEARNINGS.md
- ❌ Git commit messages, branches, or changelogs
- ❌ Bug reports or issue trackers
- ❌ Log files
- ❌ Any file in `~/.openclaw/workspace/` (except approved credential files)
- ❌ Any file in `~/OpenClaw-Wiki/`

### Secrets Are Only Stored In

- ✅ `~/.openclaw/workspace/.credentials/` — JSON credential files (gitignored)
- ✅ Environment variables (for secrets that need to be env-based)
- ✅ System secret stores (macOS Keychain, etc.)
- ✅ Cloudflare dashboard (DNS tokens)
- ✅ Vercel dashboard (API tokens)

---

## Placeholder Rule

When documenting a credential in any file (wiki, memory, procedure, report), **always use placeholders**:

```
# CORRECT
QuickBooks password: [QB_PASSWORD]

# WRONG
QuickBooks password: Reddwarf2026!
```

Approved placeholder format: `[SERVICE_NAME_FIELD]` — all caps, underscores.

---

## Approved Credential Files

All credentials for Base Lift Services operations live in:

```
~/.openclaw/workspace/.credentials/
```

| File | Contains |
|------|---------|
| `servicem8.json` | ServiceM8 API key |
| `servicem8_oauth.json` | ServiceM8 OAuth token |
| `quickbooks-debt-recovery.json` | QB login for debt recovery |
| `gmail-bills.json` | Gmail IMAP credentials |
| `protonmail.json` | Proton Mail Bridge credentials |
| `whatsapp-contacts.json` | WhatsApp contact numbers (no secrets) |
| `microsoft-onedrive.json` | OneDrive OAuth |
| `chrome-debug-plist-password.json` | Mac Mini VNC/screen share |

**Never put credentials anywhere else.**

---

## Report Output Rules

When generating reports (invoice aging, debt chase, control tower, etc.):

- ✅ Use placeholders for client names if sensitive
- ✅ Use real invoice numbers and amounts (these are not secrets)
- ✅ Use real job IDs and dates
- ❌ Never print actual passwords, API keys, OAuth tokens, or session cookies
- ❌ Never print full email addresses if they contain passwords (e.g. debt_recovery@baselifts.co.uk in a context that implies the password)
- ❌ Never print SSH private keys

---

## Git Commit Rules

Before any `git add`, `git commit`, or `git push`:

1. Run the redacted secret scan:
   ```bash
   cd ~/.openclaw/workspace && grep -rE "(password|api_key|secret|token|credential|auth).*[:=].*[A-Za-z0-9/+=]{20,}" --include="*.md" --include="*.json" --include="*.py" --include="*.sh" . 2>/dev/null | grep -v ".credentials/" | grep -v ".git/"
   ```

2. Check that no credential files are staged (they should be in `.gitignore`)

3. If a secret was accidentally committed: **revoke the credential immediately**, then clean the git history using BFG or git filter-branch.

---

## If a Secret Is Found in a Repo

1. **Revoke the credential in the service dashboard NOW** — do not wait
2. Generate a new credential
3. Update the credential file
4. Clean git history: `bfg --delete-files <filename>` or `git filter-branch`
5. Force push: `git push --force`
6. Alert Justin if the secret was in a public or shared repo

---

## Wiki Link Structure

- **Global security rules:** [07-Reference/security-and-secrets.md](07-Reference/security-and-secrets.md)
- **Credential cleanup & rotation:** [06-Runbooks/credential-rotation-and-secret-cleanup.md](06-Runbooks/credential-rotation-and-secret-cleanup.md)
- **Project-specific security:** [03-Projects/base-service-contract-manager/security-and-secrets.md](../03-Projects/base-service-contract-manager/security-and-secrets.md)

---

## Related

- [Credential Rotation Runbook](../06-Runbooks/credential-rotation-and-secret-cleanup.md)

## Last Updated

`2026-05-11`
