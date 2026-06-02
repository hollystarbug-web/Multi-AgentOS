# Multi-AgentOS

> A local, beautiful, dopamine-inducing dashboard for orchestrating multiple AI agents across your machines.

Multi-AgentOS is a Next.js 14 app that runs on your Mac, talks to your VPS, your Mac Mini, and your Obsidian vault, and gives you a single dark-mode glass UI for chat, mission control, terminal access, node monitoring, journal, goals, and a vault-backed journal of every conversation.

It ships with **9 pre-configured agents** (Holly, Kryten, Sally, Grim, Oscar, Reggie, Claude, Hermes, Direct), each with its own persona, accent colour, and default model. The persona prompts live in `prompts/<agent>.md` — edit them to make an agent your own.

---

## 🚀 Quick Start (one command)

```bash
curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/install.sh | bash
```

This will:

1. Check for Node 20+ (offers help if missing)
2. Clone the repo to `~/Multi-AgentOS`
3. Run `npm install`
4. Launch the **setup wizard** (interactive) — it auto-detects your OS, finds your Obsidian vault, and asks for the missing pieces
5. Print `npm run dev` so you can launch

Open **http://localhost:3000** and you're in.

---

## 🎯 What you get

| Panel | What it does |
|---|---|
| **Chat** | Streamed conversation with any of 9 agents × 14 models × 6 providers |
| **Model Rail** | Browse all models grouped by provider, with cost indicators |
| **Goals** | Monthly goal tracker with checkboxes — auto-saved to your Obsidian vault |
| **Journal** | Daily markdown journal with voice input — auto-saved |
| **Node Monitor** | Live status of Hetzner VPS, Mac Mini, MacBook |
| **Mission Control** | Create, dispatch, and track agent tasks |
| **Terminal** | SSH terminal into the Hetzner VPS rendered in-browser |
| **OpenClaw** | Embed any URL (e.g. an OpenClaw instance) in an iframe |
| **Agent Panels** | Per-agent chat — Holly, Kryten, Sally, Grim, Oscar, Reggie, Claude, Hermes, Direct |

---

## ⚙️ Configuration

Everything lives in **one file**: `config.yaml` (created by the setup wizard).

```yaml
vault:
  localPath: "~/Documents/Obsidian"
  projectDir: "Multi-AgentOS"

nodes:
  - id: hetzner-vps
    name: "Hetzner VPS"
    host: "100.87.207.10"
  - id: mac-mini
    name: "Mac Mini"
    host: "100.91.33.1"

providers:
  defaultModel: "nvidia/deepseek-v4-flash"
  fallbackModel: "MiniMax-M2.7-highspeed"

agents:
  - id: agent-holly
    name: Holly
    icon: Sparkles
    accent: "rgba(6,182,212,"
    defaultModel: claude-haiku-4-5
    promptFile: "prompts/agent-holly.md"
  # …etc
```

**To re-configure at any time:** `npm run setup`

**To validate your config:** `npm run config:validate`

**To print the active config:** `npm run config:show`

---

## 🔑 API Keys

API keys live in `.env.local` (gitignored). Set them via the setup wizard or the in-app **Settings modal** (⚙️ top-right).

Supported providers:

| Provider | Env var | Get key |
|---|---|---|
| Anthropic (Claude) | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| OpenAI (GPT) | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| DeepSeek | `DEEPSEEK_API_KEY` | [platform.deepseek.com](https://platform.deepseek.com) |
| OpenRouter | `OPENROUTER_API_KEY` | [openrouter.ai](https://openrouter.ai) |
| NVIDIA NIM (FREE) | `NVIDIA_API_KEY` | [build.nvidia.com](https://build.nvidia.com) |
| Google Gemini | `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) |

---

## 🤖 Agents

Each agent has:
- A **persona** (system prompt) in `prompts/<id>.md`
- An **accent colour** for sidebar dot, message tint, header strip
- A **default model** (overrideable per-chat)
- A **provider** (Anthropic, Direct, Custom)

**To add a new agent:**

1. Add an entry to `config.yaml` under `agents:`
2. Create `prompts/<your-agent-id>.md` with the system prompt
3. Restart the dev server

**To customise an existing agent:** edit its `prompts/<id>.md` file. The next chat turn will use the new prompt.

---

## 🗄️ Vault

Multi-AgentOS auto-saves your chats, journal, goals, and missions to an Obsidian vault. The vault must be a regular folder on disk (or accessible over SSH).

**Where it writes:**

```
<vault>/<projectDir>/
├── chats/
│   ├── agent-holly/2026-06-02.md
│   ├── agent-kryten/2026-06-02.md
│   └── …one folder per agent
├── journal/2026-06-02.md
├── goals/2026-06.md          ← one per month
├── missions.md               ← rolling
└── bugs/                     ← error reports
```

Each save triggers a `git commit` if the vault is a git repo (recommended).

**Local vault:** point `vault.localPath` at any folder.
**Remote vault:** enable `vault.ssh.enabled` and set host/user/key.

---

## 🛠️ Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + Tailwind + Framer Motion |
| State | Zustand + persist (localStorage) |
| AI | Multi-provider: Anthropic, OpenAI, DeepSeek, OpenRouter, NVIDIA NIM, Gemini |
| SSH | ssh2 |
| Voice | Web Speech API (no API key) |
| Config | YAML + Zod schema validation |
| Setup | Interactive wizard with auto-detection |

---

## 🧪 Development

```bash
git clone https://github.com/hollystarbug-web/Multi-AgentOS.git
cd Multi-AgentOS
npm install
npm run setup          # interactive
npm run dev            # → http://localhost:3000
```

Other scripts:

| Script | What |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run setup` | Re-run setup wizard |
| `npm run config:show` | Print active config |
| `npm run config:validate` | Validate config against schema |

---

## 🔄 Updating

Multi-AgentOS uses [Semantic Versioning](https://semver.org/). New versions are tagged on the `main` branch and announced via GitHub releases.

| Command | What it does |
|---|---|
| `npm run check-update` | Check if a newer version is on GitHub |
| `npm run update` | Pull the latest code + reinstall dependencies |
| `npm run release` | **Maintainer only** — bump version, tag, push |

**Pin to a specific version at install time:**
```bash
MULTI_AGENTOS_VERSION=v0.1.0 curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/Multi-AgentOS/main/install.sh | bash
```

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

## 🤝 Contributing

PRs welcome. For major changes, open an issue first to discuss.

---

## 📜 License

MIT — see [LICENSE](./LICENSE).

---

## 🙏 Credits

Built by [Justin Howard](https://github.com/hollystarbug-web). Inspired by Julian Goldie's "Agent OS Framework™" (Ears / Brain / Hands) and built to be shareable with anyone running a similar agentic stack.
