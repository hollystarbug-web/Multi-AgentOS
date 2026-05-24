# GBrain as Complementary Retrieval Layer — 2026-05-24

## Rule: GBrain Is A Complementary Layer, Not A Replacement

**What:** GBrain (garrytan/gbrain) was evaluated and installed as an experimental retrieval/indexing layer over the curated OpenClaw-Wiki. It does NOT replace memory-core, lossless-claw, memory-wiki, Obsidian, or the Git-backed wiki. **Why:** The existing OpenClaw memory system (lossless-claw for conversation context, memory-core for active memory, wiki for knowledge) is the canonical source of truth. GBrain adds vector search and synthesis on top. **When:** Any consideration of using GBrain as the primary memory or knowledge source.

---

## Rule: ZeroEntropy API Key Goes In config.json, Not gbrain config set

**What:** When installing GBrain with ZeroEntropy embedding, the API key must be added manually to `~/.gbrain/config.json` as `zeroentropy_api_key: "ze_..."`. Do NOT use `gbrain config set` for this key. **Why:** `gbrain config set` writes to the database plane, which the embedding pipeline ignores. The embedding pipeline only reads from `~/.gbrain/config.json`. **When:** Every GBrain install with ZeroEntropy.

---

## Rule: gbrain search/query CLI Commands May Consume Excessive Memory

**What:** On the VPS (Hetzner Ubuntu), `gbrain search` and `gbrain query` commands consumed 20-25GB RAM and 100%+ CPU, then hung. The embed pipeline worked fine. The MCP server also worked (port 3001, listening). **Why:** Under investigation — possibly a PGLite memory management issue or CLI-specific bug in gbrain 0.40.8.1. **When:** If CLI queries hang, use the MCP server (`gbrain serve`) instead.

---

## Rule: MCP Server OAuth Registration Required

**What:** `gbrain serve --http` starts an MCP server but requires OAuth 2.1 client registration before MCP tools can be accessed. The admin token is in the serve log. **Why:** gbrain's MCP server uses OAuth 2.1 for authentication. Anonymous access is not allowed. **When:** Every time you want to connect an external client (like OpenClaw) to the gbrain MCP server.
