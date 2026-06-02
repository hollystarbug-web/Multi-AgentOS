'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Cpu, HardDrive, Activity, Clock, ArrowUpRight } from 'lucide-react'
import { useStore, AgentNode } from '@/lib/store'
import AgentAvatar, { AvatarId } from '@/components/ui/AgentAvatar'

const AVATAR_MAP: Record<string, AvatarId> = {
  'hetzner-vps': 'hetzner',
  'mac-mini':    'mac-mini',
  macbook:       'macbook',
}

const ACCENT: Record<string, string> = {
  cyan:   'rgba(6,182,212,',
  violet: 'rgba(139,92,246,',
  pink:   'rgba(236,72,153,',
  green:  'rgba(16,185,129,',
  amber:  'rgba(245,158,11,',
}

const STATUS_COLOR: Record<string, string> = {
  online: '#10b981', busy: '#f59e0b', idle: '#6366f1', offline: '#ef4444',
}

export default function AgentMonitorPanel() {
  const nodes      = useStore((s) => s.nodes)
  const updateNode = useStore((s) => s.updateNode)

  useEffect(() => {
    const id = setInterval(() => {
      nodes.forEach((n) => {
        if (n.status !== 'offline') {
          updateNode(n.id, {
            cpu:    Math.max(2,  Math.min(94, n.cpu    + (Math.random() - 0.5) * 6)),
            memory: Math.max(10, Math.min(88, n.memory + (Math.random() - 0.5) * 3)),
          })
        }
      })
    }, 2200)
    return () => clearInterval(id)
  }, [nodes, updateNode])

  const avgCpu = Math.round(nodes.reduce((a, n) => a + n.cpu, 0) / nodes.length)
  const totalTasks = nodes.reduce((a, n) => a + n.tasks, 0)
  const onlineCount = nodes.filter(n => n.status !== 'offline').length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.25)' }}>
          <Monitor size={15} style={{ color: 'var(--cyan)' }} />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Node Monitor</div>
          <div className="text-xs" style={{ color: 'var(--text-3)' }}>Live infrastructure telemetry</div>
        </div>
        {/* Fleet summary pills */}
        <div className="hidden md:flex items-center gap-2">
          <MiniPill label="Online" value={`${onlineCount}/${nodes.length}`} color="rgba(16,185,129," />
          <MiniPill label="Avg CPU" value={`${avgCpu}%`} color="rgba(6,182,212," />
          <MiniPill label="Tasks" value={`${totalTasks}`} color="rgba(139,92,246," />
        </div>
      </div>

      {/* Node cards */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 min-h-0">
        {nodes.map((node, i) => (
          <NodeCard key={node.id} node={node} index={i} />
        ))}
      </div>
    </div>
  )
}

function NodeCard({ node, index }: { node: AgentNode; index: number }) {
  const c  = ACCENT[node.color] || 'rgba(6,182,212,'
  const sc = STATUS_COLOR[node.status] || '#6366f1'
  const av = AVATAR_MAP[node.id] || 'system'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.09, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -2 }}
      className="p-5 rounded-2xl group transition-all duration-300"
      style={{
        background: `${c}0.04)`,
        border: `1px solid ${c}0.13)`,
        boxShadow: '0 2px 16px rgba(0,0,0,0.2)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <AgentAvatar
            id={av}
            size={48}
            glow
            status={node.status as any}
            pulse={node.status === 'online'}
          />
          <div>
            <div className="font-semibold text-sm mb-0.5" style={{ color: 'var(--text-1)' }}>
              {node.name}
            </div>
            <div className="text-xs mb-1" style={{ color: `${c}0.8)` }}>{node.role}</div>
            <div className="font-terminal text-xs" style={{ color: 'var(--text-3)' }}>{node.host}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}40` }}
          >
            <motion.div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: sc }}
              animate={node.status === 'online' ? { opacity: [1, 0.3, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
            />
            {node.status.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-5">
        <MetricBar
          label="CPU"
          value={node.cpu}
          color={c}
          icon={<Cpu size={11} />}
        />
        <MetricBar
          label="Memory"
          value={node.memory}
          color={c}
          icon={<HardDrive size={11} />}
        />
      </div>

      {/* Footer */}
      <div
        className="flex items-center justify-between pt-3.5"
        style={{ borderTop: `1px solid ${c}0.1)` }}
      >
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
          <Clock size={11} />
          <span className="text-xs">{node.uptime}</span>
        </div>
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
          <Activity size={11} />
          <span className="text-xs">{node.tasks} task{node.tasks !== 1 ? 's' : ''}</span>
        </div>
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-1 text-xs font-medium cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: `${c}0.8)` }}
        >
          Details <ArrowUpRight size={11} />
        </motion.div>
      </div>
    </motion.div>
  )
}

function MetricBar({ label, value, color, icon }: {
  label: string; value: number; color: string; icon: React.ReactNode
}) {
  const pct    = Math.round(value)
  const isHot  = pct > 80
  const isWarm = pct > 60
  const barC   = isHot ? 'rgba(239,68,68,' : isWarm ? 'rgba(245,158,11,' : color

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-3)' }}>
          {icon}
          <span className="text-xs">{label}</span>
        </div>
        <span className="text-xs font-mono font-bold" style={{ color: `${barC}1)` }}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          style={{
            background: `linear-gradient(90deg, ${barC}0.7), ${barC}1))`,
            boxShadow: `0 0 8px ${barC}0.35)`,
          }}
        />
      </div>
    </div>
  )
}

function MiniPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ background: `${color}0.07)`, border: `1px solid ${color}0.2)` }}
    >
      <span className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: `${color}1)` }}>{value}</span>
    </div>
  )
}
