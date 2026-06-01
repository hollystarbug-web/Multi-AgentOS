import { NextRequest } from 'next/server'
import { AGENTS, getAgent, type AgentId } from '@/lib/agents'

export const runtime = 'nodejs'

// ─── Provider detection ────────────────────────────────────────────────────────

type Provider = 'anthropic' | 'openai' | 'deepseek' | 'minimax' | 'openrouter' | 'nvidia' | 'gemini' | 'hermes' | 'openclaw'

function getProvider(model: string): Provider {
  if (model.startsWith('claude-')) return 'anthropic'
  if (model.startsWith('deepseek-')) return 'deepseek'
  if (model.startsWith('gpt-') || model.startsWith('o4-') || model.startsWith('o3-') || model.startsWith('chatgpt-')) return 'openai'
  if (model.startsWith('MiniMax-')) return 'minimax'
  if (model.startsWith('nvidia/')) return 'nvidia'
  if (model.startsWith('gemini')) return 'gemini'
  if (model.startsWith('hermes')) return 'hermes'
  if (model.startsWith('openclaw')) return 'openclaw'
  if (model.includes('/')) return 'openrouter'
  return 'openai'
}

function getBaseUrl(provider: Provider): string {
  switch (provider) {
    case 'anthropic':  return 'https://api.anthropic.com/v1'
    case 'deepseek':   return 'https://api.deepseek.com/v1'
    case 'openai':     return 'https://api.openai.com/v1'
    case 'minimax':    return 'https://api.minimax.chat/v1'
    case 'openrouter': return 'https://openrouter.ai/api/v1'
    case 'nvidia':     return 'https://integrate.api.nvidia.com/v1'
    case 'gemini':     return 'https://generativelanguage.googleapis.com/v1beta/openai'
    case 'hermes':     return process.env.HERMES_BASE_URL || 'http://localhost:11434/v1'
    case 'openclaw':   return process.env.OPENCLAW_BASE_URL || 'http://localhost:18789/v1'
    default:           return 'https://api.openai.com/v1'
  }
}

function getHeaders(provider: Provider, key: string, model: string): Record<string, string> {
  switch (provider) {
    case 'anthropic':
      return {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
        'anthropic-dangerous-direct-browser-access': 'true',
      }
    case 'deepseek':
    case 'openai':
    case 'openrouter':
    case 'nvidia':
    case 'gemini':
    case 'hermes':
    case 'openclaw':
      return {
        'Authorization': `Bearer ${key}`,
        'content-type': 'application/json',
      }
    case 'minimax':
      return {
        'Authorization': `Bearer ${key}`,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      }
    default:
      return { 'Authorization': `Bearer ${key}`, 'content-type': 'application/json' }
  }
}

function buildRequestBody(
  provider: Provider,
  model: string,
  messages: Array<{ role: string; content: string }>,
  systemPrompt?: string,
  reasoning?: { effort: 'low' | 'medium' | 'high' },
): Record<string, unknown> {
  const msgs = [...messages]
  if (systemPrompt) {
    msgs.unshift({ role: 'system', content: systemPrompt })
  }

  switch (provider) {
    case 'anthropic': {
      const system = msgs.filter(m => m.role === 'system').map(m => m.content).join('\n')
      const conversation = msgs.filter(m => m.role !== 'system')
      return {
        model,
        max_tokens: 8192,
        system: system || undefined,
        messages: conversation.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }
    }
    case 'deepseek':
    case 'openai':
    case 'minimax':
    case 'openrouter':
    case 'nvidia':
    case 'gemini':
    case 'hermes':
    case 'openclaw': {
      let actualModel = model
      if (provider === 'nvidia') {
        actualModel = model.replace('nvidia/', 'deepseek-ai/')
      }
      const body: Record<string, unknown> = {
        model: actualModel,
        messages: msgs.map(m => ({ role: m.role, content: m.content })),
        stream: true,
      }
      if (provider === 'minimax' || provider === 'openai') {
        body.max_tokens = 8192
      }
      // OpenAI-style reasoning_effort for thinking models (gpt-5.5-thinking, o4-mini, etc.)
      if (reasoning && (provider === 'openai' || provider === 'openrouter')) {
        body.reasoning_effort = reasoning.effort
      }
      return body
    }
    default:
      return { model, messages: msgs.map(m => ({ role: m.role, content: m.content })), stream: true }
  }
}

function extractDelta(provider: Provider, event: Record<string, unknown>): string | null {
  try {
    switch (provider) {
      case 'anthropic':
        if (event.type === 'content_block_delta' && (event.delta as Record<string, unknown>)?.type === 'text_delta') {
          return (event.delta as Record<string, string>).text || null
        }
        break
      case 'deepseek':
      case 'openai':
      case 'minimax':
      case 'openrouter':
      case 'nvidia':
      case 'gemini':
      case 'hermes':
      case 'openclaw': {
        const choices = event.choices as Array<Record<string, unknown>> | undefined
        if (choices && choices.length > 0) {
          const delta = choices[0].delta as Record<string, unknown> | undefined
          if (delta && typeof delta.content === 'string') return delta.content
          if (delta && typeof delta.text === 'string') return delta.text
          // reasoning_content (DeepSeek R1, etc.) — surface it transparently
          if (delta && typeof (delta as any).reasoning_content === 'string') {
            return (delta as any).reasoning_content
          }
        }
        break
      }
    }
  } catch {}
  return null
}

function isDoneEvent(provider: Provider, event: Record<string, unknown>): boolean {
  switch (provider) {
    case 'anthropic': return event.type === 'message_stop' || event.type === 'message_delta'
    case 'deepseek':
    case 'openai':
    case 'minimax':
    case 'openrouter':
    case 'nvidia':
    case 'gemini':
    case 'hermes':
    case 'openclaw': {
      const choices = event.choices as Array<Record<string, unknown>> | undefined
      return choices?.[0]?.finish_reason != null
    }
    default: return false
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const {
    messages,
    apiKey, deepseekApiKey, openaiApiKey, nvidiaApiKey,
    openrouterApiKey, geminiApiKey, hermesApiKey, openclawApiKey,
    model: requestedModel,
    agentId,
  } = body as {
    messages: Array<{ role: string; content: string }>
    apiKey?: string
    deepseekApiKey?: string
    openaiApiKey?: string
    nvidiaApiKey?: string
    openrouterApiKey?: string
    geminiApiKey?: string
    hermesApiKey?: string
    openclawApiKey?: string
    model?: string
    agentId?: string
  }

  // Resolve the system prompt from the agent registry.
  // Free agents (e.g. agent-direct) have an empty prompt and get the default.
  const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant running inside Agentic OS — a custom AI mission control dashboard. You're being accessed from the operator's MacBook via a Next.js app that manages their AI agent fleet: a Hetzner VPS running OpenClaw (with agents Holly, Kryten, Sally, Grim, Oscar, Reggie), and a Mac Mini browsing node.

Be concise, direct, and technically precise. The operator is technical and building out an AI agent infrastructure.`

  let systemPrompt = DEFAULT_SYSTEM_PROMPT
  if (agentId) {
    const agent = getAgent(agentId)
    if (agent.systemPrompt) systemPrompt = agent.systemPrompt
    else if (agent.freeAgent) systemPrompt = '' // truly free
  }

  // Default to MiniMax-M3 if no model specified (free, fast, agent-friendly)
  const model = (requestedModel as string) || 'MiniMax-M3'
  const provider = getProvider(model)

  // Get the right API key for this provider
  let key = ''
  switch (provider) {
    case 'anthropic':  key = (apiKey as string) || ''; break
    case 'deepseek':   key = (deepseekApiKey as string) || ''; break
    case 'openai':     key = (openaiApiKey as string) || ''; break
    case 'minimax':    key = (apiKey as string) || process.env.MINIMAX_API_KEY || ''; break
    case 'openrouter': key = (openrouterApiKey as string) || (openaiApiKey as string) || process.env.OPENROUTER_API_KEY || ''; break
    case 'nvidia':     key = (nvidiaApiKey as string) || ''; break
    case 'gemini':     key = (geminiApiKey as string) || process.env.GEMINI_API_KEY || ''; break
    case 'hermes':     key = (hermesApiKey as string) || ''; break
    case 'openclaw':   key = (openclawApiKey as string) || ''; break
    default:           key = (apiKey as string) || ''
  }

  // For thinking models, pull reasoning effort from the model config
  let reasoning: { effort: 'low' | 'medium' | 'high' } | undefined
  if (model === 'gpt-5.5-thinking' || model === 'gpt-5.5-thinking' || model === 'o4-mini') {
    reasoning = { effort: 'high' }
  }

  if (!key && provider !== 'hermes' && provider !== 'openclaw') {
    return Response.json({
      error: `No API key for ${provider}. Add your ${provider} API key in Settings → API Keys.`,
    }, { status: 401 })
  }

  const baseUrl = getBaseUrl(provider)
  const headers = getHeaders(provider, key, model)
  const requestBody = buildRequestBody(provider, model, messages, systemPrompt, reasoning)

  let fetchUrl: string
  let fetchOptions: RequestInit

  switch (provider) {
    case 'anthropic':
      fetchUrl = `${baseUrl}/messages`
      break
    case 'deepseek':
    case 'openai':
    case 'minimax':
    case 'openrouter':
    case 'nvidia':
    case 'gemini':
    case 'hermes':
    case 'openclaw':
      fetchUrl = `${baseUrl}/chat/completions`
      break
    default:
      fetchUrl = `${baseUrl}/chat/completions`
  }
  fetchOptions = { method: 'POST', headers, body: JSON.stringify(requestBody) }

  let res: Response
  try {
    res = await fetch(fetchUrl, fetchOptions)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error'
    return Response.json({ error: `Connection failed: ${message}` }, { status: 502 })
  }

  if (!res.ok) {
    let errorMessage = `HTTP ${res.status}`
    try {
      const errData = await res.json()
      errorMessage = errData.error?.message || errData.error?.type || JSON.stringify(errData).slice(0, 200)
    } catch {}
    console.error(`${provider} API error:`, errorMessage)
    return Response.json({ error: `${provider} error: ${errorMessage}` }, { status: res.status })
  }

  if (!res.body) {
    return Response.json({ error: 'No response body' }, { status: 500 })
  }

  // ── Stream the response ────────────────────────────────────────────────────
  const encoder = new TextEncoder()
  const readable = new ReadableStream({
    async start(controller) {
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || trimmed === 'data: [DONE]' || trimmed === '[DONE]') {
              if (trimmed) controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
              continue
            }
            if (!trimmed.startsWith('data: ')) continue

            const dataStr = trimmed.slice(6).trim()
            if (!dataStr || dataStr === '[DONE]') continue

            try {
              const event = JSON.parse(dataStr)
              const delta = extractDelta(provider, event)
              if (delta) {
                const json = JSON.stringify({ delta: { text: delta } })
                controller.enqueue(encoder.encode(`data: ${json}\n\n`))
              }
              if (isDoneEvent(provider, event)) {
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
                break
              }
            } catch (e) {
              // Skip malformed JSON lines
            }
          }
        }
        controller.enqueue(encoder.encode(`data: [DONE]\n\n`))
        controller.close()
      } catch (streamErr) {
        console.error('Stream error:', streamErr)
        controller.error(streamErr)
      }
    },
  })

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Model-Provider': provider,
      'X-Model-Id': model,
      'X-Agent-Id': agentId || 'default',
    },
  })
}
