---
title: Bugs
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [bugs, issues]
---

# Bugs — Base Service Contract Manager

## Known Bugs

### Bug #001 — sc-forms INSERT Failure (FIXED)
**Date:** 2026-05-10
**Severity:** Critical
**Status:** Fixed
**Found by:** Holly during DVB Capital Assets II LLC (Bas-4529) investigation

**Description:** The VPS API's `POST /api/sc-form` INSERT prepared statement in `/root/portal-api/server.js` had a parameter count mismatch. The VALUES clause provided the wrong number of values compared to the column list. SQLite threw `RangeError: Too few parameter values were provided`.

**Root Cause:** The original INSERT statement was missing the `company_uuid` placeholder and had incorrect parameter mapping. The prepared statement failed silently because the SM8 job was created before the INSERT — so the SM8 API call succeeded but the portal DB record was never saved.

**Impact:** Every Step 1 submission since the portal was built failed silently. No `sc_forms` record was ever created for any job. Jobs appeared in SM8 but not in the portal pipeline.

**Fix Applied:**
- Corrected VALUES clause in `/root/portal-api/server.js` — aligned to match all 29 table columns
- Restarted PM2 `portal-api` service
- Verified INSERT now works: `curl POST /api/sc-form` returns `{"success":true,...}`

**Recovery:**
- Manually inserted missing `sc_forms` record for Bas-4529 (DVB Capital Assets II LLC) into `/tmp/portal.db`
- Job now appears in portal Step 2 queue

**Files affected:** `/root/portal-api/server.js`

**Lesson:** When an API creates two resources (SM8 job + DB record) in sequence, check the second write's success before returning to the caller.

---

### Bug #002 — portal-api Used Wrong DB Path (FIXED)
**Date:** 2026-04-28
**Severity:** Critical
**Status:** Fixed
**Found by:** Holly during debugging

**Description:** `portal-api` (PM2 `portal-api`, port 3001) was using `/var/lib/portal/portal.db`. `portal` (Next.js, port 3000) was using `/tmp/portal.db`. Step 1 saved `job_description` via the API to the wrong DB path. Step 2 read from the portal's own API which pointed to the other DB — so `job_description` was always empty in Step 2.

**Fix Applied:**
- Changed `portal-api` to use `/tmp/portal.db` (same as portal)
- Rebuilt and restarted both PM2 processes

**Lesson:** When two processes share a database, document the shared path explicitly. Use a constant, not a hardcoded path, in both codebases.

---

### Bug #003 — /root/portal 11 Commits Behind (FIXED)
**Date:** 2026-04-28
**Severity:** High
**Status:** Fixed
**Found by:** Holly

**Description:** The local VPS portal at `/root/portal` was 11 commits behind workspace-sally/portal. Nginx was proxying to the local portal instead of Vercel, so all changes to workspace-sally/portal weren't reaching dashboard.baselifts.co.uk.

**Fix Applied:**
- Pulled workspace-sally/portal into /root/portal
- Rebuilt: `cd /root/portal && npm run build`
- PM2 restarted portal on port 3000

**Rule:** After any portal commit in workspace-sally, MUST pull into /root/portal and rebuild.

**Lesson:** Auto-deploy pipelines need a monitoring step. When two deployment targets exist (Vercel + local VPS), the local VPS path must be explicitly maintained.

---

## What Agents Have Forgotten

### Forgetting: /root/portal Sync Rule
**When:** April 28, 2026
**What was forgotten:** After Sally committed changes to workspace-sally/portal, the changes weren't reaching the custom domain. The /root/portal wasn't being kept in sync.
**Lesson:** Established as a permanent rule in decisions.md and LEARNINGS.md.

### Forgetting: LEARNINGS.md Was Overwritten
**When:** May 1, 2026
**What was forgotten:** During wiki setup, LEARNINGS.md was accidentally overwritten mid-session. All critical rules were lost.
**Lesson:** Always backup before bulk file operations. Critical files should be immutable (chattr +i).

### Forgetting: Open Questions Between Sessions
**Context:** Open questions from the 2026-04-24 session (Q1-Q8 in SC-PORTAL-CONTEXT-2026-04-24.md) were not carried forward into the wiki. Several questions remained unanswered for days.
**Lesson:** Open questions must be in the wiki, not just in session memory files. Wiki is the source of truth for project state.

### Forgetting: Dual-Process Architecture
**When:** April 28, 2026
**What was forgotten:** Holly and Sally treated the portal as a single application. The dual-process architecture (Next.js portal + VPS API server) was not clearly documented, leading to confusion about where code runs and which DB is used.
**Lesson:** Architecture must be documented before building. Dual-process systems need explicit interface contracts.

---

## Known Recurring Errors

### SC v7 Field Storage Location
**Error class:** Missing assumption
**Description:** The original spec said SC v7 fields should be stored as SM8 task/checklist fields. The actual implementation stores them in the portal `sc_forms` table. Staff cannot see or edit these fields in the SM8 app.
**Status:** Open — needs clarification from Justin

### renewal_category Not Synced to SQLite
**Error class:** Scope mismatch
**Description:** The sync script (`sync-sm8.js`) only syncs SC category jobs (`6d2fd47f-...`) to `/tmp/portal.db`. SC Renewal Invoice category jobs (`a04b781f-...`) are NOT synced. Portal fetches renewal jobs live from SM8 API. This means renewal data may be stale if the API is slow or rate-limited.
**Status:** Unverified — may work fine with live fetches

### approval_queue Schema Inconsistency
**Error class:** Schema drift
**Description:** `server.js` (VPS API) creates `approval_queue` without `invoicing_address` column. `db.ts` (Next.js) adds it via ALTER TABLE migration. If the VPS API server started before the migration ran, the column may be missing in production.
**Status:** Unverified — may cause errors if column is missing
**Fix needed:** Add `invoicing_address` to `server.js` schema definition, or add migration to `server.js`

### SC v7 Numeric Fields Hardcoded to 0
**Error class:** Incomplete implementation
**Description:** In `POST /api/sc-form`, the VALUES clause has 8 inline `0` literals for: `lifts_covered`, `visits_per_year`, `full_day_rate`, `per_hour_rate`, `minimum_callout`, `price_per_service`, `price_per_loler`, `total_invoice_per_annum`. These should be parameterizable at Step 2 but Step 1 shouldn't need them. However, Step 2 (`POST /api/sc-form-existing`) does set them correctly.
**Status:** Works as designed (Step 1 creates draft; Step 2 fills in details) but the inline zeros are confusing in the code

---

## Missing Assumptions

### Assumption: Clerk Auth Is Stable
**Status:** Unverified
**Description:** Clerk auth sessions may expire. The portal may need session refresh/re-login handling. No explicit session management code found.
**Risk:** If Clerk session expires mid-workflow, staff may lose their work.

### Assumption: Nginx Proxies to /root/portal
**Status:** Needs verification
**Description:** The architecture assumes nginx on VPS proxies `dashboard.baselifts.co.uk` to port 3000 (the local /root/portal). This was the state on April 28. It may have been changed.
**Risk:** If nginx was changed to proxy to Vercel instead, the local portal is bypassed.

### Assumption: SC v7 Fields Are Stored in Portal DB Only
**Status:** Needs confirmation from Justin
**Description:** The implementation stores SC v7 fields in `sc_forms` table. Staff who work primarily in SM8 cannot see these fields there. If Justin wants them in SM8 task fields, the portal needs to call `POST /task.json` for each field.

### Assumption: Sync Script Schedule Is Correct
**Status:** Needs verification
**Description:** The sync script was reported to take ~80s. If scheduled every 60s (`every 1m` in cron), overlapping runs are possible. The PID lock prevents concurrent runs but may cause skipped syncs.
**LEARNINGS rule:** The sync script's schedule must exceed runtime + overlap buffer.

---

## Sync / Memory Issues Affecting the Project

### Session Memory vs Wiki Memory
**Issue:** Significant project knowledge was held in Telegram session memory and sub-agent session transcripts. This knowledge was not reliably promoted to durable wiki files.
**Example:** The INSERT bug was found during the May 10 session but the root cause investigation, previous fixes, and design decisions from April 24-28 sessions were all in session memory.
**Fix:** All project-relevant knowledge must be written to the wiki after each meaningful session.

### Sub-Agent Memory Persistence
**Issue:** Sally's sessions were noted as "not reliably persistent." Sally's workspace had significant build artifacts and notes, but session continuity was poor.
**Fix:** Sally's workspace files are the durable record. Session transcripts are not reliable. Wiki is the source of truth.

### SC v7 Field Question Unanswered for Days
**Issue:** Q1 ("What exact fields does Justin want in SC v7 form?") was raised by Sally on April 24. The answer was partially confirmed on April 25 but the storage location question remained unanswered as of May 10.
**Fix:** All open questions must be tracked in `open-questions.md` with a clear "waiting on" tag.

### Knowledge Lost When LEARNINGS.md Was Overwritten
**Issue:** On May 1, LEARNINGS.md was accidentally overwritten during wiki setup. Critical rules (SQLite/SM8 architecture, Justin-only-deletes) were lost and had to be restored from backup.
**Fix:** LEARNINGS.md should be immutable (chattr +i). No agent should overwrite it without explicit backup.

### Two Different Database Schemas
**Issue:** Sally built an earlier version of the SC database schema (`workspace-sally/docs/docs/sc-database-schema.md`) with tables: clients, sc_jobs, visits, price_history, renewals, pending_actions, diary_notes. This schema was never used in production. The actual production schema is in `db.ts` and `server.js` with tables: sc_forms, approval_queue, sm8_jobs, sm8_companies, sm8_company_contacts.
**Risk:** Future agents may confuse Sally's old schema with the production schema.
**Fix:** The old schema is obsolete and should not be referenced. All references should point to the current schema in `db.ts`.

---

## Resolved Issues

| Bug | Date | Found By | Fix |
|-----|------|---------|-----|
| sc-forms INSERT failure | 2026-05-10 | Holly | Corrected VALUES clause in server.js |
| portal-api wrong DB path | 2026-04-28 | Holly | Aligned both to /tmp/portal.db |
| /root/portal 11 commits behind | 2026-04-28 | Holly | Pulled + rebuilt + PM2 restart |

---

---

## Security Issues

### SECURITY #001 — ecosystem.config.js with Secrets in Repository 🔴 CRITICAL
**Date:** 2026-05-10
**Severity:** Critical
**Status:** DELETED — needs security review
**Found by:** Holly during verification checks

**Description:** A file `ecosystem.config.js` was found as an untracked file in `/root/portal/`. This file is a PM2 configuration containing:
- Clerk secret key
- Clerk webhook secret
- ServiceM8 OAuth email: `hollystarbug@gmail.com`
- ServiceM8 OAuth password: [REDACTED]

**Why critical:** These credentials are the same as the production OAuth tokens used by the portal to send emails and interact with ServiceM8 on behalf of users.

**Action taken:**
1. File DELETED from `/root/portal`
2. Added `ecosystem.config.js` to `.gitignore`
3. Not committed to git (was untracked)

**⚠️ Risk:** The file may have existed in `/root/portal` for some time. If it was ever staged or committed to the git repository, the secrets are in the git history of `hollystarbug-web/BaseSC_dashboard`.

**Security review needed:**
1. Check git history of `/root/portal` for any committed secrets: `git log --all --source --remotes -- ecosystem.config.js`
2. Run a secret scanner: `git ls-files | xargs grep -l "sk_test_\|sk_live_\|Reddwarf2026"`
3. Rotate all credentials found: Clerk keys, SM8 OAuth tokens
4. Update PM2 to use environment variables from a secure source (e.g. `.env` file not in git)
5. Consider using a secrets manager instead of environment variables in PM2 config

**Files affected:** `hollystarbug-web/BaseSC_dashboard` (GitHub repo)

**Lesson:** Never leave credential files in project directories, even as untracked files. Use `.gitignore` from the start. Use a secrets manager or `.env` files that are explicitly excluded from git.

---

## Last Updated

`2026-05-10`
