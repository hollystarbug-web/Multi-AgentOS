---
title: Knowledge Migration
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [knowledge, migration, documentation]
---

# Knowledge Migration — Base Service Contract Manager

**Date:** 2026-05-10
**Purpose:** Document what knowledge was found, where it was found, what is still missing, and what risks exist.

---

## Sources Checked

### Wiki Files (Existing)
- `~/OpenClaw-Wiki/03-Projects/base-service-contract-manager/` (14 files)
  - `status.md` — brief, needs expansion
  - `changelog.md` — only May 10 entry
  - `decisions.md` — partial decisions
  - `architecture.md` — mostly correct
  - `data-model.md` — has errors
  - `servicem8-integration.md` — partial
  - `service-contract-workflow.md` — basic steps, needs edge cases
  - `bugs.md` — only Bug #001
  - `open-questions.md` — generic, needs specifics
  - `agent-rules.md` — basic
  - `todo.md` — generic
  - `README.md` — good project intro
  - `prompts.md` — reusable prompts
  - `security-and-secrets.md` — security rules
  - `macmini-codex-routing.md` — automation routing

### Workspace Files
- `~/.openclaw/workspace/MEMORY.md` — long-term memory, SC portal section
- `~/.openclaw/workspace/LEARNINGS.md` — rules and lessons
- `~/.openclaw/workspace/TOOLS.md` — tools reference
- `~/.openclaw/workspace/memory/2026-04-28.md` — deployment fix, DB path bug
- `~/.openclaw/workspace/memory/2026-04-29.md` — Mac Mini setup, Chrome CDP
- `~/.openclaw/workspace/memory/2026-04-30.md` — agent-browser discovery
- `~/.openclaw/workspace/memory/2026-05-01.md` — wiki setup started
- `~/.openclaw/workspace/docs/ServiceM8_API.md` — SM8 API reference

### Sally's Workspace
- `~/.openclaw/workspace-sally/docs/docs/SC-PORTAL-WORKFLOW-SPEC-v1.md` — build spec (authoritative)
- `~/.openclaw/workspace-sally/docs/docs/SC-PORTAL-CONTEXT-2026-04-24.md` — full session context
- `~/.openclaw/workspace-sally/docs/docs/SC-PORTAL-CONTEXT-2026-04-25.md` — walkthrough with Justin
- `~/.openclaw/workspace-sally/docs/docs/sc-database-schema.md` — **OBSOLETE** — old schema
- `~/.openclaw/workspace-sally/docs/docs/ServiceM8_API.md` — SM8 API reference
- `~/.openclaw/workspace-sally/docs/docs/ServiceM8_API_Migration_Guide.md` — API guide
- `~/.openclaw/workspace-sally/docs/docs/FIELD_TECH_PROFILES.md` — field tech profiles
- `~/.openclaw/workspace-sally/memory/2026-04-15` through `2026-04-26.md` — daily logs

### VPS Deployed Code
- `/root/portal/lib/db.ts` — **current** database schema and logic
- `/root/portal/scripts/sync-sm8.js` — SM8 sync script
- `/root/portal-api/server.js` — VPS API server (where the INSERT bug was fixed)
- `/root/portal/` — VPS Next.js portal (what's actually deployed)
- `/root/portal/app/api/` — Next.js API routes

---

## Knowledge Successfully Migrated

### Architecture
- ✅ Dual-process architecture: Next.js portal (port 3000) + VPS API (port 3001) + SQLite at /tmp/portal.db
- ✅ Deployment rule: sync /root/portal after workspace-sally commits
- ✅ Sync script: PID lock, SC category only, overlap protection
- ✅ Chrome CDP: Mac Mini Chrome debug port 9222, tab IDs, agent-browser CLI
- ✅ Safari WebDriver: separate tunnel, Safari-only tasks
- ✅ QB CDP: login requires clicking pre-filled email button first

### Build History
- ✅ Apr 24: Project started, spec written, Sally briefed
- ✅ Apr 25: SC v7 fields confirmed (5 fields), signed contract = original job diary confirmed
- ✅ Apr 28: Critical deployment fix (/root/portal 11 commits behind), DB path bug (portal-api vs portal)
- ✅ Apr 29: Chrome CDP fully operational, Mac Mini reverse tunnel, QB CDP scripts working
- ✅ Apr 30: ServiceM8 automation via agent-browser, Chrome session discovery
- ✅ May 5: Chrome-only rule established, wiki setup
- ✅ May 10: INSERT bug fixed, wiki migrated

### SC Workflow
- ✅ 7-step lifecycle confirmed
- ✅ SC v7 5-field list confirmed
- ✅ Signed contract = ORIGINAL job diary confirmed
- ✅ CPI rate: 3.3% (March 2026, ONS)
- ✅ 6-week renewal window, 2-month cancellation
- ✅ RENEW creates new SM8 job via API
- ✅ INITIATE checklist (3 steps in SM8)

### Decisions
- ✅ SQLite for speed, SM8 as source of truth
- ✅ Justin-only deletes rule
- ✅ Chrome-only for SM8 and QB
- ✅ Two lead source options only
- ✅ Universal job ID rule: Bas-\d{4,} only
- ✅ Exclude Unsuccessful jobs from all SC workflows

### Bugs Found
- ✅ Bug #001: INSERT failure (fixed)
- ✅ Bug #002: DB path mismatch (fixed)
- ✅ Bug #003: /root/portal 11 commits behind (fixed)

---

## Knowledge Not Found / Still Missing

### Critical Gaps
1. **Nginx configuration** — Is nginx currently proxying to /root/portal or Vercel? The nginx config was not read.
2. **approval_queue schema** — Does production DB have `invoicing_address` column? Needs verification via SQL.
3. **SC v7 field storage** — Justin hasn't confirmed whether fields should also sync to SM8 task fields.
4. **Renewal rejection path** — What happens if a renewal is rejected at Step 7?
5. **Portal user roles** — Who can approve vs who can submit? Clerk role definitions unknown.
6. **Signing workflow** — Is DocuSign integrated? How do signed contracts return?
7. **Clerk auth stability** — No session management code found. Does it work reliably?

### Medium Gaps
8. **SM8 custom field names** — Are `customfield_frequency_of_visits` etc. correct? No SM8 field inspector run.
9. **SM8 diary attachment detection** — Does `/note.json` reliably return document-type notes?
10. **SC checklist API scope** — Conflicting reports on whether API key can write tasks.
11. **Renewal category sync** — Sync script doesn't sync renewal jobs. Portal fetches live. Sufficient?
12. **Vercel vs local strategy** — Long-term intent unknown.
13. **SC SLA / follow-up timing** — How long to wait before chasing unanswered quotes?

### Could Not Verify
14. **Pm2 process health** — Are both `portal` and `portal-api` PM2 processes running reliably?
15. **Portal DB size** — Is /tmp/portal.db growing unboundedly?
16. **Sync script log** — `/var/log/sync-sm8.log` was not checked.
17. **Workspace-sally vs /root/portal diff** — Are they in sync now?
18. **SC exclusion list completeness** — 117 IDs listed. Are they all still correct?

---

## Risks

### Risk 1: Portal Code Drift 🔴
**Risk:** workspace-sally/portal and /root/portal may have diverged. Sally may have committed changes not synced to /root/portal.
**Mitigation:** Run `cd /root/portal && git log --oneline -5` and compare to Sally's last commit.
**Action needed:** Verify /root/portal is up to date before next build session.

### Risk 2: Production DB Schema Mismatch 🟡
**Risk:** `approval_queue.invoicing_address` column may not exist in production.
**Mitigation:** Run `sqlite3 /tmp/portal.db "PRAGMA table_info(approval_queue);"` to verify.
**Action needed:** Check schema and fix if missing.

### Risk 3: Insert Bug May Have Affected Other Jobs 🟡
**Risk:** The INSERT bug was present since portal build. Only Bas-4529 was recovered. Other jobs may have failed silently.
**Mitigation:** Search SM8 for jobs created via portal that don't have a corresponding `sc_forms` record.
**Action needed:** Audit all SM8 SC jobs against portal `sc_forms` table.

### Risk 4: SC v7 Field Storage Ambiguity 🟡
**Risk:** Fields are in portal DB only. Staff working in SM8 can't see or edit them.
**Mitigation:** Confirm with Justin whether SM8 task field storage is needed.
**Action needed:** Get Justin's answer to Q1 in open-questions.md.

### Risk 5: Renewal Jobs Not Synced 🟢
**Risk:** Sync script doesn't mirror renewal jobs. Portal fetches live. API rate limits could cause gaps.
**Mitigation:** Monitor portal for missing renewal data.
**Action needed:** Verify live fetch approach works reliably at scale.

### Risk 6: Session Memory Lost Between Sessions 🟢
**Risk:** Open questions and partial decisions from April 24-28 sessions were in Telegram memory and session transcripts. Some may have been lost.
**Mitigation:** Read Sally's memory files from April 24-26.
**Action needed:** Read `~/.openclaw/workspace-sally/memory/2026-04-24.md` through `2026-04-26.md`.

---

## Recommended Next Actions Before Continuing Build

### Immediate (Do These First)
1. **Verify /root/portal is in sync** with workspace-sally:
   ```bash
   cd /root/portal && git log --oneline -3
   cd ~/.openclaw/workspace-sally/portal && git log --oneline -3
   ```
2. **Check approval_queue schema:**
   ```bash
   sqlite3 /tmp/portal.db "PRAGMA table_info(approval_queue);"
   ```
3. **Verify nginx config** — which portal is serving dashboard.baselifts.co.uk?
   ```bash
   cat /etc/nginx/sites-available/portal
   ```
4. **Read Sally's memory files** from April 24-26:
   - `~/.openclaw/workspace-sally/memory/2026-04-24.md`
   - `~/.openclaw/workspace-sally/memory/2026-04-25.md`
   - `~/.openclaw/workspace-sally/memory/2026-04-26.md`

### Then (Before Next Build Session)
5. **Answer Q1-Q8** in `open-questions.md` with Justin
6. **Test end-to-end SC workflow** with a real or test client
7. **Verify renewal job detection** — create a test renewal and verify it appears
8. **Audit SC jobs** — compare SM8 SC jobs against portal `sc_forms` table

---

## Sally's Obsolete Schema — Do Not Use

**File:** `~/.openclaw/workspace-sally/docs/docs/sc-database-schema.md`

This file describes Sally's original 2026-04-23 SQLite schema with tables:
`clients`, `sc_jobs`, `visits`, `price_history`, `renewals`, `pending_actions`, `diary_notes`

**This schema was never deployed.** The production schema is in:
- `/root/portal/lib/db.ts` (Next.js portal)
- `/root/portal-api/server.js` (VPS API server)

**Do not reference Sally's old schema.** The production tables are: `sc_forms`, `approval_queue`, `sm8_jobs`, `sm8_companies`, `sm8_company_contacts`, `portal_settings`, `lead_source_options`.

---

## What Remains Uncertain

1. **Portal deployment strategy** — Vercel vs local VPS long-term
2. **Approver workflow** — Who approves quotes? Is it always Justin?
3. **Initiation checklist** — Is the 3-step checklist complete? Does portal automate all 3?
4. **Diary attachment detection** — Is `/note.json` the right endpoint?
5. **SC v7 field rendering** — Is there a separate SC v7 checklist/PDF, or is it just the portal form?
6. **Renewal CPI update process** — Who updates the CPI rate in the portal before each renewal batch?
7. **Portal SC form UI** — Which tab/page is the SC v7 form rendered on?

---

## Last Updated

`2026-05-10`
