'use client'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,   // Holly — OpenClaw
  Bot,        // Kryten — OpenClaw
  ClipboardList, // Sally — OpenClaw
  Anchor,     // Grim — OpenClaw
  Star,       // Oscar — OpenClaw
  Shield,     // Reggie — OpenClaw
  Brain,      // Claude — Anthropic
  Zap,        // Hermes — fast/lightweight agent
  LayoutGrid, // Overview
  MessageSquare, // Chat
  Monitor,    // Nodes
  Target,     // Missions
  Terminal,   // Terminal
  Globe,      // OpenClaw platform
  BookOpen,  // Journal
  Flag,       // Goals
} from 'lucide-react'
import { useStore } from '@/lib/store'
import AgentAvatar from '@/components/ui/AgentAvatar'

// ── Provider badge colours ─────────────────────────────────────────────────
const PROVIDER_COLORS: Record<string, string> = {
  openclaw:  'rgba(6,182,212,1)',   // cyan  — OpenClaw agents
  anthropic: 'rgba(168,85,247,1)',   // violet — Claude / Anthropic
  custom:    'rgba(251,191,36,1)',  // amber  — Hermes / custom
}

type NavItemType = 'agent' | 'panel'

interface NavItem {
  id: string
  label: string
  icon: React.ElementType
  color: string
  provider?: string
  type: NavItemType
}

const AGENTS: NavItem[] = [
  { id: 'agent-holly',   label: 'Holly',     icon: Sparkles,       color: 'rgba(6,182,212,1)',   provider: 'openclaw',  type: 'agent' },
  { id: 'agent-kryten',  label: 'Kryten',    icon: Bot,            color: 'rgba(249,115,22,1)',  provider: 'openclaw',  type: 'agent' },
  { id: 'agent-sally',    label: 'Sally',     icon: ClipboardList,  color: 'rgba(139,92,246,1)',  provider: 'openclaw',  type: 'agent' },
  { id: 'agent-grim',    label: 'Grim',      icon: Anchor,         color: 'rgba(239,68,68,1)',   provider: 'openclaw',  type: 'agent' },
  { id: 'agent-oscar',    label: 'Oscar',     icon: Star,           color: 'rgba(251,191,36,1)',  provider: 'openclaw',  type: 'agent' },
  { id: 'agent-reggie',   label: 'Reggie',    icon: Shield,         color: 'rgba(16,185,129,1)',  provider: 'openclaw',  type: 'agent' },
  { id: 'agent-claude',   label: 'Claude',    icon: Brain,          color: 'rgba(168,85,247,1)',  provider: 'anthropic', type: 'agent' },
  { id: 'agent-hermes',   label: 'Hermes',    icon: Zap,            color: 'rgba(251,191,36,1)',  provider: 'custom',    type: 'agent' },
  { id: 'agent-direct',   label: 'Direct',    icon: MessageSquare,  color: 'rgba(255,255,255,1)', provider: 'direct',    type: 'agent' },
]

const PANELS: NavItem[] = [
  { id: 'overview',  label: 'Overview',        icon: LayoutGrid,     color: 'rgba(255,255,255,1)',  type: 'panel' },
  { id: 'chat',     label: 'Chat',             icon: MessageSquare,  color: 'rgba(168,85,247,1)',  type: 'panel' },
  { id: 'nodes',    label: 'Node Monitor',     icon: Monitor,       color: 'rgba(6,182,212,1)',   type: 'panel' },
  { id: 'missions', label: 'Mission Control',  icon: Target,        color: 'rgba(236,72,153,1)',  type: 'panel' },
  { id: 'terminal', label: 'Terminal',         icon: Terminal,      color: 'rgba(16,185,129,1)',  type: 'panel' },
  { id: 'openclaw', label: 'OpenClaw',         icon: Globe,         color: 'rgba(245,158,11,1)',  type: 'panel' },
  { id: 'journal',  label: 'Journal',          icon: BookOpen,      color: 'rgba(168,85,247,1)',  type: 'panel' },
  { id: 'goals',    label: 'Goals',             icon: Flag,          color: 'rgba(249,115,22,1)',  type: 'panel' },
]

const AVATAR_MAP: Record<string, string> = {
  'hetzner-vps': 'hetzner',
  'mac-mini':    'mac-mini',
  macbook:       'macbook',
}

const STATUS_MAP: Record<string, any> = {
  online: 'online', busy: 'busy', idle: 'idle', offline: 'offline',
}

function NavRow({ item, isActive, onClick }: { item: NavItem; isActive: boolean; onClick: () => void }) {
  const Icon = item.icon
  const c = item.color

  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 relative group"
      style={{
        background: isActive ? `${c}14)` : 'transparent',
        border: `1px solid ${isActive ? `${c}35)` : 'transparent'}`,
        boxShadow: isActive ? `0 0 16px ${c}18)` : 'none',
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <motion.div
          layoutId="sidebarActiveBar"
          className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
          style={{ background: `${c}1)` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${c}18)`, border: `1px solid ${c}35)` }}
      >
        <Icon size={14} style={{ color: `${c}1)` }} />
      </div>

      {/* Label + provider badge */}
      <div className="flex-1 min-w-0 text-left">
        <div
          className="text-xs font-semibold leading-none"
          style={{ color: isActive ? `${c}1)` : 'var(--text-2)' }}
        >
          {item.label}
        </div>
        {item.provider && (
          <div className="flex items-center gap-1 mt-1">
            <div
              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: PROVIDER_COLORS[item.provider] }}
            />
            <span className="text-[10px]" style={{ color: 'var(--text-4)' }}>
              {item.provider === 'openclaw' ? 'OpenClaw'
               : item.provider === 'anthropic' ? 'Anthropic'
               : item.provider === 'direct' ? 'No persona'
               : 'Custom'}
            </span>
          </div>
        )}
      </div>
    </motion.button>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="px-3 pt-4 pb-1.5 text-[10px] font-bold tracking-widest uppercase"
      style={{ color: 'var(--text-4)', letterSpacing: '0.1em' }}
    >
      {children}
    </div>
  )
}

export default function Sidebar() {
  const activePanel = useStore((s) => s.activePanel)
  const setActivePanel = useStore((s) => s.setActivePanel)
  const nodes = useStore((s) => s.nodes)

  const allItems = [...AGENTS, ...PANELS]
  const activeItem = allItems.find((i) => i.id === activePanel) ?? PANELS.find((i) => i.id === activePanel)

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="glass flex flex-col items-stretch py-4 gap-0 relative overflow-y-auto overflow-x-hidden"
      style={{
        width: 180,
        minHeight: 0,
        zIndex: 20,
        borderRight: '1px solid var(--glass-border)',
        flexShrink: 0,
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(255,255,255,0.08) transparent',
      }}
    >
      {/* Logo / App name */}
      <div className="px-4 pb-3 flex items-center gap-2.5" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(168,85,247,0.18)', border: '1px solid rgba(168,85,247,0.35)' }}
        >
          <Sparkles size={13} style={{ color: 'rgba(168,85,247,1)' }} />
        </div>
        <div>
          <div className="text-xs font-bold" style={{ color: 'var(--text-1)' }}>Multi-AgentOS</div>
          <div className="text-[10px]" style={{ color: 'var(--text-4)' }}>v1.0</div>
        </div>
      </div>

      {/* ── AGENTS ── */}
      <SectionLabel>Agents</SectionLabel>

      {AGENTS.map((item, i) => (
        <div key={item.id} className="px-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.06 + i * 0.04 }}
          >
            <NavRow
              item={item}
              isActive={activePanel === item.id}
              onClick={() => setActivePanel(item.id)}
            />
          </motion.div>
        </div>
      ))}

      {/* ── PANELS ── */}
      <SectionLabel>Panels</SectionLabel>

      {PANELS.map((item, i) => (
        <div key={item.id} className="px-2">
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.04 }}
          >
            <NavRow
              item={item}
              isActive={activePanel === item.id}
              onClick={() => setActivePanel(item.id)}
            />
          </motion.div>
        </div>
      ))}

      {/* Spacer */}
      <div className="flex-1 min-h-4" />

      {/* Divider */}
      <div className="mx-4 h-px mb-3" style={{ background: 'var(--glass-border)' }} />

      {/* Node avatars at bottom */}
      <div className="px-4 pb-1">
        <div className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--text-4)' }}>
          Nodes
        </div>
        <div className="flex flex-col gap-1.5">
          {nodes.map((node) => (
            <motion.button
              key={node.id}
              whileHover={{ scale: 1.05, x: 2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActivePanel(node.id === 'hetzner-vps' ? 'openclaw' : 'nodes')}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all"
              style={{ background: 'transparent' }}
            >
              <AgentAvatar
                id={AVATAR_MAP[node.id] as any || 'system'}
                size={22}
                status={STATUS_MAP[node.status]}
              />
              <div className="text-xs text-left" style={{ color: 'var(--text-3)' }}>
                <div className="leading-none">{node.name}</div>
                <div className="text-[10px] mt-0.5 capitalize" style={{ color: node.status === 'online' ? 'rgba(16,185,129,0.7)' : 'var(--text-4)' }}>
                  {node.status}
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.aside>
  )
}
