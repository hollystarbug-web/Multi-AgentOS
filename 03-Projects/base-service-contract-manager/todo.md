---
title: Todo
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [todo, open-items]
---

# Todo — Base Service Contract Manager

## Immediate Priority — Verification Checks

These must be done before any build work:

### Git Sync Check 🟡
- [ ] Compare `/root/portal` and `workspace-sally/portal` git logs
- [ ] Pull /root/portal if behind
- Command:
```bash
cd /root/portal && git log --oneline -3
cd ~/.openclaw/workspace-sally/portal && git log --oneline -3
```

### approval_queue Schema Check 🟡
- [ ] Verify `invoicing_address` column exists in `/tmp/portal.db`
- Command: `sqlite3 /tmp/portal.db "PRAGMA table_info(approval_queue);"`
- If missing: `ALTER TABLE approval_queue ADD COLUMN invoicing_address TEXT DEFAULT '';`

### Nginx Config Check 🟡
- [ ] Verify which portal serves `dashboard.baselifts.co.uk` (VPS /root/portal or Vercel)
- Command: `cat /etc/nginx/sites-available/portal`

### Sally Memory Files Check 🟡
- [ ] Read Sally's memory files from 2026-04-24 through 2026-04-26
- Files:
  - `~/.openclaw/workspace-sally/memory/2026-04-24.md`
  - `~/.openclaw/workspace-sally/memory/2026-04-25.md`
  - `~/.openclaw/workspace-sally/memory/2026-04-26.md`
- Extract: any knowledge not already in the wiki

---

## Next Build Step — After Verification

### End-to-End Workflow Test 🔴 URGENT
- [ ] Test the full SC workflow with a real or test client
  - Step 1: New Contract → creates SM8 job
  - Step 2: SC v7 form → submit for approval
  - Step 3: Approve email (human review)
  - Step 4: Invoice Send detection
  - Step 5: Initiate checklist
- **Why:** The INSERT bug means no job has ever successfully completed Step 1 → Step 2 before May 10 fix. The entire pipeline needs live testing.
- **Contact:** Need a test client or Justin to create a real new contract

### SC v7 Field Storage Clarification ✅ COMPLETED (2026-05-10)
- [x] Decision confirmed: store in portal `sc_forms` SQLite table only. NOT in SM8 task fields.
- **Reasoning:** Staff workflow is portal-first. SM8 task fields not required.
- **Confirmed by:** Justin (2026-05-10)

---

## Documentation

### Wiki Migration ✅ COMPLETED (2026-05-10)
- [x] status.md — updated with current working/broken state
- [x] changelog.md — full build history documented
- [x] decisions.md — all decisions documented (Q1 confirmed 2026-05-10)
- [x] architecture.md — correct architecture documented
- [x] data-model.md — corrected schema documented
- [x] servicem8-integration.md — updated with diary attachment, OAuth, automation
- [x] service-contract-workflow.md — updated with confirmed SC v7 fields and initiation steps
- [x] bugs.md — updated with all known bugs
- [x] agent-rules.md — comprehensive non-negotiable rules
- [x] knowledge-migration.md — sources, gaps, risks, recommendations
- [x] 05-Learnings/ — prevention rules for future sessions

### Additional Wiki Updates 🟡
- [ ] README.md — update to reflect current state
- [ ] `prompts.md` — update with current automation commands (agent-browser, Codex)
- [ ] `agent-rules.md` — review and update Sally's role description

---

## Ongoing Monitoring

- [ ] Monitor portal health after May 10 INSERT bug fix
- [ ] Verify Bas-4529 (DVB Capital Assets II LLC) successfully moves through pipeline
- [ ] Check SM8 sync is working reliably
- [ ] Verify Clerk auth is stable

---

## Nice to Have

- [ ] Add monitoring/alerting for portal API failures (port 3001)
- [ ] Document the full initiation checklist in the portal UI
- [ ] Add more test cases for edge cases (renewal of renewal, cancellation mid-workflow)
- [ ] Document the stale quotes workflow
- [ ] Add badge counts on tab buttons (verify they work)

---

## Blocked / Waiting On Justin

| # | Question | Priority | Status |
|---|---------|---------|--------|
| Q2 | Renewal rejection path | 🔴 HIGH | Waiting |
| Q3 | Badge count scope (Renewals tab) | 🟡 MEDIUM | Waiting |
| Q4 | Re-initiating renewal | 🟡 MEDIUM | Waiting |
| Q5 | Nginx proxy destination | 🟡 MEDIUM | Verification in progress |
| Q6 | Clerk auth stability | 🟡 MEDIUM | Monitor |
| Q7 | Who does SC admin day-to-day | 🟡 MEDIUM | Waiting |
| Q8 | SC SLA / follow-up timing | 🟢 LOW | Waiting |
| Q12 | Renewal category sync strategy | 🟡 MEDIUM | Waiting |
| Q17 | Portal user roles | 🟡 MEDIUM | Waiting |
| Q22 | Vercel vs local portal strategy | 🟡 MEDIUM | Waiting |

---

## Last Updated

`2026-05-10`
