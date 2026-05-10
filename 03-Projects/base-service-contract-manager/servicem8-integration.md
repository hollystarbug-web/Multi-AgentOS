---
title: ServiceM8 Integration
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [servicem8, api, integration]
---

# ServiceM8 Integration

## Overview

ServiceM8 is the **source of truth** for all job and client data. The portal's SQLite DB syncs FROM SM8 (never the other way). All writes to SM8 happen via the API.

## API Access

**API Key:** `smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7`
**Base URL:** `https://api.servicem8.com/api_1.0`

### Authentication — Two Methods

| Method | Use For | Scope |
|--------|---------|-------|
| API Key (`X-API-Key` header) | Read-only data fetching | Jobs, companies, contacts, notes, invoices |
| OAuth 2.0 (`Bearer token`) | Write/send operations | Email, SMS, documents, templates |

**API key limitations:** The API key CANNOT be used for:
- `jobCommunication` (email/SMS sending) — returns `"not an authorised object type"`
- Publishing documents
- Managing templates
- Job checklists/tasks via API

**OAuth credentials:** `~/.openclaw/workspace/.credentials/servicem8_oauth.json`. Token auto-refreshes when expired.

### Cursor Pagination

SM8 API uses cursor-based pagination for all list endpoints:
1. First request: add `?cursor=-1`
2. Check response header `x-next-cursor` for next page
3. If header exists, use that value as next cursor
4. Repeat until no `x-next-cursor` header (done)
5. Rate limit: 200ms delay between requests; wait 60s on HTTP 429

---

## Key Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/job.json` | GET | API key | Fetch jobs (with filters) |
| `/job/{uuid}.json` | GET/PUT | API key | Read/update individual job |
| `/company.json` | GET | API key | Fetch companies |
| `/companycontact.json` | GET | API key | Fetch contacts |
| `/note.json` | GET/POST | API key | Diary notes |
| `/jobCommunication.json` | POST | OAuth | Send email/SMS |
| `/recurringjob.json` | POST | API key | Create recurring job (initiation) |
| `/task.json` | POST | API key | Add checklist item to job |

---

## Key Filters

```bash
# Unpaid invoices (Awaiting Payment)
GET /job.json?$filter=invoice_sent%20eq%201%20and%20payment_received%20eq%200&cursor=-1

# SC category jobs (active)
GET /job.json?$filter=category_uuid%20eq%20'6d2fd47f-4ae0-4041-8cc0-22e739804a6b'&cursor=-1

# SC Renewal Invoice category jobs
GET /job.json?$filter=category_uuid%20eq%20'a04b781f-047f-4db4-9872-241accbf1f8b'&cursor=-1

# Jobs in specific queue
GET /job.json?$filter=queue_uuid%20eq%20'{queue_uuid}'&cursor=-1
```

---

## Categories

| Category | UUID | Use For |
|----------|------|---------|
| SC Standard | `6d2fd47f-4ae0-4041-8cc0-22e739804a6b` | New service contracts |
| SC Renewal Invoice | `a04b781f-047f-4db4-9872-241accbf1f8b` | Renewal quotes/invoices |

---

## Diary Attachment Process (Contract PDF Detection)

### What It Is

Step 4 (Invoice Send) detects whether the client has signed the contract by checking if a PDF is attached to the SM8 job diary.

### How It Works

1. Staff uploads signed contract PDF to the job diary in ServiceM8
2. Portal checks for attachment in job diary via SM8 API
3. If PDF found → `contract_received = true` → invoice can be sent

### Implementation

The portal checks job diary entries (`/note.json` filtered by `related_object_uuid`) for attachments. Attachment type documents have `type = "Document"`.

### Important: Which Job Diary?

**Signed contract PDF goes to the ORIGINAL job diary, NOT the renewal job diary.**

This was confirmed with Justin on 2026-04-25. When checking for contract received in Step 4, portal must check the ORIGINAL SC job's diary, not the renewal job's diary.

---

## Fallback Process (Client Signs Outside Portal)

### Scenario

Client signs a contract without using the portal's integrated DocuSign/email flow.

### Fallback Steps

1. Staff receives signed contract PDF via email or other means
2. Staff manually attaches PDF to the job diary in ServiceM8
3. Portal detects PDF in job diary → marks `contract_received = true`
4. Invoice Send step proceeds automatically

### Staff Training

Staff must be trained to attach the PDF to the job diary immediately upon receiving a signed contract, even if it arrived outside the portal workflow.

---

## Browser Automation (Chrome CDP via Mac Mini)

**⚠️ Chrome only for SM8 and QB.** Safari WebDriver is NOT to be used for SM8 or QB automation.

### Chrome Setup

Chrome is permanently logged into ServiceM8 as Justin Howard on Mac Mini.

**Chrome CDP endpoint:** `http://localhost:9222` (VPS) → Mac Mini Chrome debug port 9222
**Chrome tab ID:** `8B77F0A5A19CC9D32B7090C06EB4996C` (ServiceM8 Dispatch Board)
**LaunchAgent:** `com.holly.chrome-debug.plist` (auto-starts, auto-restarts)

### Tool

`agent-browser` CLI on Mac Mini: `/opt/homebrew/lib/node_modules/agent-browser/bin/agent-browser-darwin-arm64`

### Commands

```bash
# Connect to ServiceM8 tab
agent-browser connect "ws://localhost:9222/devtools/page/8B77F0A5A19CC9D32B7090C06EB4996C"

# See UI
agent-browser snapshot

# Click element
agent-browser click @<ref>

# Fill input
agent-browser fill @<ref "text"

# Run JavaScript
agent-browser eval "window.location.href='...'"

# Screenshot
agent-browser screenshot /tmp/sm8.png
```

### Navigation with s_auth Token

**Always use eval with s_auth token.** `agent-browser open <url>` loses the session token and redirects to marketing site.

```bash
# Get fresh s_auth token
S_AUTH=$(curl -s http://localhost:9222/json | python3 -c "
import sys,json
for t in json.load(sys.stdin):
    if '8B77F0A5A19CC9D32B7090C06EB4996C' in t.get('id',''):
        import re
        m = re.search(r's_auth=([a-f0-9]+)', t['url'])
        if m: print(m.group(1))
")

# Navigate
agent-browser eval "window.location.href='https://go.servicem8.com/job_dispatch?&s_auth=${S_AUTH}'"
```

---

## ServiceM8 OAuth Flow

### When Needed

- Sending emails via `jobCommunication` endpoint
- Sending SMS
- Publishing documents to job diary
- Managing templates

### How It Works

1. Phase 1: Auth code request → user approves → redirect with code
2. Phase 2: Exchange code for tokens
3. Token stored in `~/.openclaw/workspace/.credentials/servicem8_oauth.json`
4. Token auto-refreshes when expired

### redirect_uri Rule

The `redirect_uri` in Phase 1 must be **byte-identical** to Phase 2. Any mismatch causes rejection.

### OAuth Scopes Required

- `publish_email` — send emails
- `publish_sms` — send SMS
- `manage_job_checklists` — update job checklists via API
- `manage_documents` — upload/manage documents

---

## Known Constraints

1. **Checklist/task API** — requires OAuth `manage_job_checklists` scope. API key returns `"not an authorised object type"`.
2. **Job card must be opened through ExtJS app** — cannot navigate directly via URL. Must use `PluginDBOJob_HandleOpenJobPanel(numericID)` or double-click in dispatch board.
3. **Chrome automation is blocked** — ServiceM8 detects Chrome automation. Use agent-browser with existing session (already logged in).
4. **SC Renewal category not in sync** — renewal jobs not synced to SQLite by sync-sm8.js. Portal fetches live from API.
5. **s_auth tokens are page-specific** — different ServiceM8 pages have different session tokens. Grab from URL after navigation.

---

## SC Exclusion List

117 job IDs are excluded from all SC calculations and KPIs.
**Location:** `docs/ServiceM8_API.md` appendix.

**Rule:** Jobs with `status = Unsuccessful` are always skipped. These are definitively incomplete — no debt, no contract.

---

## Last Updated

`2026-05-10`
