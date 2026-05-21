---
title: Open Questions
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [open-questions]
---

# Open Questions

Questions Justin needs to answer, questions the agent needs to verify, and questions about ServiceM8, hosting, data model, user roles, signing, and permissions.

---

## Questions for Justin

### Q1 — SC v7 Field Storage Location ✅ ANSWERED
**Decision:** Store SC v7 fields in portal `sc_forms` SQLite table only. NOT in SM8 task/checklist fields.
**Reasoning:** Staff workflow is portal-first. SM8 task fields not required.
**Confirmed by:** Justin (2026-05-10)

---

### Q2 — Renewal Rejection Path 🔴 HIGH PRIORITY
**Question:** What happens if a renewal is rejected at Step 7 (Renewal Approval)?
Options considered:
- Back to `pending_review` for renegotiation
- Mark the renewal job as Unsuccessful in SM8
- Something else
**Impact:** Portal workflow for rejected renewals
**Waiting on:** Justin

---

### Q3 — Badge Count Scope (Renewals Tab)
**Question:** Does the Renewals tab badge count only the 6-week renewal window, or does it also include the 2-month cancellation cutoff?
**Assumption:** 6-week window only
**Impact:** Dashboard UX
**Waiting on:** Justin

---

### Q4 — Re-initiating Renewal
**Question:** If a RENEW was already created for a contract but the client didn't sign, does clicking RENEW again create a new renewal job or reopen the existing one?
**Assumption:** Creates a new job (previous one stays as abandoned/stale)
**Impact:** Portal RENEW button logic
**Waiting on:** Justin

---

### Q5 — Nginx Proxy Destination ✅ ANSWERED
**Decision:** nginx proxies `dashboard.baselifts.co.uk` to `http://127.0.0.1:3000` — local `/root/portal` (PM2).
**Vercel:** Serves `.vercel.app` preview URLs only. Not in the path for `dashboard.baselifts.co.uk`.
**Confirmed by:** `cat /etc/nginx/sites-available/portal` (2026-05-10)

---

### Q6 — Clerk Auth Stability
**Question:** Is Clerk auth stable, or does it need session refresh/re-login handling?
No explicit session management code was found in the portal.
**Impact:** Portal reliability for staff users
**Waiting on:** Justin (monitor)

---

### Q7 — Who Does SC Administration Day-to-Day?
**Question:** Who handles the SC administration tasks — creating jobs, following up, approving quotes?
Is it Justin, Caz, Malene, Diogo, or a combination?
**Impact:** Workflow design, notification routing, approval escalation
**Waiting on:** Justin

---

### Q8 — SC SLA / Response Time
**Question:** What is the expected response time for SC follow-ups?
- How long to wait before chasing an unanswered quote?
- How long to wait before chasing an unpaid invoice after sending?
**Impact:** Stale quote thresholds, follow-up timing
**Waiting on:** Justin

---

## Questions About ServiceM8

### Q9 — SM8 Checklist API Scope
**Question:** Does the SM8 API key have access to `task.json` (job checklists/tasks)?
Reports from April 25 suggested `POST /task.json` works for adding checklist items to jobs.
Can the API key also update task fields, or does it need OAuth?
**Status:** Needs verification — some evidence it works, some that it doesn't
**Waiting on:** Agent verification

---

### Q10 — SM8 Diary Attachment Detection
**Question:** How does the portal detect a PDF attachment in a SM8 job diary?
The portal checks `/note.json` filtered by `related_object_uuid`. Does this reliably return document-type notes?
Are there different note types returned by SM8 for emails vs documents vs field notes?
**Status:** Needs verification
**Waiting on:** Agent verification

---

### Q11 — DocuSign Integration
**Question:** Is DocuSign integrated with ServiceM8 for SC contract signing?
If yes, does a signed DocuSign document automatically appear in the SM8 job diary?
If no, what is the current signing workflow?
**Impact:** Step 3 (Approve Email) and Step 4 (Invoice Send) signing detection
**Waiting on:** Justin

---

### Q12 — SC Renewal Category Jobs in SM8 Mirror
**Question:** The sync script (`sync-sm8.js`) only syncs SC standard category jobs (`6d2fd47f-...`) to SQLite. Renewal Invoice category jobs (`a04b781f-...`) are not in the sync.
Portal fetches renewal jobs live from SM8 API at request time.
Is this sufficient, or should the sync script include renewal jobs?
**Risk:** If SM8 API is rate-limited, renewal data may be stale
**Status:** Needs monitoring
**Waiting on:** Justin (monitor and decide)

---

### Q13 — Custom Field Names in SM8
**Question:** The portal code uses these SM8 custom field names:
- `customfield_frequency_of_visits` (on company)
- `customfield_contract_renewal_date` (on company)
- `customfield_followup_basis` (on job)
- `customfield_contract_start_date` (on company)

Are these the exact internal field names in SM8, or do they differ?
If they differ, the portal may be reading null/empty values.
**Status:** Needs SM8 field name verification
**Waiting on:** Agent verification in SM8

---

## Questions About Data Model

### Q14 — approval_queue Schema
**Question:** Does the `approval_queue` table in `/tmp/portal.db` have the `invoicing_address` column?
`server.js` creates it without this column. `db.ts` adds it via migration.
If the VPS API server started before the migration ran, the column may be missing.
**Status:** Needs SQL verification: `PRAGMA table_info(approval_queue);`
**Fix if missing:** `ALTER TABLE approval_queue ADD COLUMN invoicing_address TEXT DEFAULT '';`
**Waiting on:** Agent verification

---

### Q15 — SC v7 Fields in SM8 vs Portal DB
**Question:** Should `sc_forms` store `previous_price` and `reference_price` correctly for renewals?
`previous_price` should be the last paid invoice amount. `reference_price` is unclear in usage.
**Status:** Needs clarification
**Waiting on:** Justin

---

### Q16 — SC Exclusion List — Scope
**Question:** The SC exclusion list (117 job IDs) excludes certain jobs from SC KPI calculations.
Should these jobs also be excluded from the SC workflow entirely (e.g. they should never appear in New Contract)?
Or are they excluded only from dashboard metrics/reporting?
**Status:** Needs clarification
**Waiting on:** Justin

---

## Questions About User Roles

### Q17 — SC Portal User Roles
**Question:** Who can do what in the SC portal?
- Who can create a new contract (Step 1)?
- Who can submit for approval (Step 2)?
- Who can approve and send (Step 3)?
- Who can initiate a contract (Step 5)?
- Who can process renewals (Step 6)?
**Assumption:** Justin approves all. Staff create and submit.
**Waiting on:** Justin

---

### Q18 — Clerk Auth Roles
**Question:** Are there different Clerk user roles for staff vs admin?
Does Clerk passkey auth distinguish between staff who can submit and staff who can approve?
**Waiting on:** Justin

---

## Questions About Signing and Permissions

### Q19 — Client Signing Outside Portal
**Question:** If a client signs the contract outside the portal's integrated signing workflow, what is the expected staff process for getting the signed PDF into SM8?
Is it always uploaded to the SM8 job diary? Or are there other channels?
**Confirmed answer:** Upload to original SM8 job diary
**Needs confirmation:** Is this the only acceptable process?
**Waiting on:** Justin

---

### Q20 — DocuSign / Signing Platform
**Question:** Is Base Lift Services using DocuSign, HelloSign, or another signing platform for SC contracts?
**Impact:** How the signed contract gets returned to Base Lift Services
**Waiting on:** Justin

---

### Q21 — Who Can Delete ServiceM8 Records
**Question:** Only Justin can delete ServiceM8 records. Can any staff mark a job as Unsuccessful?
**Confirmed answer:** Justin only deletes. Staff can mark jobs inactive in SM8? (unclear).
**Waiting on:** Justin

---

## Questions About Hosting

### Q22 — Vercel vs Local Portal
**Question:** What is the intended long-term deployment strategy?
- Vercel only (remove /root/portal)?
- Local VPS only (stop using Vercel)?
- Both (Vercel for preview, local for production)?
**Current:** Both, which is confusing and requires manual sync
**Waiting on:** Justin

---

### Q23 — PM2 Monitoring
**Question:** Is there monitoring on the PM2 processes (`portal` and `portal-api`)?
If they crash, does anyone get alerted?
**Waiting on:** Justin

---

## Status Summary

| # | Question | Priority | Waiting On |
|---|---------|---------|-----------|
| Q1 | SC v7 field storage location | ✅ ANSWERED | Justin |
| Q2 | Renewal rejection path | 🔴 HIGH | Justin |
| Q3 | Badge count scope | 🟡 MEDIUM | Justin |
| Q4 | Re-initiating renewal | 🟡 MEDIUM | Justin |
| Q5 | Nginx proxy destination | ✅ ANSWERED | Verified |
| Q6 | Clerk auth stability | 🟡 MEDIUM | Justin |
| Q7 | Who does SC admin | 🟡 MEDIUM | Justin |
| Q8 | SC SLA / response time | 🟢 LOW | Justin |
| Q9 | SM8 checklist API scope | 🟡 MEDIUM | Agent |
| Q10 | SM8 diary detection | 🟡 MEDIUM | Agent |
| Q11 | DocuSign integration | 🟡 MEDIUM | Justin |
| Q12 | Renewal category sync | 🟡 MEDIUM | Monitor |
| Q13 | SM8 custom field names | 🟡 MEDIUM | Agent |
| Q14 | approval_queue schema | ✅ VERIFIED | Agent |
| Q15 | previous_price usage | 🟢 LOW | Justin |
| Q16 | SC exclusion scope | 🟢 LOW | Justin |
| Q17 | Portal user roles | 🟡 MEDIUM | Justin |
| Q18 | Clerk auth roles | 🟢 LOW | Justin |
| Q19 | Manual signing process | 🟡 MEDIUM | Justin |
| Q20 | Signing platform | 🟡 MEDIUM | Justin |
| Q21 | Delete permissions | 🟢 LOW | Justin |
| Q22 | Vercel vs local strategy | 🟡 MEDIUM | Justin |
| Q23 | PM2 monitoring | 🟢 LOW | Justin |

---

## Last Updated

`2026-05-10`

---

### Q24 — SO/DD Monthly Extraction Cron
**Question:** The SO/DD monthly extraction cron was never activated. April 2026 data had to be extracted manually. Need to set up the cron properly and confirm SO/DD source accounts.
**Priority:** 🟡 MEDIUM
**Waiting on:** Justin

### Q25 — SM8 Browser Login Skill
**Question:** Justin requested a skill/script to open SM8 login page and log in via Chrome/CDP on Mac Mini.
**Priority:** 🟢 LOW
**Waiting on:** Justin

---

## Status Summary (Updated 2026-05-21)

| # | Question | Priority | Status |
|---|---------|---------|--------|
| Q1 | SC v7 field storage location | ✅ ANSWERED | Justin |
| Q2 | Renewal rejection path | 🔴 HIGH | Waiting |
| Q3 | Badge count scope | 🟡 MEDIUM | Waiting |
| Q4 | Re-initiating renewal | 🟡 MEDIUM | Waiting |
| Q5 | Nginx proxy destination | ✅ ANSWERED | Verified |
| Q6 | Clerk auth stability | 🟡 MEDIUM | Waiting |
| Q7 | Who does SC admin | 🟡 MEDIUM | Waiting |
| Q8 | SC SLA / response time | 🟢 LOW | Waiting |
| Q9 | SM8 checklist API scope | 🟡 MEDIUM | Agent |
| Q10 | SM8 diary detection | 🟡 MEDIUM | Agent |
| Q11 | DocuSign integration | 🟡 MEDIUM | Justin |
| Q12 | Renewal category sync | 🟡 MEDIUM | Waiting |
| Q13 | SM8 custom field names | 🟡 MEDIUM | Agent |
| Q14 | approval_queue schema | ✅ VERIFIED | Agent |
| Q15 | previous_price usage | 🟢 LOW | Justin |
| Q16 | SC exclusion scope | 🟢 LOW | Justin |
| Q17 | Portal user roles | 🟡 MEDIUM | Waiting |
| Q18 | Clerk auth roles | 🟢 LOW | Waiting |
| Q19 | Manual signing process | 🟡 MEDIUM | Waiting |
| Q20 | Signing platform | 🟡 MEDIUM | Waiting |
| Q21 | Delete permissions | 🟢 LOW | Justin |
| Q22 | Vercel vs local strategy | 🟡 MEDIUM | Waiting |
| Q23 | PM2 monitoring | 🟢 LOW | Waiting |
| Q24 | SO/DD monthly extraction | 🟡 MEDIUM | Waiting |
| Q25 | SM8 browser login skill | 🟢 LOW | Waiting |

---

## Last Updated

`2026-05-21`
