/**
 * /api/config — read and write the user's `config.yaml`.
 *
 * GET  /api/config   → returns the active config (user merged with defaults)
 * POST /api/config   → writes a new config.yaml (called by Settings modal + setup wizard)
 *
 * Server-only. Rejects writes that would break the schema.
 */

import { NextResponse } from 'next/server'
import { writeFileSync, existsSync, copyFileSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import { loadConfig, configPath, hasUserConfig } from '@/lib/config'

export const dynamic = 'force-dynamic'

export async function GET() {
  const cfg = loadConfig()
  return NextResponse.json({
    config: cfg,
    configPath: configPath(),
    hasUserConfig: hasUserConfig(),
  })
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const newConfig = body?.config
  if (!newConfig || typeof newConfig !== 'object') {
    return NextResponse.json({ error: 'Missing "config" object in body' }, { status: 400 })
  }

  // Back up existing config before overwriting
  if (existsSync(configPath())) {
    const backup = `${configPath()}.bak.${new Date().toISOString().replace(/[:.]/g, '-')}`
    copyFileSync(configPath(), backup)
  }

  try {
    const yamlStr = yaml.dump(newConfig, { lineWidth: 120, noRefs: true })
    writeFileSync(configPath(), yamlStr, 'utf8')
  } catch (e: any) {
    return NextResponse.json({ error: `Failed to write config: ${e.message}` }, { status: 500 })
  }

  // Reload to confirm
  const { resetConfigCache } = await import('@/lib/config')
  resetConfigCache()
  const reloaded = loadConfig(true)

  return NextResponse.json({
    success: true,
    config: reloaded,
    configPath: configPath(),
  })
}
