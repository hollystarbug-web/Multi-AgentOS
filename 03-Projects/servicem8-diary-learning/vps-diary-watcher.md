---
title: VPS Diary Watcher — Status & Runbook
project: servicem8-diary-learning
created: 2026-05-14
updated: 2026-05-15
tags: [project, servicem8, diary, vps, systemd, postgresql, ollama]
status: in-progress
owner: Holly (main agent)
---

# VPS Diary Watcher

## What Is It

A systemd service running on the VPS (Hetzner) that:
1. Polls ServiceM8 for new/updated diary notes every 2 minutes
2. Generates embeddings using Ollama + nomic-embed-text
3. Stores raw + embedded entries in PostgreSQL

Provides the real-time data pipeline for the ServiceM8 Diary Learning Model.

---

## Architecture

| Component | Detail |
|-----------|--------|
| **Host** | VPS (Hetzner ubuntu-16gb-hel1-1) |
| **Database** | PostgreSQL (`diary` database, `holly` user) |
| **Embedding model** | Ollama + nomic-embed-text (274MB, F16) ✅ installed 2026-05-15 |
| **Polling interval** | 2 minutes |
| **Service name** | `diary-watcher` (systemd) |
| **Script location** | `/opt/holly/bin/diary_watcher.py` |
| **Log location** | `/root/.openclaw/diary/watcher.log` + journald |

---

## Known Issues (as of 2026-05-15)

### 1. Four bugs found and fixed — 2026-05-15 ✅

**Bug A — Wrong SM8 timestamp field in API filter (CRITICAL)**
- **Problem:** URL filter used `stamp` field — but SM8 notes API uses `create_date`, NOT `stamp`
- **Effect:** Every poll returned 0 notes because `stamp` doesn't exist in the API response
- **Fix:** Changed filter from `stamp%20gt%20` to `create_date%20gt%20`
- **File:** `/opt/holly/bin/diary_watcher.py`, poll() function

**Bug B — Wrong Ollama embedding endpoint**
- **Problem:** Used `/api/embed` but Ollama's embedding endpoint is `/api/embeddings` (plural)
- **Effect:** All embedding generation silently failed
- **Fix:** Changed `OLLAMA_URL` to `http://localhost:11434/api/embeddings`
- **File:** `/opt/holly/bin/diary_watcher.py`, line ~17

**Bug C — Checkpoint only saved when notes found**
- **Problem:** Checkpoint was only saved when `processed > 0`. Since Bug A returned 0 notes, checkpoint was NEVER saved, so every poll restarted from 2024-01-01 in an infinite loop
- **Effect:** Watcher was completely broken — cycling from 2024-01-01 every 2 minutes, finding nothing, repeating forever
- **Fix:** Checkpoint is now saved on every poll (even 0 notes) so the timestamp advances correctly
- **File:** `/opt/holly/bin/diary_watcher.py`, poll() function

**Bug D — Ollama embedding field name wrong**
- **Problem:** Script sent `{"model": "nomic-embed-text", "input": text}` but Ollama expects `"prompt": text` for this model
- **Effect:** `diary_embeddings` table was always empty — embeddings silently returned empty arrays
- **Fix:** Changed `"input"` to `"prompt"` in get_embedding()
- **File:** `/opt/holly/bin/diary_watcher.py`, get_embedding() function

**Bug E — Wrong SM8 field for staff UUID**
- **Problem:** Code used `note.get("staff_uuid", "")` but SM8 API returns `edit_by_staff_uuid` for the staff who last edited the note
- **Effect:** All staff names were "Unknown" — staff UUID mapping never matched
- **Fix:** Changed to `note.get("edit_by_staff_uuid", "")`
- **File:** `/opt/holly/bin/diary_watcher.py`, process_note() function

**Bug F — Timestamp parsing used wrong field**
- **Problem:** Code used `note.get("stamp", "")` but SM8 API uses `create_date` (format: `"2026-05-11 12:18:36"`)
- **Effect:** All timestamps were NULL — notes had no temporal ordering
- **Fix:** Changed to `note.get("create_date", "")` with proper `datetime.strptime` parsing for `"YYYY-MM-DD HH:MM:SS"` format
- **File:** `/opt/holly/bin/diary_watcher.py`, process_note() function

### 2. Ollama model installed ✅
- **Problem:** `nomic-embed-text` was not installed in Ollama
- **Fix:** Pulled and installed 2026-05-15 — 274MB model, F16 quantization
- **Verified:** `curl http://localhost:11434/api/tags` shows `nomic-embed-text:latest`
- **Verified:** Test embedding with `{"model": "nomic-embed-text", "prompt": "hello"}` returns valid 768-dim vector

### 3. Data Confirmed Stored — 2026-05-15 07:48 ✅
- First notes processed by the OLD service (PID 712259) at 07:48:56: "Processed 1 new notes"
- Checkpoint saved correctly: new service polls from `2026-05-15T07:48:56+00:00`
- **Total in DB: 19,197 notes** across all tables

### 4. Historical Data Gap
- **Problem:** Watcher only captures new notes going forward — ~8 months of historical diary entries not captured
- **Impact:** Layer A archive will be incomplete until backfill is done
- **Priority:** Lower — real-time pipeline must work first

---

## Service Management

```bash
# Check service status
sudo systemctl status diary-watcher

# View recent logs (journald)
sudo journalctl -u diary-watcher -n 50 --no-pager

# View full log file
tail -f /root/.openclaw/diary/watcher.log

# Restart service
sudo systemctl restart diary-watcher

# Check if process is running
ps aux | grep diary_watcher | grep -v grep
```

---

## Database Schema

Tables in `diary` database (PostgreSQL, owner: holly):

| Table | Purpose |
|-------|---------|
| `diary_archive` | Layer A — raw diary entries verbatim |
| `diary_events` | Layer B — structured/classified events |
| `diary_embeddings` | Vector embeddings (nomic-embed-text) |
| `diary_tags` | Tag associations |
| `import_batches` | Bulk import tracking |
| `pattern_summary` | Aggregated pattern stats |
| `polling_checkpoint` | Last-polled timestamp (currently EMPTY — needs to be populated by successful poll) |

---

## SM8 API Details

- **Endpoint:** `https://api.servicem8.com/api_1.0/note.json`
- **Auth:** X-API-Key header
- **Key:** Stored in `/root/.openclaw/workspace/.credentials/servicem8.json` → `apiKey`
- **Key timestamp field:** `create_date` (NOT `stamp`)
- **Cursor pagination:** Not needed for note polling (uses date filter)
- **Rate limit:** 200ms between requests, wait 60s on 429

---

## Next Steps

1. **Fix second poll hang** — investigate why poll #2 after restart hasn't completed
2. **Verify notes are being fetched** — confirm checkpoint saves correctly after fix
3. **Backfill historical data** — bulk import script for ~8 months of historical notes
4. **Verify embeddings** — check `diary_embeddings` table has data

---

## Related

- Project parent: [ServiceM8 Diary Learning Model](./README.md)
- Context source (May 14 conversation): DOCX in media inbox
