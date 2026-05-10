---
title: Architecture
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [architecture, technical]
---

# Architecture — Base Service Contract Manager

## System Overview

```
User (Justin + Staff) ── HTTPS ──► dashboard.baselifts.co.uk
                                          │
                                          ▼
                               ┌──────────┴──────────┐
                               │    nginx (VPS)       │
                               │  proxies to port 3000 │
                               └──────────┬──────────┘
                                          │
                              ┌───────────┴───────────┐
                              │    Next.js Portal       │
                              │    /root/portal        │
                              │    port 3000           │
                              │    (Clerk auth)        │
                              └───────────┬───────────┘
                                          │ API calls
                              ┌───────────┴───────────┐
                              │   VPS API Server      │
                              │   /root/portal-api    │
                              │   port 3001           │
                              │   (PM2: portal-api)   │
                              └───────────┬───────────┘
                                          │
                      ┌───────────────────┼───────────────────┐
                      │                   │                   │
                      ▼                   ▼                   ▼
             ┌──────────────┐  ┌─────────────────┐  ┌──────────────┐
             │ /tmp/        │  │ ServiceM8 API   │  │ Clerk Auth   │
             │ portal.db    │  │ (live + mirror) │  │ (passkeys)   │
             │ (SQLite)     │  └────────┬────────┘  └──────────────┘
             └──────┬───────┘           │
                      │          ┌───────┴───────┐
             ┌───────┴───────┐  │ SM8 Sync      │
             │ sync-sm8.js   │  │ (every ~1min) │
             │ (cron)        │  └───────────────┘
             └───────────────┘

        Mac Mini (100.91.33.1)
        ↳ Chrome (SM8 + QB sessions live, CDP :9222)
        ↳ Codex Computer Use (VNC)
        ↳ Safari WebDriver (:9225)
```

## Component Details

### Portal UI — Next.js (Vercel + VPS Local)

**Vercel deployment:**
- **Repo:** `hollystarbug-web/BaseSC_dashboard`
- **Vercel project:** `base-sc-dashboard`
- **Preview URL:** `https://base-sc-dashboard.vercel.app`

**VPS local deployment:**
- **Path:** `/root/portal/`
- **Port:** 3000
- **Auth:** Clerk passkeys
- **Deployed via:** nginx on VPS

**URL:** https://dashboard.baselifts.co.uk
**DNS:** CNAME `dashboard` → `9652a0358d21c446.vercel-dns-017.com` (Cloudflare)

**Sync rule (CRITICAL):** After any commit to `/root/.openclaw/workspace-sally/portal/`, pull into `/root/portal/` and rebuild:
```bash
cd /root/portal && git pull && npm run build && pm2 restart portal
```
Sally's workspace commits do NOT auto-deploy to the custom domain — they need syncing to `/root/portal`.

### Portal API Server — VPS (Node.js PM2)

**Path:** `/root/portal-api/`
**Port:** 3001
**PM2 name:** `portal-api`
**Startup command:** `node server.js`

Handles:
- `POST /api/sc-form` — Step 1: save SC intake form
- `POST /api/sc-form-existing` — Step 2: update SC form + create approval queue entry
- `GET /api/sc-jobs-pending` — list draft jobs
- `GET /api/approval-queue` — list pending approvals
- `GET /api/approval-queue/detail` — single approval + form
- `GET/POST /api/portal-settings` — labour rates, etc.

**Note:** Both `portal` (Next.js) and `portal-api` (VPS server.js) write to the SAME `/tmp/portal.db`. This was a source of bugs when they used different paths.

### Database — SQLite at /tmp/portal.db

**Location:** `/tmp/portal.db`
**Type:** SQLite (WAL mode)
**Shared by:** Next.js portal, VPS API server, sync script

**Tables:**
- `sc_forms` — SC intake forms (draft records)
- `approval_queue` — Pending approvals
- `sm8_jobs` — SM8 job mirror (synced from SM8 every ~1 min)
- `sm8_companies` — SM8 company mirror
- `sm8_company_contacts` — SM8 contact mirror
- `portal_settings` — key-value settings (labour rates, etc.)
- `lead_source_options` — dropdown values

**Source of truth:** ServiceM8 is the authoritative source. SQLite is a local speed cache. Never write to `sm8_*` tables directly.

### SM8 Sync Script — sync-sm8.js

**Path:** `/root/portal/scripts/sync-sm8.js`
**Schedule:** Every ~1 minute via `/root/run-sync.sh`
**Lock:** Uses `/tmp/sync-sm8.pid` for overlap protection

Syncs FROM SM8 TO SQLite:
- `sm8_companies` — all active companies
- `sm8_company_contacts` — all company contacts
- `sm8_jobs` — SC category jobs only (NOT renewal category)

**Known gap:** Renewal Invoice category jobs (`a04b781f-047f-4db4-9872-241accbf1f8b`) are NOT synced to SQLite. Portal fetches them live from SM8 API at request time.

### ServiceM8 Integration

**API Key:** `smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7`
**Base URL:** `https://api.servicem8.com/api_1.0`

**Two access methods:**
1. **Direct API calls** (from db.ts and portal API): For live data, KPIs, dashboard metrics, job creation
2. **Chrome CDP** (via agent-browser on Mac Mini): For UI operations, diary checks, document uploads

**Categories:**
- SC standard: `6d2fd47f-4ae0-4041-8cc0-22e739804a6b`
- SC Renewal Invoice: `a04b781f-047f-4db4-9872-241accbf1f8b`

**OAuth:** For email/SMS sending. Credentials at `~/.openclaw/workspace/.credentials/servicem8_oauth.json`. Token auto-refreshes.

### Tab Structure (Portal UI)

| Tab | Purpose |
|-----|---------|
| Pipeline | New Contract → Contract & Invoice → Approve Email |
| Awaiting Payment | Invoice Send + Initiate or Chase (unpaid) |
| Active/Initiated | Live contracts after INITIATE |
| Renewals | Renewal queue + Renewal Approval |

### Dashboard Metrics

| Metric | Source | Definition |
|--------|--------|------------|
| Live Contracts | SM8 API | `payment_received === 1` + valid Bas-XXXX |
| Annual Revenue | SM8 API | Sum of paid SC job invoice amounts |
| Renewals Invoice Due | SM8 API | Paid SC jobs with renewal_date within 6 weeks |
| Invoices Unpaid | SM8 API | Active SC jobs, invoice sent, not paid |
| Quotes Sent Unanswered | SM8 API | Active SC jobs with status = Quote |

## Mac Mini Browser Automation

### Chrome CDP (Primary — for SM8 and QB)

**LaunchAgent:** `com.holly.chrome-debug.plist`
**Endpoint:** `http://localhost:9222` (VPS) → Mac Mini Chrome debug port 9222
**Chrome tab IDs:**
- ServiceM8: `8B77F0A5A19CC9D32B7090C06EB4996C` (Dispatch Board)
- QuickBooks: `6D8251B13C4D77646C82F7B2DBF7279B`

**Tool:** `agent-browser` CLI at `/opt/homebrew/lib/node_modules/agent-browser/bin/agent-browser-darwin-arm64`
**Navigation:** Always use eval with s_auth token — `agent-browser open <url>` loses session.

### Safari WebDriver (Secondary — Safari only)

**LaunchAgent:** `com.holly.safari-tunnel.plist`
**Endpoint:** `http://localhost:9225` (VPS) → Mac Mini Safari WebDriver
**Watchdog:** Cron every 15 min auto-restarts tunnel if down.
**Use:** Safari-specific tasks ONLY. NOT for SM8 or QB.

### Codex Computer Use (Full Desktop Control)

**For:** Visual reasoning, native macOS apps, multi-app coordination, expired sessions.
**Access:** `ssh holly@100.91.33.1 "/Applications/Codex.app/Contents/MacOS/Codex --search '...' --ask-for-approval never"`

## Deployment Architecture

| Environment | URL | Notes |
|-------------|-----|-------|
| Production (nginx→VPS) | dashboard.baselifts.co.uk | `/root/portal/` port 3000 |
| Vercel preview | base-sc-dashboard.vercel.app | Auto-deploys from workspace-sally |
| Local dev | localhost:3000 | `cd /root/portal && npm run dev` |
| VPS API | http://localhost:3001 | PM2 `portal-api` |

## Service Accounts

| Service | Account | Access Method |
|---------|---------|--------------|
| ServiceM8 | justin.howard@silverbrookcm.com | Chrome session (Mac Mini) |
| QuickBooks | debt_recovery@baselifts.co.uk | Chrome session (Mac Mini) |
| Gmail/Chrome | justin.howard@silverbrookcm.com | Chrome session (Mac Mini) |
| ServiceM8 API | `smk-4457bf-...` | Direct API calls |

## File Locations

| What | Location |
|------|----------|
| Portal code (VPS) | `/root/portal/` |
| Portal code (workspace) | `/root/.openclaw/workspace-sally/portal/` |
| Portal API | `/root/portal-api/server.js` |
| SM8 sync script | `/root/portal/scripts/sync-sm8.js` |
| SQLite DB | `/tmp/portal.db` |
| Nginx config | `/etc/nginx/sites-available/portal` |
| PM2 processes | `portal` (port 3000) + `portal-api` (port 3001) |
| Wiki | `/root/OpenClaw-Wiki/` |

## Last Updated

`2026-05-10`
