/**
 * Version constants and helpers for Multi-Agent OS.
 *
 * Versioning rules:
 *   - MAJOR.MINOR.PATCH (semver)
 *   - MAJOR: breaking config schema changes
 *   - MINOR: new features, new agents, new panels
 *   - PATCH: bug fixes, prompt edits, copy changes
 *
 * The version is read from package.json at build time. Use these constants
 * in the UI to show the user what they're running.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

function readVersion(): string {
  const pkgPath = resolve(__dirname, '..', 'package.json')
  if (!existsSync(pkgPath)) return '0.0.0'
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'))
    return pkg.version || '0.0.0'
  } catch {
    return '0.0.0'
  }
}

export const VERSION = readVersion()
export const REPO    = 'hollystarbug-web/multi-agent-os'
export const REPO_URL = `https://github.com/${REPO}`

/** Check GitHub for the latest release. Returns null if check fails. */
export async function checkLatestRelease(): Promise<{
  version: string
  url: string
  publishedAt: string
  notes: string
} | null> {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const data = await res.json()
    return {
      version: data.tag_name?.replace(/^v/, '') || '0.0.0',
      url: data.html_url,
      publishedAt: data.published_at,
      notes: data.body || '',
    }
  } catch {
    return null
  }
}

/** Compare two semver strings. Returns -1, 0, or 1. */
export function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const na = pa[i] || 0
    const nb = pb[i] || 0
    if (na < nb) return -1
    if (na > nb) return 1
  }
  return 0
}

/** True if `latest` is newer than `current`. */
export function isNewer(latest: string, current: string): boolean {
  return compareVersions(latest, current) > 0
}
