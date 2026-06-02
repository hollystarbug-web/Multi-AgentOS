'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Loader2, BookMarked } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function VaultStatus() {
  const status    = useStore((s) => s.vaultSaveStatus)
  const lastSaved = useStore((s) => s.vaultLastSaved)
  const lastError = useStore((s) => s.vaultLastError)
  const enabled   = useStore((s) => s.vaultEnabled)

  if (!enabled) return null

  const CONFIG = {
    idle: {
      icon: <BookMarked size={11} />,
      label: lastSaved
        ? `Vault · ${lastSaved.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}`
        : 'Vault ready',
      color: 'rgba(255,255,255,0.25)',
      bg: 'rgba(255,255,255,0.04)',
      border: 'rgba(255,255,255,0.08)',
    },
    saving: {
      icon: <Loader2 size={11} className="animate-spin" />,
      label: 'Saving to vault…',
      color: 'rgba(245,158,11,0.9)',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
    },
    saved: {
      icon: <CheckCircle2 size={11} />,
      label: 'Saved to vault',
      color: 'rgba(16,185,129,0.9)',
      bg: 'rgba(16,185,129,0.08)',
      border: 'rgba(16,185,129,0.2)',
    },
    error: {
      icon: <AlertCircle size={11} />,
      label: lastError ? `Vault: ${lastError.slice(0, 40)}` : 'Vault save failed',
      color: 'rgba(239,68,68,0.9)',
      bg: 'rgba(239,68,68,0.08)',
      border: 'rgba(239,68,68,0.2)',
    },
  }

  const c = CONFIG[status]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={status}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.2 }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
        style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.color }}
        title="OpenClaw-Wiki vault sync"
      >
        {c.icon}
        <span className="hidden sm:inline">{c.label}</span>
      </motion.div>
    </AnimatePresence>
  )
}
