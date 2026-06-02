#!/usr/bin/env tsx
/**
 * release — bump version, update CHANGELOG, tag, and push.
 *
 *   npm run release -- patch   # 0.1.0 → 0.1.1
 *   npm run release -- minor   # 0.1.0 → 0.2.0
 *   npm run release -- major   # 0.1.0 → 1.0.0
 *   npm run release -- 0.2.0   # set explicit version
 *
 * What it does:
 *   1. Bumps `package.json` version
 *   2. Adds a CHANGELOG.md entry (empty, for you to fill in)
 *   3. Creates a git commit
 *   4. Creates a git tag v<version>
 *   5. Pushes commit + tag
 *   6. (Optional) Opens a GitHub release via `gh` CLI
 *
 * Requires a clean working tree.
 */

import { execSync } from 'node:child_process'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import prompts from 'prompts'

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

function run(cmd: string, opts: { allowFail?: boolean; capture?: boolean } = {}): string {
  try {
    return execSync(cmd, {
      cwd: ROOT,
      stdio: opts.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      encoding: 'utf8',
    }).trim()
  } catch (e: any) {
    if (opts.allowFail) return ''
    fail(`Command failed: ${cmd}\n${e.message}`)
    return ''  // unreachable, satisfies TS
  }
}

function bumpVersion(current: string, kind: string): string {
  const [maj, min, pat] = current.split('.').map(Number)
  if (kind === 'major') return `${maj + 1}.0.0`
  if (kind === 'minor') return `${maj}.${min + 1}.0`
  if (kind === 'patch') return `${maj}.${min}.${pat + 1}`
  if (/^\d+\.\d+\.\d+/.test(kind)) return kind
  fail(`Invalid version bump: ${kind} (use: major | minor | patch | X.Y.Z)`)
  return ''  // unreachable, satisfies TS
}

async function main() {
  const arg = process.argv[2]
  if (!arg) fail('Usage: npm run release -- [patch | minor | major | X.Y.Z]')

  header('Multi-AgentOS — Release')

  // ── Clean working tree? ─────────────────────────────────────────────
  const status = run('git status --porcelain', { capture: true })
  if (status) {
    fail(`Working tree is not clean. Commit or stash changes first:
${status}`)
  }
  ok('Working tree clean')

  // ── Bump version ────────────────────────────────────────────────────
  const pkgPath = resolve(ROOT, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
  const oldVersion = pkg.version
  const newVersion = bumpVersion(oldVersion, arg)
  pkg.version = newVersion
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  ok(`Bumped: v${oldVersion} → v${newVersion}`)

  // ── Add CHANGELOG entry ─────────────────────────────────────────────
  const changelogPath = resolve(ROOT, 'CHANGELOG.md')
  if (existsSync(changelogPath)) {
    const today = new Date().toISOString().slice(0, 10)
    const newEntry = `## [${newVersion}] — ${today}\n\n### Added\n-\n\n### Changed\n-\n\n### Fixed\n-\n`
    const content = readFileSync(changelogPath, 'utf8')
    // Insert after the header (after the first "## " line)
    const headerEnd = content.indexOf('\n## ')
    if (headerEnd === -1) {
      writeFileSync(changelogPath, content + '\n' + newEntry)
    } else {
      const before = content.slice(0, headerEnd + 1)
      const after = content.slice(headerEnd + 1)
      writeFileSync(changelogPath, before + '\n' + newEntry + after)
    }
    warn('CHANGELOG.md updated with empty entry — fill it in before committing!')
  }

  // ── Confirm ─────────────────────────────────────────────────────────
  const { confirm } = await prompts({
    type: 'confirm',
    name: 'confirm',
    message: `Commit, tag v${newVersion}, and push?`,
    initial: true,
  })
  if (!confirm) {
    warn('Aborted. Revert version bump:')
    info(`  git checkout -- package.json CHANGELOG.md`)
    process.exit(0)
  }

  // ── Commit, tag, push ───────────────────────────────────────────────
  header('Commit, tag, push')
  run('git add package.json CHANGELOG.md')
  run(`git commit -m "release: v${newVersion}"`)
  run(`git tag v${newVersion}`)
  const branch = run('git rev-parse --abbrev-ref HEAD', { capture: true })
  run(`git push origin ${branch}`)
  run('git push origin --tags')
  ok(`Pushed v${newVersion} to origin`)

  // ── Done ────────────────────────────────────────────────────────────
  header('🎉 Released v' + newVersion)
  ok(`Tag:    v${newVersion}`)
  ok(`Commit: ${run('git rev-parse --short HEAD', { capture: true })}`)
  info(`Users will be notified of the update on next \`npm run check-update\`.`)
  info(`To create a GitHub release with notes: gh release create v${newVersion} --notes-file CHANGELOG.md`)
}

main().catch(e => { console.error(e); process.exit(1) })
