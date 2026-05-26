# ServiceM8 Invoice Aging Rules — Base Lift Services

**Last updated:** 2026-05-26

## Critical Rules

### 1. ServiceM8 is authoritative for A/R — NEVER use QB A/R
Invoice aging and accounts receivables come from ServiceM8 only. QB A/R must not appear in any cashflow, aging, or debt reports.

**Why:** QB A/R only captures posted invoices. SM8 is the system of record for all invoice aging and receivables.

**Source:** Justin confirmed 2026-05-26

---

### 2. Always include Work Orders (no completion_date) in grand_total
Jobs with no `completion_date` (Work Orders) have invoices sent but work not yet marked complete. They are **real receivables** and must be included in the grand total.

**Filter:**
- `status != "Unsuccessful"` AND `balance > 0` AND `invoice_sent == 1`
- Then split: `has completion_date` → aged jobs; `no completion_date` → WIP jobs

**Breakdown (May 26 2026):**
| Category | Jobs | Amount |
|---|---|---|
| Aged (has completion_date) | 160 | £164,654.46 |
| Work Orders (no completion_date) | 12 | £37,635.80 |
| **Grand total (active)** | **172** | **£202,290.26** |
| Unsuccessful | 11 | £31,789.95 |
| TOTAL (incl Unsuccessful) | 183 | £234,080.21 |

**Source:** Bug found and fixed 2026-05-26 — previous extraction was skipping WIP jobs, undercounting by £37,636.

---

### 3. Unsuccessful jobs are NOT receivables
Jobs with `status == "Unsuccessful"` are failed/abandoned jobs. **Do not count as outstanding receivables.**

On May 26 2026: 11 Unsuccessful jobs totaling £31,789.95 were present in the unpaid jobs list. They must be excluded from the receivable total.

---

### 4. Save daily invoice aging with full job data for reconciliation
The daily report JSON must save:
- Band totals (`0-30`, `31-60`, `61-90`, `91-120`, `120+`)
- Individual job details: `uuid`, `job_id`, `status`, `balance`, `completion_date`
- Grand total (active), aged total, WIP total, unsuccessful total

**File format:** `data/daily-reports/YYYY-MM-DD-invoice-aging.json`

**Existing files:**
- `2026-05-21.json` — band totals only (no individual jobs) — INCOMPLETE
- `2026-05-26-invoice-aging.json` — full job data — COMPLETE

**Why this matters:** On 2026-05-26, comparing May 21 vs May 26 aging required knowing which specific jobs disappeared. The May 21 file had band totals only, making reconciliation difficult.

---

### 5. Always reconcile aging change against bank balance
When aging drops by X, the bank should be UP by approximately X (if payments received).

**Formula:** `Expected bank change ≈ -aging_change`

If bank change differs significantly from `-aging_change`, investigate immediately.

**May 21 → May 26 example:**
- Aging dropped: £39,879.49
- Bank changed: -£1,226.89
- Expected bank if paid: +£39,879.49
- **Unexplained gap: £41,106.38** — required manual investigation

---

### 6. Aging band movements tell the collection story
| Band | What change means |
|---|---|
| 0-30 drops | Payments received OR invoices aged out to older buckets |
| 31-60/61-90 increases | Younger invoices aging in — NOT lost, just older |
| 91-120/120+ drops | Payments received on old invoices |

**May 21 → May 26 band movements:**
| Band | May 21 | May 26 | Change |
|---|---|---|---|
| 0-30 | £136,094 | £53,070 | -£83,024 |
| 31-60 | £26,291 | £28,601 | +£2,309 |
| 61-90 | £40,516 | £46,388 | +£5,872 |
| 91-120 | £13,127 | £12,672 | -£455 |
| 120+ | £26,141 | £23,924 | -£2,218 |

**Interpretation:** Large 0-30 drop (−£83k) with modest 31-90 increases suggests real payments were received, but bank didn't increase — cash came in and went straight back out as expenses.

---

## Key Data Reference

**May 21 baseline (from `data/daily-reports/2026-05-21.json`):**
- Bank: £107,642.09 combined
- Aging: £242,169.75 (189 invoices)
- Bands: 0-30 £136,094 | 31-60 £26,291 | 61-90 £40,516 | 91-120 £13,127 | 120+ £26,141

**May 26 baseline (from `data/daily-reports/2026-05-26-invoice-aging.json`):**
- Bank: £106,415.20 combined
- Aging: £202,290.26 (172 active jobs)
- Bands: 0-30 £53,070 | 31-60 £28,601 | 61-90 £46,388 | 91-120 £12,672 | 120+ £23,924
- WIP: 12 jobs (£37,636) | Unsuccessful: 11 jobs (£31,790)
