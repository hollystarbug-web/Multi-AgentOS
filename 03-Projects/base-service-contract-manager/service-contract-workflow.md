---
title: Service Contract Workflow
project: Base Service Contract Manager
created: 2026-05-10
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

## Step-by-Step

### Step 1: New Contract
**Who:** Staff (via SC Portal)
**Action:** Fill customer details, job description, contact info
**Output:** SM8 job created (Quote status, SC category), sc_forms record saved to portal DB

### Step 2: Contract & Invoice
**Who:** Staff (via SC Portal)
**Action:** Fill SC v7 checklist fields — lifts covered, visits per year, rates, annual value
**Output:** Form data saved, moves to approval queue

### Step 3: Approve Email
**Who:** Justin (human review)
**Action:** Review quote details, click APPROVE AND SEND
**Output:** Email sent to client with quote + contract PDF

### Step 4: Invoice Send
**Who:** System/Staff
**Action:** Track quote accepted + contract received → send invoice
**Detection:**
- Quote accepted: SM8 API `payment_received = 1`
- Contract received: PDF attachment in SM8 job diary

### Step 5: Initiate or Chase
**Who:** Justin/Staff
**Action:**
- PAID: Click INITIATE → guided checklist in SM8
- NOT PAID: Click PLEASE CHASE → follow-up process

### Step 6: Contract Renewal
**Who:** System (automated monitoring)
**Action:** 6 weeks before renewal date → RENEW button creates renewal job
**Price:** Previous price × (1 + CPI) — CPI = 3.3% (March 2026)

### Step 7: Renewal Approval
**Who:** Justin (human review)
**Action:** Review renewal quote, approve and send

## SC v7 Form Fields

The portal's `sc_forms` table stores:
- `lifts_covered` — number of lifts at site
- `visits_per_year` — frequency (e.g. 2)
- `full_day_rate` — full day rate
- `per_hour_rate` — per hour rate
- `minimum_callout` — minimum callout charge
- `price_per_service` — price per service visit
- `price_per_loler` — LOLER inspection price
- `total_invoice_per_annum` — annual invoice total
- `annual_value` — calculated: visits × full_day_rate

## Initiation Checklist

After clicking INITIATE in portal, staff must manually in SM8:
1. Change job status to Completed
2. Add "1 Year Follow-up" badge
3. Create recurring job: Frequency = Custom > Yearly, Ends = Never, Start Date = contract signing date
4. Select: Service, Recurring Type = "Reminder should arrive in inbox"

## Last Updated

`2026-05-10`
