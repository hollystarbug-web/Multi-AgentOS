/**
 * Server-side credential resolver.
 *
 * Looks up API keys for each provider. Lookup order:
 *   1. Request body (per-call override, e.g. user testing a new key)
 *   2. Process env var (e.g. ANTHROPIC_API_KEY)
 *   3. JSON file in /root/.openclaw/workspace/.credentials/<name>.json
 *
 * Keys are NEVER exposed to the client. Only this server-side module reads them.
 * The client sends no API key in requests — the server fills it in.
 *
 * Why: API keys in the request body mean the client must store them
 * somewhere (localStorage), which is vulnerable to XSS. Server-side
 * resolution means the client just says "talk to Claude" and the server
 * looks up the key. Keys never leave the server.
 */

import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

const CRED_DIR = '/root/.openclaw/workspace/.credentials'

interface ProviderKey {
  key: string
  source: 'request' | 'env' | 'file' | 'missing'
  meta?: Record<string, any>
}

function safeReadJson(path: string): any | null {
  try {
    if (!existsSync(path)) return null
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch {
    return null
  }
}

function pickKey(obj: any, ...names: string[]): string {
  if (!obj || typeof obj !== 'object') return ''
  for (const n of names) {
    if (typeof obj[n] === 'string' && obj[n].length > 8) return obj[n]
  }
  return ''
}

/**
 * Get an API key for a provider.
 *
 * @param provider - provider id (matches MODELS provider field)
 * @param override - optional per-request key passed from client
 */
export function getApiKey(
  provider: string,
  override?: string,
): ProviderKey {
  // 1. Override from request body
  if (override && override.length > 8) {
    return { key: override, source: 'request' }
  }

  // 2. Env var
  const envMap: Record<string, string> = {
    anthropic: 'ANTHROPIC_API_KEY',
    openai: 'OPENAI_API_KEY',
    deepseek: 'DEEPSEEK_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    gemini: 'GEMINI_API_KEY',
    minimax: 'MINIMAX_API_KEY',
    hermes: 'HERMES_API_KEY',
    openclaw: 'OPENCLAW_API_KEY',
    nvidia: 'NVIDIA_API_KEY',
    kimi: 'KIMI_API_KEY',
    moonshot: 'MOONSHOT_API_KEY',
    xai: 'XAI_API_KEY',
  }
  const envVar = envMap[provider]
  if (envVar && process.env[envVar]) {
    return { key: process.env[envVar]!, source: 'env' }
  }

  // 3. JSON file in .credentials/
  const fileMap: Record<string, string> = {
    anthropic: 'claude.json',
    openai: 'openai.json',
    deepseek: 'deepseek.json',
    openrouter: 'openrouter.json',
    gemini: 'gemini.json',
    kimi: 'kimi.json',
    moonshot: 'kimi.json',
    minimax: 'minimax.json',
    hermes: 'hermes.json',
    openclaw: 'openclaw.json',
    nvidia: 'nvidia.json',
    xai: 'xai.json',
  }
  const fileName = fileMap[provider]
  if (fileName) {
    const data = safeReadJson(join(CRED_DIR, fileName))
    if (data) {
      const key = pickKey(data, 'api_key', 'apiKey', 'key', 'token')
      if (key) {
        return { key, source: 'file', meta: data }
      }
    }
  }

  return { key: '', source: 'missing' }
}

/**
 * Get base URL for a provider, with optional override.
 */
export function getProviderBaseUrl(provider: string, override?: string): string {
  if (override) return override
  const envMap: Record<string, string> = {
    anthropic: 'ANTHROPIC_BASE_URL',
    openai: 'OPENAI_BASE_URL',
    deepseek: 'DEEPSEEK_BASE_URL',
    openrouter: 'OPENROUTER_BASE_URL',
    gemini: 'GEMINI_BASE_URL',
    kimi: 'KIMI_BASE_URL',
    moonshot: 'MOONSHOT_BASE_URL',
    minimax: 'MINIMAX_BASE_URL',
    hermes: 'HERMES_BASE_URL',
    openclaw: 'OPENCLAW_BASE_URL',
    nvidia: 'NVIDIA_BASE_URL',
  }
  const envVar = envMap[provider]
  if (envVar && process.env[envVar]) return process.env[envVar]!

  // Default URLs
  const defaults: Record<string, string> = {
    anthropic: 'https://api.anthropic.com/v1',
    openai: 'https://api.openai.com/v1',
    deepseek: 'https://api.deepseek.com/v1',
    openrouter: 'https://openrouter.ai/api/v1',
    gemini: 'https://generativelanguage.googleapis.com/v1beta/openai',
    kimi: 'https://api.moonshot.ai/v1',
    moonshot: 'https://api.moonshot.ai/v1',
    minimax: 'https://api.minimax.chat/v1',
    hermes: 'http://localhost:11434/v1',
    openclaw: 'http://localhost:18789/v1',
    nvidia: 'https://integrate.api.nvidia.com/v1',
  }
  return defaults[provider] || 'https://api.openai.com/v1'
}

/**
 * Provider health check — used by the model rail to show "✅" or "❌" next to each model.
 *
 * Sends a minimal "ping" request to the provider. Returns:
 *   { ok: true, latencyMs, model }
 *   { ok: false, error, source: 'missing' | 'http' | 'network' }
 */
export async function pingProvider(
  provider: string,
  model: string,
  override?: { apiKey?: string; baseUrl?: string },
): Promise<{ ok: boolean; latencyMs?: number; error?: string; model?: string; source?: string }> {
  const key = getApiKey(provider, override?.apiKey)
  if (!key.key) {
    return { ok: false, error: 'No API key', source: 'missing' }
  }

  const baseUrl = getProviderBaseUrl(provider, override?.baseUrl)
  const start = Date.now()

  try {
    if (provider === 'anthropic') {
      // Anthropic: POST a tiny message request
      const res = await fetch(`${baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': key.key,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: model.startsWith('claude-') ? model : 'claude-haiku-4',
          max_tokens: 8,
          messages: [{ role: 'user', content: 'hi' }],
        }),
        // Tight timeout for health check
        signal: AbortSignal.timeout(8000),
      })
      const latencyMs = Date.now() - start
      if (!res.ok) {
        const err = await res.text()
        return { ok: false, error: `HTTP ${res.status}: ${err.slice(0, 120)}`, latencyMs, source: 'http' }
      }
      return { ok: true, latencyMs, model: 'claude' }
    } else {
      // OpenAI-compat: POST a tiny chat completion
      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key.key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          max_tokens: 8,
          messages: [{ role: 'user', content: 'hi' }],
        }),
        signal: AbortSignal.timeout(8000),
      })
      const latencyMs = Date.now() - start
      if (!res.ok) {
        const err = await res.text()
        return { ok: false, error: `HTTP ${res.status}: ${err.slice(0, 120)}`, latencyMs, source: 'http' }
      }
      return { ok: true, latencyMs, model }
    }
  } catch (e: any) {
    return { ok: false, error: e?.message || 'network error', latencyMs: Date.now() - start, source: 'network' }
  }
}

/**
 * List all known providers with their credential status.
 * Used by the Settings modal to show which providers are configured.
 */
export function listProviderStatus(): Array<{
  provider: string
  keySource: 'env' | 'file' | 'missing'
  hasKey: boolean
  keyPreview?: string
}> {
  const providers = [
    'anthropic', 'openai', 'openrouter', 'deepseek', 'kimi', 'moonshot',
    'gemini', 'minimax', 'hermes', 'openclaw', 'nvidia', 'xai',
  ]
  return providers.map((p) => {
    const k = getApiKey(p)
    return {
      provider: p,
      keySource: k.source as 'env' | 'file' | 'missing',
      hasKey: !!k.key,
      keyPreview: k.key ? `${k.key.slice(0, 7)}…${k.key.slice(-4)}` : undefined,
    }
  })
}
