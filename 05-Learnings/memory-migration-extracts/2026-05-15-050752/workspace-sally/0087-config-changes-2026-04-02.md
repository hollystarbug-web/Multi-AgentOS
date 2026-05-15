## Config Changes (2026-04-02)

**Model Fallback Chain — PERMANENT (updated 2026-04-08):**
1. Primary: `minimax27/MiniMax-M2.7-highspeed` — ALWAYS
2. Fallback 1: `kimi/kimi-k2.5` (context 1M, max tokens 32k) — API key in `.credentials/kimi.json`
3. Fallback 2: `openai/gpt-5.4`
4. Fallback 3: `openrouter/qwen/qwen3.6-plus` (paid, not :free)

**⚠️ PDF RULE (Justin, 2026-04-08) — PERMANENT:**
- PDFs: GPT-5.4 ONLY via OpenAI direct API (`api.openai.com/v1/chat/completions`)
- **NEVER use OpenRouter for PDFs** — banned completely
- **NEVER fallback to MiniMax or Kimi for PDFs** — CRON fails rather than degrade
- Direct API key: `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`
- If direct OpenAI fails → report failure, do NOT silently use alternatives

⚠️ `moonshot/kimi-k2.5` is wrong path — use `kimi/kimi-k2.5` only.

**Kryten Disabled:**
- Kryten agent kept but isolated: `execApprovals.target` set to `"dm"` (not "both")
- Kryten Telegram `enabled: false`
- Telegram `defaultAccount` set to `"default"` (Holly)
- Kryten workspace still exists at `/Users/holly/.openclaw/workspace-kryten` but agent is dormant
- Fix was to stop Kryten receiving approval requests that should go to Holly

---

