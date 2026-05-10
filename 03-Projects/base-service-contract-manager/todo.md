---
title: Todo
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [todo, open-items]
---

# Todo — Base Service Contract Manager

## Immediate Priority

### End-to-End Workflow Test 🔴 URGENT
- [ ] Test the full SC workflow with a real or test client
  - Step 1: New Contract → creates SM8 job
  - Step 2: SC v7 form → submit for approval
  - Step 3: Approve email (human review)
  - Step 4: Invoice Send detection
  - Step 5: Initiate checklist
- **Why:** The INSERT bug means no job has ever successfully completed Step 1 → Step 2 before May 10 fix. The entire pipeline needs live testing.
- **Contact:** Need a test client or Justin to create a real new contract

### SC v7 Field Storage Clarification 🔴 IMPORTANT
- [ ] Clarify with Justin: should SC v7 form fields be stored in SM8 task/checklist fields, or is portal DB sufficient?
- **Original spec:** Fields stored as SM8 task/checklist fields
- **Current implementation:** Fields stored in portal `sc_forms` table only
- **Impact:** If SM8 task storage is needed, portal needs to call `POST /task.json` for each SC v7 field

### approval_queue Schema Fix 🟡
- [ ] Verify `invoicing_address` column exists in `/tmp/portal.db`
- [ ] If missing, add: `ALTER TABLE approval_queue ADD COLUMN invoicing_address TEXT DEFAULT '';`

## Documentation

### Wiki Migration ✅ COMPLETED (2026-05-10)
- [x] status.md — updated with current working/broken state
- [x] changelog.md — full build history documented
- [x] decisions.md — all decisions documented
- [x] architecture.md — correct architecture documented
- [x] data-model.md — corrected schema documented
- [x] servicem8-integration.md — updated with diary attachment, OAuth, automation
- [x] service-contract-workflow.md — updated with confirmed SC v7 fields and initiation steps
- [x] bugs.md — updated with all known bugs

### Additional Wiki Updates 🟡
- [ ] README.md — update to reflect current state
- [ ] `prompts.md` — update with current automation commands (agent-browser, Codex)
- [ ] `agent-rules.md` — review and update Sally's role description

## Ongoing Monitoring

- [ ] Monitor portal health after May 10 INSERT bug fix
- [ ] Verify Bas-4529 (DVB Capital Assets II LLC) successfully moves through pipeline
- [ ] Check SM8 sync is working reliably
- [ ] Verify Clerk auth is stable

## Nice to Have

- [ ] Add monitoring/alerting for portal API failures (port 3001)
- [ ] Document the full initiation checklist in the portal UI
- [ ] Add more test cases for edge cases (renewal of renewal, cancellation mid-workflow)
- [ ] Document the stale quotes workflow
- [ ] Add badge counts on tab buttons (verify they work)

## Blocked / Waiting On Justin

- [ ] Test new contract creation — Justin or staff needs to try it with a real client
- [ ] Clarify SC v7 field storage approach
- [ ] Decide on renewal job sync strategy (add to sync script or keep live fetches)

## Last Updated

`2026-05-10`
