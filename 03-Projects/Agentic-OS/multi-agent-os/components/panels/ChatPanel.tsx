'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Trash2, Sparkles, ChevronDown, Copy, Check, Mic, MicOff, AlertCircle } from 'lucide-react'
import { useStore, ChatMessage } from '@/lib/store'
import AgentAvatar from '@/components/ui/AgentAvatar'
import { useVoiceInput } from '@/lib/useVoiceInput'
import {
  saveToVault, chatFilePath, chatFileHeader,
  formatChatEntry, todayStr,
} from '@/lib/vault'
import { MODELS, getProviders, getModelsByProvider, type ModelConfig } from '@/lib/models'

export default function ChatPanel() {
  const [input, setInput] = useState('')
  const messages = useStore((s) => s.messages)
  const addMessage = useStore((s) => s.addMessage)
  const clearMessages = useStore((s) => s.clearMessages)
  const isStreaming = useStore((s) => s.isStreaming)
  const setIsStreaming = useStore((s) => s.setIsStreaming)
  const apiKey = useStore((s) => s.apiKey)
  const deepseekApiKey = useStore((s) => s.deepseekApiKey)
  const openaiApiKey = useStore((s) => s.openaiApiKey)
  const nvidiaApiKey = useStore((s) => s.nvidiaApiKey)
  const selectedModel = useStore((s) => s.selectedModel)
  const setSelectedModel = useStore((s) => s.setSelectedModel)
  const defaultModel = useStore((s) => s.defaultModel || 'nvidia/deepseek-v4-flash')
  const fallbackModel = useStore((s) => s.fallbackModel || 'MiniMax-M2.7-highspeed')
  const vaultEnabled      = useStore((s) => s.vaultEnabled)
  const hetznerHost       = useStore((s) => s.hetznerHost)
  const vaultSshUser      = useStore((s) => s.vaultSshUser)
  const vaultSshKeyPath   = useStore((s) => s.vaultSshKeyPath)
  const vaultSshPassword  = useStore((s) => s.vaultSshPassword)
  const setVaultSaveStatus = useStore((s) => s.setVaultSaveStatus)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [atBottom, setAtBottom] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' })
  }, [])

  useEffect(() => {
    if (atBottom) scrollToBottom()
  }, [messages, atBottom, scrollToBottom])

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
    addMessage(userMsg)
    setInput('')
    setIsStreaming(true)
    setAtBottom(true)

    const assistantId = crypto.randomUUID()
    addMessage({ id: assistantId, role: 'assistant', content: '', timestamp: new Date() })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({ role: m.role, content: m.content })),
          apiKey,
          deepseekApiKey,
          openaiApiKey,
          nvidiaApiKey,
          model: selectedModel,
        }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Request failed' }))
        useStore.setState((s) => ({
          messages: s.messages.map((m) =>
            m.id === assistantId ? { ...m, content: `⚠️ ${err.error || 'Error'}` } : m
          ),
        }))
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (!reader) return
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
                messages: s.messages.map((m) =>
                  m.id === assistantId ? { ...m, content: full } : m
                ),
              }))
            }
          } catch {}
        }
      }
    } catch {
      useStore.setState((s) => ({
        messages: s.messages.map((m) =>
          m.id === assistantId
            ? { ...m, content: '⚠️ Connection error. Check your API key in Settings.' }
            : m
        ),
      }))
    } finally {
      setIsStreaming(false)

      // ── Vault save ───────────────────────────────────────────────
      if (vaultEnabled) {
        // userMsg is already in scope — just grab the final assistant content from store
        const assistantMsg = useStore.getState().messages.find((m) => m.id === assistantId)
        if (assistantMsg?.content && !assistantMsg.content.startsWith('⚠️')) {
          setVaultSaveStatus('saving')
          const date    = todayStr()
          const isNew   = messages.filter(
            (m) => new Date(m.timestamp).toISOString().slice(0, 10) === date
          ).length <= 2 // just these two
          const chunk   = (isNew ? chatFileHeader(date) : '') +
            formatChatEntry(userMsg.content, assistantMsg.content, assistantMsg.timestamp)
          const result = await saveToVault({
            remotePath: chatFilePath(date),
            content: chunk,
            append: !isNew,
            commitMessage: `chat: ${date} — Multi-Agent OS`,
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

  // Group consecutive messages from same role within 2 min
  const grouped = groupMessages(messages)

  return (
    <div className="flex flex-col h-full" style={{ background: 'transparent' }}>
      {/* Header */}
      <ChatHeader
        onClear={clearMessages}
        selectedModel={selectedModel}
        onModelChange={setSelectedModel}
        fallbackModel={fallbackModel}
        apiKey={apiKey}
        deepseekApiKey={deepseekApiKey}
        nvidiaApiKey={nvidiaApiKey}
      />

      {/* Messages */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto min-h-0 px-4 py-4"
        style={{ scrollbarWidth: 'thin' }}
      >
        {messages.length === 0 ? (
          <EmptyState hasKey={!!apiKey} />
        ) : (
          <div className="space-y-1 max-w-3xl mx-auto">
            {grouped.map((group) => (
              <MessageGroup key={group.id} group={group} />
            ))}
          </div>
        )}
        <div ref={bottomRef} className="h-4" />
      </div>

      {/* Scroll to bottom button */}
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

      {/* Input bar */}
      <InputBar
        input={input}
        setInput={setInput}
        onSend={sendMessage}
        onKeyDown={handleKey}
        textareaRef={textareaRef}
        isStreaming={isStreaming}
        hasKey={!!apiKey}
      />
    </div>
  )
}

/* ── Header ── */
function ChatHeader({ onClear, selectedModel, onModelChange, fallbackModel, apiKey, deepseekApiKey, nvidiaApiKey }: {
  onClear: () => void
  selectedModel: string
  onModelChange: (m: string) => void
  fallbackModel: string
  apiKey: string
  deepseekApiKey: string
  nvidiaApiKey: string
}) {
  const [modelOpen, setModelOpen] = useState(false)
  const model = MODELS[selectedModel] || MODELS['nvidia/deepseek-v4-flash']
  const hasAnyKey = apiKey || deepseekApiKey || nvidiaApiKey

  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-center gap-3">
        <AgentAvatar id="claude" size={36} glow status={hasAnyKey ? 'online' : 'offline'} pulse={hasAnyKey} />
        <div>
          <div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>
            {hasAnyKey ? 'Agent' : 'No API Key'}
          </div>
          {/* Model selector button */}
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className="text-xs flex items-center gap-1.5 group"
            style={{ color: model?.color || 'var(--text-3)' }}
          >
            <motion.span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: hasAnyKey ? (model?.color || '#10b981') : '#6b7280' }}
              animate={hasAnyKey ? { opacity: [1, 0.4, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="group-hover:underline" style={{ color: model?.color || 'var(--text-3)' }}>
              {model?.name || 'deepseek-v4-flash'}
            </span>
            <span className="opacity-50">›</span>
          </button>
        </div>
      </div>

      {/* Model dropdown */}
      {modelOpen && (
        <div
          className="absolute z-50 mt-2 rounded-xl overflow-hidden shadow-xl"
          style={{
            background: 'rgba(10,15,25,0.98)',
            border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(20px)',
            minWidth: '280px',
            top: '60px',
            left: '20px',
          }}
        >
          <div className="px-3 py-2 text-xs font-semibold" style={{ color: 'var(--text-muted)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            Select Model — {hasAnyKey ? 'active' : '⚠️ No API key set'}
          </div>
          {getProviders().map((prov) => {
            const models = getModelsByProvider(prov.id)
            const hasProviderKey = prov.id === 'anthropic' ? !!apiKey : prov.id === 'deepseek' ? !!deepseekApiKey : prov.id === 'nvidia' ? !!nvidiaApiKey : true
            return (
              <div key={prov.id}>
                <div
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: hasProviderKey ? prov.color : '#6b7280', background: `${prov.color}08`, borderBottom: `1px solid ${prov.color}15` }}
                >
                  {prov.name} {hasProviderKey ? '' : '⚠️ (no key)'}
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onModelChange(m.id); setModelOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left transition-colors"
                    style={{ borderLeft: selectedModel === m.id ? `2px solid ${m.color}` : '2px solid transparent' }}
                  >
                    <span>{m.icon}</span>
                    <span className="flex-1">
                      <span className="text-white font-medium">{m.name}</span>
                      <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                        {m.bestFor.slice(0,2).join(', ')}
                      </span>
                    </span>
                    <span className="text-xs opacity-60">${m.costPerMillion.input}/M</span>
                    {selectedModel === m.id && <span style={{ color: m.color }}>✓</span>}
                  </button>
                ))}
              </div>
            )
          })}
          <div className="px-3 py-2 text-xs" style={{ borderTop: '1px solid rgba(255,255,255,0.06)', color: 'var(--text-muted)' }}>
            Default: {MODELS[selectedModel]?.name} · Fallback: {MODELS[fallbackModel]?.name}
          </div>
        </div>
      )}
      {modelOpen && <div className="fixed inset-0 z-40" onClick={() => setModelOpen(false)} />}

      <motion.button
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
        onClick={onClear}
        className="w-8 h-8 rounded-xl flex items-center justify-center btn-ghost"
        title="Clear conversation"
      >
        <Trash2 size={14} style={{ color: 'var(--text-3)' }} />
      </motion.button>
    </div>
  )
}

/* ── Empty state ── */
function EmptyState({ hasKey }: { hasKey: boolean }) {
  const SUGGESTIONS = [
    'Help me architect a multi-agent system',
    'Review my Openclaw configuration',
    'Write a shell script for node health checks',
    'Explain how to set up a Cloudflare tunnel',
  ]
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
        >
          <AgentAvatar id="claude" size={64} glow status="online" />
        </motion.div>
        <div className="text-center">
          <div className="text-lg font-semibold mb-1" style={{ color: 'var(--text-1)' }}>Claude is ready</div>
          <div className="text-sm" style={{ color: 'var(--text-3)' }}>
            {hasKey
              ? 'Start a conversation or pick a suggestion below'
              : '⚠️ Add your Anthropic API key in Settings to begin'}
          </div>
        </div>
      </div>

      {hasKey && (
        <div className="w-full grid grid-cols-2 gap-2">
          {SUGGESTIONS.map((s) => (
            <motion.button
              key={s}
              whileHover={{ scale: 1.02, borderColor: 'rgba(139,92,246,0.35)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                useStore.setState({ messages: [] })
                // Programmatically insert into input — use event
                const evt = new CustomEvent('suggestion', { detail: s })
                window.dispatchEvent(evt)
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
function MessageGroup({ group }: { group: MsgGroup }) {
  const isUser = group.role === 'user'
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-end mb-4`}
    >
      {/* Avatar — only show for first in group */}
      <div className="flex-shrink-0 w-8">
        {group.showAvatar && (
          <AgentAvatar id={isUser ? 'user' : 'claude'} size={32} />
        )}
      </div>

      {/* Bubbles */}
      <div className={`flex flex-col gap-1 max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {group.messages.map((msg, i) => (
          <Bubble
            key={msg.id}
            msg={msg}
            isUser={isUser}
            isFirst={i === 0}
            isLast={i === group.messages.length - 1}
          />
        ))}
      </div>
    </motion.div>
  )
}

/* ── Individual bubble ── */
function Bubble({ msg, isUser, isFirst, isLast }: {
  msg: ChatMessage; isUser: boolean; isFirst: boolean; isLast: boolean
}) {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  const copyText = () => {
    navigator.clipboard.writeText(msg.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  // Render message — detect code blocks
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
            : 'var(--glass-2)',
          border: isUser
            ? '1px solid rgba(139,92,246,0.3)'
            : '1px solid var(--glass-border)',
          color: 'var(--text-1)',
          borderRadius: isUser
            ? `${isFirst ? 18 : 6}px ${isFirst ? 18 : 18}px ${isLast ? 4 : 18}px 18px`
            : `${isFirst ? 18 : 18}px ${isFirst ? 18 : 6}px 18px ${isLast ? 4 : 18}px`,
          boxShadow: isUser
            ? '0 2px 12px rgba(139,92,246,0.12)'
            : '0 2px 12px rgba(0,0,0,0.2)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {renderContent(msg.content)}
      </motion.div>

      {/* Hover actions */}
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

      {/* Timestamp on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`absolute -bottom-5 text-xs ${isUser ? 'right-0' : 'left-0'}`}
            style={{ color: 'var(--text-4)', whiteSpace: 'nowrap' }}
          >
            {ts}
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
}

function InputBar({ input, setInput, onSend, onKeyDown, textareaRef, isStreaming, hasKey }: InputBarProps) {
  const canSend = !!input.trim() && !isStreaming && hasKey

  // Append final voice transcript to the existing input text
  const handleFinalTranscript = useCallback((text: string) => {
    setInput((prev) => {
      const trimmed = prev.trimEnd()
      return trimmed ? `${trimmed} ${text}` : text
    })
    // Focus the textarea so the user can review + edit before sending
    setTimeout(() => textareaRef.current?.focus(), 50)
  }, [setInput, textareaRef])

  const voice = useVoiceInput({ onFinalTranscript: handleFinalTranscript })
  const isListening = voice.state === 'listening'

  // Merge live interim text into a display value (shown as placeholder-style overlay)
  const displayPlaceholder = isListening && voice.interimText
    ? voice.interimText
    : hasKey
    ? 'Message Claude…'
    : 'Set your API key in Settings first…'

  // Listen for suggestion events from EmptyState
  useEffect(() => {
    const handler = (e: Event) => {
      setInput((e as CustomEvent).detail)
      textareaRef.current?.focus()
    }
    window.addEventListener('suggestion', handler)
    return () => window.removeEventListener('suggestion', handler)
  }, [setInput, textareaRef])

  return (
    <div
      className="px-4 pb-4 pt-2 flex-shrink-0"
      style={{ borderTop: '1px solid var(--glass-border)' }}
    >
      {/* Error toast */}
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

      {/* Listening banner */}
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
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
              }}
            >
              {/* Animated waveform bars */}
              <div className="flex items-center gap-0.5 flex-shrink-0">
                {[1, 1.6, 0.8, 1.4, 1].map((h, i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 rounded-full"
                    style={{ background: '#ef4444' }}
                    animate={{ scaleY: [h * 0.4, h, h * 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.12, ease: 'easeInOut' }}
                    initial={{ height: 12, transformOrigin: 'center' }}
                  />
                ))}
              </div>
              <span style={{ color: 'rgba(252,165,165,0.85)' }}>
                {voice.interimText
                  ? <span className="italic">"{voice.interimText}"</span>
                  : 'Listening… speak now'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input row */}
      <div
        className="flex items-end gap-2 px-3 py-2 rounded-2xl transition-all duration-200"
        style={{
          background: 'var(--glass-2)',
          border: `1px solid ${
            isListening
              ? 'rgba(239,68,68,0.35)'
              : input
              ? 'rgba(139,92,246,0.3)'
              : 'var(--glass-border)'
          }`,
          boxShadow: isListening
            ? '0 0 20px rgba(239,68,68,0.1)'
            : input
            ? '0 0 20px rgba(139,92,246,0.08)'
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
            caretColor: 'var(--violet)',
          }}
        />

        {/* Char count */}
        {input.length > 200 && (
          <span className="text-xs self-center flex-shrink-0" style={{ color: 'var(--text-4)' }}>
            {input.length}
          </span>
        )}

        {/* Mic button */}
        {voice.supported && (
          <MicButton
            state={voice.state}
            onToggle={voice.toggle}
            disabled={isStreaming}
          />
        )}

        {/* Send button */}
        <motion.button
          whileHover={canSend ? { scale: 1.08 } : {}}
          whileTap={canSend ? { scale: 0.92 } : {}}
          onClick={onSend}
          disabled={!canSend}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            background: canSend
              ? 'linear-gradient(135deg, rgba(139,92,246,0.8), rgba(109,40,217,0.9))'
              : 'rgba(255,255,255,0.05)',
            color: canSend ? 'white' : 'var(--text-4)',
            boxShadow: canSend ? '0 0 20px rgba(139,92,246,0.35)' : 'none',
            border: canSend ? '1px solid rgba(139,92,246,0.5)' : '1px solid transparent',
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

/* ── Mic button with pulse ring ── */
function MicButton({
  state, onToggle, disabled,
}: {
  state: 'idle' | 'listening' | 'processing' | 'error'
  onToggle: () => void
  disabled?: boolean
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
          ? 'rgba(239,68,68,0.18)'
          : 'rgba(255,255,255,0.055)',
        border: isListening
          ? '1px solid rgba(239,68,68,0.45)'
          : '1px solid rgba(255,255,255,0.1)',
        color: isListening ? '#f87171' : 'var(--text-3)',
        boxShadow: isListening ? '0 0 16px rgba(239,68,68,0.2)' : 'none',
      }}
    >
      {/* Animated pulse ring when listening */}
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: '2px solid rgba(239,68,68,0.5)' }}
            animate={{ scale: [1, 1.35, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
          />
          <motion.div
            className="absolute inset-0 rounded-xl"
            style={{ border: '2px solid rgba(239,68,68,0.3)' }}
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
          />
        </>
      )}
      {isListening ? <MicOff size={15} /> : <Mic size={15} />}
    </motion.button>
  )
}

export { ChatHeader }
