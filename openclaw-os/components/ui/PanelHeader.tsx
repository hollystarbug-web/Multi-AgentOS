'use client'
import { motion } from 'framer-motion'
import { Trash2 } from 'lucide-react'

const COLOR_MAP: Record<string, string> = {
  cyan:   'rgba(6,182,212,',
  violet: 'rgba(139,92,246,',
  green:  'rgba(16,185,129,',
  pink:   'rgba(236,72,153,',
  amber:  'rgba(245,158,11,',
  white:  'rgba(255,255,255,',
}

interface PanelHeaderProps {
  title: string
  subtitle: string
  color: string
  icon: React.ReactNode
  onClear?: () => void
  children?: React.ReactNode
}

export default function PanelHeader({ title, subtitle, color, icon, onClear, children }: PanelHeaderProps) {
  const c = COLOR_MAP[color] || `${color}` || 'rgba(6,182,212,'
  return (
    <div
      className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
      style={{ borderBottom: '1px solid var(--glass-border)' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{
            background: `${c}0.12)`,
            border: `1px solid ${c}0.28)`,
            color: `${c}1)`,
          }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>{title}</div>
          <div className="text-xs" style={{ color: 'var(--text-3)' }}>{subtitle}</div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {onClear && (
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={onClear}
            className="w-7 h-7 rounded-lg flex items-center justify-center btn-ghost"
            title="Clear"
          >
            <Trash2 size={13} style={{ color: 'var(--text-3)' }} />
          </motion.button>
        )}
      </div>
    </div>
  )
}
