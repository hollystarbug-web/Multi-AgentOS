## Key Lessons (from Justin)

**Browser automation: explicit scripts > high-level instructions.**
When spawning subagents for browser tasks, ALWAYS give them the exact script file paths to run. Never say "fill in the email and password" — instead give the exact Python script path. Subagents improvise and use the wrong tools (agent-browser instead of CDP) when given vague instructions.

**Pattern:**
1. Save working scripts to `/root/.openclaw/workspace/scripts/qb_*.py`
2. Give subagents the exact command: `python3 /root/.openclaw/workspace/scripts/qb_login_email.py`
3. Never rely on the agent to figure out how to fill forms — hand it the script

**OpenClaw local docs — ALWAYS check first:**
- TOOLS.md has links to docs.openclaw.ai, Discord, ClawhHub
- Read local docs before web searching
- Community Discord for real-time help

**Always propagate scripts to subagent-accessible storage.**
Any time I save or update a working script, I must immediately copy it to the workspace scripts directory so subagents can access it. The workspace scripts dir (`/root/.openclaw/workspace/scripts/`) is the canonical location for all reusable scripts.

**When scripts are updated, propagate immediately.**
If I update a script (e.g., fix a bug, improve parsing), I must copy the updated version to the workspace scripts directory AND update any CRON job payloads that reference the old script path. The scripts in the workspace scripts dir are the single source of truth — all subagents and CRON jobs must reference the same files.

**QuickBooks Chrome DevTools:**
- Persistent Chrome at `localhost:9222` with profile `/Users/holly/openclaw-chrome-profile`
- DO NOT use `agent-browser` tool — it spawns ephemeral browsers
- Use CDP via Python/curl: `http://localhost:9222/json/{method}/{tab_id}`
- Scripts: `qb_login_email.py`, `qb_login_password.py`, `qb_bank_balance.py`

