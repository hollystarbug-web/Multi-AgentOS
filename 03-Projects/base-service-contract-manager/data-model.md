---
title: Data Model
project: Base Service Contract Manager
created: 2026-05-10
tags: [database, schema, sqlite]
---

# Data Model — Portal SQLite DB

## Database

**Location:** `/tmp/portal.db`
**Type:** SQLite (WAL mode)
**Purpose:** Speed cache. SM8 is the source of truth.

## Tables

### sc_forms

SC intake forms (draft records). Created at Step 1, updated at Step 2.

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | Primary key |
| job_uuid | TEXT | SM8 job UUID |
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
| contract_type | TEXT | 'standard' or 'installation' |
| installation_job_number | TEXT | |
| reference_price | REAL | |
| previous_price | REAL | |
| cpi_rate | REAL | |
| processing_mode | TEXT | 'approval' or 'automatic' |
| notes | TEXT | |
| job_description | TEXT | |
| lead_source | TEXT | |
| status | TEXT | 'draft' → 'pending_review' |
| price_per_service | REAL | |
| price_per_loler | REAL | |
| total_invoice_per_annum | REAL | |
| created_at | TEXT | ISO timestamp |
| updated_at | TEXT | ISO timestamp |

### approval_queue

Pending approvals. Created when SC form submitted.

| Column | Type | Notes |
|--------|------|-------|
| id | TEXT | Primary key |
| sc_form_id | TEXT | FK → sc_forms.id |
| job_uuid | TEXT | |
| job_id | TEXT | |
| company_name | TEXT | |
| previous_price | REAL | |
| proposed_price | REAL | |
| status | TEXT | 'pending_review' → 'approved' → 'sent' |
| contract_received | INTEGER | 0 or 1 |
| invoicing_address | TEXT | |
| created_at | TEXT | |
| reviewed_at | TEXT | |
| reviewed_by | TEXT | |
| sent_at | TEXT | |
| notes | TEXT | |

### sm8_jobs

ServiceM8 job cache. Synced FROM SM8 every ~1 minute.

### sm8_companies

ServiceM8 company cache. Synced FROM SM8 every ~1 minute.

### sm8_company_contacts

ServiceM8 contact cache. Synced FROM SM8 every ~1 minute.

### portal_settings

Key-value settings.

### lead_source_options

Dropdown values for lead source field.

## Sync Architecture

```
SM8 API → /root/run-sync.sh (cron every 1 min) → SQLite tables
```

**Never write to these tables directly** — they are synced from SM8.

## Last Updated

`2026-05-10`
