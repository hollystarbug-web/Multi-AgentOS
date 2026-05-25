# 🦞 Openclaw OS — Mission Control

A gorgeous glassmorphism AI agent command center. Built with **Next.js 14**, **Tailwind CSS**, and **Framer Motion**.

Manage your Claude connection, monitor your Hetzner VPS and Mac Mini nodes, dispatch tasks to agents, stream logs, and embed Openclaw — all from one beautiful local dashboard on your MacBook.

---

## What's Inside

| Panel | Description |
|-------|-------------|
| **Overview** | Fleet status hero, node grid, quick panel navigation |
| **Claude Chat** | Real-time streaming chat with Claude API (SSE) |
| **Node Monitor** | Live CPU/RAM/uptime for Hetzner VPS, Mac Mini, MacBook |
| **Mission Control** | Create, dispatch, and track agent missions |
| **Terminal** | Live log stream with filtering + interactive command input |
| **Openclaw** | Embed your Hetzner Openclaw instance in an iframe |

---

## Quick Start

### 1. Clone & install

```bash
cd openclaw-os
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
ANTHROPIC_API_KEY=sk-ant-api03-...

# Optional: set these as defaults (can also set in the in-app Settings)
NEXT_PUBLIC_HETZNER_HOST=65.21.x.x
NEXT_PUBLIC_MAC_MINI_HOST=192.168.1.x
NEXT_PUBLIC_OPENCLAW_URL=http://65.21.x.x:3000
```

### 3. Run

```bash
npm run dev
```

Open **http://localhost:3000** in your browser.

---

## In-App Settings

Click the ⚙️ gear icon in the top-right to open Settings:

- **Anthropic API Key** — paste your `sk-ant-...` key (stored in browser localStorage, never leaves your machine)
- **Hetzner VPS IP** — updates the Node Monitor card
- **Mac Mini IP** — updates the Node Monitor card  
- **Openclaw URL** — the full URL to embed in the Openclaw panel (e.g. `http://65.21.x.x:3000`)

---

## Connecting Openclaw (iframe)

The Openclaw panel embeds your running Openclaw instance via iframe.

**Requirements:**
1. Openclaw must be running on your Hetzner VPS
2. The VPS must allow connections from your MacBook's IP
3. For best results, proxy through nginx with HTTPS (avoids mixed-content warnings)

**Nginx config snippet for your VPS:**
```nginx
server {
    listen 443 ssl;
    server_name openclaw.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        add_header X-Frame-Options SAMEORIGIN;
    }
}
```

Or use **Cloudflare Tunnel** for a zero-config HTTPS solution:
```bash
cloudflared tunnel --url http://localhost:3000
```

---

## Adding More Agents

Edit `lib/store.ts` → `defaultNodes` array to add new nodes:

```ts
{
  id: 'new-agent',
  name: 'My Agent',
  role: 'Task Runner',
  host: '10.0.0.5',
  status: 'online',
  cpu: 15,
  memory: 30,
  uptime: '0d 0h 0m',
  tasks: 0,
  icon: '🤖',
  color: 'cyan',
}
```

---

## Tech Stack

- **Next.js 14** (App Router)
- **Tailwind CSS** — glassmorphism design system
- **Framer Motion** — all animations and transitions
- **Zustand** — global state with localStorage persistence
- **@anthropic-ai/sdk** — Claude streaming via SSE
- **Lucide React** — icons

---

## Production Build

```bash
npm run build
npm start
```

To keep it running, use `pm2`:
```bash
npm i -g pm2
pm2 start npm --name openclaw-os -- start
```

---

Built for Justin Howard's AI agent infrastructure.
