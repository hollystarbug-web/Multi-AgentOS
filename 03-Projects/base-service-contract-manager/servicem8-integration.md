---
title: ServiceM8 Integration
project: Base Service Contract Manager
created: 2026-05-10
tags: [servicem8, api, integration]
---

# ServiceM8 Integration

## Overview

ServiceM8 is the **source of truth** for all job and client data. The portal's SQLite DB syncs FROM SM8.

## API Access

**API Key:** `smk-4457bf-5dba51feb84ada3a-b34852e9afbff3c7`
**Base URL:** `https://api.servicem8.com/api_1.0`

### Authentication
- Read operations: API key (`X-API-Key` header)
- Write/send operations: OAuth 2.0 (required for email/SMS sending)

### Cursor Pagination
SM8 API uses cursor-based pagination:
1. First request: add `?cursor=-1`
2. Check response header `x-next-cursor` for more pages
3. If header exists, use that value as next cursor
4. Repeat until no `x-next-cursor` header
5. Rate limit: 200ms delay between requests, wait 60s on 429

## Key Filters

```
# Unpaid invoices (Awaiting Payment)
GET /job.json?%24filter=invoice_sent%20eq%201%20and%20payment_received%20eq%200&cursor=-1

# Service Contract jobs
GET /job.json?%24filter=category_uuid%20eq%20'6d2fd47f-4ae0-4041-8cc0-22e739804a6b'&cursor=-1

# Jobs in specific queue
GET /job.json?%24filter=queue_uuid%20eq%20'{queue_uuid}'&cursor=-1
```

## Key Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/job.json` | Jobs (invoices, SC classification) |
| `/note.json` | Diary notes |
| `/jobpayment.json` | Payments |
| `/company.json` | Clients |
| `/category.json` | Categories (SC = `6d2fd47f-4ae0-4041-8cc0-22e739804a6b`) |
| `/queue.json` | Job queues |

## Key Job Fields

- `generated_job_id` — Job number (e.g. "Bas-1264")
- `total_invoice_amount` — Invoice total
- `payment_received` — 1 if fully paid
- `invoice_sent` — 1 if invoice sent
- `completion_date` — Use for aging calculation
- `invoice_sent_stamp` — When invoice was sent
- `category_uuid` — Compare to SC Category UUID for SC check

## SC Category UUID

**Service Contract:** `6d2fd47f-4ae0-4041-8cc0-22e739804a6b`
**SC Renewal Invoice:** `a04b781f-047f-4db4-9872-241accbf1f8b`

## SC Exclusion List

117 job IDs are excluded from SC calculations. See `docs/ServiceM8_API.md` appendix.

## Unsuccessful Jobs

Jobs with `status = Unsuccessful` should be SKIPPED from all reports and KPIs. These are definitively incomplete work — no debt exists.

## Last Updated

`2026-05-10`
