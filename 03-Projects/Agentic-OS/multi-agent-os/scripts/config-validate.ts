#!/usr/bin/env tsx
/**
 * config:validate — check config.yaml is valid against the schema.
 *
 *   npm run config:validate
 *
 * Exits 0 on success, 1 on failure (with the validation error).
 */

import { loadConfig } from '../lib/config'

try {
  const cfg = loadConfig(true)
  console.log('✓ config is valid')
  console.log(`  vault: ${cfg.vault.enabled ? cfg.vault.localPath : '(disabled)'}`)
  console.log(`  nodes: ${cfg.nodes.length}`)
  console.log(`  panels: ${Object.keys(cfg.panels).filter(k => cfg.panels[k as keyof typeof cfg.panels]).length} enabled`)
  process.exit(0)
} catch (e: any) {
  console.error('✗ config validation failed:')
  console.error(e.message)
  process.exit(1)
}
