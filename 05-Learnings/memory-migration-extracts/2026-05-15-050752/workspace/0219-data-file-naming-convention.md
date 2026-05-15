### Data File Naming Convention
All daily report data saves to: `data/daily-reports/YYYY-MM-DD.json`

**MANDATORY: After every CRON data extraction, you MUST:**
1. Save extracted data to `data/daily-reports/YYYY-MM-DD.json` with a timestamp
2. Note in this MEMORY.md pointing to where each data type is saved
3. This is how Mini Forward Cashflow finds data — if it's not saved, it's not available

**Per-data-type storage locations:**
- Bank Balance: `data/daily-reports/YYYY-MM-DD.json` → `bank_balance` key
- VAT Estimate: `data/daily-reports/YYYY-MM-DD.json` → `vat_estimate` key
- Bills to Pay: `data/daily-reports/YYYY-MM-DD.json` → `bills_total` key AND `/tmp/bills-combined.txt`
- Invoice Aging: `data/invoice-aging-history.json` (append new entry)
- SO/DD: `data/so-dd/YYYY-MM.json` → `grand_total`
- Control Tower data: `/tmp/{staff}_report_data.json` (temporary, consumed by PDF gen)

**Mini Forward Cashflow data lookup order:
1. Check today's file first: `data/daily-reports/[today].json`
2. If today doesn't have all data, check yesterday: `data/daily-reports/[yesterday].json`
3. Use most recent file that has the data needed
4. Bills to Pay: Also check `/tmp/bills-combined.txt` (created by extraction)

**Timestamp validation:** Before using any data, verify it was extracted TODAY. If data is stale (from before today), re-extract or flag as unavailable.

**Never use stale data in reports.** If any data feed for a report is stale, re-trigger the relevant job to bring it up to date before assembling the dependent report. Mini Forward Cashflow requires fresh Bank Balance, VAT, and SO/DD — if any are older than today, trigger them first. |

---

