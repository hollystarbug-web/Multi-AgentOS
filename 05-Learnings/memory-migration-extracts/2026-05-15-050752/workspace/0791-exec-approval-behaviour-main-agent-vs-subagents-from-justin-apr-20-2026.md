## Exec Approval Behaviour — Main Agent vs Subagents (from Justin, Apr 20 2026)

**Why main agent prompts while subagents don't:**
- OpenClaw has TWO layers: shared `openclaw.json` config AND host-local `~/.openclaw/exec-approvals.json`
- Per-agent allowlists live in `exec-approvals.json` under `agents.<id>.allowlist`
- Main agent's local approval state can differ from Kryten/Reggie even with identical shared config
- Effective policy = stricter of config AND local approvals state

**Known bugs:**
- "Allow always" does NOT persist reliably — approved command may prompt again next run
- Wrapper scripts / different shell invocation shapes can cause approvals not to match saved ones
- If host-local `ask: always` is set, durable allow trust does NOT suppress prompts

**Workaround for main agent exec:** Use subagents for anything needing exec, since subagents use `security=full` and bypass approval prompts entirely. This is the established pattern (Kryten/Reggie pattern).

**If main agent exec MUST run directly:** Expect approval prompts; use `security=allowlist ask=off` or ensure host-local `exec-approvals.json` has the specific command allow-listed for the main agent session.

