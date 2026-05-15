## CRON FAILURE RULE — PERMANENT (added 2026-04-17)

**ANY CRON job that fails must be handled as follows:**
1. Fix the root cause (timeout, script error, logic bug, etc.)
2. Run it immediately via `cron run <jobId>` — do NOT wait for next scheduled trigger
3. The goal is same-day data, not "fixed for next time"

**This applies to ALL failed CRONs without exception.**

---

