---
title: Agent Rules
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [agent-rules, sally]
---

# Agent Rules — Base Service Contract Manager

These rules apply to ALL agents working on the Base Service Contract Manager project. They are non-negotiable.

---

## Before Starting Any Work

### Read These Files First
Before working on this project, always read:
1. `README.md` — project overview and documentation map
2. `status.md` — current state, what's working and broken
3. `decisions.md` — all architecture and workflow decisions
4. `architecture.md` — system components, file locations, ports
5. `bugs.md` — known bugs and what agents have forgotten before
6. Relevant integration or workflow files for the specific task

Do not start building until these are read. If they are missing or stale, flag it immediately.

---

## Memory Rules

### Do Not Rely on Telegram History as Durable Memory
**Rule:** Telegram session history is not durable. Do not assume a previous conversation or decision will be remembered across sessions.
**What to do instead:**
- Write decisions to `decisions.md`
- Write status changes to `status.md`
- Write bugs to `bugs.md`
- Write build progress to `changelog.md`
- Commit and push wiki changes after meaningful work

### Update the Wiki After Meaningful Work
After completing a feature, fixing a bug, or making a decision:
1. Update `status.md` if the system state changed
2. Add an entry to `changelog.md`
3. Add any new decisions to `decisions.md`
4. Add any new bugs to `bugs.md`
5. Commit and push to GitHub

---

## ServiceM8 Rules

### ServiceM8 Is the Source of Truth
**Rule:** ServiceM8 is the authoritative data source. The portal's SQLite DB syncs FROM SM8. Never write to SM8 through the portal DB.
- `sm8_*` tables are read-only mirrors — do not modify directly
- All SM8 writes go through the SM8 API or SM8 app
- Never delete ServiceM8 records (ever)

### Never Delete ServiceM8 Records or Contract Records
**Rule:** Justin only deletes records. Holly never deletes. No agent deletes.
**What this means:**
- Do not delete jobs, companies, contacts, notes, or any SM8 records
- Do not delete portal DB records (sc_forms, approval_queue entries)
- If deletion is needed, flag it for Justin
**Exception:** Explicit, explicit Justin instruction. Verify in writing before proceeding.

### Justin Is the Only Person Who Can Approve Record Deletion
**Rule:** No agent may delete any record without Justin's explicit, verified instruction.
**What to do instead:** Archive, mark inactive, or flag for Justin.

---

## Data Rules

### SQLite / Cache Is for Speed, Not for Destructive Authority
**Rule:** The portal's SQLite DB is a speed cache. SM8 is the master.
- Do not treat the SQLite cache as authoritative
- Always verify critical data against SM8 when uncertain
- Do not use SQLite writes as the primary record-keeping mechanism

### Universal Job ID Rule: Bas-\d{4,} Only
**Rule:** Only jobs with IDs matching `Bas-\d{4,}` (Bas- + 4+ digits) are real SC jobs.
**What this means:**
- Skip all jobs without this format in SC calculations
- Exclude them from KPIs, reports, and workflows
- This applies everywhere: db.ts, portal API, scripts, reports

### Exclude Unsuccessful Jobs from All SC Workflows
**Rule:** Jobs with `status = Unsuccessful` are definitively incomplete — no debt, no contract.
**What this means:**
- Skip immediately in all invoice aging, control tower, and SC reports
- Never include them in live contract counts
- Never chase them for payment

---

## Portal Rules

### Never Send Anything to Clients Without Explicit Approval
**Rule:** All client-facing actions require Justin's explicit approval first.
- No invoices, quotes, emails, SMS
- No approval-and-send actions without verified instruction
- Internal actions allowed without approval: `add_note`, `create_invoice` (draft only)

### Portal Browser: Chrome Only
**Rule:** Use Chrome for ServiceM8 and QuickBooks automation. Never use Safari for SM8 or QB.
**Why:** Chrome has the logged-in sessions. Safari WebDriver is exclusive (one session at a time) and unreliable.
**Chrome CDP:** `http://localhost:9222` → Mac Mini Chrome debug port 9222
**Tab IDs:** ServiceM8 `8B77F0A5A19CC9D32B7090C06EB4996C` | QB `6D8251B13C4D77646C82F7B2DBF7279B`

### Deployment Rule: /root/portal Sync
**Rule:** After any commit to workspace-sally/portal, MUST pull into /root/portal and rebuild for the custom domain to update.
```bash
cd /root/portal && git pull && npm run build && pm2 restart portal
```
Vercel auto-deploys from workspace-sally for preview URLs. The custom domain uses the local VPS portal.

### Never Create New Chrome Tabs for SM8 or QB
**Rule:** Use existing Chrome tabs — they have session cookies. New tabs have no session.
**ServiceM8 tab:** `8B77F0A5A19CC9D32B7090C06EB4996C` (Dispatch Board)
**QB tab:** `6D8251B13C4D77646C82F7B2DBF7279B`

---

## Security Rules

### No Secrets in Wiki Files
**Rule:** Never store API keys, tokens, passwords, OAuth credentials, cookies, or sensitive logs in any wiki file.
**Where secrets go:** `~/.openclaw/workspace/.credentials/`
**What to never do:**
- Commit credentials to Git
- Paste them in Telegram
- Write them to wiki files
- Include them in session messages

### No Secrets in Session Messages
**Rule:** Credentials must never appear in Telegram messages or session transcripts.
**How to reference credentials:** Use the file path, not the value. E.g. "SM8 API key is in `~/.openclaw/workspace/.credentials/servicem8.json`"

---

## Wiki Rules

### Wiki Is the Source of Truth for Project State
**Rule:** The wiki at `~/OpenClaw-Wiki/` is the authoritative record of project state.
**What this means:**
- Update it after every meaningful change
- Keep it current — do not let it go stale
- Check it before asking Justin a question that is already answered there

### Commit and Push After Updating Durable Records
**Rule:** After updating wiki files (`status.md`, `changelog.md`, `decisions.md`, `bugs.md`), commit and push immediately.
```bash
cd ~/OpenClaw-Wiki && git add . && git commit -m "description" && git push origin master
```
Do not batch multiple sessions into one commit. Commit while the context is fresh.

### Before Asking Justin, Check the Wiki
**Rule:** Before asking Justin a question, check:
1. `open-questions.md` — has it already been asked?
2. `decisions.md` — has it been decided?
3. `bugs.md` — is it a known issue?
4. `status.md` — is it already flagged?

---

## SC Workflow Rules

### Signed Contract PDF Goes to ORIGINAL Job Diary
**Rule:** When a client signs the Service Contract PDF, it goes to the **original SC job diary** in SM8 — NOT the renewal job diary.
**Why:** Portal's Step 4 (Invoice Send) detection checks the original job's diary for the signed contract.
**This is confirmed with Justin (2026-04-25).**

### SC v7 Fields Are 5 Fields
**Rule:** SC v7 form has exactly 5 pricing fields:
1. `lifts_covered` — number of lifts at site
2. `visits_per_year` — service frequency (e.g. 2)
3. `full_day_rate` — full day rate (£)
4. `per_hour_rate` — per hour rate (£)
5. `minimum_callout` — minimum callout charge (£)
**Annual value:** `visits_per_year × full_day_rate`

### Renewal Price: Previous × (1 + CPI)
**Rule:** Renewal prices are calculated as: `previous_price × 1.033`
**Current CPI:** 3.3% (March 2026, ONS)
**Verify CPI:** Check ONS before each renewal batch at https://www.ons.gov.uk/economy/inflationandpriceindices

### All SC Emails Require Human Review
**Rule:** No quote, invoice, or contract email goes out without human review and explicit approval in the portal.
**CC rule:** Always CC `696d5a@inbox.servicem8.com` and `caz.h@baselifts.co.uk`

---

## Sally — SC Specialist Sub-Agent

### Sally's Workspace
- Location: `/root/.openclaw/workspace-sally/`
- Code: `/root/.openclaw/workspace-sally/portal/` (Next.js)
- Sally builds the SC portal under Holly's direction

### Sally's Sessions
- Sessions are NOT reliably persistent
- If Sally's session is gone: spawn a new sub-agent rather than trying to resume
- Always brief new Sally sessions with the wiki files

### Sally's CRON
- SC Renewal Check: runs Mon & Fri 9am
- Job ID: `bf22e172-2425-4a46-b651-8844f3a2b2df`
- Timeout: must be ≥900s (SC data fetch takes ~80s but job+diary iteration exceeds 300s at scale)

### Sally's Briefing Template
When spawning Sally for SC work, include:
```
Read both files in full before doing anything else:
- /root/.openclaw/workspace/AGENTS.md
- /root/.openclaw/workspace/LEARNINGS.md
Your job: (1) read both, (2) confirm you understand the LEARNINGS format,
(3) for your first task, check LEARNINGS.md first. Done.
```

---

## Non-Negotiable Rules Summary

| Rule | Why |
|------|-----|
| Read wiki before starting | Prevents repeated mistakes |
| Wiki is source of truth | Session memory is not durable |
| Commit after meaningful work | Prevents knowledge loss |
| SM8 is source of truth | Portal DB is a cache |
| Never delete SM8 records | Data integrity |
| Justin only deletes | Audit trail |
| No secrets in wiki | Security |
| No client emails without approval | Business integrity |
| Chrome only for SM8/QB | Chrome has the sessions |
| Sync /root/portal after commits | Deployment integrity |
| SC v7 = 5 fields | Avoid scope creep |
| Signed PDF = original job diary | Correct detection logic |
| CPI for renewals: 3.3% | Correct pricing |

---

## Last Updated

`2026-05-10`
