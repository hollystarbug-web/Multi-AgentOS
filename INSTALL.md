# Multi-AgentOS — Install & Activation Guide

> The fastest, most complete path from `curl | bash` to chatting with 9 AI agents in a glass dashboard.

---

## TL;DR (one command)

```bash
curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/install.sh | bash
```

Then:

```bash
cd ~/Multi-AgentOS
npm run dev
```

Open **http://localhost:3000**. You're in.

---

## What you'll need (60-second checklist)

| Requirement | Version | How to get it |
|---|---|---|
| **Node.js** | 20 or newer | https://nodejs.org/ (or `nvm install 20`) |
| **npm** | bundled with Node | comes with Node 20 |
| **git** | any modern version | `xcode-select --install` on Mac, or `apt install git` on Linux |
| **~500 MB free disk** | for `node_modules` | `~/Multi-AgentOS` is the default install dir |
| **One or more API keys** | Anthropic, OpenAI, DeepSeek, OpenRouter, NVIDIA NIM (free), or Gemini | links below |

**Don't have any API keys yet?** You can still run the dashboard. Pick the **FREE** default model (`nvidia/deepseek-v4-flash`) and grab a free NVIDIA NIM key at https://build.nvidia.com — no credit card required.

---

## Step-by-step (for humans, not just shells)

### Step 1 — Open your terminal

- **Mac:** Spotlight → "Terminal" (or iTerm2)
- **Linux:** your usual terminal
- **Windows:** WSL2 recommended (Ubuntu). PowerShell works but path handling differs.

### Step 2 — Run the one-command installer

```bash
curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/install.sh | bash
```

The installer will:

1. **Check Node 20+** — fails with a clear message and a link to nodejs.org if missing
2. **Clone the repo** to `~/Multi-AgentOS` (or pull latest if you already have it)
3. **Run `npm install`** — pulls all dependencies (Next.js, React, Zustand, ssh2, prompts, etc.)
4. **Launch the setup wizard** — 8-step interactive flow
5. **Print next steps** — tells you what to do

> 💡 **Idempotent:** safe to re-run. If a directory already exists, it updates in place.

### Step 3 — Walk through the setup wizard (8 steps)

The wizard is **fully interactive** — just answer the prompts. Defaults are sensible; you can change anything later.

| Step | Question | What to answer |
|---|---|---|
| 1 | System detection | Auto-detected. Just confirms your OS, Node version, home dir |
| 2 | AI agents on this machine | Auto-scans `$PATH` for `claude`, `codex`, `openclaw`, `ollama`, `aider`, `cursor`, etc. Reports what's found |
| 3 | **Obsidian vault location** | Select from probed locations or pick "Custom path…". Common: `~/Documents/Obsidian`. The wizard will create it if missing |
| 4 | **SSH remote vault?** | `No` for most users. `Yes` if you have a VPS with a vault (uses `ssh2` to write) |
| 5 | **API keys** | Paste the keys you have. **You can leave any blank** — add them later via the Settings modal ⚙️ in the UI. Keys go into `.env.local` (gitignored) |
| 6 | **Nodes to orchestrate** | `Yes` uses the defaults (Hetzner VPS, Mac Mini, MacBook). `No` lets you list your own machines |
| 7 | **Default model** | Pick the FREE `nvidia/deepseek-v4-flash` to start. Switch per-chat later |
| 8 | Writes config | Creates `config.yaml` (your settings) and `.env.local` (your keys). Backs up existing config if present |

**Total wizard time: ~2 minutes** if you have your keys ready.

### Step 4 — Launch the dev server

```bash
cd ~/Multi-AgentOS
npm run dev
```

Wait for the line:
```
✓ Ready in 1.2s
- Local:    http://localhost:3000
```

Open **http://localhost:3000** in your browser.

### Step 5 — First chat

1. Click the **Chat** panel in the sidebar (or just press `c`)
2. Pick an agent (Holly, Kryten, Sally, Grim, Oscar, Reggie, Claude, Hermes, Direct)
3. Pick a model in the model rail
4. Type your first message

Conversations auto-save to your vault at `<vault>/Multi-AgentOS/chats/<agent-id>/<date>.md` after every turn.

---

## What you get

| Panel | What it does |
|---|---|
| **Chat** | Streamed conversation with any of 9 agents × 14 models × 6 providers |
| **Model Rail** | Browse all models grouped by provider, with cost indicators |
| **Goals** | Monthly goal tracker — auto-saved to your vault as `goals/YYYY-MM.md` |
| **Journal** | Daily markdown journal with voice input — auto-saved as `journal/YYYY-MM-DD.md` |
| **Node Monitor** | Live status of your configured machines (VPS, Mac Mini, MacBook) |
| **Mission Control** | Create, dispatch, and track agent tasks |
| **Terminal** | SSH terminal into any node, rendered in-browser via WebSocket bridge |
| **OpenClaw** | Embed any URL (e.g. an OpenClaw instance) in an iframe |
| **Agent Panels** | Per-agent chat — one persistent thread per agent |

---

## API key cheat sheet

| Provider | Env var | Where to get it | Cost |
|---|---|---|---|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | https://console.anthropic.com | Pay-as-you-go |
| OpenAI (GPT) | `OPENAI_API_KEY` | https://platform.openai.com | Pay-as-you-go |
| DeepSeek | `DEEPSEEK_API_KEY` | https://platform.deepseek.com | Cheap |
| OpenRouter | `OPENROUTER_API_KEY` | https://openrouter.ai | Many models, one key |
| **NVIDIA NIM (FREE)** | `NVIDIA_API_KEY` | https://build.nvidia.com | **Free tier** |
| Google Gemini | `GEMINI_API_KEY` | https://aistudio.google.com | Free tier + paid |

> 🔑 **Best starter setup:** get the **FREE NVIDIA NIM key** + an Anthropic key. Use NVIDIA for bulk chat, Claude for hard reasoning. You can add the others anytime.

**To change keys after install:** open the in-app **Settings modal** (⚙️ top-right of the dashboard) or edit `~/Multi-AgentOS/.env.local` directly and restart `npm run dev`.

---

## Common scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start dev server at http://localhost:3000 |
| `npm run build` | Production build (`.next/`) |
| `npm run setup` | Re-run the setup wizard (config + keys) |
| `npm run config:show` | Print your active config (sanitised) |
| `npm run config:validate` | Validate `config.yaml` against the Zod schema |
| `npm run check-update` | Check if a newer version is on GitHub |
| `npm run update` | Pull the latest code + reinstall dependencies |

---

## Customising agents

Every agent has a **persona file** at `prompts/<agent-id>.md`. Edit any of these and the next chat turn picks up the change — no restart needed.

| Agent | File | Default vibe |
|---|---|---|
| Holly | `prompts/agent-holly.md` | Calm, efficient, ship-shape |
| Kryten | `prompts/agent-kryten.md` | Anxious, precise, by-the-book |
| Sally | `prompts/agent-sally.md` | Cheerful, supportive, helpful |
| Grim | `prompts/agent-grim.md` | Sardonic, dark, very capable |
| Oscar | `prompts/agent-oscar.md` | Mystical, over-the-top |
| Reggie | `prompts/agent-reggie.md` | Rival, blunt, competitive |
| Claude | `prompts/agent-claude.md` | Vanilla Claude (your fallback) |
| Hermes | `prompts/agent-hermes.md` | Versatile messenger |
| Direct | `prompts/agent-direct.md` | No persona, raw model output |

**To add a new agent:**

1. Add an entry to `config.yaml` under `agents:`
2. Create `prompts/<your-agent-id>.md` with the system prompt
3. Restart `npm run dev`

**To change the default model for an agent:** edit its `defaultModel:` field in `config.yaml`.

---

## Updating to a new version

```bash
cd ~/MultiAgentOS  # or wherever you installed it
npm run check-update    # tells you if there's a newer version
npm run update          # pulls latest code + reinstalls deps
npm run dev             # restart
```

**Pin to a specific version at install time** (production-style):

```bash
MULTI_AGENTOS_VERSION=v0.1.0 \
  curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/install.sh | bash
```

---

## Troubleshooting

### "Node version too old"
```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
# Then install Node 20
nvm install 20
nvm use 20
```
Re-run the install command.

### "Port 3000 is already in use"
Either kill the other process (`lsof -ti:3000 | xargs kill`) or change the port in `config.yaml`:
```yaml
app:
  port: 3001
```

### "API key not working"
1. Check `.env.local` has the right key (no quotes, no spaces)
2. Restart `npm run dev` (env vars load at startup)
3. Use `npm run config:show` to verify the wizard wrote your config correctly

### "Vault path not found"
The wizard creates the path if missing, but only if your user has permission. If you picked a system path (like `/srv/vault`), you may need `sudo`.

### "Module not found" errors after pulling
```bash
cd ~/Multi-AgentOS
rm -rf node_modules
npm install
```

---

## Uninstall

```bash
rm -rf ~/Multi-AgentOS
```

That's it. Your vault, `.env.local`, and config are all inside that directory, so this removes the entire install. Vault content is untouched (it's wherever you pointed the wizard).

---

## Architecture at a glance

```
┌─────────────────────────────────────────────┐
│  Browser (http://localhost:3000)            │
│  Next.js 14 · React 18 · Tailwind           │
└──────────────────┬──────────────────────────┘
                   │ HTTP
┌──────────────────▼──────────────────────────┐
│  ~/Multi-AgentOS  (your Mac)                │
│  Next.js dev server · Zustand · ssh2        │
│  config.yaml + .env.local                   │
└──────────────────┬──────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼          ▼          ▼
   API providers  VPS SSH    Mac Mini
   (Anthropic,    (terminal, (CDP,
   OpenAI, ...)   vault)     browser node)
```

The dashboard is local — your data never leaves your machine unless you opt in to a remote vault over SSH.

---

## What's next?

- **Production build:** `npm run build && npm start` (faster, no dev overhead)
- **Deploy to Vercel:** push to GitHub, import in Vercel, set env vars in dashboard
- **Multi-machine setup:** see `docs/multi-node.md` (coming soon) for orchestrating agents across machines

---

**Repo:** https://github.com/hollystarbug-web/Multi-AgentOS
**Issues:** https://github.com/hollystarbug-web/Multi-AgentOS/issues
**License:** MIT
