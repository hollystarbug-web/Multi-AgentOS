import Anthropic from '@anthropic-ai/sdk'
import { NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { messages, apiKey } = body

  const key = apiKey || process.env.ANTHROPIC_API_KEY
  if (!key) {
    return Response.json({ error: 'No API key. Set it in Settings or add ANTHROPIC_API_KEY to .env.local' }, { status: 401 })
  }

  const client = new Anthropic({ apiKey: key })

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-5',
      max_tokens: 4096,
      system: `You are Claude, running inside Openclaw OS — a custom AI mission control dashboard built by the operator. You're being accessed from their MacBook via a local Next.js app that manages their fleet: a Hetzner VPS running Openclaw, and a Mac Mini browsing node.

Be concise, direct, and technically precise. You can assist with: coding, infrastructure questions, agent orchestration strategy, debugging, analysis, and general tasks. The operator is technical and building out an AI agent infrastructure.`,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              const data = JSON.stringify({ delta: { text: event.delta.text } })
              controller.enqueue(encoder.encode(`data: ${data}\n\n`))
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'))
          controller.close()
        } catch (e) {
          controller.error(e)
        }
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err: any) {
    console.error('Anthropic API error:', err)
    return Response.json(
      { error: err.message || 'Claude API error' },
      { status: err.status || 500 }
    )
  }
}
