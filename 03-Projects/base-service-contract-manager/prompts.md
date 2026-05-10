---
title: Prompts
project: Base Service Contract Manager
created: 2026-05-10
tags: [prompts, templates]
---

# Prompts — Base Service Contract Manager

Reusable prompts and prompt templates for SC-related tasks.

## Spawn Sally for SC Work

```
Read both files in full before doing anything else: `/root/.openclaw/workspace/AGENTS.md` and `/root/.openclaw/workspace/LEARNINGS.md`. Your job: (1) read both, (2) confirm you understand the LEARNINGS format, (3) for your first task, check LEARNINGS.md first. Done.
```

## SC Portal — Check Job in Pipeline

```
1. Open the SC Portal dashboard: https://dashboard.baselifts.co.uk/dashboard?tab=contract_invoice
2. Take a screenshot showing the relevant tab
3. Report: does [job name/number] appear? What status does it show?
4. Report any errors visible
```

## ServiceM8 — Open Job via Chrome CDP

```
Connect: ssh holly@100.91.33.1 then use /opt/homebrew/lib/node_modules/agent-browser/bin/agent-browser-darwin-arm64
Tab ID: 8B77F0A5A19CC9D32B7090C06EB4996C (ServiceM8 Dispatch Board)
Connect: agent-browser connect "ws://localhost:9222/devtools/page/8B77F0A5A19CC9D32B7090C06EB4996C"

To search for a job:
1. agent-browser snapshot (see UI)
2. Find search field
3. agent-browser fill @<ref> "Bas-XXXX"
4. agent-browser press Enter
5. Take screenshot

Navigation ALWAYS needs s_auth token:
S_AUTH=$(curl -s http://localhost:9222/json | python3 -c "import sys,json; [print(re.search(r's_auth=([a-f0-9]+)', t['url']).group(1)) for t in json.load(sys.stdin) if '8B77F0A5A19CC9D32B7090C06EB4996C' in t.get('id','')])")
agent-browser eval "window.location.href='https://go.servicem8.com/job_dispatch?&s_auth=${S_AUTH}'"
```

## Last Updated

`2026-05-10`
