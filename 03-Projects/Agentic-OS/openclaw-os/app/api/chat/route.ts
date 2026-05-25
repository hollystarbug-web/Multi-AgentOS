import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

// ─── Provider detection ────────────────────────────────────────────────────────

function getProvider(model: string): 'anthropic' | 'openai' | 'deepseek' | 'minimax' | 'openrouter' {
  if (model.startsWith('claude-')) return 'anthropic'
  if (model.startsWith('deepseek-')) return 'deepseek'
  if (model.startsWith('gpt-') || model.startsWith('o4-') || model.startsWith('o3-') || model.startsWith('chatgpt-')) return 'openai'
  if (model.startsWith('MiniMax-')) return 'minimax'
  if (model.includes('/')) return 'openrouter'  // e.g. qwen/qwen3.6-plus via openrouter
  return 'openai'  // default fallback
}

function getBaseUrl(provider: string): string {
  switch (provider) {
    case 'anthropic': return 'https://api.anthropic.com/v1'
    case 'deepseek': return 'https://api.deepseek.com/v1'
    case 'openai': return 'https://api.openai.com/v1'
    case 'minimax': return 'https://api.minimax.io/anthropic'
    case 'openrouter': return 'https://openrouter.ai/api/v1'
    default: return 'https://api.openai.com/v1'
  }
}

function getHeaders(provider: string, key: string, model: string): Record<string, string> {
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

function buildRequestBody(provider: string, model: string, messages: Array<{ role: string; content: string }>, systemPrompt?: string): Record<string, unknown> {
  // Build messages array with optional system prompt prepended
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
    case 'openrouter': {
      return {
        model,
        messages: msgs.map(m => ({ role: m.role, content: m.content })),
        stream: true,
        ...(provider === 'minimax' ? { max_tokens: 8192 } : {}),
      }
    }
    default:
      return { model, messages: msgs.map(m => ({ role: m.role, content: m.content })), stream: true }
  }
}

function extractDelta(provider: string, event: Record<string, unknown>): string | null {
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
      case 'openrouter': {
        const choices = event.choices as Array<Record<string, unknown>> | undefined
        if (choices && choices.length > 0) {
          const delta = choices[0].delta as Record<string, unknown> | undefined
          if (delta && typeof delta.content === 'string') return delta.content
          if (delta && typeof delta.text === 'string') return delta.text
        }
        break
      }
    }
  } catch {}
  return null
}

function isDoneEvent(provider: string, event: Record<string, unknown>): boolean {
  switch (provider) {
    case 'anthropic': return event.type === 'message_stop' || event.type === 'message_delta'
    case 'deepseek':
    case 'openai':
    case 'minimax':
    case 'openrouter': {
      const choices = event.choices as Array<Record<string, unknown>> | undefined
      return choices?.[0]?.finish_reason != null
    }
    default: return false
  }
}

// ─── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an AI assistant running inside Agentic OS — a custom AI mission control dashboard. You're being accessed from the operator's MacBook via a Next.js app that manages their AI agent fleet: a Hetzner VPS running OpenClaw (with agents Holly, Kryten, Sally, Grim, Oscar, Reggie), and a Mac Mini browsing node.

Be concise, direct, and technically precise. You can assist with: coding, infrastructure questions, agent orchestration strategy, debugging, analysis, and general tasks. The operator is technical and building out an AI agent infrastructure.`

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { messages, apiKey, deepseekApiKey, openaiApiKey, model: requestedModel } = body as {
    messages: Array<{ role: string; content: string }>
    apiKey?: string
    deepseekApiKey?: string
    openaiApiKey?: string
    model?: string
  }

  // Default to deepseek-v4-flash if no model specified
  const model = (requestedModel as string) || 'deepseek-v4-flash'
  const provider = getProvider(model)

  // Get the right API key for this provider
  let key = ''
  switch (provider) {
    case 'anthropic': key = (apiKey as string) || ''; break
    case 'deepseek': key = (deepseekApiKey as string) || ''; break
    case 'openai': key = (openaiApiKey as string) || ''; break
    case 'minimax': key = (apiKey as string) || ''; break  // MiniMax uses same as Anthropic format
    case 'openrouter': key = (openaiApiKey as string) || process.env.OPENROUTER_API_KEY || ''; break
    default: key = (apiKey as string) || ''
  }

  if (!key) {
    return Response.json({
      error: `No API key for ${provider}. Add your ${provider} API key in Settings → ${provider} section.`,
    }, { status: 401 })
  }

  const baseUrl = getBaseUrl(provider)
  const headers = getHeaders(provider, key, model)
  const requestBody = buildRequestBody(provider, model, messages, SYSTEM_PROMPT)

  let fetchUrl: string
  let fetchOptions: RequestInit

  switch (provider) {
    case 'anthropic':
      fetchUrl = `${baseUrl}/messages`
      fetchOptions = { method: 'POST', headers, body: JSON.stringify(requestBody) }
      break
    case 'deepseek':
    case 'openai':
    case 'minimax':
    case 'openrouter':
      fetchUrl = `${baseUrl}/chat/completions`
      fetchOptions = { method: 'POST', headers, body: JSON.stringify(requestBody) }
      break
    default:
      fetchUrl = `${baseUrl}/chat/completions`
      fetchOptions = { method: 'POST', headers, body: JSON.stringify(requestBody) }
  }

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
          buffer = lines.pop() || ''  // Keep incomplete line for next iteration

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
        // Final done signal
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
    },
  })
}
