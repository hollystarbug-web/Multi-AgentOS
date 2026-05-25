'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Monitor, Target, Terminal, Globe, LayoutGrid, BookOpen } from 'lucide-react'
import { useStore } from '@/lib/store'
import AgentAvatar from '@/components/ui/AgentAvatar'

const NAV = [
  { id: 'overview',  label: 'Overview',        icon: LayoutGrid,    color: 'rgba(255,255,255,' },
  { id: 'chat',      label: 'Claude Chat',      icon: MessageSquare, color: 'rgba(139,92,246,' },
  { id: 'nodes',     label: 'Node Monitor',     icon: Monitor,       color: 'rgba(6,182,212,'  },
  { id: 'missions',  label: 'Mission Control',  icon: Target,        color: 'rgba(236,72,153,' },
  { id: 'terminal',  label: 'Terminal',         icon: Terminal,      color: 'rgba(16,185,129,' },
  { id: 'openclaw',  label: 'Openclaw',         icon: Globe,         color: 'rgba(245,158,11,' },
  { id: 'journal',   label: 'Journal',          icon: BookOpen,      color: 'rgba(168,85,247,' },
]

const AVATAR_MAP: Record<string, string> = {
  'hetzner-vps': 'hetzner',
  'mac-mini':    'mac-mini',
  macbook:       'macbook',
}

const STATUS_MAP: Record<string, any> = {
  online: 'online', busy: 'busy', idle: 'idle', offline: 'offline',
}

export default function Sidebar() {
  const activePanel    = useStore((s) => s.activePanel)
  const setActivePanel = useStore((s) => s.setActivePanel)
  const nodes          = useStore((s) => s.nodes)

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="glass flex flex-col items-center py-4 gap-1.5 relative"
      style={{ width: 68, minHeight: 0, zIndex: 20, borderRight: '1px solid var(--glass-border)', flexShrink: 0 }}
    >
      {/* Nav items */}
      {NAV.map((item, i) => {
        const Icon    = item.icon
        const isActive = activePanel === item.id
        const c        = item.color

        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.08 + i * 0.055 }}
            className="relative group w-full flex justify-center"
          >
            {/* Active bar */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  layoutId="activeBar"
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full"
                  style={{ background: `${c}1)` }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.07 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setActivePanel(item.id)}
              className="relative w-11 h-11 rounded-xl flex items-center justify-center transition-all duration-200"
              style={{
                background: isActive ? `${c}0.13)` : 'transparent',
                border: `1px solid ${isActive ? `${c}0.35)` : 'transparent'}`,
                boxShadow: isActive ? `0 0 16px ${c}0.18)` : 'none',
              }}
            >
              <Icon size={17} style={{ color: isActive ? `${c}1)` : 'var(--text-3)' }} />
            </motion.button>

            {/* Tooltip */}
            <div
              className="absolute left-[58px] top-1/2 -translate-y-1/2 pointer-events-none z-50
                         opacity-0 group-hover:opacity-100 translate-x-[-4px] group-hover:translate-x-0
                         transition-all duration-150 whitespace-nowrap"
            >
              <div
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium"
                style={{
                  background: 'rgba(8,12,28,0.96)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: `${c}1)`,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.6)',
                }}
              >
                {item.label}
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Divider */}
      <div className="w-8 h-px my-2" style={{ background: 'var(--glass-border)' }} />

      {/* Node avatars at bottom */}
      <div className="flex flex-col gap-2 items-center">
        {nodes.map((node, i) => (
          <motion.button
            key={node.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + i * 0.08 }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setActivePanel(node.id === 'hetzner-vps' ? 'openclaw' : 'nodes')}
            className="relative group/node"
            title={`${node.name} · ${node.status}`}
          >
            <AgentAvatar
              id={AVATAR_MAP[node.id] as any || 'system'}
              size={28}
              status={STATUS_MAP[node.status]}
            />
            {/* Tooltip */}
            <div
              className="absolute left-9 top-1/2 -translate-y-1/2 pointer-events-none z-50
                         opacity-0 group-hover/node:opacity-100 whitespace-nowrap
                         transition-opacity duration-150"
            >
              <div
                className="px-2 py-1 rounded-lg text-xs"
                style={{
                  background: 'rgba(8,12,28,0.96)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'var(--text-2)',
                }}
              >
                {node.name}
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.aside>
  )
}
