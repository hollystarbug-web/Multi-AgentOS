# GBrain MCP Integration — 2026-05-24

## What Was Done

GBrain v0.40.8.1 installed on the Hetzner VPS as a complementary retrieval layer.

## Architecture

**GBrain is an ADDITIONAL retrieval layer, not a replacement.**

- Existing memory system (OpenClaw-Wiki + lossless-claw + memory-core) remains intact
- GBrain indexes the same OpenClaw-Wiki for fast vector search
- Both systems run in parallel; lossless-claw handles session summarisation, GBrain handles knowledge retrieval

## Installation Details

| Item | Value |
|---|---|
| GBrain version | v0.40.8.1 |
| Runtime | Bun 1.3.14 |
| Database | PGLite at `/root/.gbrain/brain.pglite` (68MB) |
| Indexed pages | 183 (from `/root/OpenClaw-Wiki/`) |
| Embedding coverage | 100% |
| Embedding model | ZeroEntropy `zembed-1` (1280 dims) |
| Embedding API key | `ze_e5udnUrpWD5nhdU6` (in `~/.gbrain/config.json`) |
| Expansion model | OpenAI GPT-4o-mini |
| Chat model | OpenAI GPT-4o-mini |
| OpenAI API key | Service account key (in `~/.gbrain/config.json`) |

## Minimax in GBrain — Important Limitation

GBrain has a **native Minimax recipe**, but it only supports:
- ✅ Embeddings: `embo-01` model (1280 dims, $0.07/M tokens)
- ❌ Chat: NOT supported by GBrain's Minimax recipe
- ❌ Expansion: NOT supported by GBrain's Minimax recipe

For chat and expansion, GBrain only supports OpenAI and Anthropic.

**Solution:** Using OpenAI GPT-4o-mini for expansion/chat (~$0.15/M tokens). Very cheap.

## OpenClaw MCP Integration

Config location: `~/.openclaw/openclaw.json`

```json
"mcp": {
  "servers": {
    "gbrain": {
      "command": "gbrain",
      "args": ["serve"],
      "env": {
        "HOME": "/root",
        "PATH": "/root/.bun/bin:/usr/local/bin:/usr/bin:/bin"
      }
    }
  }
}
```

**Critical schema note:** The field is `mcp.servers` NOT `mcpServers`. OpenClaw schema uses `mcp` as the top-level key.

The gateway spawns `gbrain serve` as a subprocess over stdio. No HTTP, no OAuth needed.

## Available GBrain Tools (via MCP)

All tools are available directly as OpenClaw functions:
- `gbrain__query` — hybrid search with LLM expansion
- `gbrain__search` — keyword full-text search
- `gbrain__get_page` — read a page by slug
- `gbrain__put_page` — write/update a page
- `gbrain__list_pages` — list pages with filters
- `gbrain__think` — multi-hop synthesis with evidence
- `gbrain__find_anomalies` — statistical anomalies in page activity
- `gbrain__get_recent_salience` — emotionally-weighted recent pages
- `gbrain__find_experts` — expertise routing
- `gbrain__get_health` / `gbrain__run_doctor` — brain health
- Plus 70+ more tools

## Commands

```bash
# Query the brain
gbrain query "What is the debt chasing procedure?"

# Health check
gbrain doctor

# Config
gbrain config show

# Re-index (if needed)
gbrain embed --all
```

## Files

| File | Purpose |
|---|---|
| `~/.gbrain/config.json` | GBrain config (API keys, models) |
| `~/.gbrain/brain.pglite` | PGLite database |
| `~/.openclaw/openclaw.json` | OpenClaw config (MCP server entry) |

## Risks / Notes

1. **OpenAI API key is service account key** (`sk-svcacct-...`) — may have limitations
2. **Brain score: 45/100** — links and timeline not populated yet (can be improved with `gbrain extract all`)
3. **No MCP HTTP** — using stdio transport only; HTTP server routes had issues
4. **Memory sync error** in logs — `openai embeddings failed: 429 insufficient_quota` — unrelated to GBrain, from memory-core plugin

## Rule: When to Use GBrain vs Lossless-Claw

| Question type | Use |
|---|---|
| "What did we decide about X?" | GBrain query |
| "What does MEMORY.md say about Y?" | memory_search |
| "What happened in session Z?" | lossless-claw recall |
| "Who on the team knows about X?" | gbrain__find_experts |
| "What's been notable lately?" | gbrain__get_recent_salience |
| "Any contradictions in my brain?" | gbrain__find_anomalies |
