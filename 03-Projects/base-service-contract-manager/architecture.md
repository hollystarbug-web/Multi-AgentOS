---
title: Architecture
project: Base Service Contract Manager
created: 2026-05-10
tags: [architecture, technical]
---

# Architecture — Base Service Contract Manager

## System Overview

```
User (Justin) ── Telegram/WhatsApp ──► OpenClaw Gateway (VPS)
                                              │
                                              ▼
                                    ┌─────────┴───────┐
                                    │   VPS Services   │
                                    ├─────────────────┤
                                    │ Portal UI :3000 │
                                    │ (Next.js/Vercel│
                                    │  + nginx)       │
                                    ├─────────────────┤
                                    │ Portal API :3001│
                                    │ (PM2/SQLite)   │
                                    │ /tmp/portal.db  │
                                    ├─────────────────┤
                                    │ OpenClaw Wiki   │
                                    │ ~/OpenClaw-Wiki │
                                    └────────┬────────┘
                                             │ 1-min sync
                                             ▼
                                    ┌─────────────────┐
                                    │  ServiceM8 API  │
                                    │  (source of    │
                                    │   truth)        │
                                    └─────────────────┘
                                             ▲
                              Chrome CDP     │
                           (Mac Mini :9222)─┘
                             
                         Mac Mini (100.91.33.1)
                         ↳ Chrome (SM8 + QB sessions live)
                         ↳ Codex Computer Use (VNC)
```

## SC Portal Dashboard

- **URL:** https://dashboard.baselifts.co.uk
- **Vercel Project:** `base-sc-dashboard`
- **Repo:** `hollystarbug-web/BaseSC_dashboard`
- **Local Build:** `/root/portal/` (PM2)

### Tab Structure

| Tab | Purpose |
|-----|---------|
| Pipeline | New Contract → Contract & Invoice → Approve Email |
| Awaiting Payment | Invoice Send + Initiate or Chase (unpaid) |
| Active/Initiated | Live contracts after INITIATE |
| Renewals | Renewal queue + Renewal Approval |

## Database Schema

See `data-model.md` for full schema.

**Key tables:**
- `sm8_companies`, `sm8_jobs`, `sm8_company_contacts` — SM8 sync cache
- `sc_forms` — SC intake forms (draft)
- `approval_queue` — Pending approvals

## Browser Automation Architecture

### Chrome CDP (Mac Mini)
- Chrome is permanently logged into SM8 and QB
- CDP port 9222 → reverse tunnel → VPS localhost:9222
- Managed by LaunchAgent `com.holly.chrome-debug.plist`
- **Never create new tabs** — use existing tabs (they have session cookies)

### Safari WebDriver (Mac Mini)
- Separate LaunchAgent `com.holly.safari-tunnel.plist`
- Port 9225 → VPS localhost:9225
- Watchdog cron restarts every 15 minutes
- **Use only for Safari-specific tasks**

### Codex Computer Use (Mac Mini)
- Full desktop control via VNC Screen Sharing
- For tasks requiring visual reasoning, multiple apps, or expired sessions
- `ssh holly@100.91.33.1 /Applications/Codex.app/...`

## Deployment Architecture

| Environment | URL | Notes |
|------------|-----|-------|
| Production | dashboard.baselifts.co.uk | Vercel + nginx proxy |
| Local dev | localhost:3000 | Next.js dev server |
| VPS local | http://localhost:3001 | Portal API server |

## Service Accounts

| Service | Account | Credentials Location |
|---------|---------|---------------------|
| ServiceM8 | justin.howard@silverbrookcm.com | Chrome session |
| QuickBooks | debt_recovery@baselifts.co.uk | Chrome session |
| Gmail/Chrome | justin.howard@silverbrookcm.com | Chrome session |

## Last Updated

`2026-05-10`
