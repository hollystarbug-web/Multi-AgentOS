#!/usr/bin/env tsx
/**
 * check-update — see if a newer version is available on GitHub.
 *
 *   npm run check-update
 *
 * Exits 0 if up to date, 1 if update available, 2 if check failed.
 */

import { VERSION, checkLatestRelease, isNewer } from '../lib/version'

async function main() {
  const latest = await checkLatestRelease()
  if (!latest) {
    console.error('✗ Could not reach GitHub (offline or rate-limited)')
    process.exit(2)
  }

  console.log(`Current: v${VERSION}`)
  console.log(`Latest:  v${latest.version} (${latest.publishedAt.slice(0, 10)})`)
  console.log(`URL:     ${latest.url}`)

  if (isNewer(latest.version, VERSION)) {
    console.log('')
    console.log('🆙 New version available. Run: npm run update')
    process.exit(1)
  } else {
    console.log('')
    console.log('✓ You\'re on the latest version.')
    process.exit(0)
  }
}

main().catch(e => { console.error(e); process.exit(2) })
