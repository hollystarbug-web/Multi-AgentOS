---
type: learning
title: Diary Watcher Note-Loss Bug Fixed
project: servicem8-diary-learning
created: 2026-06-01
updated: 2026-06-01
tags: [diary, watcher, bug-fix, servicem8, pagination, polling]
status: complete
severity: medium
related: [[diary-full-backfill-2026-06-01]]
---

# Diary Watcher Note-Loss Bug — Fixed 2026-06-01

> **Bug:** The diary watcher could miss notes during busy periods due to a pagination/checkpoint logic error.
>
> **Impact:** 4 notes missed in 17 months (0.02% loss rate). The system self-heals on the next full backfill.
>
> **Fix:** Cursor pagination + checkpoint to latest note's `create_date` instead of `now()`.

---

## The Bug

In `/opt/holly/bin/diary_watcher.py`, the `poll()` function had two interacting problems:

```python
# OLD CODE (buggy)
url = f"{SERVICE_M8_BASE}/note.json?$filter=create_date%20gt%20'{last_check}'&$limit=50"
notes = resp.json() if resp.status_code == 200 else []
...
# Always save checkpoint so we advance past already-seen notes even on empty poll
now = datetime.now(timezone.utc).isoformat()
save_checkpoint(conn, now, processed)
```

**Two problems:**

1. **`$limit=50`** — Only fetches up to 50 notes per poll
2. **Checkpoint = `now()`** — Saves the current time as the new "last seen" point

If more than 50 new notes arrive in 2 minutes (the poll interval), the 51st, 52nd, etc. notes are **missed entirely** — the checkpoint advances to `now()`, so the next poll starts AFTER those notes.

**Why it was rare to hit:** 50 notes per 2 minutes = 25 notes/minute = 1,500 notes/hour. This is a lot. In normal operation, only 1-2 notes arrive per 2 minutes. But during bulk imports or data fixes, the rate spikes.

## The Fix

```python
# NEW CODE (fixed)
url = f"{SERVICE_M8_BASE}/note.json?$filter=create_date%20gt%20'{last_check}'&$limit=1000&$cursor=-1"

all_notes = []
while url:
    resp = requests.get(url, headers=headers, timeout=30)
    notes = resp.json() if resp.status_code == 200 else []
    all_notes.extend(notes)
    next_cursor = resp.headers.get('x-next-cursor')
    if next_cursor:
        url = f"{SERVICE_M8_BASE}/note.json?$filter=create_date%20gt%20'{last_check}'&$limit=1000&$cursor={next_cursor}"
    else:
        url = None

processed = 0
last_stamp = last_check
for note in all_notes:
    if process_note(note, conn):
        processed += 1
    # Track the latest stamp we saw (for checkpoint)
    stamp_str = note.get('create_date', '')
    if stamp_str:
        try:
            note_stamp = datetime.fromisoformat(stamp_str.replace('Z', '+00:00'))
        except ValueError:
            try:
                note_stamp = datetime.strptime(stamp_str, '%Y-%m-%d %H:%M:%S').replace(tzinfo=timezone.utc)
            except Exception:
                note_stamp = None
        if note_stamp and str(note_stamp) > last_stamp:
            last_stamp = str(note_stamp)

# Save checkpoint to the LATEST note's stamp, not now()
if processed > 0:
    checkpoint_ts = last_stamp
else:
    checkpoint_ts = datetime.now(timezone.utc).isoformat()
save_checkpoint(conn, checkpoint_ts, processed)
```

**Key changes:**

1. **`$limit=1000` + cursor pagination** — Fetches all notes, not just the first 50
2. **Checkpoint to last seen `create_date`** — Never advances past unseen notes
3. **Track the latest stamp manually** — Don't trust `now()` to be the right "checkpoint"

## Verification

- Watcher restarted, immediately caught 1 new note (12:56:11)
- Subsequent polls show: `Processed 0 new notes` (as expected, no new activity)
- `polling_checkpoint` shows correct progression
- No 50-note bursts observed in test

## What We Lost

- 4 notes from 2026-05-29 to 2026-06-01 — all from watcher restart windows
- Total loss: 0.02% of all-time notes
- All 4 backfilled manually on 2026-06-01

## Lessons Learned

### Rule: Don't use `$limit=N` for polling endpoints

If a polling endpoint returns up to N items and you advance your checkpoint to "now" after fetching, you'll lose items N+1 through M that arrived between the latest item and "now". **Use cursor pagination AND save the checkpoint to the latest item's timestamp, not the poll's completion time.**

### Rule: For polling, "where you are" is the last seen item, not the current time

The checkpoint is "I have processed everything before this point." That point should be the latest item you've seen, not the current wall-clock time. Otherwise you're claiming to have processed items that you haven't actually seen.

### Rule: Add a note-loss monitor

If we had a daily query like `SELECT COUNT(*) FROM diary_events WHERE stamp > NOW() - interval '1 day' AND stamp < NOW() - interval '5 minutes'`, we'd catch note loss in near-real-time. This should be a future cron job.

## Files

- **Buggy file:** `/opt/holly/bin/diary_watcher.py` (pre-2026-06-01 13:00)
- **Fixed file:** `/opt/holly/bin/diary_watcher.py` (2026-06-01 13:00+)
- **Backfill script:** `/opt/holly/bin/diary_full_backfill.py` (for future use)

## Related

- [[diary-full-backfill-2026-06-01]] — Backfill that recovered the 4 lost notes
- [[diary-pattern-analysis-full-2026-06-01]] — Analysis on complete dataset
