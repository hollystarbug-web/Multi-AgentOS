# 🏗️ Agentic OS — Architecture

> Technical reference for the Openclaw OS Next.js application.  
> See [[README]] for the project overview and [[TASKS]] for the task log.

---

## Stack Overview

```
Browser (Mac)
  └── Next.js 14 App Router (localhost:3000)
        ├── React 18 + Tailwind + Framer Motion   (UI)
        ├── Zustand + localStorage persist          (state)
        ├── Web Speech API                         (voice input)
        └── Next.js API Routes (server-side)
              ├── /api/chat/route.ts               → Anthropic API (SSE stream)
              └── /api/vault/save/route.ts         → SSH2 → Hetzner VPS → git
```

---

## Entry Point & SSR Safety

**`app/page.tsx`** uses `dynamic(() => import('../components/Dashboard'), { ssr: false })` to prevent hydration mismatches. Zustand's `persist` middleware writes to `localStorage`, which doesn't exist on the server — skipping SSR entirely avoids the white-flash bug.

---

## Global State — Zustand Store (`lib/store.ts`)

All application state lives in a single Zustand store with `persist` middleware (stored under key `'openclaw-os'` in localStorage).

### Store Shape

```typescript
// Node/agent health
nodes: AgentNode[]         // id, name, icon, status, ip, cpu, memory, uptime

// Chat
messages: ChatMessage[]    // id, role, content, timestamp
isStreaming: boolean

// Missions
missions: Mission[]        // id, title, description, status, priority, assignedTo, progress, dates

// Journal
journalEntries: JournalEntry[]   // id, date, content, savedAt

// Settings (persisted)
apiKey: string
hetznerHost: string
macMiniHost: string
openclawUrl: string

// Vault SSH settings (persisted)
vaultEnabled: boolean
vaultSshUser: string
vaultSshKeyPath: string
vaultSshPassword: string

// UI state
activePanel: string
vaultSaveStatus: 'idle' | 'saving' | 'saved' | 'error'
vaultSaveError?: string
```

### Key Types

```typescript
type Mission = {
  id: string; title: string; description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  assignedTo: string; progress: number
  createdAt: Date; completedAt?: Date
}

type ChatMessage = {
  id: string; role: 'user' | 'assistant'
  content: string; timestamp: Date
}

type AgentNode = {
  id: string; name: string; icon: string; status: string
  ip?: string; cpu?: number; memory?: number; uptime?: string
}
```

---

## API Routes

### `/api/chat/route.ts` — Claude Streaming

**Method:** POST  
**Body:** `{ messages: ChatMessage[], apiKey?: string }`

Calls `anthropic.messages.stream()` using `claude-3-5-sonnet-20241022` and pipes the response as Server-Sent Events (`text/event-stream`). The client reads the stream with `ReadableStreamDefaultReader` and appends chunks to the assistant message in real time.

The API key is read from the request body first, falling back to `process.env.ANTHROPIC_API_KEY`.

**System prompt** establishes the assistant as an AI agent orchestration interface operating on the Hetzner VPS + Mac Mini infrastructure.

### `/api/vault/save/route.ts` — SSH Vault Save

**Method:** POST  
**Body:**
```typescript
{
  remotePath: string      // Absolute path on VPS, e.g. /root/OpenClaw-Wiki/03-Projects/Agentic-OS/chats/2026-05-25.md
  content: string         // Markdown content to write
  append: boolean         // true = append, false = create/overwrite
  commitMessage: string   // Git commit message
  host: string            // VPS IP
  sshUser: string         // SSH username (default: root)
  sshKeyPath?: string     // Path to SSH private key
  sshPassword?: string    // SSH password (if not key auth)
}
```

**What it does:**
1. Opens an SSH2 connection to the VPS
2. Encodes `content` as base64
3. Runs a shell command that decodes it and appends/writes to `remotePath`
4. Ensures parent directories exist (`mkdir -p`)
5. Runs `git add . && git commit -m "..." && git push` in the vault root
6. Returns `{ success: boolean, error?: string }`

**Base64 trick** used to safely write arbitrary markdown (including backticks, special chars, newlines) without shell escaping issues:
```bash
printf '%s' "$(echo 'BASE64_CONTENT' | base64 -d)" >> /path/to/file
```

---

## UI Architecture

### Design System (`app/globals.css`)

CSS custom properties define the entire theme:
```css
--bg-deep: #060c1c        /* darkest background */
--bg-1: #080f20           /* panel background */
--glass-bg: rgba(255,255,255,0.03)
--glass-border: rgba(255,255,255,0.07)
--text-1 through --text-4, --text-muted
```

Utility classes: `.glass` (frosted panel), `.btn-glass`, `.btn-cyan`, `.input-glass`, `.noise` (SVG noise texture overlay).

### Component Hierarchy

```
Dashboard.tsx
  ├── AnimatedBackground.tsx    # Canvas: animated dot-grid
  ├── TopBar.tsx                # Logo | VaultStatus | Clock | Settings button
  │     └── VaultStatus.tsx     # Animated badge: idle/saving/saved/error
  ├── Sidebar.tsx               # Nav buttons + node avatars with status rings
  │     └── AgentAvatar.tsx     # Styled avatar with coloured status pulse ring
  └── panels/[ActivePanel]
        ├── OverviewPanel.tsx   # Stat cards + quick-action buttons
        ├── ChatPanel.tsx       # Message list + input bar + mic button
        ├── AgentMonitorPanel.tsx  # Node cards with live metrics
        ├── MissionControlPanel.tsx # Mission list + new-mission form
        ├── TerminalPanel.tsx   # SSH terminal iframe / embed
        ├── OpenclawPanel.tsx   # Configurable URL iframe
        └── JournalPanel.tsx    # Textarea + save button + entry history
```

### Animation Patterns (Framer Motion)

- **Panel transitions:** `AnimatePresence mode="wait"` with `scale 0.995 → 1 + y 10 → 0 + opacity`
- **Sidebar active bar:** `layoutId="activeBar"` shared layout animation
- **Modal entry:** Spring (`stiffness: 300, damping: 25`) scale + y
- **List items:** Staggered `initial/animate/exit` on `motion.div` with `layout`
- **Sidebar nav items:** Staggered entrance delays (`0.08 + i * 0.055`)
- **Ambient glow:** Per-panel radial gradient that cross-fades on panel switch

---

## Vault Helpers (`lib/vault.ts`)

```typescript
// Core save function — calls /api/vault/save
saveToVault(options: VaultSaveOptions): Promise<{ success: boolean; error?: string }>

// Path helpers
chatFilePath(date: string): string       // → .../chats/YYYY-MM-DD.md
missionsFilePath(): string               // → .../missions.md
journalFilePath(date: string): string    // → .../journal/YYYY-MM-DD.md

// Header generators (written once when file is new)
chatFileHeader(date: string): string
missionsFileHeader(): string
journalFileHeader(date: string): string

// Entry formatters
formatChatEntry(userMsg, assistantMsg, timestamp): string
formatMissionEntry(mission): string
formatJournalEntry(content, timestamp): string
```

---

## Voice Input (`lib/useVoiceInput.ts`)

Hook wrapping the browser `SpeechRecognition` / `webkitSpeechRecognition` API (no API key required). Falls back gracefully if the browser doesn't support it. Returns:

```typescript
{ isListening, transcript, startListening, stopListening, supported }
```

Full type declarations are in `types/speech-recognition.d.ts` (needed because the Web Speech API isn't in all TS lib.dom.d.ts builds).

---

## Deployment Notes

The app runs locally on your Mac — it is **not** deployed to the VPS. The VPS is only accessed via:
- The vault SSH save API route (from the Next.js server)
- The Openclaw iframe (URL configured in Settings)
- The Terminal panel (SSH into VPS)

To expose the dashboard publicly, you could use Tailscale's serve feature or an nginx reverse proxy, but this is not currently configured.

---

*Last updated: 2026-05-25*
