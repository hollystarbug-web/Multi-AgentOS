# Changelog

All notable changes to Multi-AgentOS are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- **Renamed product** to **Multi-AgentOS** (GitHub: `hollystarbug-web/Multi-AgentOS`). The product drives Claude, Codex, Ollama, and any local model — not just OpenClaw. Repo URL, install URL, install dir, package name (`multi-agentos`), env vars (`MULTI_AGENTOS_*`), localStorage keys (`multi-agentos-state`, `multi-agentos-errors`), and all display strings updated. Local vault path kept as `multi-agent-os/` (kebab-case, filesystem-friendly); the brand name and the directory name are intentionally different.

## [0.1.0] — 2026-06-02

### Added
- **Portable config system** — `config.yaml` is the single source of truth for paths, nodes, agents, models. Built-in defaults are merged in. Zod-validated.
- **Setup wizard** (`npm run setup`) — auto-detects OS, Node, installed AI CLIs (claude, codex, openclaw, ollama, aider, etc.), probes common vault locations, prompts for missing pieces, writes `config.yaml` and `.env.local`.
- **One-command install** (`install.sh`) — checks Node 20+, clones the repo, installs deps, runs setup. Idempotent.
- **Versioning & update system** — `package.json` version, `lib/version.ts` constants, `npm run update` script (pull + reinstall), `npm run check-update` script (checks GitHub for newer releases).
- **`/api/config` route** — GET (read active config) + POST (write new config.yaml, auto-backs up old). Settings modal & setup wizard can both use it.
- **9 agent personas** in `prompts/<id>.md` (Holly, Kryten, Sally, Grim, Oscar, Reggie, Claude, Hermes, Direct) — easy to edit, no code changes needed.
- **Bug report system** — ⌘K modal captures frontend errors and ships to vault.
- **Vault auto-save** — chats, journal, goals, missions auto-save to Obsidian vault (local path or SSH remote).

### Changed
- **Refactored hardcoded paths out of code** — `lib/vault.ts` and `lib/agents.ts` now read from config. The app runs anywhere; no more `/root/OpenClaw-Wiki` baked in.

### Security
- `.gitignore` excludes `config.yaml` and `.env.local` (personal paths and keys never committed).
- LICENSE: MIT.
