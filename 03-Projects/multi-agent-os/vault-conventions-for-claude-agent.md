---
title: Vault Conventions for Claude Agent — Multi-Agent OS
created: 2026-05-24
tags: [multi-agent, openclaw, obsidian, vault, reference]
---

# Vault Conventions for Claude Agent — Multi-Agent OS

You are building the memory layer for a multi-agent Agent OS. Here is the complete specification for how to save knowledge to the Obsidian vault, following the same conventions as the existing OpenClaw agents (Holly, Kryten, Sally, Grim, Oscar, Reggie).

## Vault Location

**On Hetzner VPS:** `/root/OpenClaw-Wiki/`

This is the canonical knowledge base — Git-backed, also used as the Obsidian vault. Every agent's important work must be saved here.

## Directory Structure

```
OpenClaw-Wiki/
├── 01-General/          # General reference docs
├── 02-Concepts/         # Architecture and design decisions
├── 03-Projects/         # Active projects (one subfolder per project)
├── 04-Procedures/       # Step-by-step how-to guides
├── 05-Learnings/        # Rules derived from failure or key decisions
├── 06-Runbooks/         # Operational quick-reference docs
├── 07-Reference/        # Technical specs, API docs, configs
└── 08-Daily-Logs/      # Daily session logs (YYYY-MM-DD.md)
```

## Required Save Workflow

Run after every significant task:

```bash
cd /root/OpenClaw-Wiki
git add .
git commit -m "descriptive message explaining what changed"
git push
```

## File Naming

`kebab-case` — e.g., `multi-agent-coordinator-design.md`, `agent-os-vault-conventions.md`

## Frontmatter

Required at the top of every file:

```markdown
---
title: Descriptive Title Here
created: 2026-05-24
tags: [project, openclaw, reference]
---
```

## Routing Rules

| Type of content | Folder |
|---|---|
| New project or initiative | `03-Projects/<project-name>/` |
| Step-by-step procedure | `04-Procedures/` |
| Lesson from mistake or decision | `05-Learnings/` |
| Operational quick-reference | `06-Runbooks/` |
| API docs, tech specs, configs | `07-Reference/` |
| Session notes or daily log | `08-Daily-Logs/YYYY-MM-DD.md` |

## Obsidian Links

Use `[[pagename]]` for internal wiki links.

## VPS Symlinks

```
~/.openclaw/projects   → /root/OpenClaw-Wiki/03-Projects
~/.openclaw/procedures → /root/OpenClaw-Wiki/04-Procedures
~/.openclaw/learnings  → /root/OpenClaw-Wiki/05-Learnings
```

## Agent Vault Assignments

| Agent | Vault Path |
|---|---|
| Holly (main) | `/root/OpenClaw-Wiki/` |
| Sally | `/root/OpenClaw-Wiki/` (writes to Holly's wiki) |
| Kryten | `/root/Kryten-Wiki/` |
| Grim | `/root/Grim-Wiki/` |
| Oscar | `/root/Oscar-Wiki/` |
| Reggie | `/root/Reggie-Wiki/` |

Route each agent's content to their designated vault.

## Important Rules

1. **Always write to the vault** before finishing a significant task
2. **Always `git add`, `commit`, and `push`** after saving
3. **Use frontmatter** on every file
4. **Do not save content** that belongs to one agent in another agent's vault
5. **The vault is the single source of truth** — not local agent memory, not session logs
6. **Do not delete ServiceM8 records** — ever
7. **Never exfiltrate private client/financial data**
