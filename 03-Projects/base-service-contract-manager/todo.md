---
title: Todo
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-21
tags: [todo, open-items]
---

# Todo — Base Service Contract Manager

## Completed Items ✅

- ✅ INSERT bug fix (2026-05-10) — sc_form INSERT parameter mismatch fixed in server.js
- ✅ Portal DB URL fix (2026-05-21) — portal now uses /root/portal.db (was /tmp/portal.db)
- ✅ Approval queue query fix (2026-05-21) — now returns all non-rejected items
- ✅ MC001 line item removed (2026-05-21) — Minimum Call-Out no longer shown as billable item
- ✅ Job description → NEW SERVICE CONTRACT (2026-05-21)
- ✅ Email To/BCC routing (2026-05-21)
- ✅ Labour rates auto-fill from portal_settings (2026-05-21)

## Immediate Priority — End-to-End Test 🔴 URGENT

### Full SC Workflow Test (PENDING — need fresh item)

All fixes deployed 2026-05-21. Both test items already sent:
- Bas-4643 — "Acme Properties Test 1234 Ltd" — status: sent
- Bas-4644 — "Acme Properties - Step 3 test" — status: sent

**Need:** A new pending approval queue item to test the full flow:
1. Step 1: New Contract → creates SM8 job
2. Step 2: SC v7 form → submit for approval
3. Step 3: Approve email → should succeed without "item not found"
4. Verify SM8 job_description = "NEW SERVICE CONTRACT"
5. Verify no MC001 line item in Step 3
6. Verify email received correctly

**Contact:** Need a test client or Justin to create a real new contract

---

## Open Issues (as of 2026-05-21)

| # | Issue | Priority | Status |
|---|-------|---------|--------|
| B007 | Premature email firing on Step 1 | 🔴 HIGH | Open — needs investigation |
| B008 | Invoice number anomaly in Step 3 | 🟡 MEDIUM | Open — need clarification from Justin |
| B009 | Labour rates auto-fill timing | 🟢 LOW | Low priority — data saves correctly |
| B010 | Lead source options missing in SC form | 🟢 LOW | Open |
| Q24 | SO/DD = 0 investigation | 🟡 MEDIUM | Waiting on Justin — monthly cron never activated |
| Q25 | SM8 browser login skill | 🟢 LOW | Waiting on Justin |

---

## Verification Checks (From 2026-05-10 — Most Likely Done)

These were checked in the 2026-05-10 session:

- [x] Git sync — `/root/portal` vs `workspace-sally/portal` — resolved
- [x] approval_queue schema — `invoicing_address` column confirmed present
- [x] Nginx config — verified dashboard.baselifts.co.uk serves local portal

---

## Ongoing Monitoring

- [x] Monitor portal health after May 10 INSERT bug fix ✅ (working)
- [ ] Verify Bas-4529 (DVB Capital Assets II LLC) successfully moves through pipeline
- [x] Check SM8 sync is working reliably ✅
- [ ] Verify Clerk auth is stable

---

## Nice to Have

- [ ] Add monitoring/alerting for portal API failures (port 3001)
- [ ] Document the full initiation checklist in the portal UI
- [ ] Add more test cases for edge cases (renewal of renewal, cancellation mid-workflow)
- [ ] Document the stale quotes workflow
- [ ] Add badge counts on tab buttons (verify they work)
- [ ] Add lead source dropdown to SC form Step 2

---

## Blocked / Waiting On Justin

| # | Question | Priority | Status |
|---|---------|---------|--------|
| Q2 | Renewal rejection path | 🔴 HIGH | Waiting |
| Q3 | Badge count scope | 🟡 MEDIUM | Waiting |
| Q4 | Re-initiating renewal | 🟡 MEDIUM | Waiting |
| Q6 | Clerk auth stability | 🟡 MEDIUM | Waiting |
| Q7 | Who does SC admin | 🟡 MEDIUM | Waiting |
| Q8 | SC SLA / follow-up timing | 🟢 LOW | Waiting |
| Q12 | Renewal category sync | 🟡 MEDIUM | Waiting |
| Q17 | Portal user roles | 🟡 MEDIUM | Waiting |
| Q22 | Vercel vs local portal | 🟡 MEDIUM | Waiting |
| Q23 | PM2 monitoring | 🟢 LOW | Waiting |
| Q24 | SO/DD monthly extraction cron | 🟡 MEDIUM | Waiting |
| Q25 | SM8 browser login skill | 🟢 LOW | Waiting |

---

## Last Updated

`2026-05-21`
