---
title: Data Model
project: Base Service Contract Manager
created: 2026-05-10
updated: 2026-05-10
tags: [database, schema, sqlite]
---

# Data Model — Portal SQLite DB

## Database

**Location:** `/tmp/portal.db`
**Type:** SQLite (WAL mode)
**Shared by:** Next.js portal (port 3000), VPS API server (port 3001), sync-sm8.js
**Source of truth:** ServiceM8 — never write directly to `sm8_*` tables

## Schema Creation

Tables are created by two processes:
- `server.js` (VPS API, port 3001): creates `sc_forms`, `approval_queue`, `portal_settings`
- `db.ts` (Next.js portal, port 3000): adds columns via ALTER TABLE migrations
- `sync-sm8.js`: creates `sm8_companies`, `sm8_jobs`, `sm8_company_contacts`

**⚠️ Schema inconsistency:** `server.js` creates `approval_queue` without `invoicing_address` column. `db.ts` adds it via migration. The VPS API may not have this column in existing deployments. Run `ALTER TABLE approval_queue ADD COLUMN invoicing_address TEXT DEFAULT ''` on the VPS if missing.

---

## Tables

### sc_forms

SC intake forms. Created at Step 1 (NewContractTab), updated at Step 2 (SCFormTab).

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | Primary key, format: `scf_{timestamp}_{random}` |
| job_uuid | TEXT | SM8 job UUID (set after job creation) |
| company_uuid | TEXT | SM8 company UUID |
| job_id | TEXT | e.g. "Bas-4529" |
| company_name | TEXT | |
| contact_name | TEXT | |
| contact_email | TEXT | |
| contact_phone | TEXT | |
| lifts_covered | INTEGER | |
| visits_per_year | INTEGER | |
| full_day_rate | REAL | |
| per_hour_rate | REAL | |
| minimum_callout | REAL | |
| annual_value | REAL | visits × full_day_rate |
| price_per_service | REAL | DEFAULT 0 — API hardcodes to 0 |
| price_per_loler | REAL | DEFAULT 0 — API hardcodes to 0 |
| total_invoice_per_annum | REAL | DEFAULT 0 — API hardcodes to 0 |
| contract_type | TEXT | `'standard'` or `'installation'` |
| installation_job_number | TEXT | Required if contract_type = installation |
| reference_price | REAL | |
| previous_price | REAL | From previous contract (for renewals) |
| cpi_rate | REAL | Applied CPI % for renewals (default 0) |
| processing_mode | TEXT | `'approval'` (always — hardcoded) |
| notes | TEXT | |
| job_description | TEXT | |
| lead_source | TEXT | "Impact Automation" or "Impact Automation 10%" |
| status | TEXT | `'draft'` → `'pending_review'` → `'approved'` → `'sent'` |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

**Note:** `price_per_service`, `price_per_loler`, `total_invoice_per_annum` are present in the DB schema but the Step 1 API (`POST /api/sc-form`) hardcodes them to `0`. They are updated at Step 2 (`POST /api/sc-form-existing`).

### approval_queue

Pending approvals. Created at Step 2 when form is submitted for review.

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | Primary key, format: `apq_{timestamp}_{random}` |
| sc_form_id | TEXT | FK → sc_forms.id |
| job_uuid | TEXT | SM8 job UUID |
| job_id | TEXT | e.g. "Bas-4529" |
| company_name | TEXT | |
| previous_price | REAL | Previous contract price |
| proposed_price | REAL | New proposed price (= annual_value) |
| status | TEXT | `'pending_review'` → `'approved'` → `'sent'` / `'rejected'` |
| invoicing_address | TEXT | ⚠️ May be missing in VPS API schema — add via ALTER if missing |
| created_at | TEXT | ISO timestamp |
| reviewed_at | TEXT | When reviewed |
| reviewed_by | TEXT | Reviewer name |
| sent_at | TEXT | When email was sent |
| notes | TEXT | |

### sm8_jobs

SM8 job mirror. **Read-only — synced from SM8 every ~1 minute.**
**⚠️ Note:** Only SC category jobs are synced (NOT SC Renewal Invoice category jobs).

| Column | Type | Notes |
|--------|------|-------|
| uuid | TEXT | SM8 job UUID, PRIMARY KEY |
| generated_job_id | TEXT | Display ID (e.g. "Bas-1234") |
| company_uuid | TEXT | |
| company_name | TEXT | |
| job_description | TEXT | |
| job_address | TEXT | |
| status | TEXT | Quote / Completed / Work Order / Unsuccessful / etc. |
| active | INTEGER | 0 or 1 |
| category_uuid | TEXT | SC category UUID |
| assigned_to_uuid | TEXT | |
| customfield_frequency | TEXT | Visit frequency |
| customfield_contract_renewal_date | TEXT | Renewal date |
| completion_date | TEXT | Invoice/completion date |
| invoice_sent | INTEGER | 0 or 1 |
| payment_received | INTEGER | 0 or 1 |
| total_invoice_amount | REAL | Last invoice amount |
| synced_at | TEXT | Last sync timestamp |

**Indexes:** `idx_jobs_company`, `idx_jobs_gen_id`, `idx_jobs_status`

### sm8_companies

SM8 company mirror. **Read-only — synced from SM8 every ~1 minute.**

| Column | Type | Notes |
|--------|------|-------|
| uuid | TEXT | SM8 company UUID, PRIMARY KEY |
| name | TEXT | |
| address | TEXT | Full address |
| address_street | TEXT | |
| address_city | TEXT | |
| address_state | TEXT | |
| address_postcode | TEXT | |
| address_country | TEXT | |
| active | INTEGER | |
| synced_at | TEXT | |

**Indexes:** `idx_companies_name`

### sm8_company_contacts

SM8 contact mirror. **Read-only — synced from SM8 every ~1 minute.**

| Column | Type | Notes |
|--------|------|-------|
| uuid | TEXT | PRIMARY KEY |
| company_uuid | TEXT | FK → sm8_companies.uuid |
| first | TEXT | |
| last | TEXT | |
| email | TEXT | |
| phone | TEXT | |
| mobile | TEXT | |
| is_primary | INTEGER | 0 or 1 |
| synced_at | TEXT | |

**Indexes:** `idx_contacts_company`

### portal_settings

Key-value settings for portal configuration.

| Column | Type | Notes |
|--------|------|-------|
| key | TEXT | PRIMARY KEY |
| value | TEXT | JSON-serialised value |
| updated_at | TEXT | |

Stored settings:
- `labour_full_day` — full day labour rate
- `labour_per_hour` — per hour labour rate
- `labour_minimum_callout` — minimum callout charge

### lead_source_options

Dropdown values for the lead source field in NewContractTab.

| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER | PRIMARY KEY, autoincrement |
| value | TEXT | Option text |
| sort_order | INTEGER | Display order |

Default options:
1. Impact Automation
2. Impact Automation 10%

---

## Sync Architecture

```
ServiceM8 API
    │
    │  sync-sm8.js (every ~1 minute)
    ▼
sm8_companies ─────┐
sm8_jobs ──────────┤──► /tmp/portal.db
sm8_company_contacts┘
    │
    │  portal/db.ts (live fetches at request time)
    ▼
Dashboard / KPIs / Pipeline
```

**Key distinction:**
- `sm8_*` tables: synced every ~1 minute — used for Awaiting Payment list and renewal price lookups
- Live SM8 API: fetched directly at request time (no cache) — used for KPIs, active contracts, renewals window

**⚠️ Known gap:** The sync script only syncs SC category jobs (`6d2fd47f-...`). SC Renewal Invoice category jobs (`a04b781f-...`) are NOT in the SQLite mirror. Portal fetches them live from SM8 API when needed.

---

## Last Updated

`2026-05-10`
