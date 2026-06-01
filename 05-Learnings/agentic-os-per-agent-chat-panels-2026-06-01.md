# Agentic OS — Per-Agent Chat Panels (Task 34) — 2026-06-01

## Rule: When wiring agent personas into a multi-agent UI, parameterise from a single registry

**What:** All 9 agents (Holly, Kryten, Sally, Grim, Oscar, Reggie, Claude, Hermes, Direct) are defined in `lib/agents.ts` and `lib/models.ts`. Components take `agentId: AgentId` and look up `AGENTS[agentId]` for persona, accent, default model. Never hardcode agent lists in components.

**Why:** If you hardcode `Holly` in `Dashboard.tsx`, `Sidebar.tsx`, `ModelRail.tsx`, and `AgentChatPanel.tsx` separately, every new agent requires 4 edits and they drift. With a registry, you add a row in `lib/agents.ts` and the whole UI updates.

**When:** Any multi-agent system. Use a single source of truth for agent identity, persona, accent, icon, default model.

## Rule: Always close `rgba(r,g,b,` with the alpha and closing paren — the truncated pattern breaks JSX

**What:** Strings like `color="rgba(255,255,255,"` (missing alpha + closing paren) are valid-looking but cause JSX parse failures. SWC misreports the line number. Forced Babel with `.babelrc` to get accurate line numbers during debugging.

**Why:** I lost hours on this in May 2026. The pattern looked fine to grep for but rendered as broken JSX. Three different files (SettingsModal, Dashboard, ModelRail) had the same bug because the same value is templated into many places.

**When:** Any time you write a `color=` or `background:` that takes an rgba value. If you cut-and-paste, ALWAYS ensure the string is `rgba(r,g,b,a)` — never leave it half-closed.

**Fix pattern:** grep for `'rgba(` and `\`rgba(` and `color="rgba(` and verify each has a `,1)` or `,0.5)` etc. The 4th argument is the alpha, and the closing `)` is mandatory.

## Rule: 3-column layout pattern for multi-agent chat UIs

**What:** Sidebar (agent list) / Main (chat) / Right-rail (model picker). The right rail is **collapsible** with an obvious toggle (icon button in chat header + chevron in rail header). Default: rail OPEN. Default landing: the primary agent (Holly), not a generic "Chat" panel.

**Why:** Per-agent system prompts and per-agent model defaults both need first-class surface. A dropdown in the chat header is too cramped for 10+ models. A grid in the rail is scannable in 1 second.

**When:** Any agentic system with >3 agents AND >5 models AND the user frequently switches both.

## Rule: When offering a "no-persona" use case, retire the master chat rather than maintaining two paths

**What:** Replaced the master "Chat" panel with a 9th agent called **Direct** (no system prompt, no persona). Same UX as the legacy chat but routed through the agent framework so it inherits the model rail, history, vault save, and color theming.

**Why:** Two parallel chat systems (master + agent-driven) drift. The master becomes a dead-end with no model picker, no history isolation, no per-agent savings. The Direct agent is the same simplicity ("just the model") but is a first-class agent.

**When:** Migrating a single-pane chat app to multi-agent. Add a persona-free "Direct" agent as the 9th entry. The user gets the same simplicity AND a path to grow into personas.

## Rule: Per-agent histories must be a record, not an array

**What:** Store chat history as `Record<AgentId, ChatMessage[]>` (e.g., `agentMessages: { 'agent-holly': [...], 'agent-grim': [...] }`). NOT a flat `messages: ChatMessage[]`. Per-agent stream of messages is what lets you switch between agents without losing context.

**Why:** Flat array requires expensive filtering on every render. Record is O(1) lookup. The Zustand selector `useStore(s => s.agentMessages[agentId] || [])` re-renders only the active agent's history.

**When:** Any multi-agent chat system. Always use a record, even if you only have 1 agent today — adding a 2nd is then trivial.

## Rule: Per-agent default model via `agentModels[agentId]`, with agent-defined fallback

**What:** Resolution order: `agentModels[agentId] || AGENTS[agentId].defaultModel || 'MiniMax-M3'`. The agent's default model lives in the agent registry. The user's per-agent override lives in the store. Code in `ModelRail` and `AgentChatPanel` both resolve the same way.

**Why:** A single `selectedModel` field doesn't scale. Different agents are best served by different models (Holly → DeepSeek, Kryten → Claude Sonnet 4 for code review, etc.). Per-agent overrides are user preferences; per-agent defaults are persona preferences.

**When:** Each agent in a multi-agent system has a "best fit" model. The user should be able to override per-agent without breaking the default.

## Rule: Keep the model rail pure (no streaming, no input) — it's a selector

**What:** ModelRail is a pure browse-and-pick component. No message input, no API calls. It just emits `onSelect(modelId)`. The parent (`Dashboard`) wires that to `setAgentModel(agentId, modelId)`.

**Why:** Mixing concerns (model picker + chat) leads to refresh bugs, hot-reload issues, and confused state. A pure selector is easy to test, easy to reuse (e.g., a future "Models" admin page), and renders cheaply.

**When:** Any time a "picker" component has secondary effects (saving to a backend, triggering fetches). Lift those effects to the parent and pass the data down.

## Rule: Vault file paths per agent — use a slug directory

**What:** `chats/<agent-slug>/YYYY-MM-DD.md` for per-agent chat logs. `chats/YYYY-MM-DD.md` for the legacy single-user daily log. The agent slug is `agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')`.

**Why:** Per-agent history needs per-agent vault files. If you keep one daily file, every agent overwrites the others. A slug directory keeps each agent's history queryable independently.

**When:** Saving per-agent chat transcripts to a vault / Obsidian / Notion. Always use a slug-based path or a per-agent frontmatter field — never a single file with all agents mixed.

## Rule: When migrating a Zustand store to support per-entity state, version + migrate

**What:** Added `version: 2` to the persist middleware. On version < 2, if the legacy `messages` array had content and `agentMessages` was missing, copy the legacy messages into `agentMessages['agent-claude']`. Existing users with stored state don't lose data on upgrade.

**Why:** A breaking change to the state shape wipes user data on next load. Migration is cheap. Without it, you can lose 6 months of chat history in a single deploy.

**When:** Changing the shape of any persisted state (adding/removing fields, renaming, restructuring). Always bump the version and write a migration.

## Rule: Verify with Playwright across all agents — 0 page errors required

**What:** After every multi-agent UI change, a Playwright probe clicks through all agents and asserts no `pageerror` events. If any agent errors, that's a regression. Do not ship.

**Why:** The agent switcher is a high-risk surface — a single missing field or undefined variable in `AgentChatPanel.tsx` makes one agent crash while others work. Manual spot-checking misses this.

**When:** Any multi-agent system with a switcher. Always probe all paths. The probe is ~50 lines and takes 30 seconds.

## Rule: Use `setTimeout(() => onSuggestion(s), 0)` to defer setState from a render child

**What:** In `EmptyState`, clicking a suggestion called `onSuggestion(s)` which called `setInput(s)` in the parent. React warned: "Cannot update a component while rendering a different component." Fix: defer with `setTimeout(0)`.

**Why:** The child's `onClick` runs synchronously during the parent's render if triggered by a state-affecting flow. Even when fired by a real click, React 18 can be picky. Deferring to the next microtask is the canonical escape hatch.

**When:** A child component's callback triggers a `setState` in a parent and React warns. The defer pattern is safe, performant, and idiomatic.

## Verified outcomes

- All 9 agents render with zero page errors (Playwright probe).
- 3-column layout: sidebar / chat / collapsible model rail.
- Default landing = Holly.
- Model rail: hero card (current model + pricing), search, grouped grid, +Add model tile, "X" close at top.
- Per-agent histories are isolated (verified by checking input was preserved across agent switches).
- Per-agent default models (Holly → DeepSeek V4 Flash, Grim → MiniMax M3, etc.) confirmed in screenshots.
- Vault save functions updated to accept agentName and modelName, paths now `chats/<slug>/YYYY-MM-DD.md`.
- Committed: `8276466` on master.
- Live URL: `http://100.87.207.10:18790/agentic-os/`
