'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, X, Check, Sparkles, Zap, Brain, Settings, ChevronDown, AlertTriangle, Loader2 } from 'lucide-react'
import { useStore } from '@/lib/store'
import { MODELS, getProviders, type ModelConfig, type Provider, PROVIDER_COLORS } from '@/lib/models'
import { AGENTS, type AgentId } from '@/lib/agents'

interface ModelRailProps {
  agentId: AgentId
  currentModelId: string
  onSelect: (modelId: string) => void
  onAddModel: () => void
  collapsed?: boolean
  onToggleCollapse?: () => void
}

export default function ModelRail({
  agentId,
  currentModelId,
  onSelect,
  onAddModel,
  collapsed = false,
  onToggleCollapse,
}: ModelRailProps) {
  const [search, setSearch] = useState('')
  // Live health status per model: { [modelId]: { status, latencyMs, keySource, error } }
  const [health, setHealth] = useState<Record<string, { status: string; latencyMs?: number; keySource?: string; error?: string }>>({})
  const [healthLoading, setHealthLoading] = useState(false)
  
  // Fetch model health on mount + every 60s
  useEffect(() => {
    let cancelled = false
    async function fetchHealth() {
      setHealthLoading(true)
      try {
        const r = await fetch('/api/models/health', { cache: 'no-store' })
        const data = await r.json()
        if (!cancelled && data.models) {
          const map: typeof health = {}
          for (const m of data.models) {
            map[m.id] = { status: m.status, latencyMs: m.latencyMs, keySource: m.keySource, error: m.error }
          }
          setHealth(map)
        }
      } catch {}
      if (!cancelled) setHealthLoading(false)
    }
    fetchHealth()
    const interval = setInterval(fetchHealth, 60_000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [])
  const userModels = useStore((s) => s.userModels)
  const agent = AGENTS[agentId]

  // Merge stock + user-added models
  const allModels: ModelConfig[] = useMemo(() => {
    return Object.values({ ...MODELS, ...userModels })
  }, [userModels])

  const filtered = useMemo(() => {
    if (!search.trim()) return allModels
    const q = search.toLowerCase()
    return allModels.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.providerName.toLowerCase().includes(q) ||
        m.bestFor.some((b) => b.toLowerCase().includes(q))
    )
  }, [allModels, search])

  // Group by provider
  const grouped = useMemo(() => {
    const map = new Map<Provider, ModelConfig[]>()
    for (const m of filtered) {
      if (!map.has(m.provider)) map.set(m.provider, [])
      map.get(m.provider)!.push(m)
    }
    return map
  }, [filtered])

  const currentModel = allModels.find((m) => m.id === currentModelId)

  if (collapsed) {
    return (
      <button
        onClick={onToggleCollapse}
        className="flex items-center justify-center w-10 h-10 rounded-xl transition-all"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--glass-border)',
          color: 'var(--text-3)',
        }}
        title="Show model rail"
      >
        <Sparkles size={14} />
      </button>
    )
  }

  return (
    <motion.aside
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 80, opacity: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="glass flex flex-col relative overflow-hidden"
      style={{
        width: 300,
        flexShrink: 0,
        zIndex: 15,
        borderLeft: '1px solid var(--glass-border)',
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
      }}
    >
      {/* Header */}
      <div className="px-4 py-3 flex items-center gap-2" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <Sparkles size={14} style={{ color: 'var(--text-3)' }} />
        <div className="text-xs font-bold tracking-wider uppercase" style={{ color: 'var(--text-2)' }}>
          Models
        </div>
        <div className="flex-1" />
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="w-6 h-6 rounded-md flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-3)' }}
            title="Hide model rail"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Hero card — current model */}
      {currentModel && (
        <div className="px-4 py-4" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <div
            className="rounded-2xl p-4 relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${currentModel.color}1A 0%, ${currentModel.color}08 100%)`,
              border: `1px solid ${currentModel.color}40`,
              boxShadow: `0 0 32px ${currentModel.color}14`,
            }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: currentModel.color }}
                  />
                  <div className="text-[10px] font-bold tracking-wider uppercase" style={{ color: currentModel.color }}>
                    {currentModel.providerName}
                  </div>
                </div>
                <div className="text-sm font-bold mt-1" style={{ color: 'var(--text-1)' }}>
                  {currentModel.icon} {currentModel.name}
                </div>
                <div className="text-[10px] mt-1" style={{ color: 'var(--text-3)' }}>
                  {(currentModel.contextWindow / 1000).toFixed(0)}k ctx · {(currentModel.maxOutput / 1000).toFixed(0)}k out
                </div>
              </div>
              {currentModel.thinking && (
                <div
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(139,92,246,0.18)', color: 'rgb(167,139,250)' }}
                >
                  🧠 THINK
                </div>
              )}
              {/* Live health badge for current model */}
              {health[currentModel.id] && health[currentModel.id].status === 'ok' && health[currentModel.id].latencyMs ? (
                <div
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(52,211,153,0.15)', color: 'rgb(110,231,183)' }}
                  title={`Healthy · ${health[currentModel.id].latencyMs}ms`}
                >
                  ● {health[currentModel.id].latencyMs}ms
                </div>
              ) : health[currentModel.id] && health[currentModel.id].status === 'quota' ? (
                <div
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(251,191,36,0.15)', color: 'rgb(252,211,77)' }}
                  title="Out of credits"
                >
                  ⚠ QUOTA
                </div>
              ) : health[currentModel.id] && (health[currentModel.id].status === 'no-key' || health[currentModel.id].status === 'auth') ? (
                <div
                  className="text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(251,113,133,0.15)', color: 'rgb(252,165,165)' }}
                  title={health[currentModel.id].error || 'Credential issue'}
                >
                  ⚠ {health[currentModel.id].status === 'no-key' ? 'NO KEY' : 'AUTH'}
                </div>
              ) : null}
            </div>
            <div className="text-[10px] mt-2.5" style={{ color: 'var(--text-2)' }}>
              {currentModel.bestFor.slice(0, 2).join(' · ')}
            </div>
            <div className="flex items-center gap-2 mt-2 text-[10px]" style={{ color: 'var(--text-4)' }}>
              <span>${currentModel.costPerMillion.input}/M in</span>
              <span>·</span>
              <span>${currentModel.costPerMillion.output}/M out</span>
              {currentModel.costPerMillion.input === 0 && currentModel.costPerMillion.output === 0 && (
                <span
                  className="ml-auto text-[9px] font-bold tracking-wider px-1.5 py-0.5 rounded"
                  style={{ background: 'rgba(16,185,129,0.18)', color: 'rgb(52,211,153)' }}
                >
                  FREE
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="px-4 py-3">
        <div className="relative">
          <Search
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: 'var(--text-4)' }}
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search models…"
            className="input-glass w-full pl-8 pr-3 py-2 rounded-lg text-xs"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          />
        </div>
      </div>

      {/* Model grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-3" style={{ scrollbarWidth: 'thin' }}>
        {Array.from(grouped.entries()).map(([provider, models]) => {
          const providerColor = PROVIDER_COLORS[provider] || '#888'
          return (
            <div key={provider} className="mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ background: providerColor }}
                />
                <div
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: 'var(--text-4)' }}
                >
                  {models[0]?.providerName || provider}
                </div>
                <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
                <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>
                  {models.length}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-1.5">
                {models.map((m) => {
                  const isCurrent = m.id === currentModelId
                  const h = health[m.id]
                  return (
                    <motion.button
                      key={m.id}
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => onSelect(m.id)}
                      className="relative text-left rounded-lg p-2.5 transition-all"
                      style={{
                        background: isCurrent
                          ? `linear-gradient(135deg, ${m.color}1F 0%, ${m.color}0A 100%)`
                          : 'rgba(255,255,255,0.025)',
                        border: isCurrent ? `1px solid ${m.color}59` : '1px solid var(--glass-border)',
                        boxShadow: isCurrent ? `0 0 16px ${m.color}1F` : 'none',
                      }}
                    >
                      <div className="flex items-start gap-2">
                        <div className="text-sm flex-shrink-0 mt-0.5">{m.icon || '·'}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <div
                              className="text-xs font-semibold truncate"
                              style={{ color: isCurrent ? m.color : 'var(--text-1)' }}
                            >
                              {m.name}
                            </div>
                            {m.thinking && (
                              <span
                                className="text-[8px] font-bold px-1 rounded"
                                style={{ background: 'rgba(139,92,246,0.2)', color: 'rgb(167,139,250)' }}
                              >
                                🧠
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <div className="text-[10px] truncate" style={{ color: 'var(--text-4)' }}>
                              {(m.contextWindow / 1000).toFixed(0)}k ctx
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>
                              ·
                            </div>
                            <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>
                              {m.costPerMillion.input === 0 && m.costPerMillion.output === 0
                                ? 'FREE'
                                : `$${m.costPerMillion.input}/$${m.costPerMillion.output}`}
                            </div>
                          </div>
                        </div>
                        {/* Health badge */}
                        {h && (
                          <div
                            className="flex-shrink-0 mt-0.5"
                            title={
                              h.status === 'ok'
                                ? `Healthy · ${h.latencyMs}ms`
                                : h.status === 'quota'
                                  ? 'Out of credits'
                                  : h.status === 'auth'
                                    ? 'API key invalid'
                                    : h.status === 'no-key'
                                      ? 'No API key configured'
                                      : h.status === 'network'
                                        ? 'Network error'
                                        : 'Unknown status'
                            }
                          >
                            {h.status === 'ok' ? (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: 'rgb(52,211,153)' }}
                              />
                            ) : h.status === 'quota' ? (
                              <div
                                className="px-1 rounded text-[8px] font-bold"
                                style={{ background: 'rgba(251,191,36,0.2)', color: 'rgb(251,191,36)' }}
                              >
                                QUOTA
                              </div>
                            ) : h.status === 'auth' || h.status === 'no-key' ? (
                              <AlertTriangle size={11} style={{ color: 'rgb(251,113,133)' }} />
                            ) : h.status === 'network' ? (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: 'rgb(251,113,133)' }}
                              />
                            ) : (
                              <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: 'rgba(255,255,255,0.3)' }}
                              />
                            )}
                          </div>
                        )}
                        {isCurrent && !h && (
                          <Check
                            size={12}
                            className="flex-shrink-0 mt-1"
                            style={{ color: m.color }}
                          />
                        )}
                        {isCurrent && h && h.status === 'ok' && (
                          <Check
                            size={11}
                            className="flex-shrink-0 mt-1"
                            style={{ color: m.color }}
                          />
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>
            </div>
          )
        })}

        {/* Add model tile */}
        <motion.button
          whileHover={{ scale: 1.01, x: 2 }}
          whileTap={{ scale: 0.99 }}
          onClick={onAddModel}
          className="w-full rounded-lg p-3 flex items-center gap-2 transition-all"
          style={{
            background: 'transparent',
            border: '1.5px dashed var(--glass-border)',
            color: 'var(--text-3)',
          }}
        >
          <Plus size={14} />
          <div className="text-xs font-semibold">Add model</div>
        </motion.button>
      </div>

      {/* Footer — agent default model note */}
      <div
        className="px-4 py-3 text-[10px]"
        style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-4)' }}
      >
        <div className="flex items-center gap-1.5">
          <div
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: agent?.accent ? `${agent.accent}1)` : 'rgba(255,255,255,0.5)' }}
          />
          <span>
            {agent?.name} default:{' '}
            <span style={{ color: 'var(--text-2)' }}>
              {agent?.defaultModel}
            </span>
          </span>
        </div>
      </div>
    </motion.aside>
  )
}
