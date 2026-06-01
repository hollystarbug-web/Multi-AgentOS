/**
 * GET /api/providers
 *
 * Returns the status of all known providers — which have keys, where the
 * keys are, and the recent ping result. Used by Settings → API Keys.
 */

import { NextRequest } from 'next/server'
import { listProviderStatus } from '@/lib/credentials'

export async function GET(_req: NextRequest) {
  return Response.json({
    providers: listProviderStatus(),
    serverTime: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV || 'unknown',
  })
}
