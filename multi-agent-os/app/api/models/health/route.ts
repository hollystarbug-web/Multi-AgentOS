/**
 * GET /api/models/health
 *
 * Returns the credential and live-ping status of every model in the registry.
 * Used by the model rail to show ✅/⚠️/❌ next to each model tile.
 *
 * Query params:
 *   ?model=<id>     ping a single model (slower but accurate)
 *   (no param)      return all models with cached status (fast)
 *
 * Status values:
 *   'ok'        key works, model available
 *   'quota'     key works but account out of credits
 *   'auth'      key invalid/expired
 *   'no-key'    no credential found
 *   'unknown'   not yet checked (use POST ?force=true to ping)
 */

import { NextRequest } from 'next/server'
import { MODELS } from '@/lib/models'
import { getApiKey, pingProvider } from '@/lib/credentials'

interface ModelStatus {
  id: string
  name: string
  provider: string
  status: 'ok' | 'quota' | 'auth' | 'no-key' | 'unknown' | 'network'
  latencyMs?: number
  keySource?: string
  error?: string
  checkedAt: string
}

const STATUS_CACHE_TTL_MS = 60_000  // 1 minute
const cache = new Map<string, { ts: number; status: ModelStatus }>()

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const modelId = url.searchParams.get('model')
  const force = url.searchParams.get('force') === 'true'

  if (modelId) {
    const status = await getModelStatus(modelId, force)
    return Response.json({ model: modelId, status })
  }

  // All models
  const all = await Promise.all(
    Object.keys(MODELS).map((id) => getModelStatus(id, force))
  )
  return Response.json({ models: all, refreshedAt: new Date().toISOString() })
}

async function getModelStatus(modelId: string, force: boolean): Promise<ModelStatus> {
  const cfg = MODELS[modelId]
  if (!cfg) {
    return {
      id: modelId,
      name: modelId,
      provider: 'unknown',
      status: 'unknown',
      error: 'model not in registry',
      checkedAt: new Date().toISOString(),
    }
  }

  // Use cache if fresh
  if (!force) {
    const cached = cache.get(modelId)
    if (cached && Date.now() - cached.ts < STATUS_CACHE_TTL_MS) {
      return cached.status
    }
  }

  const keyInfo = getApiKey(cfg.provider)
  if (!keyInfo.key) {
    const status: ModelStatus = {
      id: modelId,
      name: cfg.name,
      provider: cfg.provider,
      status: 'no-key',
      keySource: keyInfo.source,
      checkedAt: new Date().toISOString(),
    }
    cache.set(modelId, { ts: Date.now(), status })
    return status
  }

  // Live ping
  const ping = await pingProvider(cfg.provider, modelId)
  let status: ModelStatus['status'] = 'unknown'
  if (ping.ok) status = 'ok'
  else if (ping.source === 'http' && ping.error?.includes('quota')) status = 'quota'
  else if (ping.source === 'http' && (ping.error?.includes('401') || ping.error?.includes('Incorrect'))) status = 'auth'
  else if (ping.source === 'network') status = 'network'
  else if (ping.source === 'http') status = 'auth'  // generic http = likely auth issue

  const result: ModelStatus = {
    id: modelId,
    name: cfg.name,
    provider: cfg.provider,
    status,
    latencyMs: ping.latencyMs,
    keySource: keyInfo.source,
    error: ping.error,
    checkedAt: new Date().toISOString(),
  }
  cache.set(modelId, { ts: Date.now(), status: result })
  return result
}
