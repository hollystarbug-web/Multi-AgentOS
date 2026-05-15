### Portal Architecture — VPS (as of May 11, 2026)

| Port | Process | Description |
|------|---------|-------------|
| 3000 | Next.js (`portal`, PM2) | Portal web app + API routes. `http://204.168.251.149:3000` |
| 3001 | Express (`portal-api`, PM2) | Express API server. `http://204.168.251.149:3001` |
| 3003 | Silver Surfer (`www-data`) | Separate service |

**Cloudflare tunnel:** Mac Mini manages tunnel to VPS. Current URL: `https://gratis-convenient-substantially-organizational.trycloudflare.com` → forwards to port 3001 (Express). Tunnel is auto-managed by LaunchAgent on Mac Mini.

**⚠️ VPS_API env var:** Set to Cloudflare tunnel URL (`https://gratis-convenient-substantially-organizational.trycloudflare.com`). Direct Hetzner IP (`http://204.168.251.149:3001`) is NOT reachable from Vercel serverless — use tunnel URL instead. Tunnel URL changes if tunnel restarts.

**Known working API routes (Express, port 3001):**
- `/api/approval-queue` ✅
- `/api/sc-jobs-pending` ✅

**Known routes NOT in Express (only in Next.js port 3000):**
- `/api/renewals-window` — returns 500 (DB error in Next.js)
- `/api/awaiting-payment` — not exposed in Express

**⚠️ Dashboard status (May 11 2026):**
- Main page: ✅ Working
- Approval Queue: ✅ Working
- Renewals Window tab: ❌ 500 error (route issue)
- Awaiting Payment tab: ❌ Internal error (route issue)
- Root cause: Express server (port 3001) doesn't have `renewals-window` or `awaiting-payment` routes. Next.js (port 3000) has them but with DB errors.

**⚠️ Old/other Vercel projects (do not use):**
- `portal` (prj_ceI7NK8K64ZnxY3ZBmMJxzJ6sB7j) — old portal code, NOT deployed
- `sc_manager` (prj_flCfky3A4AfYgjk5UNJGVFHXY40R) — Streamlit backend project, NOT the portal
- `portal-deploy` (prj_r8BOLVCgtGJibyq2ZSuTFiepk4PE) — empty/deprecated

**Current DNS (FastHosts):**
  - CNAME: `dashboard` → `9652a0358d21c446.vercel-dns-017.com`
  - TXT: `_vercel` → `vc-domain-verify=dashboard.baselifts.co.uk,d26a407ab2c82afd41dc`

**Portal Auth:** Passkeys/WebAuthn via Clerk — passwordless magic link for @baselifts.co.uk staff

---

