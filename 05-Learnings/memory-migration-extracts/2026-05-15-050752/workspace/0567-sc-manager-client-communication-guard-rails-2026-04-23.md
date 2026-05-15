## SC Manager — Client Communication Guard Rails (2026-04-23)

**FIRM RULE — NO EXCEPTIONS:**
- **NEVER send anything directly to a client** — no invoices, no quotes, no emails, no SMS, no ServiceM8 messaging
- All client-facing actions require **explicit human approval from Justin** before execution
- Auto-processor is BLOCKED on: `send_invoice`, `send_quote`, `create_quote` (quotes only — quotes are created as draft, not sent)
- Internal actions ALLOWED: `add_note` (internal diary notes only), `create_invoice` (draft only)
- If any action involves communicating with a client → flag to Justin first

**Flow for `send_invoice` / `send_quote`:**
1. Action queued in `pending_actions` with status `pending_human`
2. I notify Justin via WhatsApp: "Invoice ready to send — [Client], £[Amount]. Reply APPROVE to send."
3. Justin approves → I process manually
4. Never auto-send without Justin's explicit instruction

**Sally knows this rule and follows it in all SC work.**

---

