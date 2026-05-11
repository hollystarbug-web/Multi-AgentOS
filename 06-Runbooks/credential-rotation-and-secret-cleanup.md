---
title: Credential Rotation and Secret Cleanup
category: runbook
created: 2026-05-11
updated: 2026-05-11
tags: [runbook, credentials, rotation, security]
---

# Credential Rotation and Secret Cleanup

This runbook covers the process for rotating credentials and cleaning up accidental secret exposure.

---

## Before You Start

**⚠️ Critical safety rule:** When a secret is compromised, revoke it FIRST, before doing anything else. Do not wait.

---

## Credential Cleanup Checklist

Use this checklist when a credential has been exposed or needs rotation.

### Phase 1 — Immediate Revocation

- [ ] 1. Log into the service dashboard
- [ ] 2. Navigate to security/credentials/API keys section
- [ ] 3. Revoke the compromised credential immediately
- [ ] 4. Generate a new credential (note the new value — you will store it in step 3)

### Phase 2 — Credential Storage

- [ ] 5. Store the new credential in the approved credential file
  - Location: `~/.openclaw/workspace/.credentials/`
  - Format: JSON — `{ "field": "value" }`
  - File must already exist in `.gitignore`
- [ ] 6. Verify the old credential file does NOT contain the new value in plaintext outside the file

### Phase 3 — Service Restart

- [ ] 7. Identify which services/applications use this credential
- [ ] 8. Restart affected services

### Phase 4 — Verification

- [ ] 9. Test the new credential works
- [ ] 10. Verify the old credential is rejected
- [ ] 11. Run secret scan (see below) to confirm cleanup is complete

### Phase 5 — Documentation

- [ ] 12. Update this runbook's affected credentials table (placeholder only)
- [ ] 13. Alert Justin if the credential was in a public repo or shared system

---

## Secret Scan Command

Run this before any git commit to confirm no secrets are staged:

```bash
# Full secret scan
cd ~/.openclaw/workspace
grep -rEn "(password|api_key|apikey|secret|token|credential|auth|bearer|oauth).*[:=][\"']?\s*[A-Za-z0-9/+=]{16,}[\"']?" \
  --include="*.md" --include="*.json" --include="*.py" --include="*.sh" --include="*.txt" \
  . 2>/dev/null \
  | grep -v "/.credentials/" \
  | grep -v "/.git/" \
  | grep -v "/node_modules/" \
  | grep -v "OPENCLAW_REDACTED"

# Check git staging area
git diff --cached --name-only
git diff --cached | grep -iE "(password|api_key|secret|token)" && echo "⚠️ SECRETS STAGED!"
```

If the scan finds anything outside `/.credentials/`, investigate immediately.

---

## Affected Credentials

All values below are **PLACEHOLDERS ONLY**. Do not use these values.

| Credential | Placeholder | Approved Storage | Services Using It |
|-----------|-------------|-----------------|-------------------|
| ServiceM8 API Key | `[SM8_API_KEY]` | `.credentials/servicem8.json` | SM8 API, Portal sync |
| ServiceM8 OAuth | `[SM8_OAUTH_TOKEN]` | `.credentials/servicem8_oauth.json` | SM8 email/SMS send |
| QuickBooks password | `[QB_PASSWORD]` | `.credentials/quickbooks-debt-recovery.json` | QB CDP automation |
| Gmail IMAP password | `[GMAIL_APP_PASSWORD]` | `.credentials/gmail-bills.json` | Bills to Pay IMAP |
| ProtonMail Bridge | `[PROTON_BRIDGE_PASSWORD]` | `.credentials/protonmail.json` | Silverbrook/Castle Rock email |
| Chrome debug password | `[CHROME_DEBUG_VNC_PASSWORD]` | `.credentials/chrome-debug-plist-password.json` | Mac Mini VNC |
| VPS root password | `[VPS_ROOT_PASSWORD]` | `.credentials/vps-root.json` | VPS SSH access |
| Mac Mini login | `[MAC_MINI_PASSWORD]` | `.credentials/mac-mini-password.json` | Mac Mini SSH |
| Telegram bot token | `[TELEGRAM_BOT_TOKEN]` | gateway config (env) | All Telegram messaging |
| ElevenLabs API key | `[ELEVENLABS_API_KEY]` | gateway config (env) | TTS voice cloning |
| WhatsApp Baileys session | `[WHATSAPP_SESSION]` | `.credentials/whatsapp-sessions/` | WhatsApp messaging |
| Cloudflare API token | `[CF_API_TOKEN]` | `.credentials/cloudflare.json` | DNS management |
| Vercel API token | `[VERCEL_API_TOKEN]` | `.credentials/vercel.json` | Portal deployment |
| GitHub token | `[GITHUB_TOKEN]` | `.credentials/github.json` | Portal git sync |

---

## Service Restart After Rotation

After rotating a credential, restart the affected services:

```bash
# VPS services
pm2 restart all

# OpenClaw gateway
openclaw gateway restart

# Mac Mini services
ssh holly@100.91.33.1 "launchctl kickstart -k gui/501/com.holly.chrome-debug"
ssh holly@100.91.33.1 "launchctl kickstart -k gui/501/com.holly.safari-tunnel"

# Portal sync
cd /root/portal && pm2 restart portal
```

---

## Specific Rotation Procedures

### Gmail App Password (Bills to Pay IMAP)

1. Google Account → Security → 2-Step Verification → App Passwords
2. Generate new app password (select "Mail" + "Other (Custom name)" → "Bills IMAP")
3. Update `~/.openclaw/workspace/.credentials/gmail-bills.json`:
   ```json
   {
     "email": "accounts@baselifts.co.uk",
     "app_password": "[NEW_APP_PASSWORD]"
   }
   ```
4. Test: `python3 -c "import imaplib, ssl, json; ctx=ssl.create_default_context(); ctx.check_hostname=False; ctx.verify_mode=ssl.CERT_NONE; m=imaplib.IMAP4_SSL('imap.gmail.com',993,ssl_context=ctx); m.login('accounts@baselifts.co.uk','[NEW_APP_PASSWORD]'); print('OK')"`
5. Restart any services using this credential

### QuickBooks Password

1. Intuit QB → Account → Security → Update password
2. Update `~/.openclaw/workspace/.credentials/quickbooks-debt-recovery.json`
3. Manually re-login to QB on Mac Mini Chrome (Chrome CDP session will need to be re-established)
4. Alert: QB CDP tunnel on Mac Mini may need restart

### ServiceM8 API Key

1. ServiceM8 → Settings → API → Regenerate Key
2. Update `~/.openclaw/workspace/.credentials/servicem8.json`
3. Test: `curl -s -H "X-API-Key: [SM8_API_KEY]" "https://api.servicem8.com/api_1.0/job.json?%24top=1"`
4. Alert Sally if portal sync is affected

---

## Related

- [Global Security Rules](../07-Reference/security-and-secrets.md)
- [Project Security Notes](../03-Projects/base-service-contract-manager/security-and-secrets.md)

## Last Updated

`2026-05-11`
