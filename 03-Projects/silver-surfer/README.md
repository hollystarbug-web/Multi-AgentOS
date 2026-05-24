# Silver Surfer 🐚

**Type:** Product / AI Companion App
**URL:** https://silversurfer.getitsorted.tech
**Status:** LIVE ✅

**Pitch:** Conversational AI companion app for baby boomers (60+). Voice-first, character-based, payment protection layer. Seeking investment or technical co-founder.

---

## Live App

**URL:** https://silversurfer.getitsorted.tech

The app is running and serving. Characters appear online, mic works, voice output is active.

### Companion Characters

| Character | Archetype | Voice |
|-----------|-----------|-------|
| Margaret | The Maternal Guardian | ElevenLabs |
| Grace | The Elegant Advisor | ElevenLabs |
| Edward | The Distinguished Gentleman | ElevenLabs |
| Arthur | The Adventurer Grandfather | ElevenLabs |

### App Features

- Voice-first UI — tap and hold mic to speak
- Settings: Large Text & Buttons, High Contrast, Character Voice toggle
- Tasks: Check email, Book appointment, Check energy tariff, Video call help
- Payment protection layer (built into concept)

---

## Project Files

**Source workspace:** `/root/.openclaw/workspace-oscar/projects/silversurfer/`

| Folder | Contents |
|--------|----------|
| `app/` | Full Next.js/Node app: React components, API routes, middleware, Docker, Docker Compose, deploy-fly.sh, .env.example |
| `wiki/` | Own Obsidian wiki: index, technical/ (api-keys, architecture, deployment) |
| Root | README.md, SPEC.md, pitch-deck.md, CONCEPT.md, roadmap, branding assets |

---

## Infrastructure

**DNS:** `silversurfer.getitsorted.tech` → `204.168.251.149` (VPS)

**TLS:** Let's Encrypt certificate
- Path: `/etc/letsencrypt/live/silversurfer.getitsorted.tech-0001/`
- Renewed via certbot with `--force-renewal --webroot`

**Deployment:** Fly.io (`deploy-fly.sh`)

**Credentials:** ElevenLabs (`~/.openclaw/credentials/oscar/elevenlabs`)

---

## Connectivity Fix — 2026-05-12

**Problem:** Site was inaccessible externally.

**Root cause:** WireGuard VPN was active with `AllowedIPs = 0.0.0.0/0` — routed ALL traffic through VPN tunnel, blocking external access.

**Fix:**
```bash
wg-quick down wg0
```

**Lesson:** WireGuard with 0.0.0.0/0 allowed IPs intercepts all traffic. Use specific subnets instead.

**Full details:** `MEMORY.md` (Silversurfer Connectivity Fix section)

---

## Pitch Book

Located at: `projects/silversurfer/pitch-deck.md`

Key points:
- Target market: Baby boomers (60+) — large, underserved, growing
- Product: Voice-first AI companion with character-based relationships
- Monetisation: Subscription + payment protection layer
- Traction: Live app, 4 characters, accessibility features
- Ask: Investment or technical co-founder

---

## Next Steps

1. Find investment or technical co-founder
2. Improve character depth and task capabilities
3. User testing with target demographic
4. Payment protection layer — productise and launch
