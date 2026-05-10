---
title: Decisions
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [decisions, design-decisions]
---

# Decisions — Base Service Contract Manager

## Architecture Decisions

### SQLite as Speed Cache, SM8 as Source of Truth (2026-04-24)
**Decision:** Portal uses SQLite for speed, ServiceM8 as authoritative data source.
**Reasoning:** SQLite enables fast local reads/writes without hammering SM8 API. SM8 is the master record. All data originates in SM8 and syncs TO SQLite.
**Source:** Justin confirmed 2026-04-24

### Dual-Process Architecture — Two Processes Share /tmp/portal.db (2026-04-28)
**Decision:** Both the Next.js portal (port 3000) and the VPS API server (port 3001) share `/tmp/portal.db`.
**Reasoning:** Step 1 (NewContractTab) saves to the VPS API (`server.js`). Step 2 (SCFormTab) reads from the Next.js API routes. Both must use the same database.
**Bug fixed 2026-04-28:** portal-api was using `/var/lib/portal/portal.db` while portal used `/tmp/portal.db`. Fixed by setting both to `/tmp/portal.db`.
**Source:** Holly, during debugging

### Portal Syncs Live from SM8 + SQLite Mirror (2026-04-24)
**Decision:** Portal fetches live data from SM8 API for dashboard metrics, KPI counts, and client lists. The SQLite mirror (synced every ~1 min) is used for the Awaiting Payment list and for renewal price lookups.
**Reasoning:** Real-time accuracy for actionable items (approval queue, payments). SQLite for historical/enriched data.
**Source:** db.ts architecture in `/root/portal/lib/db.ts`

### SC Jobs: Direct SM8 API Fetch for Live Data (2026-04-24)
**Decision:** `db.ts` fetches SC and Renewal category jobs directly from SM8 API (no SQLite cache) for: KPIs, renewals window, active contracts, awaiting payment.
**Reasoning:** Real-time accuracy is critical for actionable data. Cache TTL = 5 minutes.
**Source:** db.ts in `/root/portal/lib/db.ts`

### SM8 Sync Script: Overlap Protection via PID File (2026-04-24)
**Decision:** `sync-sm8.js` uses `/tmp/sync-sm8.pid` to prevent overlapping runs.
**Reasoning:** If sync takes longer than the cron interval, the next run skips rather than overlapping.
**Source:** sync-sm8.js

### Deployment: VPS Local + Vercel (2026-04-28)
**Decision:** The Next.js portal has two deployments:
- **Local VPS:** `/root/portal` on port 3000 — served via nginx for dashboard.baselifts.co.uk
- **Vercel:** `base-sc-dashboard` — deployed from workspace-sally/portal, serves .vercel.app preview domain
**Sync rule (2026-04-28):** After any commit to workspace-sally/portal, MUST pull into /root/portal and rebuild for the custom domain to update.
**Source:** Holly + Justin

### Renewals: Portal Fetches Renewal Jobs Live from SM8 API (2026-05-10)
**Decision:** The portal fetches both SC category (`6d2fd47f-...`) and SC Renewal Invoice category (`a04b781f-...`) directly from SM8 API at request time. The sync script only syncs SC category jobs to `/tmp/portal.db`.
**Reasoning:** Renewal jobs are less frequent; fetching live avoids stale data issues.
**Source:** db.ts `getSCJobs()`

### Browser Automation: Chrome Only for SM8 and QB (2026-05-05)
**Decision:** Chrome is the permanent, authoritative browser for ServiceM8 and QuickBooks automation.
**Reasoning:** Chrome has the logged-in sessions for both. Safari WebDriver is exclusive (one session at a time) — not reliable.
**Source:** TOOLS.md — "PERMANENT BROWSER RULE"

### Machine Roles Architecture (2026-04-29)
**Decision:** Define clear machine roles:
- **VPS:** OpenClaw brain, primary runtime, wiki host
- **MacBook Pro:** Obsidian viewer/editor (wiki)
- **Mac Mini:** GUI/browser execution node, Chrome DevTools, Codex
**Source:** Justin 2026-04-29

## SC Workflow Decisions

### 7-Step SC Lifecycle (2026-04-24)
**Decision:** Implement 7-step workflow: New Contract → Contract & Invoice → Approve Email → Invoice Send → Initiate or Chase → Contract Renewal → Renewal Approval.
**Source:** Justin's New_automated_Service_Contract_Process_Desired.docx

### SC v7 Fields (2026-04-25) — CONFIRMED
**Decision:** 5 SC v7 form fields: `lifts_covered`, `visits_per_year`, `full_day_rate`, `per_hour_rate`, `minimum_call_out`.
**Location:** Stored in portal `sc_forms` SQLite table only. NOT in SM8 task/checklist fields.
**Reasoning:** Staff workflow is portal-first. Fields are visible and editable in the portal. SM8 task fields are not required.
**Confirmed by:** Justin (2026-05-10)
**Source:** Justin, SC workflow walkthrough

### CPI Rate: 3.3% (March 2026)
**Decision:** Use 3.3% CPI (ONS) for renewal price calculations.
**Source:** SC Portal Workflow Spec v1

### 6-Week Renewal Window
**Decision:** Renewal invoice sent 6 weeks before renewal date.
**Cancellation notice:** 2 months before renewal date.
**Source:** SC Portal Workflow Spec v1

### Signed Contract PDF Location — CONFIRMED (2026-04-25)
**Decision:** Signed contract PDF goes to ORIGINAL job diary, NOT renewal job diary.
**Reasoning:** Portal's contract-received detection (Step 4) must check the original job diary, not the renewal job diary.
**Source:** Justin confirmed 2026-04-25

### Dashboard Metric Definitions (2026-04-24)
**Decision:**
- **Live Contracts** = `payment_received === 1` only (invoice paid = live)
- **Quoted Not Paid** (was "Pending") = invoice sent, not paid
- **Active** = paid + active jobs
- **Renewals Due** = active SC jobs with renewal_date within 6 weeks
- **Invoices Unpaid** = active SC jobs where invoice sent but not paid
- **Quotes Sent Unanswered** = jobs with status = "Quote", not "Unsuccessful"
**Source:** Justin + Holly 2026-04-24

### Lead Source: 2 Options (2026-04-28)
**Decision:** Only 2 lead source options in NewContractTab:
1. Impact Automation (base)
2. Impact Automation 10% (adds "Add 10% for AI team" badge + appends `\nCode: IA-10`)
**Source:** Justin

### QB Login: Pre-Filled Email Button, Not Text Field
**Decision:** QB sign-in has a pre-filled email BUTTON (shows email + "Last accessed [date]"). Must click the button first, then fill password.
**Password step:** Button says "Continue" not "Sign in".
**Source:** Holly discovery 2026-04-29

## Data Decisions

### Universal Job ID Rule: Bas-\d{4,} Only
**Decision:** Only jobs with job IDs matching `Bas-\d{4,}` (Bas- + 4+ digits) are real SC jobs.
**Reasoning:** Excludes test jobs, system records, and malformed IDs from all SC calculations.
**Source:** db.ts `VALID_JOB_ID` regex

### Exclude Unsuccessful Jobs from All SC Workflows
**Decision:** Jobs with `status = Unsuccessful` are definitively incomplete — no debt, no contract. Always skip.
**Reasoning:** Dead records that should never appear in KPIs, reports, or workflows.
**Source:** LEARNINGS.md hard rule

### Never Delete Anything (2026-04-24)
**Decision:** Justin only deletes records. Holly never deletes.
**Reasoning:** Data integrity and audit trail.
**Source:** Justin — "THIS IS A GLOBAL RULE."

## Last Updated

`2026-05-10`
