## 2026-04-17 — QB SO/DD Report — Login Issue (CORRECTED)

**Issue:** SO/DD extraction was failing.
- QB account: debt_recovery@baselifts.co.uk
- CORRECTED (Justin 17 Apr): QB login is TWO-STAGE EMAIL → PASSWORD ONLY. No CAPTCHA. No 2FA.
- The "2FA" conclusion was wrong — it was just a failed login attempt due to incorrect automation logic.
- QB register URL: https://qbo.intuit.com/app/register?accountId=1150040000
- Chrome CDP port: 9222, profile: /Users/holly/openclaw-chrome-profile

**Fix approach:** Use Chrome CDP with correct two-stage email/password fill. Keep QB logged in in Chrome.

**WhatsApp:** Daemon showing "disconnected" — Justin may need to re-auth WhatsApp

