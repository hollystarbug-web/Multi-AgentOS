---
title: Service Contract Workflow
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [workflow, service-contract, sc]
---

# Service Contract Workflow

## 7-Step SC Lifecycle

```
NEW CONTRACT
    ↓
CONTRACT & INVOICE → submit for approval
    ↓
APPROVE EMAIL → human reviews, approve and send
    ↓
INVOICE SEND → [quote accepted?] + [contract received?] → SEND INVOICE
    ↓
INITIATE OR CHASE → PAID: INITIATE | NOT PAID: PLEASE CHASE
    ↓
(recurring job running in SM8)
    ↓
CONTRACT RENEWAL (6-week window) → RENEW → creates new job
    ↓
RENEWAL APPROVAL → human reviews, approve and send
    ↓
[back to INVOICE SEND]
```

---

## Step 1 — New Contract

**Who:** Staff (via SC Portal)
**Portal action:** Click "New Contract" → fill form
**What happens:**
1. Staff fills: customer name, address, job description, contact details, lead source
2. Press Enter / Submit → job created in ServiceM8 via API
3. `sc_forms` record saved to portal DB with status = `draft`
4. Job appears in Step 2 queue

**Fields collected:**
- Company name
- Contact name
- Contact email
- Contact phone
- Lead source (Impact Automation or Impact Automation 10%)
- Job description

**Output:** SM8 job created (Quote status, SC category), `sc_forms` record saved

---

## Step 2 — Contract & Invoice

**Who:** Staff (via SC Portal)
**Portal action:** Fill SC v7 form → SUBMIT FOR APPROVAL
**What happens:**
1. Staff fills SC v7 pricing fields (see below)
2. Annual value calculated: `visits_per_year × full_day_rate`
3. SUBMIT FOR APPROVAL → `sc_forms` record updated, status → `pending_review`
4. `approval_queue` entry created with proposed price
5. Job moves to Approve Email step

**SC v7 Form Fields:**

| Field | Type | Notes |
|-------|------|-------|
| lifts_covered | integer | Number of lifts at site |
| visits_per_year | integer | Service frequency (e.g. 2) |
| full_day_rate | currency (£) | Full day rate |
| per_hour_rate | currency (£) | Per hour rate |
| minimum_callout | currency (£) | Minimum callout charge |

**Calculated field:**
- `annual_value` = `visits_per_year × full_day_rate`

**⚠️ Storage note:** SC v7 fields are stored in the portal's `sc_forms` table. Originally planned as SM8 task/checklist fields; actual implementation stores in portal DB. (Confirmation needed: should they sync to SM8 task fields?)

**Output:** Form data saved, approval queue entry created, moves to Approve Email

---

## Step 3 — Approve Email

**Who:** Justin or staff (human review)
**Portal action:** Review email preview → APPROVE AND SEND
**What happens:**
1. Human reviews quote email preview with Quote PDF + Service Contract PDF
2. CC list: `696d5a@inbox.servicem8.com` + `caz.h@baselifts.co.uk`
3. APPROVE AND SEND → email sent to client via ServiceM8
4. `approval_queue` status → `approved` → `sent`
5. `sc_forms` status → `sent`

**Email detection for automation:** Email sent via SM8 API using OAuth. Portal monitors `payment_received = 1` via SM8 API poll.

**Output:** Email sent to client, approval queue updated

---

## Step 4 — Invoice Send

**Who:** System / Staff (automated detection)
**Portal action:** Track quote accepted + contract received → SEND INVOICE
**Detection logic:**
- **Quote accepted:** SM8 API `payment_received = 1` (payment received in SM8)
- **Contract received:** PDF attached to job diary in ServiceM8

**⚠️ Important:** Signed contract PDF goes to the **ORIGINAL job diary**, NOT the renewal job diary.

**Conditions:**
- Both YES → SEND INVOICE button appears green → auto-send
- One or both NO → manual chase required

**Output:** Invoice sent to client

---

## Step 5 — Initiate or Chase

**Who:** Staff
**Portal action:** Paid → INITIATE checklist | Not paid → PLEASE CHASE

### If PAID → INITIATE

**Portal action:** Click INITIATE → guided checklist

**Initiate checklist (manual in SM8):**
1. Change job status to Completed
2. Set `customfield_followup_basis` = "1 Year"
3. Create recurring job in SM8:
   - Frequency: Custom → Monthly interval = `12 ÷ visits_per_year` (e.g. 6 for twice-yearly)
   - Start date: contract signing date
   - Ends: Never
   - Recurring type: "Reminder should arrive in inbox"
4. Job moves to Active/Initiated tab

**Automated via portal:** `initiateServiceContract()` in `db.ts` handles all three via SM8 API.

### If NOT PAID → PLEASE CHASE

**Portal action:** Click PLEASE CHASE → follow-up process
**Portal shows:** contact person, telephone, email
**Action:** Staff sends follow-up email via SM8

---

## Step 6 — Contract Renewal

**Who:** System (automated monitoring) + Staff
**Portal action:** 6 weeks before renewal date → RENEW button
**What happens:**
1. Job appears in Renewals tab when `renewal_date` is within 6 weeks
2. Staff clicks RENEW
3. Renewal job created in SM8 (type: SC Renewal Invoice category)
4. Job status: Quote
5. Invoice description includes:
   - "renewal from [previous job number]"
   - "Renewal of SC as per signed contract [old job number]"
   - "Price increase per ONS inflation rate — currently 3.3%"
   - ONS URL: https://www.ons.gov.uk/economy/inflationandpriceindices
6. CPI rate: 3.3% (March 2026)
7. Price: `previous_price × 1.033`
8. 20% VAT applied
9. Item code: `Annual Service Contract - Standard Contract - [visits]`
10. Job goes to Step 3 (Renewal Approval)

**⚠️ Renewal job created but not yet approved.** Human must review and approve before sending.

**Output:** Renewal job created, moves to Renewal Approval

---

## Step 7 — Renewal Approval

**Who:** Justin or staff (human review)
**Portal action:** Review renewal quote → APPROVE AND SEND
**Same process as Step 3.**
**Output:** Renewal quote sent to client

---

## CPI Rate

**Current rate:** 3.3% (March 2026, ONS)
**Source:** https://www.ons.gov.uk/economy/inflationandpriceindices
**Applied to:** All renewal price calculations
**When to update:** Before each renewal batch; check ONS on renewal processing day

---

## Renewal Window Rules

| Parameter | Value |
|-----------|-------|
| Renewal invoice window | 6 weeks before renewal date |
| Cancellation notice | 2 months before renewal date |
| Price adjustment | Previous price × (1 + CPI) |

---

## Last Updated

`2026-05-10`
