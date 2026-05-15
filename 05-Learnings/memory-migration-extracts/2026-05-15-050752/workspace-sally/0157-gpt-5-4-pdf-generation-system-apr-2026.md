## GPT-5.4 PDF Generation System (Apr 2026)

**Flow:** CRON extracts data → saves JSON → I generate PDF → send to WhatsApp

**CRON jobs** (data extraction only):
- Florence, Malene, Caz, Diogo, Justin Control Towers
- SC Renewal Check

**My handling (when CRON messages arrive):**
1. Load JSON from `/tmp/{staff}_report_data.json`
2. Call GPT-5.4 via `scripts/gpt5-report-generator.py`
3. HTML template: `docs/templates/control-tower-report.html`
4. Convert to PDF via Chrome headless
5. Send PDF to WhatsApp Holly_Updates

**API Key:** Stored at `~/.openclaw/workspace/.credentials/openai.json`

---

