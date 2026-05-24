# GBrain Complementary Install Procedure

**Date:** 2026-05-24  
**Status:** Experimental — Complementary Layer Only  
**Version:** gbrain 0.40.8.1  
**Install Location:** `/root/.gbrain/` (PGLite)  
**Indexed Content:** `/root/OpenClaw-Wiki/` (183 pages, 363 chunks)  
**Embedding Provider:** ZeroEntropy (`zeroentropyai:zembed-1`, 1280d)  
**Search Mode:** `balanced` (25 chunks, LLM expansion)

---

## What GBrain Is In This Setup

GBrain is installed as an **experimental complementary retrieval/indexing layer** over the curated OpenClaw-Wiki. It does NOT replace:
- The OpenClaw Wiki (Git-backed, canonical knowledge base)
- memory-core (OpenClaw's active memory system)
- lossless-claw (OpenClaw's conversation summarization/context system)
- Obsidian vault (Mac-side human-readable wiki)

**Architectural Decision:** GBrain is used as an additional retrieval/indexing layer over the curated OpenClaw-Wiki. It does not replace the Obsidian vault, Git wiki, memory-core, lossless-claw, or memory-wiki.

---

## Installation Log

### Step 1: Environment Check
- OS: Ubuntu 24.04 (Hetzner VPS)
- Bun: 1.3.14 (installed to `~/.bun/bin/bun`)
- Node: v22.22.2
- OpenClaw: 2026.5.19

### Step 2: Backup
```bash
cp /root/.openclaw/openclaw.json /root/.openclaw/openclaw.json.gbrain-install-backup-20260524-135025
```

### Step 3: Install Bun (if not present)
```bash
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"
```

### Step 4: Install GBrain
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun install -g github:garrytan/gbrain
gbrain --version  # → 0.40.8.1
```

### Step 5: Initialize Brain
```bash
export PATH="$HOME/.bun/bin:$PATH"
export ZEROENTROPY_API_KEY="ze_..."
export ANTHROPIC_API_KEY="sk-ant-..."  # Optional, for LLM expansion
gbrain init --pglite
```

**Note on ZeroEntropy API Key:** The ZeroEntropy API key must be added manually to `/root/.gbrain/config.json`:
```json
{
  "zeroentropy_api_key": "ze_your_key_here"
}
```
`gbrain config set` does NOT work for this key — it writes to the DB plane which the embed pipeline ignores.

### Step 6: Set Search Mode
```bash
gbrain config set search.mode balanced
gbrain config set search.searchLimit 25
```

**Search Mode Options:**
| Mode | Cost | Quality |
|------|------|---------|
| conservative | ~$40-200/mo | Basic retrieval |
| balanced | ~$100-500/mo | + LLM expansion |
| tokenmax | ~$200-1000/mo | Best quality (50 chunks) |

### Step 7: Import Wiki Content
```bash
export PATH="$HOME/.bun/bin:$PATH"
gbrain import /root/OpenClaw-Wiki/ --no-embed
gbrain embed --stale
```

**Import Results:**
- 183 pages imported
- 363 chunks created
- 1 skip: `08-Daily-Logs/2026-05-24.md` (Invalid input for string type)
- 100% embedding coverage

**Deliberately Excluded from Index:**
- Raw OpenClaw transcripts and session histories
- `~/.openclaw/workspace/` (credentials, node_modules, lcm.db)
- Logs, caches, and temporary files

### Step 8: Verify
```bash
gbrain doctor 2>&1 | grep -E "(\[OK\]|\[WARN\])"
```

Expected: `embeddings: 100% coverage`, `embedding_provider: zeroentropyai:zembed-1 ✓`

---

## Known Issues

### Issue 1: CLI Query Commands Consume Excessive Memory
**Symptom:** `gbrain search` and `gbrain query` commands consume 20-25GB RAM and 100%+ CPU, then hang or get killed.

**Status:** Under investigation. The embedding pipeline works correctly. The issue appears to be in the CLI query interface.

**Workaround:** Use the MCP server (`gbrain serve`) for queries instead of CLI commands.

### Issue 2: MCP Server Authentication
**Symptom:** `gbrain serve --http` starts successfully but the documented endpoints (/health, /admin, /mcp) return "Route not found" with basic auth.

**Status:** The MCP server is running (PID verified, port 3001 listening) but requires proper OAuth 2.1 client registration for MCP tool access.

**Workaround:** See MCP Setup section below.

---

## MCP Server Setup

### Start the MCP Server
```bash
export PATH="$HOME/.bun/bin:$PATH"
nohup gbrain serve --http --port 3001 --bind 0.0.0.0 > /tmp/gbrain-serve.log 2>&1 &
echo $!  # Note the PID
```

### MCP Server Details
- **URL:** `http://localhost:3001/mcp`
- **Protocol:** MCP over HTTP (JSON-RPC)
- **Admin Token:** (see `/tmp/gbrain-serve.log` on first start)
- **Token TTL:** 3600s

### Register an OAuth Client (Required for MCP Access)
```bash
# Get the admin token from the serve log
ADMIN_TOKEN=$(grep -A1 "Admin Token" /tmp/gbrain-serve.log | tail -1 | tr -d ' ')

# Register a client
curl -X POST http://localhost:3001/admin/oauth/clients \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"client_name":"openclaw","grant_types":["client_credentials"],"scopes":["read","write","admin"]}'
```

### Connect to OpenClaw
```bash
openclaw mcp set gbrain '{
  "url": "http://localhost:3001/mcp",
  "transport": "streamable-http",
  "headers": {
    "Authorization": "Bearer <client_secret>"
  }
}'
```

---

## How To Run a Test Query

### Via MCP (Recommended — once MCP is connected)
Use the gbrain MCP tools from OpenClaw once connected.

### Via CLI (If CLI memory issue is resolved)
```bash
export PATH="$HOME/.bun/bin:$PATH"
gbrain query "What is the ServiceM8 automation plan?"
```

### Test Questions
1. "What is the current ServiceM8 automation plan?"
2. "What is the procedure before reducing MEMORY.md?"
3. "What is the OpenClaw VPS/Mac mini topology?"
4. "What are the Telegram/WhatsApp channel mappings?"
5. "What is the status of the Base Service Contract Manager project?"

---

## How To Disable/Remove GBrain Safely

### Remove from OpenClaw
```bash
openclaw mcp unset gbrain
```

### Stop the MCP Server
```bash
pkill -f "gbrain serve"  # Kill the MCP server process
```

### Remove GBrain Completely
```bash
export PATH="$HOME/.bun/bin:$PATH"
bun remove -g github:garrytan/gbrain
rm -rf ~/.gbrain/
rm -f /tmp/gbrain-serve.log
```

### Restore OpenClaw Config (if needed)
```bash
cp /root/.openclaw/openclaw.json.gbrain-install-backup-20260524-135025 /root/.openclaw/openclaw.json
```

---

## Recommended Next Steps

1. **Resolve CLI memory issue** — Investigate why `gbrain search/query` consume 25GB RAM
2. **Set up MCP authentication** — Register OAuth client and verify OpenClaw MCP integration
3. **Test synthesis quality** — With MCP connected, test actual query synthesis vs raw retrieval
4. **Run graph extraction** — `gbrain extract links --source db` to populate the knowledge graph
5. **Add daily dream cycle** — Set up `gbrain dream` as a nightly cron job

---

## Safety Rules

- **DO NOT** delete, rewrite, compact, or reorganise the OpenClaw Wiki
- **DO NOT** import raw OpenClaw transcripts without Justin's explicit approval
- **DO NOT** store API keys in the wiki
- **DO NOT** expose gateway tokens, Telegram tokens, WhatsApp credentials, ServiceM8 credentials, or .env contents
- **DO NOT** make GBrain the canonical source of truth — the OpenClaw Wiki is the source of truth
- **DO NOT** replace memory-core, lossless-claw, or memory-wiki with GBrain
- If something looks risky, stop and report before proceeding
