---
title: Base Service Contract Manager — README
project: Base Service Contract Manager
created: 2026-05-10
tags: [project, service-contract, servicem8, dashboard]
---

# Base Service Contract Manager

## Project Description

A long-running OpenClaw-assisted project to build and manage a dashboard/workflow system for Base Lift Services Ltd service-contract operations.

**Should support:**
- Service-contract creation
- Client authorisation/signing workflows
- ServiceM8 diary/file attachments
- Fallback handling where clients sign outside integrated forms
- Status tracking
- Operational oversight of service contract processes

## System Overview

The SC Portal (dashboard.baselifts.co.uk) is a multi-section portal for the full SC lifecycle:

1. **New Contract** — create job, moves to step 2
2. **Contract & Invoice** — fill SC v7 form fields, submit for approval
3. **Approve Email** — human review, approve and send
4. **Invoice Send** — track quote accepted / contract received, send invoice
5. **Initiate or Chase** — paid = INITIATE | unpaid = PLEASE CHASE
6. **Contract Renewal** — 6-week window, RENEW creates renewal job
7. **Renewal Approval** — human review, approve and send

**UI:** Tabbed interface — Pipeline, Awaiting Payment, Active/Initiated, Renewals

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js (Vercel deployment) |
| Backend API | Node.js PM2 (VPS:3001) |
| Database | SQLite at /tmp/portal.db |
| Source of Truth | ServiceM8 API |
| Browser Automation | Chrome CDP via Mac Mini |
| AI Runtime | OpenClaw (Hetzner VPS) |

## Key Links

- **Portal:** https://dashboard.baselifts.co.uk
- **Vercel Project:** `base-sc-dashboard`
- **ServiceM8:** https://go.servicem8.com
- **QuickBooks:** https://qbo.intuit.com

## Team

| Name | Role |
|------|------|
| Justin Howard | Owner/Manager |
| Sally | SC Specialist sub-agent |
| Holly | AI coordinator, QA, build |

## Documentation Map

| File | Description |
|------|-------------|
| `status.md` | Current project status |
| `decisions.md` | Key decisions and reasoning |
| `architecture.md` | System architecture |
| `service-contract-workflow.md` | SC workflow details |
| `servicem8-integration.md` | SM8 API integration |
| `macmini-codex-routing.md` | Mac Mini execution routing |
| `data-model.md` | Database schema |
| `security-and-secrets.md` | Security architecture |
| `bugs.md` | Bug history |
| `changelog.md` | Work history |
| `todo.md` | Outstanding tasks |
| `open-questions.md` | Open questions |

## Getting Started

For Holly (before any SC task):
1. Read `status.md` for current state
2. Read `decisions.md` for relevant decisions
3. Check `todo.md` for outstanding items
4. Check `bugs.md` for known issues

## Last Updated

`2026-05-10` — Initial project documentation
