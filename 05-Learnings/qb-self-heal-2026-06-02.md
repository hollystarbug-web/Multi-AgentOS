# QB Self-Heal: Recovering from Session Expiry via CDP (2026-06-02)

**Status:** ✅ Live, deployed to keep-alive and 2 Lobster workflows
**Owner:** Holly (main agent)
**Date:** 2026-06-02

## What happened

On 2026-06-02 morning, every QB-related cron / Lobster workflow failed because the QB session had expired:

- `qb-vat-estimate` Lobster workflow failed ("No QB tab found")
- `qb-bank-balance` Lobster workflow would have failed
- `qb_human_keepalive.py` was failing every 25 minutes with "Could not find pre-filled email button"
- The Invoice Aging cron also reported failure (separately, due to WhatsApp not linked)

Holly's first instinct was to escalate to Justin as "please log into QB in Chrome on Mac Mini." Justin rightly pushed back: "this was fixable via your own skills, tool and automation without my input! This is the same for all CRONs that failed today for QB, whether Lobster workflow or not."

He was right. The fix was one button click + a password fill — both doable via Chrome CDP.

## What was wrong with the keep-alive

The `click_element` helper in `qb_human_keepalive.py` had a silent bug. It wrapped an IIFE that returned a string in a function that tried to call `.scrollIntoView` on the string. The TypeError was silent (CDP swallows it), so the result came back empty, the script thought the email button wasn't there, and it gave up.

```python
# BROKEN — wraps IIFE result, calls .scrollIntoView on a string
def click_element(ws, selector_script):
    r = cdp(ws, "Runtime.evaluate", {
        "expression": f"""
(function() {{
    var el = {selector_script};        # el = 'EMAIL_CLICKED: ...' (a string!)
    if (!el) return 'NOT_FOUND';
    el.scrollIntoView(...);             # TypeError: string.scrollIntoView is not a function
    el.click();                         # never reached
    return 'CLICKED: ' + (el.textContent.trim()...);
}})()
""",
```

The new `qb_session_recover.py` uses a self-contained `click_first(predicate_js)` helper that does the search and click in a single JS function, with no string-vs-element confusion.

## The new self-heal flow

`/root/.openclaw/workspace/scripts/qb_session_recover.py` is a self-contained, idempotent recovery script. It can be called from anywhere — keep-alive, Lobster workflow, ad-hoc, sub-agent.

### Page states it handles

| State | What it looks like | Action |
|-------|--------------------|--------|
| `logged_in` | URL is `qbo.intuit.com/app/...` and not on sign-in | Return 0, no work needed |
| `account_picker` | "Let's get you in to QuickBooks \| debt_recovery@baselifts.co.uk" | Click the debt_recovery email button → wait → password page |
| `signin_form` | "Email or user ID + Phone + Sign in" | Click Sign in (rare; usually reached via Use a different account) |
| `password` | "Enter your Intuit password" with Show/Continue buttons | Fill password via React-compatible value setter → click Continue |
| `unknown` | None of the above | Log full state and return 2 |

### Wrong-account recovery

If the password page shows a phone number other than the one we expect, OR if we're on the password page for a stale session, the script clicks "Use a different account" first, then goes through the account_picker path.

### React-compatible password fill

```js
const inp = document.querySelector('input[type="password"]');
const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
setter.call(inp, password);
inp.dispatchEvent(new Event('input', {bubbles: true}));
inp.dispatchEvent(new Event('change', {bubbles: true}));
```

Direct `inp.value = password` does NOT trigger React's onChange. The setter trick does.

### Exit codes

| Code | Meaning | Caller should |
|------|---------|---------------|
| 0 | Already logged in OR just logged in successfully | Continue with the real work |
| 1 | Chrome CDP unreachable OR no QB tab | Alert: "Open Chrome + go to QB" |
| 2 | Login failed after best-effort | Alert: "Manual intervention needed" |
| 3 | Password missing from credentials file | Alert: "Update qb_credentials.json" |

## Where it's wired in

### 1. `qb_human_keepalive.py` (cron `f7eb6e28-b446-4c8d-9b0c-8f7813126a6a`, every 25 min)
- Step 1: calls `qb_session_recover.py` first thing
- Step 2: warm-up navigation (Home → Accounting) to keep session warm
- Alerts via WhatsApp on any non-zero exit

### 2. `qb-bank-balance.lobster`
- New step `self_heal_qb_session` inserted between `extract_balances` and `send_to_whatsapp`
- Checks for "session expired" in `/tmp/bank_balance_fresh.json`
- Calls `qb_session_recover.py`, re-runs `qb_cdp_bank_balance.py` on success
- Falls through to alert only if recovery also fails

### 3. `qb-vat-estimate.lobster`
- Same pattern as bank-balance
- Checks `/tmp/vat_fresh.json` for "session expired" / "needs re-login"
- Re-runs `qb_cdp_vat_extract.py` on success

## Lessons (full text in `LEARNINGS.md`)

1. **Rule: QB session expired ≠ escalate to Justin. Self-heal via CDP first.** The fix is one button + a password fill. Use the tools.
2. **Rule: When a keep-alive or cron fails, investigate WHY before escalating.** Read the log, find the root cause, fix the script.
3. **Rule: For QB login, the correct flow is account_picker → password (or password → switch-account → account_picker → password).** Click Continue on the password page, NOT Sign in.
4. **Rule: Lobster workflows with browser dependencies must self-heal, not just alert.** Self-heal step belongs BEFORE the alert step.

## Related

- LEARNINGS.md → "QB session self-healing — 2026-06-02"
- `/root/.openclaw/workspace/procedures/quickbooks-auto-login.md` (the original procedure, now updated by reference)
- `/root/.openclaw/workspace/skills/qb-login-recovery/SKILL.md` (the manual one-button procedure; superseded for automation by `qb_session_recover.py`)
- MEMORY.md → "QuickBooks CDP Chrome Session" (long-standing awareness)
