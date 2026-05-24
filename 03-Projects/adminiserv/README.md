# Adminiserv Limited

**Type:** Billing entity company (UK)
**Purpose:** Trading name for Oscar's automation services business
**Status:** Active — sites live, product assets built

---

## Live Sites

| Domain | Project | Deployed From | SSL | Status |
|--------|---------|---------------|-----|--------|
| `adminiservhk.com` | `adminiserv` | `/var/www/adminiserv` | ✅ | LIVE |
| `getitsorted.tech` | `site` | `projects/online-services-empire/assets/site/` | ✅ | LIVE |

**Email:** MX records pointing to `mx.adminiservhk.com` (Fatcow/Network Solutions)

---

## The Product — Online Services Empire

**Niche:** Service businesses running ServiceM8 + QuickBooks
**Approach:** Audit-first → Implementation → Retainer

### Offer Stack

| Stage | Product | Price |
|-------|---------|-------|
| Entry | Audit / Discovery | £295 |
| Implementation | Setup / Automation | £695 |
| Recurring | Monthly retainer | £495/mo |

### Revenue Blockers (before first £)

- Upwork account (need 14 connects to submit HelpScout export proposal)
- Fiverr account (PerimeterX captcha — Justin solves)
- Public landing page URL (getitsorted.tech is live but not indexed/linked)
- Payment receiving (Stripe ready, Wise EUR balance: €323.77)

---

## Project Files

**Source workspace:** `/root/.openclaw/workspace-oscar/projects/online-services-empire/`

| Folder | Contents |
|--------|----------|
| `action-plans/` | 30-day-launch-plan, first-money-plan, niche-focus-strategy, oscar-capabilities |
| `assets/` | Landing pages, LinkedIn posts, proposals, outreach templates, client onboarding |
| `assets/site/` | Full HTML site (deployed to getitsorted.tech) |
| `crm_data/` | invoices.csv, leads.csv |
| `leads/` | archived_leads.json, lead_board.md, tracker_log.md |
| `proposals/` | 4 proposal documents |
| `reference/` | 20-principles online business guide |
| `research/` | Competitor analysis, platform algorithms, SM8+QB technical deep-dive |
| `skills/` | 4 pillar skill files (Strategic, Technical, Creative, Operational) |
| `techdesk/` | Avatar phone, content strategy, landing page, platform listings |
| `templates/` | Client onboarding packet, discovery questionnaire, SOW templates |
| `tools/` | 15+ scripts: stripe-invoice-pipeline, wise-payment-tracker, crm, proposal_generator, upwork_fiverr_manager |

**Source workspace:** `/root/.openclaw/workspace-oscar/projects/adminiserv/`
- `DNS-SETUP.md` — Vercel DNS zone setup
- `setup-ssl.sh` — SSL cert automation

---

## Infrastructure

**Platform:** Vercel
**Token:** `vcp_3TcjvwvedifnQ5OslaesxPIKzWn2OSd3zWwjdc3Hx0szGpH6jR1rJ5gR`
**Team:** `team_HNlt5IZPLk0sn6TcBL1aGgiU`
**Credentials file:** `~/.openclaw/credentials/oscar/vercel-api`

**Key lesson:** Domain must be `vercel domains add <domain> <project>` to create DNS zone before API record addition works.

---

## Payments & Invoicing

- **Stripe** — invoice pipeline built (`stripe-invoice-pipeline.py`)
- **Wise** — multi-currency account (EUR balance: €323.77)
- **Wise + QuickBooks sync** — active (Justin confirmed)
- **Billing entity:** Adminiserv Limited

---

## Credentials

| Service | File |
|---------|------|
| Stripe | `~/.openclaw/credentials/oscar/stripe-pk`, `stripe-sk` |
| Vercel | `~/.openclaw/credentials/oscar/vercel-api` |
| Wise | `~/.openclaw/credentials/oscar/wise` |
| Upwork | `~/.openclaw/credentials/oscar/upwork` |

---

## Key Learnings

- `05-Learnings/wiki-discipline.md` — wiki discipline rules
- `05-Learnings/quickbooks-automation-may-22-2026.md` — QB OAuth refresh, CDP click issue
- `05-Learnings/sc-dashboard-playwright-may-22-2026.md` — Playwright SM8 PDF generation

---

## Next Steps

1. Upwork — submit HelpScout API export proposal (needs 14 connects)
2. Fiverr — complete account setup (PerimeterX captcha)
3. Payment — connect Stripe account to getitsorted.tech
4. Outreach — deploy LinkedIn content strategy + send outreach emails
