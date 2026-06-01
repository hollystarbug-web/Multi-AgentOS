# Agentic OS — Vault Auto-Save (Same-Host Fast Path) — 2026-06-01

## Rule: When the dashboard and the vault are on the same host, skip SSH

**What:** The Agentic OS dashboard (Next.js on port 3002) and the OpenClaw-Wiki vault (`/root/OpenClaw-Wiki`) both live on the Hetzner VPS. The original API route SSHed from the dashboard to itself to write vault files. That's 3 round trips of overhead, a credential prompt, and a complete dependency on a working SSH config.

**Why:** Same-host SSH is just `fs.writeFileSync`. No security benefit (the OS already has file permissions). No remote benefit. Pure ceremony. And it broke for users who never configured an SSH key.

**When:** Any time your API can write to disk directly. If `host` is empty / `localhost` / `127.0.0.1`, take the local fast path. Reserve the SSH path for actual remote hosts (Mac Mini, external servers).

**Implementation:** `app/api/vault/save/route.ts` — `isLocalHost(h)` checks for empty / loopback. If true, `doLocalSave()` uses `fs.writeFileSync` + `git add . && git commit && git push`. Otherwise, `doSave()` uses the ssh2 client (dynamically imported so webpack doesn't bundle the native binary).

## Rule: Dynamic-import heavy modules with native bindings

**What:** `import { Client } from 'ssh2'` at the top of `route.ts` made webpack try to bundle `ssh2/lib/protocol/crypto/build/Release/sshcrypto.node` — a native `.node` binary. Webpack can't process binaries, so every request to the route failed with `Module parse failed: Unexpected character '\x7f'`.

**Why:** Native modules need to be loaded by Node at runtime, not bundled by webpack. Even type-only imports can trigger bundling. The fix is to use `await import('ssh2')` inside the function so the bundler can't statically resolve it.

**When:** Any time you `import` a package that ships native bindings: `ssh2`, `canvas`, `sharp`, `sqlite3`, `pg-native`, `bcrypt`, `node-rdkafka`, `pdfium`, `libreoffice`. Either dynamic-import inside the function, or add to `experimental.serverComponentsExternalPackages` in `next.config.mjs`.

**For Next 14 specifically:** the option is `experimental.serverComponentsExternalPackages: ['ssh2']`. For Next 15+, it's top-level `serverExternalPackages: ['ssh2']`.

## Rule: When a feature should "just work", default it to enabled

**What:** Vault auto-save was originally opt-in (`vaultEnabled: false` by default). The user had to open Settings, find the toggle, enable it. The first time they sent a chat message, nothing saved. They had to also configure an SSH host. Two gates before the feature worked.

**Why:** The user wants their work to be saved. Don't make them configure something before their work is safe. Default everything to the value that "just works" on this deployment.

**When:** A feature has two paths — "works on first try with zero config" vs "works after configuration". Always pick the first. If a user wants to override (e.g. vault to a remote host), they can flip the switch.

**Migration:** When changing a default for existing users, bump the persist `version` in the Zustand store and add a migration that sets the field to the new default for old state.

## Rule: Always use `git add .` after a save, not `git add <file>`

**What:** The vault save API runs `git add .` after writing the file. The first time it ran, it picked up the in-flight code changes to `route.ts`, `store.ts`, `vault.ts`, and `SettingsModal.tsx` (because those weren't committed yet) and bundled them all into the same commit as the chat log.

**Why:** When you're writing from an API, you don't know what other uncommitted changes might be in the worktree. `git add .` captures them all, which is fine for a personal vault but confusing for git log reading.

**When:** The vault API should `git add -A "Agentic OS/"` (or similar scoped path) instead of `git add .`, to avoid capturing unrelated worktree changes. This is a TODO. For now, the practice is to commit code changes BEFORE testing the vault save, so the save commits only contain the data.

**Caveat:** In a development workflow, you might WANT `git add .` so work-in-progress is captured. For a production save endpoint, scope to the data directory.

## Rule: Per-agent chat files use a slug directory

**What:** Each agent's daily chat log saves to `Agentic OS/Chats/<agent-slug>/YYYY-MM-DD.md`. The slug is `agent.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')` (e.g., "Holly" → "holly", "Claude" → "claude", "Direct" → "direct").

**Why:** A single `chats/YYYY-MM-DD.md` would interleave 9 agents in one file. Per-agent files keep each agent's history queryable and grep-able independently. Obsidian can render each as its own note with full-text search.

**When:** A multi-agent chat system. Always use a slug directory per agent — never a single combined file.

## Rule: When "auto-save" means "save without clicking a button", trigger it in the success path, not on every keystroke

**What:** Vault save is triggered after the assistant response finishes (in the `finally` block of the chat send). NOT on every user keystroke. NOT on every message render.

**Why:** Saves are expensive (file I/O + git). Saving on every keystroke would commit 50 times per message. Saving only on the assistant's final reply = 1 commit per conversation turn. Clean history, no spam.

**When:** Any auto-save pattern. The save should fire on the natural unit (a chat turn, a journal entry, a goal completion) — not on intermediate states.

## Rule: Show the vault status in the top bar, not buried in Settings

**What:** A small "Vault ready" / "Saving to vault…" / "Saved to vault" pill sits in the top bar (next to the AI Online indicator). It uses `useStore(s => s.vaultSaveStatus)` and animates between states.

**Why:** The user should see at a glance that their work is being saved. A status buried in Settings is invisible. A top-bar pill is always in the corner of the eye.

**When:** Any background save (vault, sync, backup, autosave). The status should be a top-bar pill or a similar always-visible element, not a buried settings page.

## Rule: When the dev server uses `import` for a native module, switch to dynamic import or externalise

**Symptom:** `Module parse failed: Unexpected character '\x7f' (1:0) ... ssh2/lib/protocol/crypto/build/Release/sshcrypto.node` — webpack is trying to bundle a native .node binary.

**Fix 1:** Dynamic import inside the function:
```ts
const { Client } = await import('ssh2')
```
Webpack can't statically resolve the import, so it doesn't try to bundle it. But this works only at runtime — the file still references ssh2.

**Fix 2 (preferred):** Add to `experimental.serverComponentsExternalPackages` (Next 14) or `serverExternalPackages` (Next 15+):
```js
// next.config.mjs
const nextConfig = {
  experimental: { serverComponentsExternalPackages: ['ssh2'] }
}
```

Both fixes work. Fix 2 is cleaner because it doesn't require code refactoring.

## Verified outcomes

- Direct API test (`fetch('/api/vault/save', ...)`) returns `{"success": true, "mode": "local"}`
- All 4 save types work end-to-end: chat, journal, goals, missions
- Per-agent files saved to correct paths:
  - `/root/OpenClaw-Wiki/Agentic OS/Chats/holly/2026-06-01.md`
  - `/root/OpenClaw-Wiki/Agentic OS/Chats/grim/2026-06-01.md`
  - `/root/OpenClaw-Wiki/Agentic OS/Journal/2026-06-01.md`
  - `/root/OpenClaw-Wiki/Agentic OS/Goals/2026-06.md`
  - `/root/OpenClaw-Wiki/Agentic OS/Missions.md`
- Each save auto-committed via `git add . && git commit -m "..." && git push` (best-effort)
- VaultStatus pill shows "Vault ready" in the top bar by default
- Settings modal shows "Local mode" badge when no remote host is configured
- All saves verified with Playwright + zero page errors

## Files modified

- `lib/vault.ts` — `PROJECT_DIR = 'Agentic OS'`, fixed wikilink to `[[Agentic OS]]`
- `app/api/vault/save/route.ts` — added `isLocalHost()`, `doLocalSave()`, dynamic import for ssh2
- `next.config.mjs` — added `experimental.serverComponentsExternalPackages: ['ssh2']`
- `lib/store.ts` — bumped persist version to 3, migration sets `vaultEnabled: true`
- `components/SettingsModal.tsx` — updated description, added "Local mode" badge
- `components/panels/MissionControlPanel.tsx` — relaxed save condition to `if (!vaultEnabled)`
- `components/panels/ChatPanel.tsx` — same
- `components/panels/AgentChatPanel.tsx` — same
- `components/panels/JournalPanel.tsx` — same
- `components/panels/GoalsPanel.tsx` — same
