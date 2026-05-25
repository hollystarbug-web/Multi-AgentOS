# 🤖 Agentic OS — Model System

> **Complete guide to models, providers, selection strategy, and routing.**  
> This document is the authoritative reference for how models are configured and used in the Agentic OS.

---

## Philosophy

Justin wants to use the **right model for each task**, with cost as a primary consideration:

- **Daily general chat** → **NVIDIA NIM DeepSeek V4 Flash** (FREE)
- **Quick free tasks** → MiniMax when available
- **Complex reasoning** → Claude Opus 4 or GPT-5.5
- **Coding** → DeepSeek V4 Flash (NVIDIA or OpenRouter)
- **Heavy professional workloads** → GPT-5.5 (expensive but powerful)

> **NVIDIA NIM is the primary default** — free, OpenAI-compatible, high limits. Get your key at [build.nvidia.com](https://build.nvidia.com) → API Keys.

---

## Model Registry

All models are defined in `lib/models.ts` — single source of truth for UI, routing, and cost display.

### DeepSeek (Provider: `deepseek`)

| Model ID | Name | Context | Max Output | Input | Output | Notes |
|---|---|---|---|---|---|---|
| `deepseek-v4-flash` | DeepSeek V4 Flash (Direct) | 1M | 32K | $0.14/M | $0.28/M | Direct API, slightly more expensive |
| `deepseek-v4-pro` | DeepSeek V4 Pro (Direct) | 1M | 32K | $0.435/M | $0.87/M | Not yet configured |
| `deepseek-chat` | DeepSeek V3 (Direct) | 64K | 8K | $0.14/M | $0.28/M | |

### NVIDIA NIM (Provider: `nvidia`) — FREE

| Model ID | Name | Context | Max Output | Input | Output | Notes |
|---|---|---|---|---|---|---|
| `nvidia/deepseek-v4-flash` | DeepSeek V4 Flash | 1M | 32K | **FREE** | **FREE** | ✅ PRIMARY DEFAULT — 1M context, OpenAI-compatible |

> **Base URL:** `https://integrate.api.nvidia.com/v1`
> **Get API key:** [build.nvidia.com](https://build.nvidia.com) → Sign up → API Keys → Create
> **Internal model ID mapping:** `nvidia/deepseek-v4-flash` → `deepseek-ai/deepseek-v4-flash` at NVIDIA

### DeepSeek via OpenRouter (Provider: `openrouter`)

| Model ID | Name | Context | Max Output | Input | Output | Notes |
|---|---|---|---|---|---|---|
| `deepseek/deepseek-v4-flash` | DeepSeek V4 Flash (OpenRouter) | 1M | 32K | **$0.10/M** | **$0.20/M** | ✅ DEFAULT — cheapest option |
| `qwen/qwen3.6-plus` | Qwen 3.6 Plus | 1M | 32K | free tier | free tier | Free tier on OpenRouter |

### OpenAI via OpenRouter (Provider: `openrouter`)

| Model ID | Name | Context | Max Output | Input | Output | Notes |
|---|---|---|---|---|---|---|
| `openai/gpt-5.5` | GPT-5.5 | 1M | 128K | **$5.00/M** | **$30.00/M** | Expensive — use for complex tasks only |

### Anthropic (Provider: `anthropic`)

| Model ID | Name | Context | Max Output | Input | Output | Notes |
|---|---|---|---|---|---|---|
| `claude-opus-4-5` | Claude Opus 4 | 200K | 8K | $15/M | $75/M | Complex reasoning, analysis |
| `claude-sonnet-4-5` | Claude Sonnet 4 | 200K | 8K | $3/M | $15/M | Balanced, good for coding |

### MiniMax (Provider: `minimax`)

| Model ID | Name | Context | Max Output | Input | Output | Notes |
|---|---|---|---|---|---|---|
| `MiniMax-M2.7-highspeed` | MiniMax M2.7 Highspeed | 1M | 32K | **FREE** | **FREE** | ✅ FALLBACK — free tier |
| `MiniMax-M2.7` | MiniMax M2.7 | 1M | 32K | free | free | |

---

## Default & Fallback Configuration

Defined in `lib/models.ts`:

```typescript
export const DEFAULTS = {
  defaultModel: 'nvidia/deepseek-v4-flash',     // ✅ PRIMARY DEFAULT — FREE via NVIDIA NIM
  fallbackModel: 'MiniMax-M2.7-highspeed',       // ✅ free fallback
}
```

**Provider priority order:** `['nvidia', 'openrouter', 'deepseek', 'anthropic', 'openai', 'minimax']`

---

## How Model Selection Works

### User Flow: Agent → Model → Message

1. User selects an **agent** from the sidebar (Holly, Kryten, Sally, etc.)
2. User selects a **model** from the dropdown in the chat header (if not using default)
3. User types their **message**
4. Message is sent to the API route with the chosen model
5. API route detects the provider and routes to the correct backend

### Model Selector UI

- Located in the **ChatHeader** (top of ChatPanel)
- Dropdown shows all available models grouped by provider
- Displays model name + cost indicator ($, $$, $$$)
- When a non-default model is selected, shows a badge in the header
- Status line shows: `modelName · Streaming`

---

## Multi-Provider API Routing

The `/api/chat/route.ts` handles all provider routing. It detects the provider from the model ID prefix:

```typescript
function getProvider(model: string): 'anthropic' | 'openai' | 'deepseek' | 'minimax' | 'openrouter' | 'nvidia' {
  if (model.startsWith('claude-'))    return 'anthropic'
  if (model.startsWith('deepseek-')) return 'deepseek'      // direct deepseek (e.g. deepseek-v4-flash)
  if (model.startsWith('gpt-') || model.startsWith('o4-') || model.startsWith('o3-') || model.startsWith('chatgpt-')) return 'openai'
  if (model.startsWith('MiniMax-'))   return 'minimax'
  if (model.startsWith('nvidia/'))    return 'nvidia'      // NVIDIA NIM (e.g. nvidia/deepseek-v4-flash)
  if (model.includes('/'))            return 'openrouter'  // e.g. deepseek/deepseek-v4-flash, openai/gpt-5.5
  return 'openai'  // default fallback
}
```

### Provider Base URLs

| Provider | Base URL |
|---|---|
| `anthropic` | `https://api.anthropic.com/v1` |
| `deepseek` | `https://api.deepseek.com/v1` |
| `openai` | `https://api.openai.com/v1` |
| `minimax` | `https://api.minimax.chat/v1` |
| `openrouter` | `https://openrouter.ai/api/v1` |
| `nvidia` | `https://integrate.api.nvidia.com/v1` |

### Request Body Format

**Anthropic** uses `/messages` endpoint with `anthropic-version: 2023-06-01` header.  
**All others** use OpenAI-style `/chat/completions`.

---

## Credentials & API Keys

All credentials stored in vault at `/root/.openclaw/workspace/.credentials/`:

| File | Contents |
|---|---|
| `openrouter.json` | `{"api_key": "sk-or-..."}` — Justin's OpenRouter account |
| `deepseek.json` | DeepSeek direct API key |
| `servicem8.json` | ServiceM8 credentials |
| `nvidia.json` | NVIDIA NIM API key (FREE — build.nvidia.com) |
| `openai.json` | OpenAI API key |

### OpenRouter API Key

- **Key:** `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`
- **Account:** Justin's OpenRouter (hollystarbug@gmail.com via Google SSO)
- **Provides access to:**
  - DeepSeek V4 Flash (free tier — $0.10/M input)
  - GPT-5.5 ($5/M input — expensive, use sparingly)
  - Qwen 3.6 Plus (free tier)

### OpenClaw Gateway Config

The OpenClaw gateway config at `~/.openclaw/openclaw.json` has all provider configurations. The Agentic OS reads from this config to know which models are available.

---

## Settings Modal — Model Configuration

The Settings modal (`components/SettingsModal.tsx`) has a **Model Defaults** section:

- **Default Model** — dropdown of all available models (default: `deepseek/deepseek-v4-flash`)
- **Fallback Model** — dropdown (default: `MiniMax-M2.7-highspeed`)

Also has API key fields for:
- **DeepSeek API Key** — for direct DeepSeek access
- **OpenAI API Key** — for OpenAI direct access
- **OpenRouter API Key** — for OpenRouter models
- **NVIDIA API Key** — for NVIDIA NIM (FREE DeepSeek V4 Flash)

---

## When to Use Which Model

| Task | Recommended Model | Why |
|---|---|---|
| Daily general chat | `nvidia/deepseek-v4-flash` | **FREE via NVIDIA NIM** — 1M context |
| Quick free tasks | `MiniMax-M2.7-highspeed` | Completely free |
| Complex reasoning | `claude-opus-4-5` | Best for deep analysis |
| Coding | `nvidia/deepseek-v4-flash` | Good at code, FREE via NVIDIA |
| Research / heavy workloads | `openai/gpt-5.5` | Most powerful, $5/M input |
| Fallback if NVIDIA is down | `deepseek/deepseek-v4-flash` | Via OpenRouter at $0.10/M |
| Fallback if all paid APIs down | `MiniMax-M2.7-highspeed` | Free, reliable |

---

## Adding a New Model

To add a new model to the Agentic OS:

### 1. Add to `lib/models.ts`

```typescript
'[provider]/[model-id]': {
  id: '[provider]/[model-id]',
  name: 'Display Name',
  provider: 'openrouter',  // or 'deepseek', 'anthropic', etc.
  providerName: 'OpenRouter',
  contextWindow: 1_000_000,
  maxOutput: 32_768,
  costPerMillion: { input: 0.10, output: 0.20 },
  bestFor: ['Use case 1', 'Use case 2'],
  color: '#7c3aed',
  icon: '🔷',
},
```

### 2. Add to OpenClaw config (`~/.openclaw/openclaw.json`)

```json
"[provider]": {
  "models": [
    {
      "id": "[provider]/[model-id]",
      "name": "Display Name",
      "input": ["text"],
      "contextWindow": 1000000,
      "maxTokens": 32768,
      "cost": { "input": 0.10, "output": 0.20 }
    }
  ]
}
```

### 3. Update provider detection in `app/api/chat/route.ts`

If the model ID format doesn't match existing patterns, update `getProvider()`.

---

## Model Cost Tracking

The UI shows cost indicators in the model selector:
- `$` — under $0.50/M input (DeepSeek, Qwen)
- `$$` — $0.50–$5/M input (Claude Sonnet, MiniMax free)
- `$$$` — over $5/M input (GPT-5.5, Claude Opus)

---

*Last updated: 2026-05-25 | Added NVIDIA NIM as primary default (FREE DeepSeek V4 Flash), multi-provider routing*
