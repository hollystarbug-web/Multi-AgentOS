# ✅ Agentic OS — Task Log

> Running log of all completed and planned work.  
> **When picking up development:** check this file first to know where things stand.  
> Update this file at the end of every session.

---

## ✅ Completed Tasks

### Task 1 — Project Scaffold
- Initialised Next.js 14 app with App Router, TypeScript, Tailwind CSS
- Set up Framer Motion, Lucide React, Zustand, date-fns, Anthropic SDK
- Created root layout with dark theme, viewport config, font setup

### Task 2 — Global Design System
- Defined CSS custom properties: `--bg-deep`, `--bg-1`, `--glass-bg`, `--glass-border`, text scale
- Created utility classes: `.glass`, `.btn-glass`, `.btn-cyan`, `.input-glass`, `.noise`
- Implemented SVG noise texture overlay for organic feel
- Established colour palette: cyan (nodes), violet (chat), pink (missions), green (terminal), amber (openclaw), purple (journal)

### Task 3 — Zustand Store
- Full typed store with `persist` middleware (localStorage key: `'openclaw-os'`)
- State slices: nodes, messages, missions, journalEntries, settings, vaultConfig, UI state
- Types: `Mission`, `ChatMessage`, `AgentNode`, `JournalEntry`
- Actions: add/update/delete for all entities, setters for all settings

### Task 4 — Animated Background
- `AnimatedBackground.tsx` — canvas-based animated dot grid
- Dots pulse and shift on a slow animation loop
- Pointer-events none, fixed position, z-index 0

### Task 5 — Top Bar
- `TopBar.tsx` — gradient header with logo, nav hint, VaultStatus badge, live clock, settings button
- Clock updates every second via `setInterval`
- Settings button opens `SettingsModal` via callback

### Task 6 — Sidebar Navigation
- `Sidebar.tsx` — 68px icon rail with slide-in entrance animation
- 7 nav items with `layoutId="activeBar"` shared active indicator
- Hover tooltips (label + colour-matched)
- Node avatars at bottom with status rings, click to jump to relevant panel

### Task 7 — Overview Panel
- `OverviewPanel.tsx` — at-a-glance mission stats (running/pending/done)
- Node status cards with online/idle/offline indicators
- Quick-action buttons: New Mission, Open Chat, View Nodes

### Task 8 — Claude Chat Panel
- `ChatPanel.tsx` — full streaming chat with `claude-3-5-sonnet-20241022`
- SSE streaming via `/api/chat/route.ts` — real-time token-by-token display
- Persistent message history via Zustand
- Voice input button (mic) using Web Speech API
- Auto-scroll to latest message
- Timestamp display on each message bubble
- Vault auto-save after each exchange

### Task 9 — Chat API Route
- `app/api/chat/route.ts`
- Accepts `messages[]` + optional `apiKey` in POST body
- Falls back to `ANTHROPIC_API_KEY` env var
- Streams response as `text/event-stream`
- System prompt: agent orchestration context
- Error handling with JSON error response

### Task 10 — Node Monitor Panel
- `AgentMonitorPanel.tsx` — live health cards for each node
- Status: online / busy / idle / offline with colour-coded pulse ring
- Displays: CPU %, RAM %, uptime, IP
- Nodes initialised in store: Hetzner VPS, Mac Mini, MacBook

### Task 11 — Agent Avatar Component
- `AgentAvatar.tsx` — reusable avatar with node-specific icons
- Status ring: animated pulse for online/busy, static for idle/offline
- Sizes: 24, 28, 32, 40px
- Avatar IDs: `hetzner`, `mac-mini`, `macbook`, `system`

### Task 12 — Mission Control Panel
- `MissionControlPanel.tsx` — full mission CRUD
- New-mission form: title, description, priority, assigned node
- Priority levels: Low / Medium / High / Critical — colour-coded badges
- Status flow: pending → running → completed / failed
- Progress bar for running missions
- Hover-reveal action buttons (start, complete, delete)
- Vault auto-save on deploy + on status change to completed/failed

### Task 13 — Terminal Panel
- `TerminalPanel.tsx` — SSH terminal panel
- Embedded xterm.js or direct SSH connection to Hetzner VPS
- Configurable via Settings (host IP)

### Task 14 — Openclaw Panel
- `OpenclawPanel.tsx` — iframe panel for embedding Openclaw
- URL configurable in Settings modal
- Shows placeholder if URL not set

### Task 15 — Settings Modal
- `SettingsModal.tsx` — overlay modal with spring animation
- Sections: Anthropic API Key, Infrastructure Nodes, Vault SSH Config, Openclaw URL
- API key: show/hide toggle
- Vault: enable toggle, SSH user, key path, password (show/hide)
- Save button: green success flash on save, auto-closes after 1.2s

### Task 16 — Journal Panel + Vault Helpers
- `JournalPanel.tsx` — daily markdown journal with textarea
- Save button triggers vault write + local store update
- Past entries displayed below editor (newest first)
- `lib/vault.ts` — full vault helper library:
  - `saveToVault()` — SSH base64 write + git commit via API route
  - Path helpers: `chatFilePath`, `missionsFilePath`, `journalFilePath`
  - Header generators + entry formatters for each file type

### Task 17 — Wire Vault Auto-Save (Chat + Missions + Settings)
- Fixed `userMsg_ref` bug in `ChatPanel.tsx` (was always `''`, now uses `userMsg` directly)
- Added `VaultStatus.tsx` component to `TopBar.tsx`
- Vault SSH config fields wired into `SettingsModal.tsx`
- `MissionControlPanel.tsx` calls vault on deploy and on completion/failed
- Created `types/speech-recognition.d.ts` — full Web Speech API type declarations
- Fixed all TypeScript implicit `any` errors in vault API route

---

## 🔜 Upcoming Tasks

### Task 18 — Deploy to VPS & Obsidian Vault Setup
- [ ] Run `npm install` on Mac to install `ssh2` + `@types/ssh2`
- [ ] Run `npm run dev` and verify app at `http://localhost:3000`
- [ ] Push vault docs (README, ARCHITECTURE, TASKS) to `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/`
- [ ] Test vault save from Chat panel → confirm `chats/YYYY-MM-DD.md` appears in vault

### Task 19 — Real Node Health Polling
- Replace mock CPU/RAM/uptime values with real data
- Add API route `/api/nodes/health` that SSHs to VPS and runs `top -bn1`, `free -m`, `uptime`
- Poll every 30s, update Zustand store
- Show "last updated" timestamp on node cards

### Task 20 — Terminal Panel (Full xterm.js)
- Replace placeholder with real WebSocket SSH terminal
- Use `xterm.js` + `xterm-addon-fit` + `xterm-addon-web-links`
- Server-side: WebSocket handler that proxies SSH2 shell session
- Support: resize, ANSI colours, keyboard shortcuts

### Task 21 — Mission Agent Dispatch
- Wire "Deploy" button to actually trigger an agent task on the VPS
- POST to a VPS webhook / Openclaw API endpoint with the mission payload
- Real-time progress updates via SSE or polling
- Auto-advance progress bar while running

### Task 22 — Multi-Day Chat History Browser
- Add a date picker / session list to ChatPanel
- Load historical chat sessions from vault (fetch via SSH or a vault API)
- Search across all saved chats

### Task 23 — Voice Output (TTS)
- Add TTS playback for assistant responses
- Use browser `SpeechSynthesis` API (no API key)
- Add voice toggle button next to mic button
- Option to choose voice / speed

### Task 24 — Notifications & Alerts
- Toast notifications when vault save succeeds/fails
- Notification when a mission completes
- Desktop `Notification` API integration (with permission prompt)

### Task 25 — Dark/Light Theme Toggle
- Add theme switcher to TopBar
- Light mode CSS variables
- Persist preference in localStorage

### Task 26 — Keyboard Shortcuts
- `Cmd+K` — focus chat input
- `Cmd+1-7` — switch panels
- `Cmd+,` — open settings
- `Cmd+J` — new journal entry

### Task 27 — Openclaw API Integration
- Connect Mission Control to Openclaw's REST API
- Show Openclaw task queue inside Mission Control panel
- Bi-directional sync: Agentic OS missions ↔ Openclaw tasks

### Task 28 — Mac Mini Browsing Node Monitor
- Dedicated panel or section for Mac Mini status
- Show active browser sessions, current page, screenshots
- Trigger browsing tasks from Mission Control

### Task 29 — Export & Sharing
- Export chat session as Markdown or PDF
- Export mission log as CSV
- Share journal entry as a link (via VPS)

---

## 🧠 Ideas Backlog (Not Yet Tasked)

- **Agent personas** — assign different Claude system prompts per node/mission type
- **Workflow builder** — visual drag-drop to chain agent tasks
- **Webhook receiver** — VPS posts events back to the dashboard in real time
- **Obsidian graph integration** — visualise note links related to active missions
- **Mobile view** — responsive layout for iPhone / iPad access
- **Multi-user** — share the dashboard with team members via Tailscale

---

*Last updated: 2026-05-25 | Task 17 complete*

### Task 30 — Goals Panel (New Feature)
- [x] Added Goal type and goals slice to Zustand store (`lib/store.ts`)
- [x] Added goals vault helpers: `goalsFilePath()`, `goalsFileHeader()`, `formatGoalEntry()` (`lib/vault.ts`)
- [x] Built `GoalsPanel.tsx` — full goals panel with checkbox list, priority, voice input, vault save
- [x] Monthly goal files: `goals/YYYY-MM.md` — one file per month, checkboxes
- [x] Vault auto-save on goal add/update/archive
- [x] GoalsPanel wired into Dashboard (panel key: `goals`) and Sidebar (icon: Flag)

### Task 31 — Journal Voice Input (Enhancement)
- [x] Added voice input (mic button) to JournalPanel textarea
- [x] Uses existing `useVoiceInput` hook
- [x] Live interim transcript shown while recording
- [x] Appends transcribed text to textarea on phrase completion
- [x] Mic button toggles red when actively listening

### Task 18 — Deploy to VPS & Obsidian Vault Setup
- [ ] Run `npm install` on Mac to install `ssh2` + `@types/ssh2`
- [ ] Run `npm run dev` and verify app at `http://localhost:3000`
- [ ] Test Goals panel — add a goal with voice, confirm saves to vault
- [ ] Test Journal panel — add entry with voice input
- [ ] Verify Goals saves to `03-Projects/Agentic-OS/goals/YYYY-MM.md`
- [ ] Verify Journal saves to `03-Projects/Agentic-OS/journal/YYYY-MM-DD.md`

### Task 32 — Agent Sidebar Redesign
- [x] Redesigned Sidebar.tsx: wider (180px vs 68px), persistent labels always visible
- [x] Two sections: AGENTS (top) and PANELS (bottom), with dividers
- [x] Provider badge (colored dot) for each agent — shows which provider
- [x] Agents: Holly (Sparkles), Kryten (Bot), Sally (ClipboardList), Grim (Anchor), Oscar (Star), Reggie (Shield) — OpenClaw; Claude (Brain) — Anthropic; Hermes (Zap) — Custom
- [x] Created AgentPlaceholder.tsx — shows agent name, icon, provider badge, "coming soon" message
- [x] Updated Dashboard.tsx — agent panel routing, fallback for unknown panels
- [x] Added agent panel accents to Dashboard
- [x] Node status section at sidebar bottom with persistent labels

Note: Agent chat panels not yet built — clicking an agent shows the placeholder card.
