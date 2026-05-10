---
title: Model Preferences
created: 2026-05-10
tags: [models, ai, openclaw]
---

# Model Preferences

## Current Model Chain

Updated: 2026-04-28

| Priority | Model | Provider | Use Case |
|----------|-------|---------|----------|
| 1 | MiniMax-M2.7-highspeed | minimax27 | Primary reasoning and work |
| 2 | kimi-k2.5 | kimi | Secondary / fallback |
| 3 | GPT-5.5 | openai | Tertiary / fallback |
| 4 | qwen3.6-plus | openrouter | Last resort |

## Model Aliases

| Alias | Full Provider/Model |
|-------|---------------------|
| minimax-m2.7-highspeed | minimax27/MiniMax-M2.7-highspeed |
| minimax-m2.7 | minimax27/MiniMax-M2.7 |
| minimax-m2.5 | minimax-portal/MiniMax-M2.5 |
| minimax-m2.5-highspeed | minimax-portal/MiniMax-M2.5-highspeed |
| minimax-m2.5-lightning | minimax-portal/MiniMax-M2.5-Lightning |

## PDF Processing

**⚠️ PDF extraction ONLY via GPT-5.5 (direct OpenAI API).**

Never use MiniMax or OpenRouter for PDF extraction — accuracy is critical for financial data.

## When to Override

- PDFs → always GPT-5.5
- Quick reasoning → minimax-m2.7-highspeed
- Complex multi-step → kimi-k2.5 or GPT-5.5

## Sub-Agent Model Selection

When spawning sub-agents:
- Sally (SC work): default model
- One-off tasks: default model
- Complex reasoning: specify `kimi-k2.5` or higher

## Last Updated

`2026-05-10`
