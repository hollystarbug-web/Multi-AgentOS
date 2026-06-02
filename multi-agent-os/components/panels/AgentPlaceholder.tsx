'use client'
import { motion } from 'framer-motion'
import { Bot, Sparkles, ClipboardList, Anchor, Star, Shield, Brain, Zap } from 'lucide-react'
import { useStore } from '@/lib/store'

const AGENT_META: Record<string, { label: string; provider: string; icon: React.ElementType; color: string }> = {
  'agent-holly':  { label: 'Holly',     provider: 'OpenClaw',   icon: Sparkles,       color: 'rgba(6,182,212,1)' },
  'agent-kryten': { label: 'Kryten',    provider: 'OpenClaw',   icon: Bot,            color: 'rgba(249,115,22,1)' },
  'agent-sally':  { label: 'Sally',     provider: 'OpenClaw',   icon: ClipboardList,  color: 'rgba(139,92,246,1)' },
  'agent-grim':   { label: 'Grim',      provider: 'OpenClaw',   icon: Anchor,         color: 'rgba(239,68,68,1)' },
  'agent-oscar':   { label: 'Oscar',    provider: 'OpenClaw',   icon: Star,           color: 'rgba(251,191,36,1)' },
  'agent-reggie': { label: 'Reggie',    provider: 'OpenClaw',   icon: Shield,         color: 'rgba(16,185,129,1)' },
  'agent-claude': { label: 'Claude',    provider: 'Anthropic',  icon: Brain,          color: 'rgba(168,85,247,1)' },
  'agent-hermes': { label: 'Hermes',    provider: 'Custom',    icon: Zap,            color: 'rgba(251,191,36,1)' },
}

export default function AgentPlaceholder({ agentId }: { agentId: string }) {
  const meta = AGENT_META[agentId]
  const Icon = meta?.icon ?? Bot
  const c = meta?.color ?? 'rgba(255,255,255,1)'

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6">
      {/* Agent avatar / icon */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="relative"
      >
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center"
          style={{
            background: `${c}14`,
            border: `2px solid ${c}40`,
            boxShadow: `0 0 60px ${c}20, 0 0 120px ${c}10`,
          }}
        >
          <Icon size={36} style={{ color: c }} />
        </div>
        {/* Pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ border: `2px solid ${c}30` }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>

      {/* Agent info */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="text-center"
      >
        <div className="text-xl font-bold mb-1" style={{ color: 'var(--text-1)' }}>
          {meta?.label ?? agentId}
        </div>
        <div
          className="text-xs px-3 py-1 rounded-full inline-flex items-center gap-1.5"
          style={{
            background: `${c}12`,
            border: `1px solid ${c}30`,
            color: c,
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: c }} />
          {meta?.provider ?? 'Agent'}
        </div>
      </motion.div>

      {/* Coming soon */}
      <motion.div
        initial={{ y: 8, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-center"
      >
        <div
          className="text-sm px-5 py-3 rounded-2xl"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-3)',
          }}
        >
          Chat interface for this agent<br />is being built
        </div>
      </motion.div>
    </div>
  )
}
