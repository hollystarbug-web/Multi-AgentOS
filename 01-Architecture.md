---
title: Architecture
created: 2026-05-10
tags: [architecture, system-design]
---

# Architecture

## Machine Roles

| Role | Machine | Notes |
|------|---------|-------|
| OpenClaw brain | Hetzner VPS (ubuntu-16gb-hel1-1) | Primary runtime, cron, wiki |
| Obsidian viewer/editor | Justin's MacBook Pro | Synced copy of ~/OpenClaw-Wiki |
| GUI/browser execution | Mac Mini (100.91.33.1) | Chrome CDP, Codex Computer Use |

## System Topology

```
Internet
  ├── Telegram/WhatsApp → OpenClaw Gateway (VPS:18789)
  │                          └── Channel integrations (Telegram, WhatsApp via Baileys)
  │
  ├── HTTPS → ServiceM8 (go.servicem8.com) — Chrome CDP via Mac Mini tunnel
  │            ↳ Chrome on Mac Mini (debug port 9222) → VPS localhost:9222
  │
  ├── HTTPS → QuickBooks (qbo.intuit.com) — Chrome CDP via Mac Mini
  │
  ├── VPS:3000 → SC Portal (Next.js on Vercel / nginx reverse proxy)
  │              ↳ /root/portal/ — local Next.js build (used via nginx)
  │              ↳ dashboard.baselifts.co.uk
  │
  ├── VPS:3001 → Portal API server (PM2, node /root/portal-api/server.js)
  │              ↳ SQLite at /tmp/portal.db (sc_forms, approval_queue, sm8_* tables)
  │              ↳ SM8 sync every 1 min via /root/run-sync.sh
  │
  ├── VPS → Mac Mini SSH tunnel
  │          ↳ Reverse SSH: Mac Mini:22 → VPS:2222
  │          ↳ Chrome CDP: Mac Mini:9222 → VPS:9222
  │          ↳ Safari WebDriver: Mac Mini:9225 → VPS:9225
  │
  └── ~/OpenClaw-Wiki/ (VPS) ← Git sync → Obsidian (MacBook Pro)
```

## Key Running Services

| Service | Location | Port | Purpose |
|---------|----------|------|---------|
| OpenClaw Gateway | VPS | 18789 | Primary AI runtime |
| Portal (Next.js) | VPS /nginx | 3000 | SC Dashboard web UI |
| Portal API | VPS PM2 | 3001 | SC data persistence (SQLite) |
| Chrome CDP tunnel | Mac Mini LaunchAgent | 9222 | Browser automation |
| Safari WebDriver | Mac Mini LaunchAgent | 9225 | Safari automation |

## Database Architecture

### Portal SQLite (/tmp/portal.db)

Source of truth for SC Portal. Syncs FROM ServiceM8 every ~1 minute.

**Tables:**
- `sm8_companies` — ServiceM8 company cache
- `sm8_jobs` — ServiceM8 job cache
- `sm8_company_contacts` — ServiceM8 contact cache
- `sc_forms` — SC intake forms (draft records)
- `approval_queue` — Pending approvals
- `portal_settings` — Key-value config
- `lead_source_options` — Lead source dropdown values

**CRITICAL RULE:** SQLite is a speed cache. SM8 is the source of truth. All data originates in SM8 and syncs TO SQLite. Never delete records.

## Network Access

- VPS public IP: 204.168.251.149
- Tailscale: 100.87.207.10 (VPS node)
- Mac Mini: 100.91.33.1 (Tailscale)
- SSH: root@cX4ugxfwvFPh@204.168.251.149

## Last Updated

`2026-05-10` — Initial architecture documentation
