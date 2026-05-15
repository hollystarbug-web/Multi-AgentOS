### Documentation:
- `README.md` — project overview, architecture, key files
- `SETUP.md` — how to start app, auto-start, backup
- `USER_GUIDE.md` — how to use each page
- `CRON_REFERENCE.md` — all CRON jobs
- `BRANDING.md` — colours, logo, CSS
- `ACTION_PROCESSOR.md` — how queued actions work
- `CHANGELOG.md` — what was built and when
- `docs/SC-PORTAL-WORKFLOW-SPEC-v1.md` — authoritative build spec
- `docs/SC-PORTAL-CONTEXT-2026-04-24.md` — yesterday's session context
- `docs/SC-PORTAL-CONTEXT-2026-04-25.md` — today's session context

**CRONs:**
- Action Processor: `a7e08ed6-6047-4678-8814-11f06ed73ab2` (every 5 mins)
- SC Renewal Checker: `bf22e172-2425-4a46-b651-8844f3a2b2df` (Mon & Fri 9am)

**Guard rails:** send_invoice/send_quote BLOCKED — require Justin approval. Full rules in `procedures/sc-manager-action-processor.md`.
**DNS guard rails:** No DNS records deleted or adjusted without explicit human confirmation.

---

