'use client'
import { motion } from 'framer-motion'
import { useStore } from '@/lib/store'
import { Activity, MessageSquare, Target, Terminal, Globe, ArrowRight, Cpu, HardDrive } from 'lucide-react'
import AgentAvatar, { AvatarId } from '@/components/ui/AgentAvatar'

const AVATAR_MAP: Record<string, AvatarId> = {
  'hetzner-vps': 'hetzner',
  'mac-mini':    'mac-mini',
  macbook:       'macbook',
}

const ACCENT_MAP: Record<string, string> = {
  cyan:   'rgba(6,182,212,',
  violet: 'rgba(139,92,246,',
  pink:   'rgba(236,72,153,',
  green:  'rgba(16,185,129,',
  amber:  'rgba(245,158,11,',
}

const STATUS_COLOR: Record<string, string> = {
  online: '#10b981', busy: '#f59e0b', idle: '#6366f1', offline: '#ef4444',
}

export default function OverviewPanel() {
  const nodes    = useStore((s) => s.nodes)
  const missions = useStore((s) => s.missions)
  const messages = useStore((s) => s.messages)
  const logs     = useStore((s) => s.logs)
  const setActivePanel = useStore((s) => s.setActivePanel)

  const running   = missions.filter((m) => m.status === 'running').length
  const avgCpu    = Math.round(nodes.reduce((a, n) => a + n.cpu, 0) / nodes.length)
  const online    = nodes.filter((n) => n.status !== 'offline').length

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-8">

        {/* ── Hero banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl p-6"
          style={{
            background: 'linear-gradient(135deg, rgba(6,182,212,0.07) 0%, rgba(139,92,246,0.07) 50%, rgba(236,72,153,0.05) 100%)',
            border: '1px solid rgba(255,255,255,0.09)',
          }}
        >
          {/* Gradient orbs */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)', filter: 'blur(20px)' }} />
          <div className="absolute -bottom-8 -left-4 w-32 h-32 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.12) 0%, transparent 70%)', filter: 'blur(20px)' }} />

          <div className="relative flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold tracking-widest mb-2" style={{ color: 'var(--text-3)' }}>
                OPENCLAW OS · MISSION CONTROL
              </div>
              <h1 className="text-3xl font-bold tracking-tight mb-3 gradient-text">
                All Systems Go
              </h1>
              <div className="flex items-center gap-5">
                <HeroStat value={`${online}/${nodes.length}`} label="Nodes online" color="#10b981" />
                <HeroStat value={`${running}`} label="Active missions" color="var(--violet)" />
                <HeroStat value={`${avgCpu}%`} label="Avg CPU" color="var(--cyan)" />
                <HeroStat value={`${messages.length}`} label="Chat messages" color="var(--pink)" />
              </div>
            </div>
            <motion.div
              animate={{ rotate: [0, 3, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              className="flex-shrink-0 hidden md:block"
            >
              <AgentAvatar id="claude" size={72} glow status="online" pulse />
            </motion.div>
          </div>
        </motion.div>

        {/* ── Agent cards ── */}
        <section>
          <SectionLabel>AI AGENTS</SectionLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Claude card */}
            <AgentCard
              avatarId="claude"
              name="Claude"
              role="Primary AI"
              description="claude-opus-4 · Anthropic API"
              status="online"
              accent="rgba(139,92,246,"
              stats={[
                { label: 'Messages', value: messages.length.toString() },
                { label: 'Model', value: 'opus-4' },
              ]}
              onClick={() => setActivePanel('chat')}
              action="Open Chat"
              delay={0}
            />

            {/* Hetzner / Openclaw card */}
            {nodes.filter(n => n.id === 'hetzner-vps').map((node) => (
              <AgentCard
                key={node.id}
                avatarId="hetzner"
                name={node.name}
                role="Openclaw Host"
                description={`${node.host} · ${node.tasks} tasks`}
                status={node.status}
                accent={ACCENT_MAP[node.color] || 'rgba(245,158,11,'}
                stats={[
                  { label: 'CPU', value: `${Math.round(node.cpu)}%`, bar: node.cpu },
                  { label: 'RAM', value: `${Math.round(node.memory)}%`, bar: node.memory },
                ]}
                onClick={() => setActivePanel('openclaw')}
                action="Open Openclaw"
                delay={0.08}
              />
            ))}

            {/* Mac Mini card */}
            {nodes.filter(n => n.id === 'mac-mini').map((node) => (
              <AgentCard
                key={node.id}
                avatarId="mac-mini"
                name={node.name}
                role={node.role}
                description={`${node.host} · ${node.uptime}`}
                status={node.status}
                accent={ACCENT_MAP[node.color] || 'rgba(6,182,212,'}
                stats={[
                  { label: 'CPU', value: `${Math.round(node.cpu)}%`, bar: node.cpu },
                  { label: 'RAM', value: `${Math.round(node.memory)}%`, bar: node.memory },
                ]}
                onClick={() => setActivePanel('nodes')}
                action="View Node"
                delay={0.16}
              />
            ))}
          </div>
        </section>

        {/* ── Command panels ── */}
        <section>
          <SectionLabel>COMMAND PANELS</SectionLabel>
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'nodes',    icon: Activity,      label: 'Node Monitor',    sub: `${online} nodes live`,    color: 'rgba(139,92,246,' },
              { id: 'missions', icon: Target,         label: 'Mission Control', sub: `${running} running`,      color: 'rgba(236,72,153,' },
              { id: 'terminal', icon: Terminal,       label: 'Terminal',        sub: `${logs.length} entries`,  color: 'rgba(16,185,129,' },
              { id: 'openclaw', icon: Globe,          label: 'Openclaw',        sub: 'Hetzner VPS',             color: 'rgba(245,158,11,' },
            ].map((p, i) => {
              const Icon = p.icon
              return (
                <motion.button
                  key={p.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  whileHover={{ scale: 1.015 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setActivePanel(p.id)}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left group transition-all"
                  style={{
                    background: `${p.color}0.05)`,
                    border: `1px solid ${p.color}0.12)`,
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${p.color}0.12)` }}>
                    <Icon size={18} style={{ color: `${p.color}1)` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{p.label}</div>
                    <div className="text-xs" style={{ color: 'var(--text-3)' }}>{p.sub}</div>
                  </div>
                  <ArrowRight size={14} style={{ color: `${p.color}0.5)` }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1 group-hover:translate-x-0 duration-200" />
                </motion.button>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}

/* ── Agent card ── */
interface CardStat { label: string; value: string; bar?: number }

function AgentCard({
  avatarId, name, role, description, status, accent, stats, onClick, action, delay,
}: {
  avatarId: AvatarId; name: string; role: string; description: string
  status: string; accent: string; stats: CardStat[]
  onClick: () => void; action: string; delay: number
}) {
  const sc = STATUS_COLOR[status] || '#6366f1'
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        y: -3,
        boxShadow: `0 0 0 1px ${accent}0.25), 0 20px 48px rgba(0,0,0,0.35), 0 0 40px ${accent}0.08)`,
      }}
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl p-5 cursor-pointer group transition-all duration-300"
      style={{
        background: `${accent}0.04)`,
        border: `1px solid ${accent}0.12)`,
      }}
    >
      {/* Background glow blob */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full pointer-events-none"
        style={{ background: `radial-gradient(circle, ${accent}0.15) 0%, transparent 70%)`, filter: 'blur(16px)' }} />

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <AgentAvatar
            id={avatarId}
            size={44}
            glow
            status={status as any}
            pulse={status === 'online'}
          />
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--text-1)' }}>{name}</div>
            <div className="text-xs" style={{ color: `${accent}0.8)` }}>{role}</div>
          </div>
        </div>
        <div
          className="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1"
          style={{ background: `${sc}18`, color: sc, border: `1px solid ${sc}40` }}
        >
          <motion.span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{ background: sc }}
            animate={status === 'online' ? { opacity: [1, 0.3, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          {status.toUpperCase()}
        </div>
      </div>

      {/* Description */}
      <p className="text-xs mb-4" style={{ color: 'var(--text-3)' }}>{description}</p>

      {/* Stats */}
      <div className="space-y-2.5 mb-5">
        {stats.map((stat) => (
          <div key={stat.label}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>{stat.label}</span>
              <span className="text-xs font-mono font-semibold" style={{ color: `${accent}0.9)` }}>{stat.value}</span>
            </div>
            {stat.bar !== undefined && (
              <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  animate={{ width: `${stat.bar}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  style={{ background: `linear-gradient(90deg, ${accent}0.7), ${accent}1))` }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Action */}
      <motion.div
        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all"
        style={{
          background: `${accent}0.08)`,
          border: `1px solid ${accent}0.15)`,
          color: `${accent}0.9)`,
        }}
        whileHover={{ background: `${accent}0.14)` }}
      >
        {action}
        <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
      </motion.div>
    </motion.div>
  )
}

function HeroStat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div>
      <div className="text-xl font-bold" style={{ color }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--text-3)' }}>{label}</div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span className="text-xs font-bold tracking-widest" style={{ color: 'var(--text-3)' }}>{children}</span>
      <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
    </div>
  )
}
