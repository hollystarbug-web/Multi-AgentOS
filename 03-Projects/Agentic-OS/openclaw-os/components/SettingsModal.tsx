'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Server, Globe, Eye, EyeOff, Save, CheckCircle, BookMarked } from 'lucide-react'
import { useStore } from '@/lib/store'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const store = useStore()
  const [apiKey, setApiKey] = useState(store.apiKey)
  const [hetznerHost, setHetznerHost] = useState(store.hetznerHost)
  const [macMiniHost, setMacMiniHost] = useState(store.macMiniHost)
  const [openclawUrl, setOpenclawUrl] = useState(store.openclawUrl)
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  // Vault settings
  const [vaultEnabled, setVaultEnabled] = useState(store.vaultEnabled)
  const [vaultSshUser, setVaultSshUser] = useState(store.vaultSshUser)
  const [vaultSshKeyPath, setVaultSshKeyPath] = useState(store.vaultSshKeyPath)
  const [vaultSshPassword, setVaultSshPassword] = useState(store.vaultSshPassword)
  const [showVaultPass, setShowVaultPass] = useState(false)

  const save = () => {
    store.setApiKey(apiKey)
    store.setHetznerHost(hetznerHost)
    store.setMacMiniHost(macMiniHost)
    store.setOpenclawUrl(openclawUrl)
    store.setVaultEnabled(vaultEnabled)
    store.setVaultSshUser(vaultSshUser)
    store.setVaultSshKeyPath(vaultSshKeyPath)
    store.setVaultSshPassword(vaultSshPassword)
    setSaved(true)
    setTimeout(() => { setSaved(false); onClose() }, 1200)
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="w-full max-w-lg glass rounded-3xl overflow-hidden"
          style={{ border: '1px solid rgba(6,182,212,0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-6 py-5"
            style={{
              background: 'linear-gradient(135deg, rgba(6,182,212,0.08) 0%, rgba(139,92,246,0.06) 100%)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div>
              <div className="text-lg font-bold text-white">Settings</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>Configure API keys and node connections</div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="w-8 h-8 rounded-xl flex items-center justify-center btn-glass"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={15} />
            </motion.button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <SettingGroup
              icon={<Key size={15} />}
              color="rgba(6,182,212,"
              title="Anthropic API Key"
              description="Used for Claude chat and agent tasks"
            >
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  className="input-glass w-full px-3 py-2.5 rounded-xl text-sm pr-10 font-mono"
                  placeholder="sk-ant-api03-..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Never shared. Stored locally in your browser.
              </p>
            </SettingGroup>

            <SettingGroup
              icon={<Server size={15} />}
              color="rgba(139,92,246,"
              title="Infrastructure Nodes"
              description="IP addresses of your Hetzner VPS and Mac Mini"
            >
              <div className="space-y-2">
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    Hetzner VPS (running Openclaw)
                  </label>
                  <input
                    type="text"
                    className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono"
                    placeholder="65.21.x.x"
                    value={hetznerHost}
                    onChange={(e) => setHetznerHost(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                    Mac Mini (browsing node)
                  </label>
                  <input
                    type="text"
                    className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono"
                    placeholder="192.168.1.x"
                    value={macMiniHost}
                    onChange={(e) => setMacMiniHost(e.target.value)}
                  />
                </div>
              </div>
            </SettingGroup>

            <SettingGroup
              icon={<BookMarked size={15} />}
              color="rgba(168,85,247,"
              title="OpenClaw-Wiki Vault"
              description="Auto-save chats, journal, and missions via SSH → git"
            >
              {/* Enable toggle */}
              <button
                onClick={() => setVaultEnabled(!vaultEnabled)}
                className="flex items-center gap-3 w-full mb-3 group"
              >
                <div
                  className="relative w-10 h-5 rounded-full transition-all duration-300 flex-shrink-0"
                  style={{
                    background: vaultEnabled ? 'rgba(168,85,247,0.6)' : 'rgba(255,255,255,0.1)',
                    border: vaultEnabled ? '1px solid rgba(168,85,247,0.8)' : '1px solid rgba(255,255,255,0.15)',
                  }}
                >
                  <motion.div
                    animate={{ x: vaultEnabled ? 20 : 2 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="absolute top-0.5 w-4 h-4 rounded-full"
                    style={{ background: vaultEnabled ? 'rgba(168,85,247,1)' : 'rgba(255,255,255,0.4)' }}
                  />
                </div>
                <span className="text-sm" style={{ color: vaultEnabled ? 'rgba(168,85,247,0.9)' : 'var(--text-3)' }}>
                  {vaultEnabled ? 'Vault sync enabled' : 'Vault sync disabled'}
                </span>
              </button>

              <AnimatePresence>
                {vaultEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden space-y-2"
                  >
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                        SSH user (default: root)
                      </label>
                      <input
                        type="text"
                        className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono"
                        placeholder="root"
                        value={vaultSshUser}
                        onChange={(e) => setVaultSshUser(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                        SSH key path (optional — leave blank to auto-detect)
                      </label>
                      <input
                        type="text"
                        className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono"
                        placeholder="~/.ssh/id_ed25519"
                        value={vaultSshKeyPath}
                        onChange={(e) => setVaultSshKeyPath(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>
                        SSH password (if not using key auth)
                      </label>
                      <div className="relative">
                        <input
                          type={showVaultPass ? 'text' : 'password'}
                          className="input-glass w-full px-3 py-2 rounded-xl text-sm font-mono pr-10"
                          placeholder="Leave blank if using key auth"
                          value={vaultSshPassword}
                          onChange={(e) => setVaultSshPassword(e.target.value)}
                        />
                        <button
                          onClick={() => setShowVaultPass(!showVaultPass)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: 'var(--text-muted)' }}
                        >
                          {showVaultPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                    </div>
                    <p className="text-xs pt-1" style={{ color: 'var(--text-4)' }}>
                      Saves to <code className="font-mono text-purple-400">/root/OpenClaw-Wiki/03-Projects/Agentic-OS/</code> on your Hetzner VPS and commits to git after every entry.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </SettingGroup>

            <SettingGroup
              icon={<Globe size={15} />}
              color="rgba(245,158,11,"
              title="Openclaw URL"
              description="Full URL to embed Openclaw in the dashboard panel"
            >
              <input
                type="url"
                className="input-glass w-full px-3 py-2.5 rounded-xl text-sm font-mono"
                placeholder="http://65.21.x.x:3000"
                value={openclawUrl}
                onChange={(e) => setOpenclawUrl(e.target.value)}
              />
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Tip: Use a Cloudflare Tunnel or nginx for HTTPS access.
              </p>
            </SettingGroup>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={save}
              className="w-full py-3 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              style={{
                background: saved
                  ? 'rgba(16,185,129,0.2)'
                  : 'rgba(6,182,212,0.15)',
                border: saved
                  ? '1px solid rgba(16,185,129,0.4)'
                  : '1px solid rgba(6,182,212,0.4)',
                color: saved ? '#10b981' : '#06b6d4',
                boxShadow: saved
                  ? '0 0 20px rgba(16,185,129,0.15)'
                  : '0 0 20px rgba(6,182,212,0.1)',
              }}
            >
              <AnimatePresence mode="wait">
                {saved ? (
                  <motion.span
                    key="saved"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle size={16} /> Saved!
                  </motion.span>
                ) : (
                  <motion.span
                    key="save"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Save size={16} /> Save Settings
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function SettingGroup({ icon, color, title, description, children }: {
  icon: React.ReactNode; color: string; title: string; description: string; children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-lg flex items-center justify-center"
          style={{ background: `${color}0.15)`, border: `1px solid ${color}0.3)`, color: `${color}1)` }}
        >
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-white">{title}</div>
          <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{description}</div>
        </div>
      </div>
      {children}
    </div>
  )
}
