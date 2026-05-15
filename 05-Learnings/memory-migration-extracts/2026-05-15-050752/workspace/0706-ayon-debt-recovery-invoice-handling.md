## AYON Debt Recovery — Invoice Handling

**File:** `/root/.openclaw/workspace/data/ayon-debt-recovery.json`
**Agency:** AYON Debt Recovery

**Logic:** When running Invoice Escalation, check diary notes for any mention of AYON / debt collection / passed to agency. If found:
1. Add to `ayon-debt-recovery.json` with timestamp, job number, client, amount, date passed
2. Classify as "PASSED TO AYON" — these skip staff escalation
3. Add to report Section 8: "PASSED TO AYON DEBT RECOVERY"
4. They are no longer escalation candidates — AYON handles them

