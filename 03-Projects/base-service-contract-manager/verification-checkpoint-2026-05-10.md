---
title: Verification Checkpoint — 2026-05-10
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [verification, checkpoint]
---

# Verification Checkpoint — 2026-05-10

Verification checks completed before resuming build work.

---

## 1. Git Sync Check — FIXED ✅

**Command:**
```bash
cd /root/portal && git log --oneline -10
cd ~/.openclaw/workspace-sally/portal && git log --oneline -10
```

**Before:**
- `/root/portal`: commit `d056cd0` — "fix: remove duplicate SC pricing fields + add missing job_address"
- `workspace-sally/portal`: commit `3e763a5` — 2 commits AHEAD of `/root/portal`

**Drift:** `/root/portal` was 2 commits behind `workspace-sally/portal`. Missing fixes:
- `4027a66`: "fix: move job_address inside clients.push() object literal" (buildClientList)
- `3e763a5`: "fix: fix second occurrence of job_address outside object literal" (getInitiateJobs)

Both commits fix the same bug: `job_address` was placed outside the object literal when pushing to an array, causing the field to be undefined on client/contract records.

**Action taken:**
- `git stash` (discarded local uncommitted change that was a partial buggy fix attempt)
- `git pull origin main` — fast-forward to `3e763a5`
- `npm run build` — succeeded
- `pm2 restart portal` — online ✅

**Current state:** Both repos at `3e763a5`. Synced. ✅

**New issue found:** `ecosystem.config.js` (untracked) contained production secrets (Clerk keys, SM8 OAuth credentials). Deleted from `/root/portal`. Added to `.gitignore`. ⚠️ SECURITY FLAG — see bugs.md.

---

## 2. approval_queue Schema Check — PASSED ✅

**Command:**
```bash
python3 -c "import sqlite3; conn=sqlite3.connect('/tmp/portal.db'); cur=conn.cursor(); cur.execute('PRAGMA table_info(approval_queue)'); [print(row) for row in cur.fetchall()]; conn.close()"
```

**Result:** 15 columns found:
| # | Column | Type | Default |
|---|--------|------|---------|
| 0 | id | TEXT | PRIMARY KEY |
| 1 | sc_form_id | TEXT | — |
| 2 | job_uuid | TEXT | — |
| 3 | company_name | TEXT | — |
| 4 | previous_price | REAL | — |
| 5 | proposed_price | REAL | — |
| 6 | status | TEXT | 'pending_review' |
| 7 | created_at | TEXT | CURRENT_TIMESTAMP |
| 8 | reviewed_at | TEXT | NULL |
| 9 | reviewed_by | TEXT | NULL |
| 10 | sent_at | TEXT | NULL |
| 11 | notes | TEXT | NULL |
| 12 | contract_received | INTEGER | 0 |
| 13 | **invoicing_address** | TEXT | '' ✅ |
| 14 | job_id | TEXT | NULL |

**Conclusion:** `invoicing_address` column EXISTS. Q14 (open-questions.md) is answered. No schema fix needed. ✅

---

## 3. Nginx Config Check — CONFIRMED ✅

**Command:** `cat /etc/nginx/sites-available/portal`

**Result:** `dashboard.baselifts.co.uk` proxies to `http://127.0.0.1:3000`

```nginx
server_name dashboard.baselifts.co.uk;
location / {
    proxy_pass http://127.0.0.1:3000;
    ...
}
```

**Conclusion:** Q5 (open-questions.md) is confirmed. The local `/root/portal` (PM2 port 3000) is serving the production custom domain. Vercel is not in the path for `dashboard.baselifts.co.uk`. ✅

**Vercel usage:** Serves `.vercel.app` preview URLs only. Vercel project `base-sc-dashboard` at `hollystarbug-web/BaseSC_dashboard`.

---

## 4. Sally Memory Files Check — COMPLETED ✅

**Files read:**
- `~/.openclaw/workspace-sally/memory/2026-04-24.md`
- `~/.openclaw/workspace-sally/memory/2026-04-25.md`
- `~/.openclaw/workspace-sally/memory/2026-04-26.md`

**New knowledge found (not previously in wiki):**

### SC V7 Form Design History
- **April 25 morning:** Originally designed as SM8 task/checklist fields via `POST /task.json`
- **April 25 afternoon:** Discovered SM8 `formfield` endpoint (1691 fields, SC V7 form UUID `ce793bdc-d51b-4639-8313-22d9d48d342b`)
- **April 25:** AppleScript + JavaScript DOM approach confirmed working for SC V7 form filling in Safari
- **May 10:** Decision made to use portal DB only (Q1 answered) — no SM8 task fields

### SC Auto Queues Created (April 25)
Justin requested and Holly created 6 SC workflow queues in SM8:
| Queue Name | UUID |
|-----------|------|
| SC Auto New | `85b22b6b-c526-4144-a3ce-241dcf57b4ab` |
| SC Auto Cntr+Inv | `3c5d63d4-8886-4872-81a9-241dcc5eeb6b` |
| SC Auto Approve | `84c5edd7-351d-49e7-8299-241dc0625a3b` |
| SC Auto Invoice | `76b0514a-0d89-42ad-a27e-241dcdae499b` |
| SC Auto Initiate | `a00be0b9-5295-42a0-b635-241dc56ae88b` |
| SC Auto Renew | `d330ce67-ae11-4c1d-9354-241dcd5c193b` |

**Note:** These queue UUIDs may not be referenced in the current portal code. Portal may use different queue logic. Need verification.

### Auto/Approval Toggle (April 25)
Portal had a "Processing Mode" toggle on Step 1:
- **Approval** (default): emails require human review before sending
- **Automatic**: emails sent immediately without review

**Note:** This feature may have been removed in later builds. Need verification if still present.

### Installation Contract Workflow (April 25)
Portal had a "Contract Type" toggle: Standard / Installation on Step 1.
- Installation: `reference_price` stored in SQLite (real price), SM8 invoice manually discounted 100%
- At renewal: portal uses `reference_price` from SQLite for CPI calculation

**Note:** This may not be in current production portal. Need verification.

### Photo Upload Automation (April 25)
- SC V7 form has serial plate photo fields (up to 5 photos)
- Photos sourced from: job diary attachments or technician's report
- File input automation via ExtJS: `input.value = '/path/to/file.jpg'` + dispatch `Event('change')`
- Photos NOT required for form submission (optional fields)

### Badge UUIDs (April 25)
| Badge | UUID | Notes |
|-------|------|-------|
| 1 Year Follow-up | `141b2dd2-a608-4303-9bfd-224d6533a0ab` | Triggers renewal reminder + auto-creates recurring yearly job |
| contract | `12938cfd-1db9-4d47-a3ee-22d9d8637e2b` | Triggers SC V7 form/checklist to appear on job |
| VIP | `d410b594-c477-456a-b187-22443ce1fd3b` | Manual VIP marker |
| Warranty | `228c489b-577c-41d7-b521-22443dd9780b` | Standard warranty badge |

### FormResponse Endpoint (April 25)
- `GET /FormResponse.json?$filter=regarding_object_uuid eq '{job_uuid}'`
- Returns form submissions for a job
- `document_attachment_uuid` = signed contract PDF (used for contract_received detection)

### Portal VPS Architecture (April 26)
- VPS portal: SQLite sync from SM8 (every 1 min via `/root/run-sync.sh`)
- Vercel portal (older): Direct SM8 API calls, no SQLite
- These are two different architectures — current production is VPS with SQLite

### PM2 Status (April 26)
- `portal` PM2 process was running (VPS portal)
- `portal-api` PM2 process was running (VPS API)
- `/tmp/sync-sm8.pid` lock file prevents overlapping sync runs

---

## Summary — Verification Results

| Check | Result | Action Needed |
|-------|--------|--------------|
| Git sync | ✅ FIXED | `/root/portal` synced. Rebuilt. PM2 restarted. |
| approval_queue schema | ✅ PASSED | `invoicing_address` column exists. Q14 answered. |
| Nginx proxy | ✅ CONFIRMED | Local VPS portal is authoritative. Q5 answered. |
| Sally memory files | ✅ COMPLETED | 10+ new knowledge items found and migrated to wiki. |

### Security Flags
| Item | Severity | Status |
|------|---------|--------|
| `ecosystem.config.js` with secrets in `/root/portal` | 🔴 HIGH | DELETED. Added to `.gitignore`. Secrets exposed in git history potentially. |
| Portal API process restarts: 26 times | 🟡 MEDIUM | Uninvestigated. May be expected behavior or may indicate crashes. |

---

## Next Step After Verification

**End-to-End Workflow Test** — Test the full SC pipeline with a real or test client.

Before testing, need Justin's answers to:
- Q2: Renewal rejection path
- Q17: Portal user roles

---

## Last Updated

`2026-05-10`
