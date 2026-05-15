## CRON Jobs Reference

| Job | Procedure File | Data Sources |
|-----|---------------|-------------|
| Bills to Pay | `procedures/bills-to-pay-v3.md` | Gmail IMAP + Tesseract OCR + **PDF always** |
| Bank Balance | `procedures/quickbooks-bank-balance.md` | Chrome port 9222 |
| VAT Estimate | `procedures/quickbooks-vat-estimate.md` | Chrome port 9222 |
| SO/DD | `procedures/standing-orders-direct-debits.md` | Chrome port 9222 |
| Invoice Aging | `procedures/Invoice_Aging_Report_API_Guide.md` | ServiceM8 API + OpenAI GPT-4o-mini |
| Mini Cashflow | `procedures/mini-forward-cashflow-v2.md` | Assembles from above reports |
| Control Towers | `procedures/{name}-control-tower.md` | ServiceM8 API + GPT-5.4 PDF |
| SC Renewal | `procedures/sc-renewal-checker.md` | ServiceM8 API |

