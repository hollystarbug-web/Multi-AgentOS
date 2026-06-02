'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Trash2 } from 'lucide-react'
import { useStore, LogEntry } from '@/lib/store'
import PanelHeader from '@/components/ui/PanelHeader'

const LOG_TEMPLATES = [
  { level: 'info' as const, source: 'openclaw', messages: [
    'Agent heartbeat received from hetzner-vps',
    'Task queue processed: 3 items',
    'Memory checkpoint saved',
    'WebSocket connection established',
    'Cache invalidated for route /api/agents',
  ]},
  { level: 'success' as const, source: 'missions', messages: [
    'Mission "scrape competitor pricing" completed in 142s',
    'Report generated: weekly_summary_2025.md',
    'Agent sync completed across 3 nodes',
    'Backup snapshot created',
  ]},
  { level: 'warn' as const, source: 'monitor', messages: [
    'CPU spike detected on hetzner-vps: 78%',
    'Response latency above threshold: 2400ms',
    'Rate limit approaching: 85% of quota used',
    'Mac Mini idle for 30+ minutes',
  ]},
  { level: 'debug' as const, source: 'system', messages: [
    'GC pass completed: 240MB freed',
    'DNS resolution: api.anthropic.com → 104.18.x.x',
    'Token count: 4,218 / 200,000',
    'Retry attempt 1/3 for task id:8472',
  ]},
  { level: 'error' as const, source: 'network', messages: [
    'Connection timeout to external API',
    'Failed to fetch resource: 503 Service Unavailable',
  ]},
]

function randomLog(): LogEntry {
  const template = LOG_TEMPLATES[Math.floor(Math.random() * LOG_TEMPLATES.length)]
  const msg = template.messages[Math.floor(Math.random() * template.messages.length)]
  return {
    id: Math.random().toString(36).slice(2),
    timestamp: new Date(),
    level: template.level,
    source: template.source,
    message: msg,
  }
}

const LEVEL_STYLE: Record<LogEntry['level'], { color: string; bg: string; label: string }> = {
  info: { color: 'rgba(6,182,212,0.9)', bg: 'rgba(6,182,212,0.08)', label: 'INFO ' },
  success: { color: 'rgba(16,185,129,0.9)', bg: 'rgba(16,185,129,0.08)', label: 'OK   ' },
  warn: { color: 'rgba(245,158,11,0.9)', bg: 'rgba(245,158,11,0.08)', label: 'WARN ' },
  error: { color: 'rgba(239,68,68,0.9)', bg: 'rgba(239,68,68,0.08)', label: 'ERR  ' },
  debug: { color: 'rgba(139,92,246,0.6)', bg: 'rgba(139,92,246,0.05)', label: 'DEBUG' },
}

export default function TerminalPanel() {
  const logs = useStore((s) => s.logs)
  const addLog = useStore((s) => s.addLog)
  const clearLogs = useStore((s) => s.clearLogs)
  const [cmd, setCmd] = useState('')
  const [cmdHistory, setCmdHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [filter, setFilter] = useState<LogEntry['level'] | 'all'>('all')

  // Seed initial logs
  useEffect(() => {
    if (logs.length === 0) {
      for (let i = 0; i < 12; i++) addLog(randomLog())
    }
  }, [])

  // Stream new logs
  useEffect(() => {
    const id = setInterval(() => {
      if (Math.random() > 0.3) addLog(randomLog())
    }, 2500)
    return () => clearInterval(id)
  }, [addLog])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [logs])

  const handleCmd = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && cmd.trim()) {
      const entry = cmd.trim()
      addLog({
        id: Date.now().toString(),
        timestamp: new Date(),
        level: 'info',
        source: 'user',
        message: `$ ${entry}`,
      })
      // Mock responses
      const resp = mockResponse(entry)
      setTimeout(() => {
        addLog({
          id: Date.now().toString() + 'r',
          timestamp: new Date(),
          level: 'success',
          source: 'system',
          message: resp,
        })
      }, 300)
      setCmdHistory((h) => [entry, ...h])
      setCmd('')
      setHistIdx(-1)
    }
    if (e.key === 'ArrowUp') {
      const next = Math.min(histIdx + 1, cmdHistory.length - 1)
      setHistIdx(next)
      setCmd(cmdHistory[next] || '')
    }
    if (e.key === 'ArrowDown') {
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next)
      setCmd(next === -1 ? '' : cmdHistory[next])
    }
  }

  const filtered = filter === 'all' ? logs : logs.filter((l) => l.level === filter)

  return (
    <div className="flex flex-col h-full font-terminal">
      <PanelHeader
        title="Terminal"
        subtitle="Live log stream & command input"
        color="green"
        icon={<Terminal size={15} />}
        onClear={clearLogs}
      />

      {/* Filter tabs */}
      <div className="flex gap-1 px-4 pt-3 pb-2 flex-shrink-0">
        {(['all', 'info', 'success', 'warn', 'error', 'debug'] as const).map((level) => {
          const isActive = filter === level
          const style = level === 'all' ? { color: 'rgba(255,255,255,0.8)', bg: 'rgba(255,255,255,0.06)' } : LEVEL_STYLE[level as LogEntry['level']]
          return (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className="px-2 py-1 rounded text-xs font-mono transition-all"
              style={{
                background: isActive ? (level === 'all' ? 'rgba(255,255,255,0.1)' : style.bg) : 'transparent',
                color: isActive ? (level === 'all' ? 'white' : style.color) : 'rgba(255,255,255,0.3)',
                border: isActive ? `1px solid ${level === 'all' ? 'rgba(255,255,255,0.15)' : style.color}` : '1px solid transparent',
              }}
            >
              {level.toUpperCase()}
            </button>
          )
        })}
      </div>

      {/* Log stream */}
      <div
        className="flex-1 overflow-y-auto px-4 space-y-0.5 min-h-0"
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence initial={false}>
          {[...filtered].reverse().map((log) => {
            const s = LEVEL_STYLE[log.level]
            const ts = log.timestamp.toLocaleTimeString('en-US', { hour12: false })
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex items-start gap-2 py-0.5 px-2 rounded text-xs hover:bg-white/[0.02] transition-colors"
              >
                <span className="flex-shrink-0 font-mono" style={{ color: 'rgba(255,255,255,0.2)', minWidth: 60 }}>
                  {ts}
                </span>
                <span
                  className="flex-shrink-0 font-mono px-1.5 py-0.5 rounded text-xs"
                  style={{ background: s.bg, color: s.color, minWidth: 52, textAlign: 'center' }}
                >
                  {s.label.trim()}
                </span>
                <span className="flex-shrink-0" style={{ color: 'rgba(255,255,255,0.25)', minWidth: 60 }}>
                  [{log.source}]
                </span>
                <span style={{ color: log.level === 'error' ? 'rgba(252,165,165,0.9)' : 'rgba(255,255,255,0.75)' }}>
                  {log.message}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Command input */}
      <div
        className="px-4 py-3 flex items-center gap-2 flex-shrink-0"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span style={{ color: 'rgba(16,185,129,0.8)' }} className="text-sm">›</span>
        <input
          ref={inputRef}
          className="flex-1 bg-transparent outline-none text-sm font-terminal"
          style={{ color: 'rgba(255,255,255,0.85)', caretColor: '#10b981' }}
          placeholder="Enter command…"
          value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={handleCmd}
          spellCheck={false}
          autoComplete="off"
        />
        <span className="cursor-blink text-sm" style={{ color: '#10b981' }}>█</span>
      </div>
    </div>
  )
}

function mockResponse(cmd: string): string {
  const c = cmd.toLowerCase().trim()
  if (c === 'help') return 'Available: status, nodes, missions, clear, ping [host], uptime'
  if (c === 'status') return 'All systems operational. 3 nodes online, 2 missions running.'
  if (c === 'nodes') return 'hetzner-vps [online] | mac-mini [idle] | macbook [online]'
  if (c === 'uptime') return 'Control node uptime: 6h 44m | Fleet uptime: 14d 6h'
  if (c.startsWith('ping')) return `PING ${c.split(' ')[1] || 'localhost'}: 64 bytes, time=4.2ms TTL=64`
  if (c === 'missions') return '3 total: 1 pending, 1 running, 1 completed'
  if (c === 'clear') return '// Use the clear button in the header'
  return `zsh: command not found: ${cmd}`
}
