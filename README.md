# OpenClaw Wiki — Root README

**Welcome.** This is the persistent memory and knowledge base for the Base Lift Services AI operation.

---

## Quick Start

1. **YOU ARE HERE:** `/root/OpenClaw-Wiki`
2. **The most important folder:** `05-Learnings/` — read this before doing anything you've done before
3. **The golden rule:** "Write it down — memory doesn't survive restarts"
4. **Credentials:** `~/.openclaw/workspace/.credentials/` — never hardcode passwords or keys
5. **GitHub sync:** Push changes after every significant update

---

## Folder Map

| Folder | Purpose |
|--------|---------|
| `01-General/` | General reference pages |
| `02-Context/` | User profiles, team contacts |
| `03-Projects/` | Active builds and projects |
| `04-Procedures/` | Step-by-step task procedures |
| `05-Learnings/` | **MOST IMPORTANT** — rules from failures and successes |
| `06-Runbooks/` | Service and system operational guides |
| `07-Reference/` | API docs, credentials reference |
| `08-Daily-Logs/` | Timestamped session logs |

---

## Symlinks

```
~/.openclaw/projects    → /root/OpenClaw-Wiki/03-Projects
~/.openclaw/procedures  → /root/OpenClaw-Wiki/04-Procedures
~/.openclaw/learnings   → /root/OpenClaw-Wiki/05-Learnings
~/.openclaw/workspace   → /root/.openclaw/workspace (workspace root)
```

---

## Adding Knowledge

### Learnings (most important)
File: `05-Learnings/[topic]/some-learning.md`

Format:
```markdown
## [Topic] — [Date]

### Rule: [One-line name]
**What:** Do X. **Why:** Because Y. **When:** Every time Z.
```

### Procedures
File: `04-Procedures/[topic]/procedure.md`
- Objective, Prerequisites, Steps, Verification, Troubleshooting

### Daily Logs
File: `08-Daily-Logs/YYYY-MM-DD.md`
- Session summary, decisions, learnings captured, next steps

---

## GitHub Backup

**Repo:** `hollystarbug-web/openclaw-wiki`
**Credentials:** `~/.openclaw/workspace/.credentials/github.json`

```bash
cd /root/OpenClaw-Wiki
git add .
git commit -m "Describe what changed"
git push
```

---

## Before Any Recurring Task

Read `~/.openclaw/workspace/LEARNINGS.md` first. It points to the relevant wiki sections.

## Full Onboarding Guide

See: `procedures/agent-wiki-onboarding.md` (workspace) or `04-Procedures/agent-wiki-onboarding.md` (wiki)
