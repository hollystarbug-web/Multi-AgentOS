---
title: Sync to MacBook Obsidian
created: 2026-05-10
updated: 2026-06-01
tags: [obsidian, sync, macbook, mac-mini, launchd, git]
---

# Sync to MacBook Obsidian

## Architecture (Updated 2026-06-01)

```
┌─────────────────────────────────────────────────────────────┐
│ Hetzner VPS (canonical source)                              │
│   /root/OpenClaw-Wiki/    [git repo, master branch]          │
│         │                                                    │
│         │ git push (VPS → GitHub)                            │
│         ▼                                                    │
│   github.com/hollystarbug-web/openclaw-wiki.git              │
│         │                                                    │
│         │ git fetch + pull (LaunchAgent every 15 min)        │
│         ▼                                                    │
│ Mac Mini                                                     │
│   ~/Documents/Obsidian Vault/  [git repo, master branch]     │
│   ~/Library/LaunchAgents/com.holly.openclaw-wiki-sync.plist │
│   ~/bin/sync-openclaw-wiki.sh                                │
│         │                                                    │
│         │ Same directory used as Obsidian vault              │
│         ▼                                                    │
│   Obsidian app opens the vault (when Obsidian is open)       │
└─────────────────────────────────────────────────────────────┘
```

## Why Mac Mini (not MacBook Pro)?

- MacBook Pro is Justin's personal machine — offline when closed
- Mac Mini is permanently on, has the keys, can run launchd jobs
- Mac Mini is on the same Tailscale network as the VPS
- Obsidian can run on either Mac, both see the same `~/Documents/Obsidian Vault/` directory
- If MacBook Pro is the one with Obsidian open, it reads from the Mac Mini's filesystem via SMB/AFP

## Sync Method (Updated 2026-06-01)

**Three-tier git-based sync:**

1. **VPS commits + pushes to GitHub** (VPS agent does this on every wiki change)
2. **Mac Mini pulls from GitHub** (launchd job every 15 min)
3. **Obsidian reads the directory** (real-time, no further sync needed)

### VPS side

The VPS has a git repo at `/root/OpenClaw-Wiki/` with a deploy key:

```
Host github-openclaw-wiki
 HostName github.com
 User git
 IdentityFile ~/.ssh/openclaw_wiki_github
 IdentitiesOnly yes
```

Commit + push:
```bash
cd /root/OpenClaw-Wiki
git add <files>
git commit -m "Brief description"
git push origin master
```

### Mac Mini side

Deploy key copied to `~/.ssh/openclaw_wiki_github`. SSH config has:

```
Host github-wiki
    HostName github.com
    User git
    IdentityFile ~/.ssh/openclaw_wiki_github
    IdentitiesOnly yes
```

Obsidian vault is a git repo with remote `github-wiki:hollystarbug-web/openclaw-wiki.git`.

**Sync script** at `~/bin/sync-openclaw-wiki.sh`:
- Uses `git fetch` + `git pull --ff-only` (won't clobber local edits)
- Locks against concurrent runs
- Logs to `~/.openclaw/logs/wiki-sync.log`

**LaunchAgent** at `~/Library/LaunchAgents/com.holly.openclaw-wiki-sync.plist`:
- `StartInterval: 900` (every 15 min)
- `RunAtLoad: true` (also runs immediately on load/reboot)
- Standard streams to `~/.openclaw/logs/wiki-sync-{stdout,stderr}.log`

Load with:
```bash
launchctl load ~/Library/LaunchAgents/com.holly.openclaw-wiki-sync.plist
```

Check status:
```bash
launchctl list | grep openclaw-wiki
tail -20 ~/.openclaw/logs/wiki-sync.log
```

## MacBook Pro Setup (Justin's side)

Option A: Open the Mac Mini's `~/Documents/Obsidian Vault/` directly:
1. In Finder, Connect to Server: `smb://macmini.local` (or Tailscale IP)
2. Open `~/Documents/Obsidian Vault/` as a vault in Obsidian
3. All changes here are git-tracked and synced

Option B: Local vault on MacBook Pro with manual pull:
1. Clone the GitHub repo to `~/Documents/Obsidian Vault/` on MacBook Pro
2. Use Obsidian Git plugin to auto-pull every X minutes
3. Push local edits back to GitHub (be careful — could conflict with VPS changes)

**Currently configured: Option A** (the Mac Mini's vault is the canonical Obsidian target).

## IMPORTANT

- **The Mac Mini's Obsidian Vault is the canonical Obsidian copy.**
- The VPS's `/root/OpenClaw-Wiki/` is the canonical SOURCE of truth.
- The MacBook Pro is just a viewing client.
- Never edit files directly on the MacBook Pro and push to the same GitHub repo — could cause conflicts.
- If Obsidian is open on the MacBook Pro via SMB to the Mac Mini, edits are immediate (no sync delay).

## Troubleshooting

### Sync not working

```bash
# 1. Check if launchd job is loaded
ssh holly@100.91.33.1 "launchctl list | grep openclaw-wiki"

# 2. Check the log
ssh holly@100.91.33.1 "tail -30 ~/.openclaw/logs/wiki-sync.log"

# 3. Run sync manually
ssh holly@100.91.33.1 "~/bin/sync-openclaw-wiki.sh"

# 4. Check git remote
ssh holly@100.91.33.1 "cd ~/Documents/Obsidian\\ Vault && git remote -v"
```

### Conflicts in vault

If someone edited files directly on the Mac Mini while the sync pulled:

```bash
# On Mac Mini
cd ~/Documents/Obsidian\ Vault
git status
# If there are conflicts, the pull will have failed
git stash  # Save local changes
git pull   # Try again
git stash pop  # Re-apply local changes (may need merge)
```

## Initial Setup (Reference)

This is what was done on 2026-06-01:

1. Created `/opt/holly/bin/diary_layer_b_*.py` and `~/.lobster/workflows/*.lobster`
2. Wrote new wiki files (`05-Learnings/diary-layer-b-enrichment-2026-06-01.md`, etc.)
3. Updated `03-Projects/servicem8-diary-learning/README.md` and `findings-2026-06-01.md`
4. Committed and pushed to GitHub: `git push origin master` from `/root/OpenClaw-Wiki/`
5. Initialized `~/Documents/Obsidian Vault/` on Mac Mini as a git repo
6. Added `github-wiki:hollystarbug-web/openclaw-wiki.git` as remote
7. `git fetch origin master` + `git reset --hard origin/master`
8. Copied deploy key to Mac Mini: `~/.ssh/openclaw_wiki_github`
9. Created `~/bin/sync-openclaw-wiki.sh` (sync script)
10. Created `~/Library/LaunchAgents/com.holly.openclaw-wiki-sync.plist` (LaunchAgent)
11. Loaded: `launchctl load ~/Library/LaunchAgents/com.holly.openclaw-wiki-sync.plist`

Now any change pushed from VPS → GitHub appears in the Obsidian vault within 15 minutes.

## Last Updated

`2026-06-01 12:46 UTC` — Three-tier git sync set up via Mac Mini LaunchAgent.
