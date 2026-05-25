# 🤖 Agentic OS — Project Hub

> **This is the master reference for all ongoing development of the Agentic OS dashboard.**  
> Every session with Claude should start here and update the relevant files when work is complete.

---

## What Is Agentic OS?

Agentic OS is a beautiful, dopamine-inducing local **operating system dashboard** for orchestrating Claude and AI agents across your infrastructure. It runs as a Next.js 14 app at `http://localhost:3000` on your Mac and connects outward to your Hetzner VPS, Mac Mini, and this Obsidian vault.

Think of it as mission control for your entire agentic stack — chat, node monitoring, mission dispatch, terminal access, and a git-backed journal, all in a single dark-mode glass UI.

---

## Infrastructure Map

| Node | Address | Role |
|------|---------|------|
| **Hetzner VPS** | `100.87.207.10` (Tailscale) | Runs Openclaw, hosts this vault |
| **Mac Mini** | `100.91.33.1` (Tailscale) | Browsing node |
| **Mac (Dev)** | localhost | Runs the Agentic OS Next.js app |

**Vault location on VPS:** `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/`  
**Symlink:** `~/.openclaw/projects` → `/root/OpenClaw-Wiki/03-Projects`

---

## Running the App

```bash
# Navigate to the project
cd "/Users/justinhoward/Library/Application Support/Claude/local-agent-mode-sessions/0980e4bb-6670-4fbb-a9f6-3a3729db52bc/4bcd3afc-55fb-4f0b-9bbb-4ed04c3f1edb/local_5fec8168-151c-475c-9bca-bc391ecf606d/outputs/openclaw-os"

# Install dependencies (first time only)
npm install

# Start the dev server
npm run dev
```

Then open **http://localhost:3000**

### Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...   # Required for Claude chat
```

> API key can also be set via the Settings modal (⚙️ top-right) — stored in localStorage.

---

## Panels Built

| Panel | Sidebar Icon | Description |
|-------|-------------|-------------|
| **Overview** | Grid | At-a-glance stats: nodes, missions, chat count, quick actions |
| **Claude Chat** | Message | Full streaming chat with Claude (claude-3-5-sonnet). Voice input (mic button). Auto-saves to vault |
| **Node Monitor** | Monitor | Live status of Hetzner VPS + Mac Mini — ping, uptime, CPU/RAM, online/idle/offline |
| **Mission Control** | Target | Create, dispatch, and track agent tasks. Priority levels (Critical/High/Med/Low). Auto-saves to vault |
| **Terminal** | Terminal | SSH terminal into the Hetzner VPS rendered in-browser |
| **Openclaw** | Globe | Embedded Openclaw iframe (configurable URL) |
| **Journal** | Book | Daily markdown journal with auto-save to vault via SSH → git |

---

## Vault Auto-Save

When **Vault Sync** is enabled (Settings → OpenClaw-Wiki Vault toggle), the app auto-saves:

| Content | Destination on VPS |
|---------|-------------------|
| Chat sessions | `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/chats/YYYY-MM-DD.md` |
| Journal entries | `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/journal/YYYY-MM-DD.md` |
| Missions log | `/root/OpenClaw-Wiki/03-Projects/Agentic-OS/missions.md` |

Each save triggers a `git commit` on the VPS, so everything is version-controlled.

**Configure in Settings:**
- SSH user (default: `root`)
- SSH key path (e.g. `~/.ssh/id_ed25519`) — leave blank to auto-detect
- SSH password — leave blank if using key auth
- Hetzner host IP

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind CSS + Framer Motion |
| State | Zustand + persist (localStorage) |
| AI | Anthropic SDK (`@anthropic-ai/sdk`) — SSE streaming |
| Icons | Lucide React |
| SSH | ssh2 npm package (server-side API route) |
| Voice | Web Speech API — no API key required |
| Dates | date-fns |

---

## Key Files

```
openclaw-os/
├── app/
│   ├── page.tsx                    # Entry point (SSR-safe dynamic import)
│   ├── layout.tsx                  # Root layout + metadata
│   ├── globals.css                 # Design tokens, glass/noise/glow utilities
│   └── api/
│       ├── chat/route.ts           # Claude streaming SSE endpoint
│       └── vault/save/route.ts     # SSH → git vault-save API route
├── components/
│   ├── Dashboard.tsx               # Root shell: layout, panel switcher, ambient glow
│   ├── TopBar.tsx                  # Header: logo, VaultStatus badge, clock, settings
│   ├── Sidebar.tsx                 # Nav icons + node avatars
│   ├── SettingsModal.tsx           # API key, hosts, vault SSH config
│   └── panels/
│       ├── OverviewPanel.tsx
│       ├── ChatPanel.tsx           # Streaming chat + voice + vault save
│       ├── AgentMonitorPanel.tsx   # Node health dashboard
│       ├── MissionControlPanel.tsx # Mission CRUD + vault save
│       ├── TerminalPanel.tsx
│       ├── OpenclawPanel.tsx
│       └── JournalPanel.tsx        # Daily journal + vault save
├── components/ui/
│   ├── AgentAvatar.tsx             # Node/agent avatar with status ring
│   ├── AnimatedBackground.tsx      # Animated dot-grid canvas
│   ├── PanelHeader.tsx             # Shared panel header component
│   └── VaultStatus.tsx            # Vault save indicator badge in TopBar
├── lib/
│   ├── store.ts                    # Zustand store — all global state
│   ├── vault.ts                    # Vault SSH helpers + markdown formatters
│   └── useVoiceInput.ts            # Web Speech API hook
└── types/
    └── speech-recognition.d.ts     # Browser SpeechRecognition type declarations
```

---

## Related Docs

- [[ARCHITECTURE]] — Technical deep-dive: patterns, store shape, API routes
- [[TASKS]] — Full task log: completed work + upcoming backlog
- [[chats/]] — Auto-saved Claude chat sessions
- [[journal/]] — Daily journal entries
- [[missions]] — Mission log

---

## Development Process

All development is done via **Claude in Cowork mode**. Each session:

1. Start by reading this README and [[TASKS]] to understand current state
2. Pick up from the next pending task or add new ones as requested
3. All code lives at the path shown above on your Mac
4. When features are complete, update [[TASKS]] and push docs to this vault

To deploy code updates to the VPS (if running there), use the deploy script:

```bash
bash "/Users/justinhoward/Library/Application Support/Claude/local-agent-mode-sessions/0980e4bb-6670-4fbb-a9f6-3a3729db52bc/4bcd3afc-55fb-4f0b-9bbb-4ed04c3f1edb/local_5fec8168-151c-475c-9bca-bc391ecf606d/outputs/vault-docs/deploy-to-vault.sh"
```

---

*Last updated: 2026-05-25 | Task 17 complete — vault auto-save wired into Chat, Missions, Journal*
