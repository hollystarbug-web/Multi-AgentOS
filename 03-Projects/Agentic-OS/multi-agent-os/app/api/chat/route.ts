import { NextRequest } from 'next/server'
import { AGENTS, getAgent, type AgentId } from '@/lib/agents'
import { getApiKey, getProviderBaseUrl } from '@/lib/credentials'

export const runtime = 'nodejs'

// ─── Provider detection ────────────────────────────────────────────────────────

type Provider = 'anthropic' | 'openai' | 'deepseek' | 'minimax' | 'openrouter' | 'nvidia' | 'gemini' | 'hermes' | 'openclaw' | 'kimi' | 'moonshot'

function getProvider(model: string): Provider {
  if (model.startsWith('claude-')) return 'anthropic'
  if (model.startsWith('kimi') || model.startsWith('moonshot')) return 'kimi'
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

function getHeaders(provider: Provider, key: string): Record<string, string> {
  switch (provider) {
    case 'anthropic':
      return {
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      }
    case 'deepseek':
    case 'openai':
    case 'kimi':
    case 'moonshot':
    case 'openrouter':
    case 'nvidia':
    case 'gemini':
    case 'hermes':
    case 'openclaw':
    case 'minimax':
      return {
        'Authorization': `Bearer ${key}`,
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
  if (systemPrompt && provider !== 'anthropic') {
    msgs.unshift({ role: 'system', content: systemPrompt })
  }

  switch (provider) {
    case 'anthropic': {
      const system = msgs.filter(m => m.role === 'system').map(m => m.content).join('\n')
      const conversation = msgs.filter(m => m.role !== 'system')
      if (systemPrompt && !system) {
        return {
          model,
          max_tokens: 8192,
          system: systemPrompt,
          messages: conversation.map(m => ({ role: m.role, content: m.content })),
          stream: true,
        }
      }
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
    case 'kimi':
    case 'moonshot':
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
      // Kimi requires temperature=1 or omitted
      const body: Record<string, unknown> = {
        model: actualModel,
        messages: msgs.map(m => ({ role: m.role, content: m.content })),
        stream: true,
        max_tokens: 8192,
      }
      // OpenAI-style reasoning_effort for thinking models
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
      case 'kimi':
      case 'moonshot':
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
    case 'kimi':
    case 'moonshot':
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
    apiKey,
    model: requestedModel,
    agentId,
  } = body as {
    messages: Array<{ role: string; content: string }>
    apiKey?: string
    model?: string
    agentId?: string
  }

  // Resolve the system prompt from the agent registry.
  const DEFAULT_SYSTEM_PROMPT = `You are an AI assistant running inside Multi-Agent OS — a custom AI mission control dashboard. You're being accessed from the operator's MacBook via a Next.js app that manages their AI agent fleet: a Hetzner VPS running OpenClaw (with agents Holly, Kryten, Sally, Grim, Oscar, Reggie), and a Mac Mini browsing node.

Be concise, direct, and technically precise. The operator is technical and building out an AI agent infrastructure.`

  let systemPrompt = DEFAULT_SYSTEM_PROMPT
  if (agentId) {
    const agent = getAgent(agentId)
    if (agent.systemPrompt) systemPrompt = agent.systemPrompt
    else if (agent.freeAgent) systemPrompt = '' // truly free
  }

  // Default to Claude Haiku 4.5 if no model specified (fast + free-tier ish)
  const model = (requestedModel as string) || 'claude-haiku-4-5'
  const provider = getProvider(model)

  // Get API key from credentials (server-side: env > file > request override)
  const keyInfo = getApiKey(provider, apiKey)
  const key = keyInfo.key

  // For thinking models, pull reasoning effort from the model config
  let reasoning: { effort: 'low' | 'medium' | 'high' } | undefined
  if (model === 'gpt-5.5-thinking' || model === 'o4-mini') {
    reasoning = { effort: 'high' }
  }

  if (!key) {
    return Response.json({
      error: `No API key for ${provider}. Add a credential at /root/.openclaw/workspace/.credentials/ or set ${provider.toUpperCase()}_API_KEY in env.`,
      provider,
      keySource: keyInfo.source,
    }, { status: 401 })
  }

  const baseUrl = getProviderBaseUrl(provider)
  const headers = getHeaders(provider, key)
  const requestBody = buildRequestBody(provider, model, messages, systemPrompt, reasoning)

  let fetchUrl: string
  switch (provider) {
    case 'anthropic':
      fetchUrl = `${baseUrl}/messages`
      break
    case 'deepseek':
    case 'openai':
    case 'kimi':
    case 'moonshot':
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
  const fetchOptions: RequestInit = { method: 'POST', headers, body: JSON.stringify(requestBody) }

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
    return Response.json({ error: `${provider} error: ${errorMessage}`, provider, model }, { status: res.status })
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
      'X-Key-Source': keyInfo.source,
    },
  })
}
