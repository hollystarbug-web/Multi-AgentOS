#!/usr/bin/env tsx
/**
 * update — pull the latest code and reinstall dependencies.
 *
 *   npm run update
 *
 * What it does:
 *   1. Fetches the latest from origin
 *   2. Pulls (with --rebase --autostash for safety)
 *   3. Runs `npm install` for any new deps
 *   4. Runs `npm run setup -- --no-interactive` if config was added
 *   5. Re-runs `npm run config:validate`
 *
 * Safe to re-run. If the user has uncommitted local changes, --autostash
 * will move them aside and restore after the pull.
 */

import { execSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { VERSION, checkLatestRelease, isNewer } from '../lib/version'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', red: '\x1b[31m',
}
const ok    = (s: string) => console.log(`${c.green}✓${c.reset} ${s}`)
const info  = (s: string) => console.log(`${c.dim}${s}${c.reset}`)
const warn  = (s: string) => console.log(`${c.yellow}⚠${c.reset} ${s}`)
const fail  = (s: string) => { console.error(`${c.red}✗${c.reset} ${s}`); process.exit(1) }
const header= (s: string) => console.log(`\n${c.cyan}${c.bold}━━━ ${s} ━━━${c.reset}\n`)

function run(cmd: string, opts: { allowFail?: boolean } = {}): string {
  try {
    return execSync(cmd, { cwd: ROOT, stdio: ['ignore', 'pipe', 'pipe'], encoding: 'utf8' }).trim()
  } catch (e: any) {
    if (opts.allowFail) return ''
    fail(`Command failed: ${cmd}\n${e.stderr || e.message}`)
    return ''  // unreachable, satisfies TS
  }
}

function isGitRepo(): boolean {
  return existsSync(resolve(ROOT, '.git'))
}

async function main() {
  header(`Update Multi-Agent OS (current: v${VERSION})`)

  if (!isGitRepo()) {
    fail(`Not a git repo. Multi-Agent OS must be installed via:
        curl -fsSL https://raw.githubusercontent.com/hollystarbug-web/multi-agent-os/main/install.sh | bash
        Re-run that to get a proper install, then re-run this update.`)
  }

  // ── Check for newer release ─────────────────────────────────────────
  info('Checking for updates…')
  const release = await checkLatestRelease()
  if (release) {
    if (isNewer(release.version, VERSION)) {
      ok(`Latest: v${release.version} (published ${release.publishedAt.slice(0, 10)})`)
      info(release.notes.split('\n').slice(0, 10).join('\n'))
    } else {
      ok(`You're on the latest version (v${VERSION})`)
    }
  } else {
    warn('Could not check for updates (offline? GitHub rate-limited?)')
  }

  // ── Pull ────────────────────────────────────────────────────────────
  header('Step 1 · Pull latest code')
  const branch = run('git rev-parse --abbrev-ref HEAD')
  info(`Current branch: ${branch}`)
  run('git fetch origin', { allowFail: true })
  try {
    run(`git pull --rebase --autostash origin ${branch}`)
    ok('Pulled latest changes')
  } catch (e: any) {
    fail(`Pull failed. Resolve conflicts manually and re-run.
${e.message}`)
  }

  // ── Reinstall deps ──────────────────────────────────────────────────
  header('Step 2 · Reinstall dependencies')
  const oldHash = existsSync(resolve(ROOT, 'package-lock.json'))
    ? run('md5sum package-lock.json | awk \'{print $1}\'')
    : ''
  run('npm install --no-audit --no-fund')
  const newHash = existsSync(resolve(ROOT, 'package-lock.json'))
    ? run('md5sum package-lock.json | awk \'{print $1}\'')
    : ''
  if (oldHash === newHash) {
    ok('Dependencies unchanged')
  } else {
    ok('Dependencies updated')
  }

  // ── Validate config ─────────────────────────────────────────────────
  header('Step 3 · Validate config')
  try {
    run('npm run config:validate')
  } catch {
    warn('Config validation failed — your config.yaml may be out of date.')
    warn('Re-run `npm run setup` to migrate.')
  }

  // ── Done ────────────────────────────────────────────────────────────
  header('🎉 Update complete')
  const newVersion = run('node -e "console.log(require(\'./package.json\').version)"')
  ok(`Now running v${newVersion}`)
  info(`Restart your dev server: ${c.bold}npm run dev${c.reset}`)
}

main().catch(e => { console.error(e); process.exit(1) })
