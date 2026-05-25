# Agent Documentation Discipline — Universal Rule

> Status: **ACTIVE** — 2026-05-25  
> Source: Justin, conversation 2026-05-25

## Rule: Vault Documentation Update — MANDATORY for ALL Agents

**What:** After EVERY significant work session on ANY project, the agent MUST update the relevant wiki vault files with all decisions, design choices, and current state before finishing.

**Why:** Future agents and harnesses must be able to pick up any project immediately without re-discovering decisions already made. Without documentation, every new agent starts from zero.

**When:** Every time an agent:
- Makes a design decision
- Changes the architecture or approach
- Adds, removes, or modifies features
- Integrates a new API, provider, or service
- Changes credentials or configuration
- Completes a task or identifies a new one
- Hits a blocker or learns something important

**How — For the Agentic OS specifically:**

1. **Update the relevant files in order:**
   - `03-Projects/Agentic-OS/MODELS.md` — model/credential decisions
   - `03-Projects/Agentic-OS/README.md` — project overview, panels, setup
   - `03-Projects/Agentic-OS/ARCHITECTURE.md` — technical decisions, API routes, store shape
   - `03-Projects/Agentic-OS/TASKS.md` — mark completed tasks, add new ones
   - `03-Projects/Agentic-OS/PROCEDURES/` — if a new procedure was created

2. **For each file:**
   - Read the current content first
   - Update in place (don't rewrite everything, just the affected sections)
   - Preserve existing content that's still accurate

3. **Git commit format:**
   ```
   [Project]: [Brief description of what changed]
   
   - [List of specific changes]
   - [Decisions made and why]
   - [Any new tasks or blockers]
   ```

4. **After committing:** Push to GitHub so Justin can pull.

**How — For OTHER projects (generic pattern):**

1. Identify the project directory under `03-Projects/`
2. Read the project's `README.md` and any existing documentation
3. Update:
   - `README.md` — current state, what's built, what's next
   - `TASKS.md` or `CHANGELOG.md` — what was done
   - `ARCHITECTURE.md` or `DESIGN.md` — technical decisions
   - `PROCEDURES/` — if a procedure was created or updated
4. Commit and push

**The minimal documentation update after ANY session:**
- What changed
- What decisions were made
- What's still pending
- Any new information another agent would need

**What to NEVER do:**
- Leave a session without updating vault docs
- Make changes and leave no trace in the wiki
- Only update口头 memory — always write it down in the vault
- Assume someone else will document it later

**Verification:** Before finishing, the agent should be able to answer: "If I handed this project to another agent right now with no context except the vault, could they continue from here?" If no, documentation is incomplete.

---

## Agentic OS — Current State (as of 2026-05-25)

### What's Built
- Next.js 14 dashboard with dark glass UI (violet accent)
- Panels: Overview, Chat (multi-model), Goals, Journal (voice), Node Monitor, Mission Control, Terminal, Openclaw, Agent Placeholders (8 agents)
- Sidebar: 180px wide, persistent labels, agents grouped by provider, node status at bottom
- Model system: Agent → Model → Message flow with model selector dropdown
- Multi-provider chat routing: Anthropic, DeepSeek, OpenAI, MiniMax, OpenRouter
- Vault auto-save: Goals, Journal, Chat, Missions → git on VPS

### Model Defaults
- Default: `deepseek/deepseek-v4-flash` via OpenRouter ($0.10/M input)
- Fallback: `MiniMax-M2.7-highspeed` (free)
- Expensive option: `openai/gpt-5.5` via OpenRouter ($5/M input)

### Credentials (vault: `/root/.openclaw/workspace/.credentials/`)
- `openrouter.json` — Justin's OpenRouter key `sk-or-…da38`
- `deepseek.json` — DeepSeek direct key
- `servicem8.json` — ServiceM8 credentials

### Git Workflow
- Remote: `https://github.com/hollystarbug-web/openclaw-wiki`
- Holly pushes → Justin pulls (no automatic sync)
- Local path on VPS: `/root/OpenClaw-Wiki/`
- Local path on MacBook: `~/openclaw-os/`

### Next Tasks
1. Per-agent chat panels (Task 34 — each agent gets own panel with system prompt)
2. Real node health polling
3. Full terminal with xterm.js
4. Mission agent dispatch (wire to OpenClaw API)
