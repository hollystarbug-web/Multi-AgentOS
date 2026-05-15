## QuickBooks Login — IMPORTANT (updated 2026-04-23)

**Credentials:** debt_recovery@baselifts.co.uk / Reddwarf2026!

**CRITICAL LOGIN STEPS (learned from session):**
1. Chrome is at Intuit accounts page showing email selection
2. The email `debt_recovery@baselifts.co.uk` is shown as a **BUTTON** (not a form field) — it looks like an email address but it IS the sign-in button. Click it directly.
3. After clicking email button → wait 2-3s → page transitions to password
4. Click **CONTINUE** button (not Enter key)
5. May trigger 2FA — if so, wait for the code input
6. After login → may land on `/app/vat` (404) or `/app/get-things-done`
   - If 404 on VAT → navigate to `https://qbo.intuit.com/app/tax/home`
   - If get-things-done → look for VAT link in sidebar or dashboard
7. The VAT page URL structure is `/app/tax/home` not `/app/vat`
8. Always screenshot AFTER each major step — do NOT assume the click worked without checking

**Chrome debug port:** 9222 | Profile: /Users/holly/openclaw-chrome-profile
**QB account ID:** 1150040000 (Base Metro Bank Current GBP)
**Known QB URLs:**
- Dashboard: `/app/dashboard`
- VAT: `/app/tax/home`
- Bank: `/app/register?accountId=1150040000`

**Credentials file:** `~/.openclaw/workspace/.credentials/quickbooks-main.json`

**Login:** debt_recovery@baselifts.co.uk / Reddwarf2026!

**Login flow (2-stage):**
1. Enter email → click **Sign In**
2. Enter password → click **Continue**
3. Done. If reCAPTCHA appears in a separate tab, close it and continue.

**Chrome debug port:** 9222
**Logged-in tab ID:** `23B1451DAE6884E22B05F570D255FDFE`

**Procedures:**
- Bank Balance: `procedures/quickbooks-bank-balance.md`
- VAT Estimate: `procedures/quickbooks-vat-estimate.md`
- Auto-Login: `procedures/quickbooks-auto-login.md`

---

