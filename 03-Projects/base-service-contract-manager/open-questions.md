---
title: Open Questions
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [open-questions]
---

# Open Questions

## SC Workflow — Answered

### ✅ SC v7 Form Fields — CONFIRMED
**Question:** What exact fields does Justin want to capture in the SC v7 form?
**Answer (2026-04-25):** 5 fields: `lifts_covered`, `visits_per_year`, `full_day_rate`, `per_hour_rate`, `minimum_callout`
**Status:** Confirmed with Justin

### ✅ RENEW Action — CONFIRMED
**Question:** Does RENEW create a new SM8 job via API, or just a portal DB record?
**Answer:** Creates new SM8 job via API (SC Renewal Invoice category)
**Status:** Confirmed

### ✅ "sent" State Meaning — CONFIRMED
**Question:** Does "sent" = email already gone (human clicked send), or record marked ready-to-send?
**Answer:** "sent" = email already gone. Human clicks APPROVE AND SEND → email sent → status updated to "sent"
**Status:** Confirmed

### ✅ Signed Contract PDF Location — CONFIRMED
**Question:** Does signed contract go to original job diary or new renewal job diary?
**Answer:** **ORIGINAL job diary** — confirmed by Justin 2026-04-25. Portal's Step 4 detection checks the ORIGINAL SC job's diary.
**Status:** Confirmed — critical for Step 4 detection

---

## SC Workflow — Still Open

### ❓ SC v7 Field Storage Location
**Question:** Should SC v7 form fields be stored in SM8 task/checklist fields, or is portal `sc_forms` table sufficient?
**Original spec:** Fields stored as SM8 task/checklist fields via `POST /task.json`
**Current implementation:** Fields stored in portal `sc_forms` table only
**Why it matters:** If fields need to be in SM8 for staff to see/edit in SM8 app, portal needs to call `POST /task.json` with each SC v7 field
**Blocking:** Staff workflow in SM8 after job creation

### ❓ Renewal Rejection Path
**Question:** What happens if a renewal is rejected at approval stage?
**Options:** Back to pending_review? Cancelled?
**Status:** Needs answer from Justin

### ❓ Badge Count Scope
**Question:** Does Renewals tab badge count only the 6-week window, or also the 2-month cancellation cutoff?
**Assumption:** 6-week window only
**Status:** Needs confirmation from Justin

### ❓ Re-initiating Renewal
**Question:** If a renewal was already created but not signed, does RENEW create a new job or reopen the existing one?
**Assumption:** Creates new job (previous one stays as abandoned)
**Status:** Needs confirmation from Justin

---

## Portal — Still Open

### ❓ Clerk Auth Stability
**Question:** Is Clerk auth stable or does it need session management / re-login handling?
**Status:** Monitor — session may need refreshing periodically

### ❓ Renewal Category Sync Strategy
**Question:** Should SC Renewal Invoice category jobs be added to `sync-sm8.js`, or is live API fetching sufficient?
**Current:** Portal fetches renewal jobs live from SM8 API
**Status:** Needs review — if SM8 API rate-limits, consider adding to sync

### ❓ Initiation Checklist — Full Automation
**Question:** Should the full initiate checklist be automated via SM8 API, or remain a guided manual process?
**Current:** Portal has `initiateServiceContract()` function that automates all 3 steps via SM8 API
**Status:** Needs Justin to test and confirm this works end-to-end

---

## Operations

- [ ] Who handles day-to-day SC administration? (Caz? Malene? Diogo?)
- [ ] What is the SLA for responding to SC inquiries?
- [ ] Who approves the initial "Approve Email" step? (Justin only, or any admin?)

---

## Last Updated

`2026-05-10`
