---
title: Multi-Agent Vault Discipline
category: learning
created: 2026-05-23
updated: 2026-05-23
tags: [learning, wiki, vault, multi-agent, openclaw]
---

# Multi-Agent Vault Discipline

**Date:** 2026-05-23  
**Author:** Holly  
**Context:** Planning vault structure for Kryten, Grim, Oscar, Reggie

---

## Rule: Each Agent Owns Their Own Vault

**What:** Each agent has their own wiki vault at `/root/<AgentName>-Wiki/`.  
**Why:** Separate vaults prevent cross-contamination of project memory. Each agent is responsible for their own wiki discipline.  
**When:** Every time an agent works on a project.

---

## Vault Structure (Same For All Agents)

```
/root/<AgentName>-Wiki/
├── 03-Projects/          ← project plans, specs, architecture
├── 04-Procedures/         ← step-by-step workflows
├── 05-Learnings/          ← lessons from failure/success
├── 06-Runbooks/           ← execution checklists
├── 07-Reference/          ← credentials, URLs, contacts, bot handles
└── 08-Daily-Logs/         ← daily session logs
```

All vaults share the same folder structure — identical to the canonical OpenClaw Wiki (`/root/OpenClaw-Wiki/`).

---

## Agent Vault Assignments

| Agent | Vault | Focus Areas |
|---|---|---|
| Holly | `/root/OpenClaw-Wiki/` | Base Lift ops, SM8, QB, debt, scheduling |
| Sally | `/root/OpenClaw-Wiki/` (under Holly) | SC Dashboard — Sally is Holly's sub-agent |
| Kryten | `/root/Kryten-Wiki/` | Financial compliance, VAT, regulatory |
| Grim | `/root/Grim-Wiki/` | Monitoring, alerting, healthchecks |
| Oscar | `/root/Oscar-Wiki/` | External comms, client portal, DocuSign |
| Reggie | `/root/Reggie-Wiki/` | Reports, KPI, data pipelines |

**Sally is a special case:** She is Holly's dedicated sub-agent for the SC Dashboard project. She writes to Holly's wiki (`/root/OpenClaw-Wiki/`), not her own vault.

---

## GitHub Repos

Each vault pushes to its own GitHub repo under `hollystarbug-web/`:

| Agent | GitHub Repo |
|---|---|
| Holly | `hollystarbug-web/openclaw-wiki` |
| Kryten | `hollystarbug-web/kryten-wiki` |
| Grim | `hollystarbug-web/grim-wiki` |
| Oscar | `hollystarbug-web/oscar-wiki` |
| Reggie | `hollystarbug-web/reggie-wiki` |

SSH deploy key: `~/.ssh/openclaw_wiki_github` (for openclaw-wiki)  
Each new vault needs its own SSH deploy key added to GitHub.

---

## Bot Handles (Telegram)

| Agent | Bot Handle |
|---|---|
| Kryten | `@Kryten_RDbot` |
| Grim | `@GrimReaperSLS_bot` |
| Oscar | `@Oscar_the_Oracle_bot` |
| Reggie | `@ReggieFCABot` |

---

## New Project Checklist

When starting a new project:

1. **Create project directory** in own vault: `/root/<AgentName>-Wiki/03-Projects/<project-name>/`
2. **Write procedures first** in `04-Procedures/` before starting
3. **Write learnings** to `05-Learnings/` during the project — not after
4. **Commit** after every significant session: `git add . && git commit -m "description"`
5. **Push** to GitHub when commits are stable
6. **Never write** to another agent's vault

---

## Related

- [Wiki Conventions (MEMORY.md)](../MEMORY.md)
- [Credential Rotation Runbook](../06-Runbooks/credential-rotation-and-secret-cleanup.md)

---

**Last Updated:** 2026-05-23
