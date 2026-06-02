'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, ExternalLink, RefreshCw, Settings2 } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function OpenclawPanel() {
  const openclawUrl = useStore((s) => s.openclawUrl)
  const setOpenclawUrl = useStore((s) => s.setOpenclawUrl)
  const [inputUrl, setInputUrl] = useState(openclawUrl)
  const [key, setKey] = useState(0)
  const [editing, setEditing] = useState(!openclawUrl)

  const apply = () => {
    setOpenclawUrl(inputUrl)
    setEditing(false)
    setKey((k) => k + 1)
  }

  return (
    <div className="flex flex-col h-full">
      <div
        className="flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
        style={{ borderColor: 'rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: 'rgba(245,158,11,0.15)',
              border: '1px solid rgba(245,158,11,0.3)',
              color: 'rgba(245,158,11,1)',
            }}
          >
            <Globe size={15} />
          </div>
          <div>
            <div className="text-sm font-semibold text-white">Openclaw</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              {openclawUrl || 'Configure URL to connect'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setEditing(!editing)}
            className="w-7 h-7 rounded-lg flex items-center justify-center btn-glass"
            style={{ color: 'var(--text-muted)' }}
          >
            <Settings2 size={13} />
          </motion.button>
          {openclawUrl && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setKey((k) => k + 1)}
                className="w-7 h-7 rounded-lg flex items-center justify-center btn-glass"
                style={{ color: 'var(--text-muted)' }}
              >
                <RefreshCw size={13} />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                href={openclawUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 rounded-lg flex items-center justify-center btn-glass"
                style={{ color: 'var(--text-muted)' }}
              >
                <ExternalLink size={13} />
              </motion.a>
            </>
          )}
        </div>
      </div>

      {/* URL config */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="px-4 py-3 flex-shrink-0"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="flex gap-2">
            <input
              className="input-glass flex-1 px-3 py-2 rounded-lg text-sm"
              placeholder="http://your-vps-ip:3000"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && apply()}
            />
            <button onClick={apply} className="px-4 py-2 rounded-lg text-sm btn-cyan font-medium">
              Connect
            </button>
          </div>
          <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
            Enter the URL of your Openclaw instance. Make sure CORS allows your MacBook's IP.
          </p>
        </motion.div>
      )}

      {/* iframe or placeholder */}
      <div className="flex-1 relative overflow-hidden min-h-0">
        {openclawUrl ? (
          <iframe
            key={key}
            src={openclawUrl}
            className="absolute inset-0 w-full h-full border-0"
            title="Openclaw"
            allow="clipboard-read; clipboard-write"
          />
        ) : (
          <EmptyState onEdit={() => setEditing(true)} />
        )}
      </div>
    </div>
  )
}

function EmptyState({ onEdit }: { onEdit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full gap-6 p-8 text-center"
    >
      <motion.div
        animate={{ rotate: [0, 5, -5, 0] }}
        transition={{ duration: 4, repeat: Infinity }}
        className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
        style={{
          background: 'rgba(245,158,11,0.1)',
          border: '1px solid rgba(245,158,11,0.2)',
          boxShadow: '0 0 40px rgba(245,158,11,0.08)',
        }}
      >
        🦞
      </motion.div>
      <div>
        <div className="text-white font-semibold text-lg mb-2">Openclaw Not Connected</div>
        <div className="text-sm mb-6" style={{ color: 'var(--text-muted)', maxWidth: 280 }}>
          Enter your Hetzner VPS URL to embed the Openclaw interface directly in your dashboard.
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          onClick={onEdit}
          className="px-6 py-2.5 rounded-xl text-sm font-medium btn-cyan"
        >
          Configure URL
        </motion.button>
      </div>

      {/* Quick reference */}
      <div
        className="w-full max-w-xs p-4 rounded-xl text-left"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <div className="text-xs font-semibold mb-2" style={{ color: 'rgba(245,158,11,0.8)' }}>QUICK CONNECT</div>
        {[
          { label: 'Hetzner VPS', hint: 'http://65.21.x.x:3000' },
          { label: 'Local proxy', hint: 'http://localhost:8080' },
          { label: 'Cloudflare tunnel', hint: 'https://openclaw.your-domain.com' },
        ].map((item) => (
          <div key={item.label} className="flex items-center justify-between py-1">
            <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
            <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{item.hint}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
