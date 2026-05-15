## Promoted From Short-Term Memory (2026-05-02)

<!-- openclaw-memory-promotion:memory:memory/2026-04-26.md:15:18 -->
- | Layer | Tech | |-------|------| | Frontend | Next.js 16 (App Router), TypeScript, Tailwind CSS | | Auth | Clerk (Passkeys/WebAuthn for @baselifts.co.uk) | [score=0.920 recalls=0 avg=0.620 source=memory/2026-04-26.md:15-18]
<!-- openclaw-memory-promotion:memory:memory/2026-04-26.md:9:9 -->
- **Current status:** DNS migration pending — still on Vercel [score=0.888 recalls=0 avg=0.620 source=memory/2026-04-26.md:9-9]
<!-- openclaw-memory-promotion:memory:memory/2026-04-26.md:27:30 -->
- | File | Purpose | |------|---------| | `app/api/sc-form/route.ts` | POST: creates SM8 company+job+contact, saves to portal DB. GET: fetches form by job_uuid or id | | `app/api/companies/search/route.ts` | Company typeahead — queries **local SQLite mirror** (INSTANT) | [score=0.888 recalls=0 avg=0.620 source=memory/2026-04-26.md:27-30]
<!-- openclaw-memory-promotion:memory:memory/2026-04-26.md:31:34 -->
- | `components/NewContractTab.tsx` | Step 1 — company search, job creation, spinner+countdown loading | | `components/SCFormTab.tsx` | Step 2 — loads from URL `?job_uuid=...`, pre-populates from SM8 | [score=0.888 recalls=0 avg=0.620 source=memory/2026-04-26.md:31-32]

