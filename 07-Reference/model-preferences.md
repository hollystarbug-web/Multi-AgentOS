---
title: Model Preferences
created: 2026-05-10
updated: 2026-05-26
tags: [models, ai, openclaw, minimax, openrouter, deepseek]
---

# Model Preferences

## Current Model Hierarchy (Effective: 2026-05-26)

Justin decided: **MiniMax is the main model.** Others are alternatives and fallbacks.

| Priority | Model | Provider | Notes |
|----------|-------|---------|-------|
| **1 (MAIN)** | MiniMax-M2.7-highspeed | minimax27 | Primary — reasoning enabled, free, fast |
| 2 | DeepSeek V4 Flash | OpenRouter | Free tier via OpenRouter — alternative |
| 3 | GPT-5.5 (thinking) | OpenAI | Complex reasoning — paid, use selectively |
| 4 | DeepSeek V4 Flash | NVIDIA NIM | Free via build.nvidia.com — alternative |
| 5 | kimi-k2.6 | kimi | Fallback |
| 6 | qwen/qwen3.6-plus | OpenRouter | Free tier — last resort |

## Model Aliases

| Alias | Full Provider/Model |
|-------|---------------------|
| minimax-m2.7-highspeed | minimax27/MiniMax-M2.7-highspeed |
| minimax-m2.7 | minimax27/MiniMax-M2.7 |
| minimax-m2.5 | minimax-portal/MiniMax-M2.5 |
| minimax-m2.5-highspeed | minimax-portal/MiniMax-M2.5-highspeed |
| minimax-m2.5-lightning | minimax-portal/MiniMax-M2.5-Lightning |

## OpenRouter API Key (Updated 2026-05-26)

**API Key:** `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`
**Account:** hollystarbug@gmail.com (Google SSO)

Stored in: `~/.openclaw/workspace/.credentials/openrouter.json`

**Available models via OpenRouter:**
- `deepseek/deepseek-v4-flash` — $0.10/M input (free tier available)
- `openai/gpt-5.5` — $5/M input (expensive, use sparingly)
- `qwen/qwen3.6-plus` — free tier

## NVIDIA NIM — Free DeepSeek V4 Flash

**Key:** Stored in `~/.openclaw/workspace/.credentials/nvidia.json`
**Endpoint:** `https://integrate.api.nvidia.com/v1`
**Get key:** https://build.nvidia.com → API Keys
**Model:** `nvidia/deepseek-v4-flash` → `deepseek-ai/deepseek-v4-flash` at NVIDIA

This is a **free alternative** for DeepSeek V4 Flash — use when OpenRouter is unavailable.

## OpenAI API

**For GPT-5.5 thinking:** Use OpenAI direct API
**Key:** Stored in `~/.openclaw/workspace/.credentials/openai.json`

## OpenClaw Configured Providers

| Provider | Base URL | Available Models |
|----------|---------|-----------------|
| minimax27 | https://api.minimax.io/anthropic | M2.7-highspeed, M2.7, M2.5-Lightning |
| openai | https://api.openai.com/v1 | gpt-5.4, gpt-5.5, gpt-image-1 |
| openrouter | https://openrouter.ai/api/v1 | deepseek-v4-flash, gpt-5.5, qwen3.6-plus |
| deepseek | https://api.deepseek.com/v1 | deepseek-v4-flash, deepseek-chat |
| anthropic | https://api.anthropic.com | claude-opus-4.7 |
| google | https://generativelanguage.googleapis.com/v1beta | Gemini models |
| moonshot | https://api.moonshot.cn/v1 | moonshot-v1-32k |
| kimi | https://api.moonshot.ai/v1 | kimi-k2.6 |

## When to Use Which Model

| Task | Recommended Model |
|------|------------------|
| General work, reasoning, chat | **MiniMax-M2.7-highspeed** (main) |
| Free alternative for DeepSeek V4 | NVIDIA NIM `nvidia/deepseek-v4-flash` (FREE) |
| Cheap DeepSeek fallback | OpenRouter `deepseek/deepseek-v4-flash` |
| Complex reasoning (paid) | OpenAI `gpt-5.5` thinking |
| Last resort fallback | `qwen/qwen3.6-plus` (OpenRouter free tier) |

## PDF Processing

**⚠️ PDF extraction only via GPT-5.5 (direct OpenAI API).**
Never use MiniMax or OpenRouter for PDF extraction — accuracy is critical for financial data.

## Vault Update Rule — ALL Agents

**Every agent that does work must update the vault before and after:**

1. **Before starting work:** Read relevant wiki pages to understand current state
2. **After completing work:** Write notes/decisions/learnings to the vault
3. **New projects:** Create project directory in `/root/OpenClaw-Wiki/03-Projects/`
4. **Learnings:** Write to `/root/OpenClaw-Wiki/05-Learnings/`
5. **Always:** `git add` → `git commit` → `git push` after significant saves

This ensures any agent (or new harness) can pick up and continue work immediately.

## Last Updated

`2026-05-26` — Updated model hierarchy: MiniMax main, others as alternatives/fallbacks
`2026-05-10` — Initial document
