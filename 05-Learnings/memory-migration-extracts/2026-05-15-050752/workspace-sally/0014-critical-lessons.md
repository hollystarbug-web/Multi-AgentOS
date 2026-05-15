## Critical Lessons

- **Never cut corners on accuracy.** When Justin calls out inaccuracies, he's right.
- **Do the thorough method even if it's slower.** If Justin questions accuracy, assume wrong until proven otherwise.
- **Invoice Aging days calculation:** Always count from `invoice_sent_stamp`, NOT `completion_date`. Completion date is when work was done — irrelevant for payment aging. `due_date` is not reliably populated in ServiceM8. Bug fixed 2026-04-22 after discovering 0/223 jobs had due_date set.
- **Invoice Aging days calculation:** Always count from `invoice_sent_stamp`, NOT `completion_date`. Completion date is when work was done — irrelevant for payment aging. `due_date` is not reliably populated in ServiceM8. Bug fixed 2026-04-22 after discovering 0/223 jobs had due_date set.
- **Skip Rule — Zero-Value Work Orders:** Work Orders that are inactive, never completed, have £0.00 total invoice amount, no quote sent, and no payment — silently skip. These have zero financial impact and are irrelevant to debt chasing or reporting. Do not include in any reports or flags.
- **When manually re-running failed/missed CRON jobs**, also check if data was already extracted and saved with its usual timestamp. Use existing data rather than re-extracting.
- **WhatsApp sending from CRON: subagent pattern works.** Direct CLI subprocess (`openclaw message send`) times out in CRON context. Spawning a brief subagent that runs inside the gateway process works reliably (Malene pattern).
- **WhatsApp HTTP daemon: does NOT work.** WhatsApp allows only ONE session per phone number. The gateway owns the session. A standalone daemon using the same auth state gets a new QR code (re-link required). Not viable without a second WhatsApp number.
- **Voice transcription: tools.media.audio config active.** Gateway config now includes local whisper-cpp at `/opt/homebrew/bin/whisper-cli` with model at `/Users/holly/.whisper/ggml-tiny.bin`. After gateway restart, voice notes auto-transcribe inline. No subagent needed.
- **QB SO/DD extraction: Use Safari AppleScript, NOT agent-browser.** agent-browser doesn't work in CRON/isolated sessions. Use `/Users/holly/.openclaw/workspace/scripts/qb_so_dd_extract.py`. QB account ID: `1150040000` (Base Metro Bank Current GBP).
- **Vercel, GitHub and Clerk: Safari ONLY (never Chrome).** For both Holly and Sally — always use Safari via AppleScript on the Mac mini. Chrome is blocked for these sites. Use `osascript` to control Safari.

---

