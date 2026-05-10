---
title: Decisions
project: Base Service Contract Manager
created: 2026-05-10
tags: [decisions, design-decisions]
---

# Decisions — Base Service Contract Manager

## Architecture Decisions

### SQLite as Speed Cache, SM8 as Source of Truth (2026-05-10)
**Decision:** Portal uses SQLite for speed, ServiceM8 as authoritative data source.
**Reasoning:** SQLite enables fast local reads/writes without hammering SM8 API. SM8 is the master record. All data originates in SM8 and syncs TO SQLite.
**Source:** Justin confirmed 2026-05-10

### Never Delete Anything (2026-05-10)
**Decision:** Justin only deletes records. Holly never deletes.
**Reasoning:** Data integrity and audit trail.
**Source:** Justin — "THIS IS A GLOBAL RULE. JUSTIN ONLY DELETES RECORDS. This is immutable until Justin informs otherwise."

### Browser Automation: Chrome Only for SM8 and QB (2026-05-10)
**Decision:** Chrome is the permanent, authoritative browser for ServiceM8 and QuickBooks automation.
**Reasoning:** Chrome has the logged-in sessions for both SM8 and QB. Safari WebDriver is exclusive (one session at a time) — not reliable for automation.
**Source:** TOOLS.md — "PERMANENT BROWSER RULE"

### Machine Roles Architecture (2026-05-10)
**Decision:** Define clear machine roles:
- VPS = OpenClaw brain and canonical wiki
- MacBook Pro = Obsidian viewer/editor
- Mac Mini = GUI/browser execution node
**Reasoning:** Prevents agents from attempting GUI automation on VPS or using Mac Mini as wiki host.
**Source:** Justin 2026-05-10

## SC Workflow Decisions

### 7-Step SC Lifecycle (2026-04-24)
**Decision:** Implement 7-step workflow: New Contract → Contract & Invoice → Approve Email → Invoice Send → Initiate or Chase → Contract Renewal → Renewal Approval.
**Source:** Justin's New_automated_Service_Contract_Process_Desired.docx

### CPI Rate for Renewals: 3.3% (March 2026)
**Decision:** Use 3.3% CPI (ONS) for renewal price calculations.
**Source:** SC Portal Workflow Spec v1

### 6-Week Renewal Window
**Decision:** Renewal invoice sent 6 weeks before renewal date.
**Cancellation notice:** 2 months before renewal date.
**Source:** SC Portal Workflow Spec v1

## Last Updated

`2026-05-10`
