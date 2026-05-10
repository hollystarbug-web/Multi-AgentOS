# Internet Check Procedure

## Purpose

This procedure defines how Holly must perform internet-based checking tasks when the user asks Holly to check the internet, or to check, review, assess, audit, inspect, verify, or validate something using external online sources.

This procedure is for outward-facing web research and verification.

It is not the default procedure for internal/local checks such as:
- OpenClaw setup
- local config or JSON
- scripts
- CRON jobs
- plugins
- gateway/services
- channels
- models/providers
- memory state
- terminal environment
- local files

Unless the user explicitly asks for an internet-based check of those matters, internal checks should follow normal local diagnostic methods instead.

---

## Trigger Rule

Use this procedure when the user asks for any of the following in a way that clearly means use the internet or external current sources:

- check the internet
- look online
- see what the web says
- verify online
- review current public information
- assess external information
- audit public information
- validate against current online sources
- confirm using websites, news, public filings, vendor pages, forums, docs, or community sources

### Examples that should trigger this procedure
- "Check the internet and see what people say about this software."
- "Review the latest public information on this company."
- "Verify this against current online sources."
- "Check whether there are recent complaints about this service."
- "Assess what the internet says about the latest OpenClaw updates."
- "Audit current web feedback and assessments."

### Examples that should not trigger this procedure by default
- "Check my OpenClaw config."
- "Review this script."
- "Verify the CRON job."
- "Audit the gateway setup."
- "Inspect the JSON."
- "Check whether the plugin is enabled."

If the wording is ambiguous, use this rule:
- outward/public/web/current-source checking → use this procedure
- inward/local/system/setup checking → do not use this procedure unless the user explicitly asks for internet-based checking

---

## Core Principles

1. **Use current source material, not memory alone.** Internet-check tasks must be based on live or current-accessible sources wherever possible.
2. **Prefer primary sources first.** Start with official documentation, official websites, official release notes, vendor pages, public filings, standards bodies, regulator pages, and first-party announcements.
3. **Use secondary/community sources carefully.** Community forums, Reddit, Discord summaries, blog posts, review sites, social commentary, and issue threads may be useful, but must not outrank stronger primary evidence when the two conflict.
4. **Separate fact from opinion.** Distinguish: verified facts, informed inference, community sentiment, speculation, marketing claims.
5. **Weight recency appropriately.** For time-sensitive topics, prioritize recent sources and explicitly note dates when they matter.
6. **Be transparent about uncertainty.** If evidence is mixed, incomplete, low quality, stale, or unavailable, say so clearly.
7. **Do not guess.** If the evidence cannot support a conclusion, state the limitation.

---

## Source Priority Order

### Tier 1 — strongest sources
- official product documentation
- official vendor/company websites
- official changelogs and release notes
- official repositories
- official regulator or government pages
- official standards/specification bodies
- official public filings and investor materials
- direct statements from the entity being assessed

### Tier 2 — strong supporting sources
- reputable industry publications
- established technical publications
- trusted trade journals
- recognised analysts or research houses
- major app/platform listings where relevant

### Tier 3 — useful but lower-authority sources
- GitHub issues
- user forums
- Reddit
- Discord/community posts
- review sites
- independent blog posts
- social posts or commentary

Do not treat Tier 3 sources as definitive unless no better evidence exists, and say so when relying on them.

### Tier 4 — use with caution
- anonymous forum posts
- single-source claims
- obviously outdated information
- self-reported claims without verification
- marketing materials presented as facts

---

## Standard Workflow

### Step 1 — Define the task
Identify:
- what exactly is being checked
- whether the user wants facts, latest updates, user feedback, comparison, risk review, reputation view, or validation
- whether the matter is time-sensitive
- whether the request is global or jurisdiction-specific

### Step 2 — Confirm this is an internet-check task
Apply the trigger rule above. If it is not an internet-check task, do not use this procedure unless the user explicitly says to.

### Step 3 — Break the task into check categories
Where relevant, split the work into:
- latest updates / changes
- official position
- software/features/capabilities
- user feedback / complaints / praise
- reliability / support / stability
- security / legal / compliance concerns
- pricing / availability / compatibility
- reputation / assessments
- known limitations / trade-offs

### Step 4 — Gather sources in priority order
Start with Tier 1 sources. Then add Tier 2 and Tier 3 sources only as needed to round out the picture.

### Step 5 — Evaluate source quality
For each important source, assess: authority, recency, relevance, specificity, evidence quality, whether it is firsthand or repeating others.

### Step 6 — Cross-check important claims
Do not rely on a single weak source for an important conclusion if stronger corroboration is available. For claims that materially affect the answer, try to confirm through official source + independent source, multiple independent sources, or direct evidence.

### Step 7 — Distinguish types of findings
Present results under clear headings where useful: confirmed facts, current status, recent developments, user sentiment, concerns / risks, unclear or disputed points.

### Step 8 — Give a grounded conclusion
The conclusion should say whether the matter appears: well supported, partly supported, mixed, unclear, or unsupported.

### Step 9 — Include limitations
State any important limits such as: source scarcity, stale information, conflicting sources, unofficial evidence, likely regional differences, fast-moving topic.

---

## Special Handling Rules

### A. Latest / current / recent requests
If the user asks for latest, current, recent, today, newest, updated, or now — explicitly favour the most recent reliable sources and mention dates where useful.

### B. User feedback / sentiment requests
Include both positive and negative patterns. Avoid over-weighting isolated anecdotes. Note where sentiment is coming from. Distinguish broad repeated complaints from single posts.

### C. Assessments / quality / "is it good?" requests
Break the answer into factors: feature quality, reliability, cost/value, support quality, ecosystem/community, integration fit, operational risk, security posture.

### D. Legal / regulatory / compliance requests
Prefer official regulator, legal, statutory, or government sources first. Do not rely primarily on community commentary for these topics.

### E. Technical/software requests
Prefer: official docs, official changelogs, repositories, issue trackers, vendor announcements — before forum discussion.

### F. Company/reputation checks
Use: official site, filings, reputable news coverage, regulator sources, independent reporting — then community commentary. Avoid presenting rumour as fact.

---

## Output Style Rules

1. **Lead with the answer.** Give the user the core conclusion first.
2. **Use structure.** Organise under headings such as: official updates, user feedback, risks / concerns, bottom line.
3. **Show source weighting in the language.** Use phrases like:
   - "Official sources indicate…"
   - "Recent release notes show…"
   - "User feedback appears mixed…"
   - "Community reports suggest…, but this is less authoritative than…"
4. **Be explicit about evidence strength.** Use: strongly supported, reasonably supported, mixed evidence, limited evidence, unclear from available sources.
5. **Do not overstate.** Avoid certainty when the evidence is patchy.
6. **Do not pad.** Stay focused on the question asked.

---

## What Holly Must Avoid

Do not:
- rely on stale memory instead of checking sources
- present community sentiment as confirmed fact
- present marketing claims as neutral evidence
- ignore dates on time-sensitive information
- cherry-pick only positive or only negative evidence
- use one weak source to support a strong conclusion
- pretend certainty where there is none
- continue as though this procedure was followed when it was not

---

## Failure / Access Rule

If Holly cannot access the internet sources needed or cannot retrieve enough reliable material, say so clearly. Use wording like:
- "I can't verify that properly from accessible online sources."
- "The available sources are too limited or conflicting to support a confident conclusion."
- "I could not access enough current reliable material to validate that."

Do not guess in place of missing evidence.

---

## Memory Rule

This procedure must not be copied into long-term memory. Only the lightweight standing rule should be retained:

> For internet-based check, review, assessment, audit, inspection, verification, or validation tasks, load and follow the internet check procedure document from source.

The procedure itself should be read fresh from file when needed.

---

## Override Rule

This procedure takes priority for qualifying internet-check tasks over shortcuts, cached assumptions, stale memory, convenience summaries, and pattern-matching based only on prior similar requests.

---

## Quick Checklist

Before answering an internet-check request, confirm:
- Is this an outward-facing internet/public-source task?
- Did I use current sources rather than memory alone?
- Did I check primary sources first?
- Did I separate facts from sentiment and opinion?
- Did I note important dates if recency matters?
- Did I avoid overstating weak evidence?
- Did I state uncertainty where appropriate?

If any answer is no, fix that before finalising the response.
