## Credential Handling — GLOBAL RULE

**ALL credentials (API keys, passwords, OAuth tokens, session cookies, auth tokens) MUST:**
- Live ONLY in `~/.openclaw/workspace/.credentials/`
- That directory must have permissions `700`
- Each file must have permissions `600`
- The directory and files must NOT be committed to git
- Never in wiki files, code, chat messages, or procedure files
- If found outside `.credentials/`, immediately redact and fix

**No exceptions.** Not even temporarily. Not even "just for testing."

**Why:** Prevents accidental exposure in git history, chat logs, and public repos.

---

