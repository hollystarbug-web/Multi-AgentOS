# Agentic OS — Bug Report System (🔍 Look · 🐛 Find · 🔧 Fix) — 2026-06-01

## Rule: Users need a way to tell you things broke

**What:** Justin asked for a single, fast, low-friction way to file a bug. The result: a floating "🐛 Report" pill in the bottom-right of the dashboard, plus the same modal opening on `⌘K` (or `Ctrl+K`).

**Why:** Without a clear entry point, the failure mode is "user notices bug → user puts off reporting it → user forgets the details → user never reports it". With a one-click button visible at all times, the friction drops to "type the issue, hit Send". The ⌘K shortcut is for power users who don't want to mouse around.

**When:** Any dashboard or tool a user runs daily. The "report" affordance should be visible without breaking the flow of normal use. Bottom-right pill is the convention (Sentry, LogRocket, etc.).

## Rule: Auto-collect context — never make the user explain

**What:** The bug report modal auto-attaches:
- Current active panel + agent + model
- Last 50 console errors and warnings (captured via window.onerror, unhandledrejection, console.error/warn wrappers)
- Last 12 chat messages across all agents (with timestamps)
- Vault status (enabled, last save, errors)
- URL, user agent, viewport, build version
- Store snapshot (message counts, goals, journal entries)

The user only types: "what happened" + "what did you expect" + severity.

**Why:** The most common failure mode of bug reports is missing context. "It's broken" with no agent name, no model, no error, no screenshot. The user shouldn't have to remember what they were doing — the dashboard knows. Capture it at click-time.

**When:** Any bug report or feedback flow. The form should be MINIMAL on user input and MAXIMAL on auto-collected context. If you're tempted to add a dropdown asking "which agent were you using?", the answer is in the store — just read it.

## Rule: Use a vault file as the bug report transport, not a chat webhook

**What:** Bug reports are written to the OpenClaw-Wiki vault at `Agentic OS/Bug Reports/YYYY-MM-DD-HHMM-{slug}.md`. The file is auto-committed to git. The agentic OS (Holly) reads the vault on its next loop and triages the report.

**Why:** A vault file is:
1. **Audit-able** — git log shows every bug report, with diffs.
2. **Inspectable** — the user can `cat` the file and see exactly what was sent.
3. **Discoverable** — the agent doesn't need a webhook endpoint or chat ID; it reads the same vault it writes to.
4. **Persistent** — even if the agent is offline, the report is durable on disk.
5. **File-system as queue** — no message broker, no DB, no schema.

**When:** A bug flow between a UI and an agent. Always prefer a file-based transport. Chat webhooks are good for "fire and forget" notifications; files are good for "do work on this later" tasks.

## Rule: Capture errors globally, persist to localStorage, ship in the report

**What:** `lib/errorCapture.ts` installs:
- `window.addEventListener('error')` — uncaught errors with file/line info
- `window.addEventListener('unhandledrejection')` — promise rejections
- `console.error` / `console.warn` wrappers — captures logs

The last 50 entries are kept in `localStorage['openclaw-error-buffer']` as a ring buffer. The bug report reads from there.

**Why:** "No output" bugs are usually a silent error somewhere. The user clicks Report, the modal reads the buffer, and Holly sees "TypeError: Cannot read property 'foo' of undefined" with a stack trace. Diagnosis goes from "ask the user 10 questions" to "I see exactly what failed".

**When:** Any frontend where errors are silent (not surfaced to the user). Capture them in a buffer, ship them with bug reports. The buffer is cheap — 50 errors × ~500 bytes = 25KB. Trivial.

## Rule: Use severity tiers in the form, not just in the response

**What:** The modal has 4 severity options (Annoyance / Broken / Data loss / Critical) — each with a one-line hint. Required to submit.

**Why:** Severity drives triage. A "broken chat input" report and a "data loss" report should both reach Holly, but the data loss one should be opened first. Without a severity, all reports look the same and triage is a coin-flip.

**When:** Any user-reported issue form. Always offer 3-4 tiers with plain-language labels (not 1-5 stars — too vague).

## Rule: ⌘K as the universal "do a thing" shortcut

**What:** The bug report modal is bound to `⌘K` (or `Ctrl+K` on non-Mac). The modal toggles open/close on the same shortcut. `Esc` closes. `⌘↵` (Cmd+Enter) submits from inside the description textarea.

**Why:** `⌘K` is the universal "search/palette" shortcut (Slack, VS Code, Linear, GitHub). Users reach for it without thinking. The bug report reuses the same shortcut for the same reason — it's already muscle memory.

**When:** A modal that should be reachable from anywhere. Bind it to `⌘K`. Bind `Esc` to close. Bind `⌘↵` to submit the primary action.

## Rule: Make the report file human-readable, not just machine-parseable

**What:** The bug report markdown has sections with emoji, headers, tables, and a closing note. It's not a JSON dump — it's a doc a person (Holly) can read in 30 seconds and immediately know:
- What was reported
- How bad it is
- What the user was doing (agent, model, panel)
- What the environment looked like
- Whether there were errors (and if so, the actual error messages and stacks)

**Why:** Markdown is for humans first. JSON-in-frontmatter is for machines. The report file should be readable as a GitHub PR comment without any rendering. Holly triaging 10 reports in a row should be able to skim, not parse.

**When:** Any artifact written for an agent or another human. Always include emoji severity markers, a one-line summary, and structured sections. Never just `JSON.stringify(obj)`.

## Rule: Success state shows the file path

**What:** After a successful bug report, the success state shows the full file path (e.g., `/root/OpenClaw-Wiki/Agentic OS/Bug Reports/2026-06-01-1958-when-i-send-a-message-to-openclaw-i-see-no-output.md`).

**Why:** Two reasons:
1. The user knows the report was actually saved (not just "submitted" with no audit trail).
2. If the user wants to inspect or edit the report, they can navigate to the file directly.

**When:** Any save/submit flow. Show the file path or storage location. If you can't show the path (e.g., DB-backed), show at least the record ID.

## Rule: Auto-commit each report with a meaningful message

**What:** The `/api/bug-report` route runs `git add <file> && git commit -m "bug: <slug>"` after writing the file. The slug is the bug description lowercased and stripped of non-alphanumeric chars.

**Why:** Auto-committing makes reports part of the project's git history. Justin can `git log --grep="bug:"` to see all reports over time. The slug-based commit message is searchable AND human-readable in PRs.

**When:** Any file the user creates through the UI. Commit it so it's part of history. Use a meaningful commit message that includes the user's input.

## Verified outcomes

- Bug report button visible bottom-right of dashboard (Playwright confirms)
- ⌘K toggles modal from anywhere (verified via keydown handler)
- Modal auto-focuses description textarea on open
- "Common reports" examples populate the textarea on click
- Severity tiers (Annoyance / Broken / Data loss / Critical) selectable with one click
- Cmd+Enter submits from the description textarea
- Submission writes to `/root/OpenClaw-Wiki/Agentic OS/Bug Reports/YYYY-MM-DD-HHMM-{slug}.md`
- API returns HTTP 200 with `{success: true, file, filename, relativePath}`
- File is auto-committed to git with `bug: <slug>` message
- Success state shows full file path
- Modal auto-closes 3.5s after success
- Zero page errors during full flow (Playwright confirmed)
- Global error capture active: window.onerror, unhandledrejection, console.error/warn wrapped
- Last 50 errors stored in localStorage ring buffer

## Files created

- `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/openclaw-os/lib/errorCapture.ts` — global error ring buffer
- `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/openclaw-os/lib/bugReport.ts` — payload builder
- `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/openclaw-os/app/api/bug-report/route.ts` — vault writer
- `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/openclaw-os/components/BugReportButton.tsx` — UI

## Files modified

- `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/openclaw-os/components/Dashboard.tsx` — mounts `<BugReportButton />`

## Live demo

A test bug report was filed: "When I send a message to OpenClaw, I see no output" (severity: critical) — saved at `Agentic OS/Bug Reports/2026-06-01-1958-when-i-send-a-message-to-openclaw-i-see-no-output-just-a-b.md`. Holly can read this and start triaging.

## Future enhancements (TODO)

- [ ] Telegram notification on critical bugs (immediate pings)
- [ ] Auto-screenshot attached to the report (canvas snapshot)
- [ ] "Did this fix it?" link-back from the report file to the chat conversation
- [ ] Bug history view in the dashboard (list of past reports)
