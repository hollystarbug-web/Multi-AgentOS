'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { Settings, Bell } from 'lucide-react'
import { useStore } from '@/lib/store'
import AgentAvatar from '@/components/ui/AgentAvatar'
import VaultStatus from '@/components/ui/VaultStatus'

export default function TopBar({ onSettings }: { onSettings: () => void }) {
  const [time, setTime] = useState('')
  const [date, setDate] = useState('')
  const nodes          = useStore((s) => s.nodes)
  const missions       = useStore((s) => s.missions)
  const online         = nodes.filter((n) => n.status !== 'offline').length
  const running        = missions.filter((m) => m.status === 'running').length

  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
      setDate(now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }))
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])

  return (
    <motion.header
      initial={{ y: -56, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className="glass flex items-center justify-between px-5 py-2.5 relative"
      style={{ zIndex: 20, borderBottom: '1px solid var(--glass-border)', flexShrink: 0 }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <AgentAvatar id="claude" size={32} glow status="online" />
        <div>
          <div className="text-sm font-bold tracking-wide" style={{ color: 'var(--text-1)', letterSpacing: '0.04em' }}>
            OPENCLAW <span className="gradient-text">OS</span>
          </div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>Mission Control</div>
        </div>
      </div>

      {/* Center pills */}
      <div className="flex items-center gap-2">
        <StatusPill label="NODES" value={`${online}/${nodes.length}`} color="rgba(16,185,129," pulse />
        <StatusPill label="MISSIONS" value={running > 0 ? `${running} ACTIVE` : 'IDLE'} color={running > 0 ? 'rgba(245,158,11,' : 'rgba(255,255,255,'} pulse={running > 0} />
        <StatusPill label="AI" value="ONLINE" color="rgba(139,92,246," pulse />
      </div>

      {/* Right: clock + actions */}
      <div className="flex items-center gap-4">
        {/* Tiny node avatars */}
        <div className="hidden md:flex items-center gap-1.5">
          {nodes.map((n) => (
            <AgentAvatar
              key={n.id}
              id={n.id === 'hetzner-vps' ? 'hetzner' : n.id === 'mac-mini' ? 'mac-mini' : 'macbook'}
              size={22}
              status={n.status as any}
            />
          ))}
        </div>

        <VaultStatus />

        <div className="text-right">
          <div className="font-terminal text-sm font-medium" style={{ color: 'var(--cyan)', letterSpacing: '0.08em' }}>
            {time}
          </div>
          <div className="text-xs" style={{ color: 'var(--text-4)' }}>{date}</div>
        </div>

        <div className="flex items-center gap-1.5">
          <IconBtn><Bell size={14} /></IconBtn>
          <IconBtn onClick={onSettings}><Settings size={14} /></IconBtn>
        </div>
      </div>
    </motion.header>
  )
}

function StatusPill({ label, value, color, pulse }: { label: string; value: string; color: string; pulse?: boolean }) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-full"
      style={{ background: `${color}0.07)`, border: `1px solid ${color}0.2)` }}
    >
      {pulse && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: `${color}1)` }}
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      <span className="text-xs font-medium" style={{ color: 'var(--text-3)', letterSpacing: '0.06em' }}>{label}</span>
      <span className="text-xs font-bold" style={{ color: `${color}1)` }}>{value}</span>
    </div>
  )
}

function IconBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      onClick={onClick}
      className="w-8 h-8 rounded-lg flex items-center justify-center btn-ghost"
    >
      {children}
    </motion.button>
  )
}
