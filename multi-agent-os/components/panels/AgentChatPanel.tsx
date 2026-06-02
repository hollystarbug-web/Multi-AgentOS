'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Trash2, Sparkles, ChevronDown, Copy, Check, Mic, MicOff,
  AlertCircle, Plus, MessageSquare, BookOpen,
} from 'lucide-react'
import { useStore, ChatMessage } from '@/lib/store'
import AgentAvatar from '@/components/ui/AgentAvatar'
import { useVoiceInput } from '@/lib/useVoiceInput'
import {
  saveToVault, chatFilePath, chatFileHeader,
  formatChatEntry, todayStr,
} from '@/lib/vault'
import { MODELS, type ModelConfig, PROVIDER_COLORS } from '@/lib/models'
import { AGENTS, type AgentId } from '@/lib/agents'

interface AgentChatPanelProps {
  agentId: AgentId
}

export default function AgentChatPanel({ agentId }: AgentChatPanelProps) {
  const agent = AGENTS[agentId] || AGENTS['agent-direct']
  const accent = agent.accent
  const accentBg = agent.accentBg

  const [input, setInput] = useState('')
  const agentMessages = useStore((s) => s.agentMessages[agentId] || [])
  const addAgentMessage = useStore((s) => s.addAgentMessage)
  const clearAgentMessages = useStore((s) => s.clearAgentMessages)
  const agentModels = useStore((s) => s.agentModels)
  const setAgentModel = useStore((s) => s.setAgentModel)
  const isStreaming = useStore((s) => s.isStreaming)
  const setIsStreaming = useStore((s) => s.setIsStreaming)

  // Server-side model health (used to know if server has API key for this model)
  const [serverHealth, setServerHealth] = useState<Record<string, { status: string }>>({})
  useEffect(() => {
    let cancelled = false
    async function fetchHealth() {
      try {
        const r = await fetch('/api/models/health', { cache: 'no-store' })
        const data = await r.json()
        if (!cancelled && data.models) {
          const map: Record<string, { status: string }> = {}
          for (const m of data.models) map[m.id] = { status: m.status }
          setServerHealth(map)
        }
      } catch {}
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 60_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])

  // API keys
  const apiKey           = useStore((s) => s.apiKey)
  const deepseekApiKey   = useStore((s) => s.deepseekApiKey)
  const openaiApiKey     = useStore((s) => s.openaiApiKey)
  const nvidiaApiKey     = useStore((s) => s.nvidiaApiKey)
  const openrouterApiKey = useStore((s) => s.openrouterApiKey)
  const geminiApiKey     = useStore((s) => s.geminiApiKey)
  const hermesApiKey     = useStore((s) => s.hermesApiKey)
  const openclawApiKey   = useStore((s) => s.openclawApiKey)

  // Vault
  const vaultEnabled      = useStore((s) => s.vaultEnabled)
  const hetznerHost       = useStore((s) => s.hetznerHost)
  const vaultSshUser      = useStore((s) => s.vaultSshUser)
  const vaultSshKeyPath   = useStore((s) => s.vaultSshKeyPath)
  const vaultSshPassword  = useStore((s) => s.vaultSshPassword)
  const setVaultSaveStatus = useStore((s) => s.setVaultSaveStatus)

  // Resolve the model for this agent
  const effectiveModelId =
    agentModels[agentId] ||
    agent.defaultModel ||
    'MiniMax-M3'

  const model = MODELS[effectiveModelId] || MODELS['MiniMax-M3']

  // Has any key for this provider
  // First check client-side key (overrides), then fall back to server-side status from /api/models/health
  const hasProviderKey = (() => {
    // Client override keys (set in Settings)
    switch (model.provider) {
      case 'anthropic': if (apiKey) return true; break
      case 'openai': if (openaiApiKey) return true; break
      case 'deepseek': if (deepseekApiKey) return true; break
      case 'openrouter': if (openrouterApiKey || openaiApiKey) return true; break
      case 'nvidia': if (nvidiaApiKey) return true; break
      case 'gemini': if (geminiApiKey) return true; break
    }
    // Local endpoints don't need keys
    if (model.provider === 'hermes' || model.provider === 'openclaw') return true
    // Fall back to server-side health check — if status is 'ok' or 'quota', server has the key
    if (serverHealth && serverHealth[model.id]) {
      const s = serverHealth[model.id].status
      if (s === 'ok' || s === 'quota') return true
    }
    return false
  })()

  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const [showPersona, setShowPersona] = useState(false)

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    if (atBottom) scrollToBottom()
  }, [agentMessages, atBottom, scrollToBottom])

  const handleScroll = () => {
    const el = scrollRef.current
    if (!el) return
    const dist = el.scrollHeight - el.scrollTop - el.clientHeight
    setAtBottom(dist < 60)
  }

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 140) + 'px'
  }, [input])

  const sendMessage = async () => {
    if (!input.trim() || isStreaming) return
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }
    addAgentMessage(agentId, userMsg)
    setInput('')
    setIsStreaming(true)
    setAtBottom(true)

    const assistantId = crypto.randomUUID()
    addAgentMessage(agentId, { id: assistantId, role: 'assistant', content: '', timestamp: new Date() })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...agentMessages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          // Per-request key override (used to test new keys in Settings).
          // If unset, the server falls back to its own credential store.
          apiKey: apiKey || undefined,
          deepseekApiKey: deepseekApiKey || undefined,
          openaiApiKey: openaiApiKey || undefined,
          nvidiaApiKey: nvidiaApiKey || undefined,
          openrouterApiKey: openrouterApiKey || undefined,
          geminiApiKey: geminiApiKey || undefined,
          hermesApiKey: hermesApiKey || undefined,
          openclawApiKey: openclawApiKey || undefined,
          model: effectiveModelId,
          agentId,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        useStore.setState((s) => ({
          agentMessages: {
            ...s.agentMessages,
            [agentId]: (s.agentMessages[agentId] || []).map((m) =>
              m.id === assistantId ? { ...m, content: `⚠️ ${err.error || 'Error'}` } : m
            ),
          },
        }))
        setIsStreaming(false)
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) { setIsStreaming(false); return }
      let full = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        for (const line of decoder.decode(value).split('\n')) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6)
          if (data === '[DONE]') break
          try {
            const delta = JSON.parse(data)?.delta?.text || ''
            if (delta) {
              full += delta
              useStore.setState((s) => ({
                agentMessages: {
                  ...s.agentMessages,
                  [agentId]: (s.agentMessages[agentId] || []).map((m) =>
                    m.id === assistantId ? { ...m, content: full } : m
                  ),
                },
              }))
            }
          } catch {}
        }
      }
    } catch {
      useStore.setState((s) => ({
        agentMessages: {
          ...s.agentMessages,
          [agentId]: (s.agentMessages[agentId] || []).map((m) =>
            m.id === assistantId
              ? { ...m, content: '⚠️ Connection error. Check your API key in Settings.' }
              : m
          ),
        },
      }))
    } finally {
      setIsStreaming(false)

      if (vaultEnabled) {
        const assistantMsg = (useStore.getState().agentMessages[agentId] || []).find(
          (m) => m.id === assistantId
        )
        if (assistantMsg?.content && !assistantMsg.content.startsWith('⚠️')) {
          setVaultSaveStatus('saving')
          const date = todayStr()
          const isNew = agentMessages.filter(
            (m) => new Date(m.timestamp).toISOString().slice(0, 10) === date
          ).length <= 2
          const chunk =
            (isNew ? chatFileHeader(date, agent.name) : '') +
            formatChatEntry(
              userMsg.content,
              assistantMsg.content,
              assistantMsg.timestamp,
              agent.name,
              model.name
            )
          const result = await saveToVault({
            remotePath: chatFilePath(date, agent.name),
            content: chunk,
            append: !isNew,
            commitMessage: `chat: ${date} — ${agent.name} — Multi-Agent OS`,
            host: hetznerHost,
            sshUser: vaultSshUser || 'root',
            sshKeyPath: vaultSshKeyPath || undefined,
            sshPassword: vaultSshPassword || undefined,
          })
          setVaultSaveStatus(result.success ? 'saved' : 'error', result.error)
        }
      }
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const grouped = groupMessages(agentMessages)
  const Icon = agent.icon

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'transparent' }}>
      {/* Agent header strip */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0 relative"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div
          className="absolute left-0 right-0 bottom-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${accent}40 50%, transparent 100%)` }}
        />
        <div className="flex items-center gap-3 min-w-0">
          <motion.div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: accentBg,
              border: `1px solid ${accent}40`,
              boxShadow: `0 0 16px ${accent}25`,
            }}
            animate={{ boxShadow: [`0 0 16px ${accent}25`, `0 0 24px ${accent}35`, `0 0 16px ${accent}25`] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={16} style={{ color: `${accent}1)` }} />
          </motion.div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="font-bold text-sm" style={{ color: 'var(--text-1)' }}>
                {agent.name}
              </div>
              <div
                className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded"
                style={{ background: accentBg, color: `${accent}1)` }}
              >
                {agent.provider}
              </div>
              {!hasProviderKey && (
                <div className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(239,68,68,0.15)', color: '#f87171' }}>
                  ⚠ NO KEY
                </div>
              )}
            </div>
            <button
              onClick={() => setShowPersona(!showPersona)}
              className="text-xs text-left truncate max-w-[300px] hover:underline"
              style={{ color: 'var(--text-3)' }}
            >
              {agent.tagline}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => clearAgentMessages(agentId)}
            className="w-8 h-8 rounded-xl flex items-center justify-center transition-all btn-ghost"
            style={{ color: 'var(--text-3)' }}
            title="Clear conversation"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Persona popover */}
      <AnimatePresence>
        {showPersona && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute z-30 left-4 right-4 top-16 rounded-2xl p-4 max-h-72 overflow-y-auto"
            style={{
              background: 'rgba(10,15,25,0.98)',
              border: `1px solid ${accent}40`,
              backdropFilter: 'blur(20px)',
              boxShadow: `0 8px 32px ${accent}20`,
            }}
            onClick={() => setShowPersona(false)}
          >
            <div className="flex items-center gap-2 mb-2">
              <BookOpen size={12} style={{ color: `${accent}1)` }} />
              <div className="text-xs font-bold tracking-wider uppercase" style={{ color: `${accent}1)` }}>
                {agent.name} system prompt
              </div>
            </div>
            <pre
              className="text-xs whitespace-pre-wrap font-mono"
              style={{ color: 'var(--text-2)', lineHeight: '1.6' }}
            >
              {agent.systemPrompt || '— No persona. Direct model access. —'}
            </pre>
            <div className="text-[10px] mt-3" style={{ color: 'var(--text-4)' }}>
              Click anywhere to close
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {agentMessages.length === 0 ? (
          <EmptyState agent={agent} hasKey={hasProviderKey} onSuggestion={(s) => setInput(s)} />
        ) : (
          <div className="space-y-1 max-w-3xl mx-auto">
            {grouped.map((group) => (
              <MessageGroup
                key={group.id}
                group={group}
                agentId={agentId}
                agentName={agent.name}
                accent={accent}
                accentBg={accentBg}
              />
            ))}
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Scroll-to-bottom button */}
      <AnimatePresence>
        {!atBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 8 }}
            onClick={() => { setAtBottom(true); scrollToBottom() }}
            className="absolute bottom-24 right-6 w-8 h-8 rounded-full flex items-center justify-center glass-raised"
            style={{ zIndex: 10 }}
          >
            <ChevronDown size={14} style={{ color: 'var(--text-2)' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Input */}
      <InputBar
        input={input}
        setInput={setInput}
        onSend={sendMessage}
        onKeyDown={handleKey}
        textareaRef={textareaRef}
        isStreaming={isStreaming}
        hasKey={hasProviderKey}
        agent={agent}
        model={model}
      />
    </div>
  )
}

/* ── Empty state ── */
function EmptyState({ agent, hasKey, onSuggestion }: {
  agent: typeof AGENTS[AgentId]
  hasKey: boolean
  onSuggestion: (s: string) => void
}) {
  const Icon = agent.icon
  const accent = agent.accent
  const accentBg = agent.accentBg

  const SUGGESTIONS_BY_AGENT: Record<string, string[]> = {
    'agent-holly': [
      'What are my open invoices for Base Lift Services?',
      'Show me this week\'s schedule',
      'Run the daily diary summary',
    ],
    'agent-kryten': [
      'Audit my TypeScript file for any silent bugs',
      'Check that this command\'s syntax is correct',
      'Review this config for missing fields',
    ],
    'agent-sally': [
      'Extract the table from this PDF',
      'Compare these two invoices line by line',
      'Count rows in this CSV and flag anomalies',
    ],
    'agent-grim': [
      'Which invoices are > 60 days overdue?',
      'Send a final demand to customer X',
      'List the 3 longest-running jobs',
    ],
    'agent-oscar': [
      'Three options for migrating the SC dashboard',
      'Risk assessment of moving to a single VPS',
      'Should we drop the master chat panel?',
    ],
    'agent-reggie': [
      'Is this command safe to run? Check for credential leaks',
      'Show me a pre-flight for the cron migration',
      'Audit my SSH config for any issues',
    ],
    'agent-claude': [
      'Help me think through this problem',
      'Write me a python script',
      'Explain how this works',
    ],
    'agent-hermes': [
      'Define API',
      'Capital of France',
      'Today\'s date',
    ],
    'agent-direct': [
      'Just type anything…',
    ],
  }

  const suggestions = SUGGESTIONS_BY_AGENT[agent.id] || ['Start a conversation…']

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full gap-8 py-8 max-w-md mx-auto"
    >
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{
            background: accentBg,
            border: `1px solid ${accent}40`,
            boxShadow: `0 0 32px ${accent}25`,
          }}
        >
          <Icon size={28} style={{ color: `${accent}1)` }} />
        </motion.div>
        <div className="text-center">
          <div className="text-lg font-semibold mb-1" style={{ color: 'var(--text-1)' }}>
            {agent.name} is ready
          </div>
          <div className="text-sm" style={{ color: 'var(--text-3)' }}>
            {hasKey
              ? agent.tagline
              : `⚠️ Add your ${agent.provider} API key in Settings to begin`}
          </div>
        </div>
      </div>

      {hasKey && (
        <div className="w-full grid grid-cols-1 gap-2">
          {suggestions.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.01, borderColor: `${accent}59` }}
              whileTap={{ scale: 0.99 }}
              onClick={() => {
                // Defer to next tick to avoid setState-during-render
                setTimeout(() => onSuggestion(s), 0)
              }}
              className="text-left px-3 py-2.5 rounded-xl text-xs leading-relaxed glass-2 hover-ring transition-all"
              style={{ color: 'var(--text-2)', borderColor: 'var(--glass-border)' }}
            >
              {s}
            </motion.button>
          ))}
        </div>
      )}
    </motion.div>
  )
}

/* ── Message grouping ── */
interface MsgGroup {
  id: string
  role: 'user' | 'assistant'
  messages: ChatMessage[]
  showAvatar: boolean
}

function groupMessages(msgs: ChatMessage[]): MsgGroup[] {
  const groups: MsgGroup[] = []
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i]
    const prev = msgs[i - 1]
    const sameAuthor = prev?.role === msg.role
    const withinWindow = prev
      ? (new Date(msg.timestamp).getTime() - new Date(prev.timestamp).getTime()) < 120_000
      : false
    const shouldGroup = sameAuthor && withinWindow

    if (shouldGroup && groups.length > 0) {
      groups[groups.length - 1].messages.push(msg)
    } else {
      groups.push({ id: msg.id, role: msg.role, messages: [msg], showAvatar: true })
    }
  }
  return groups
}

/* ── Message group ── */
function MessageGroup({ group, agentId, agentName, accent, accentBg }: {
  group: MsgGroup
  agentId: AgentId
  agentName: string
  accent: string
  accentBg: string
}) {
  const isUser = group.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end mb-4`}
    >
      <div className="flex-shrink-0 w-8">
        {group.showAvatar && (
          isUser ? <AgentAvatar id="user" size={32} /> : (
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{
                background: accentBg,
                border: `1px solid ${accent}40`,
              }}
            >
              {(() => {
                const Icon = AGENTS[agentId].icon
                return <Icon size={14} style={{ color: `${accent}1)` }} />
              })()}
            </div>
          )
        )}
      </div>

      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {group.messages.map((msg, i) => (
          <Bubble
            key={msg.id}
            msg={msg}
            isUser={isUser}
            isFirst={i === 0}
            isLast={i === group.messages.length - 1}
            accent={accent}
            accentBg={accentBg}
            agentName={agentName}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Individual bubble ── */
function Bubble({ msg, isUser, isFirst, isLast, accent, accentBg, agentName }: {
  msg: ChatMessage
  isUser: boolean
  isFirst: boolean
  isLast: boolean
  accent: string
  accentBg: string
  agentName: string
}) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const renderContent = (text: string) => {
    if (!text) return <TypingIndicator />
    const parts = text.split(/(```[\s\S]*?```)/g)
    return parts.map((part, i) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const lines = part.slice(3, -3).split('\n')
        const lang = lines[0].trim()
        const code = lines.slice(1).join('\n')
        return (
          <code key={i} className="chat-code">
            {lang && <span style={{ color: 'var(--text-3)', display: 'block', marginBottom: 4, fontSize: 10 }}>{lang}</span>}
            {code}
          </code>
        )
      }
      return <span key={i} style={{ whiteSpace: 'pre-wrap' }}>{part}</span>
    })
  }

  const ts = new Date(msg.timestamp).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        layout
        className="px-4 py-2.5 text-sm leading-relaxed relative"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, rgba(139,92,246,0.22), rgba(109,40,217,0.18))'
            : `linear-gradient(135deg, ${accentBg} 0%, rgba(255,255,255,0.02) 100%)`,
          border: isUser
            ? '1px solid rgba(139,92,246,0.3)'
            : `1px solid ${accent}30`,
          color: 'var(--text-1)',
          borderRadius: isUser
            ? `${isFirst ? 18 : 6}px ${isFirst ? 18 : 18}px ${isLast ? 4 : 18}px 18px`
            : `${isFirst ? 18 : 18}px ${isFirst ? 18 : 6}px 18px ${isLast ? 4 : 18}px`,
          boxShadow: isUser
            ? '0 2px 12px rgba(139,92,246,0.12)'
            : `0 2px 12px ${accent}0C`,
          backdropFilter: 'blur(12px)',
        }}
      >
        {renderContent(msg.content)}
      </motion.div>

      <AnimatePresence>
        {hovered && msg.content && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            className={`absolute top-1 flex items-center gap-1 ${isUser ? 'right-full mr-2' : 'left-full ml-2'}`}
          >
            <button
              onClick={copyText}
              className="w-6 h-6 rounded-lg flex items-center justify-center glass-raised transition-all"
              style={{ color: copied ? '#10b981' : 'var(--text-3)' }}
            >
              {copied ? <Check size={11} /> : <Copy size={11} />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute -bottom-5 text-xs ${isUser ? 'right-0' : 'left-0'}`}
            style={{ color: 'var(--text-4)', whiteSpace: 'nowrap' }}
          >
            {ts}{!isUser && ` · ${agentName}`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Typing indicator ── */
function TypingIndicator() {
  return (
    <span className="flex items-center gap-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-2 h-2 rounded-full inline-block"
          style={{ background: 'rgba(139,92,246,0.6)' }}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.18, ease: 'easeInOut' }}
        />
      ))}
    </span>
  )
}

/* ── Input bar ── */
interface InputBarProps {
  input: string
  setInput: React.Dispatch<React.SetStateAction<string>>
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent) => void
  textareaRef: React.RefObject<HTMLTextAreaElement>
  isStreaming: boolean
  hasKey: boolean
  agent: typeof AGENTS[AgentId]
  model: typeof MODELS[string]
}

function InputBar({ input, setInput, onSend, onKeyDown, textareaRef, isStreaming, hasKey, agent, model }: InputBarProps) {
  const canSend = !!input.trim() && !isStreaming && hasKey
  const accent = agent.accent

  const handleFinalTranscript = useCallback((text: string) => {
    setInput((prev) => {
      const trimmed = prev.trimEnd()
      return trimmed ? `${trimmed} ${text}` : text
    })
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [setInput, textareaRef])

  const voice = useVoiceInput({ onFinalTranscript: handleFinalTranscript })
  const isListening = voice.state === 'listening'

  const displayPlaceholder = isListening && voice.interimText
    ? voice.interimText
    : hasKey
    ? `Message ${agent.name}…`
    : `No API key for ${model.provider} — add one to .credentials/ or Settings`

  return (
    <div
      className="px-4 pb-4 pt-2 flex-shrink-0"
      style={{ borderTop: '1px solid var(--glass-border)' }}
    >
      <AnimatePresence>
        {voice.errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.97 }}
            className="flex items-center gap-2 mb-2 px-3 py-2 rounded-xl text-xs"
            style={{
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.25)',
              color: 'rgba(252,165,165,0.9)',
            }}
          >
            <AlertCircle size={12} />
            {voice.errorMessage}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mb-2"
          >
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
              style={{
                background: `${accent}10`,
                border: `1px solid ${accent}30`,
              }}
            >
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[1, 1.6, 0.8, 1.4, 1].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full"
                    style={{ background: `${accent}1)` }}
                    animate={{ scaleY: [h * 0.4, h, h * 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                    initial={{ height: 12, transformOrigin: 'center' }}
                  />
                ))}
              </div>
              <span style={{ color: 'var(--text-2)' }}>
                {voice.interimText
                  ? <span className="italic">"{voice.interimText}"</span>
                  : `Listening… speak to ${agent.name}`}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="flex items-end gap-2 px-3 py-2 rounded-2xl transition-all duration-200"
        style={{
          background: 'var(--glass-2)',
          border: `1px solid ${
            isListening
              ? `${accent}59`
              : input
              ? `${accent}4D`
              : 'var(--glass-border)'
          }`,
          boxShadow: isListening
            ? `0 0 20px ${accent}1A`
            : input
            ? `0 0 20px ${accent}14`
            : 'none',
        }}
      >
        <AgentAvatar id="user" size={28} />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={displayPlaceholder}
          rows={1}
          disabled={!hasKey}
          className="flex-1 bg-transparent resize-none text-sm outline-none py-1.5 px-1"
          style={{
            color: 'var(--text-1)',
            lineHeight: '1.55',
            maxHeight: 140,
            caretColor: `${accent}1)`,
          }}
        />

        {input.length > 200 && (
          <span className="text-xs self-center flex-shrink-0" style={{ color: 'var(--text-4)' }}>
            {input.length}
          </span>
        )}

        {voice.supported && (
          <MicButton
            state={voice.state}
            onToggle={voice.toggle}
            disabled={isStreaming}
            accent={accent}
          />
        )}

        <motion.button
          whileHover={canSend ? { scale: 1.08 } : {}}
          whileTap={canSend ? { scale: 0.92 } : {}}
          onClick={onSend}
          disabled={!canSend}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            background: canSend
              ? `linear-gradient(135deg, ${accent}CC, ${accent}99)`
              : 'rgba(255,255,255,0.05)',
            color: canSend ? 'white' : 'var(--text-4)',
            boxShadow: canSend ? `0 0 20px ${accent}59` : 'none',
            border: canSend ? `1px solid ${accent}80` : '1px solid transparent',
          }}
        >
          {isStreaming
            ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                <Sparkles size={15} />
              </motion.div>
            : <Send size={14} />
          }
        </motion.button>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2">
        <span className="text-xs" style={{ color: 'var(--text-4)' }}>
          Enter to send · Shift+Enter for newline
          {voice.supported && ' · 🎙 mic for voice'}
        </span>
      </div>
    </div>
  )
}

function MicButton({
  state, onToggle, disabled, accent,
}: {
  state: 'idle' | 'listening' | 'processing' | 'error'
  onToggle: () => void
  disabled?: boolean
  accent: string
}) {
  const isListening = state === 'listening'

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.1 } : {}}
      whileTap={!disabled ? { scale: 0.88 } : {}}
      onClick={onToggle}
      disabled={disabled}
      title={isListening ? 'Stop recording' : 'Start voice input'}
      className="relative w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
      style={{
        background: isListening
          ? `${accent}26`
          : 'rgba(255,255,255,0.055)',
        border: isListening
          ? `1px solid ${accent}73`
          : '1px solid rgba(255,255,255,0.1)',
        color: isListening ? `${accent}1)` : 'var(--text-3)',
        boxShadow: isListening ? `0 0 16px ${accent}33` : 'none',
      }}
    >
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: `2px solid ${accent}80` }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: `2px solid ${accent}4D` }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
        </>
      )}
      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
    </motion.button>
  )
}
