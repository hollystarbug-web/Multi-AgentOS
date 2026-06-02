'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Key, Server, Globe, Eye, EyeOff, Save, CheckCircle, BookMarked, ChevronDown, Bot } from 'lucide-react'
import { useStore } from '@/lib/store'
import { MODELS, DEFAULTS, getProviders, getModelsByProvider, type ModelConfig } from '@/lib/models'

export default function SettingsModal({ onClose }: { onClose: () => void }) {
  const store = useStore()
  const [apiKey, setApiKey] = useState(store.apiKey)
  const [hetznerHost, setHetznerHost] = useState(store.hetznerHost)
  const [macMiniHost, setMacMiniHost] = useState(store.macMiniHost)
  const [openclawUrl, setOpenclawUrl] = useState(store.openclawUrl)
  const [deepseekApiKey, setDeepseekApiKey] = useState(store.deepseekApiKey)
  const [openaiApiKey, setOpenaiApiKey] = useState(store.openaiApiKey)
  const [nvidiaApiKey, setNvidiaApiKey] = useState(store.nvidiaApiKey)
  const [defaultModel, setDefaultModel] = useState(store.defaultModel || DEFAULTS.defaultModel)
  const [fallbackModel, setFallbackModel] = useState(store.fallbackModel || DEFAULTS.fallbackModel)
  const [showKey, setShowKey] = useState(false)
  const [showDeepseekKey, setShowDeepseekKey] = useState(false)
  const [showOpenaiKey, setShowOpenaiKey] = useState(false)
  const [showNvidiaKey, setShowNvidiaKey] = useState(false)
  const [saved, setSaved] = useState(false)
  // Vault settings
  const [vaultEnabled, setVaultEnabled] = useState(store.vaultEnabled)
  const [vaultSshUser, setVaultSshUser] = useState(store.vaultSshUser)
  const [vaultSshKeyPath, setVaultSshKeyPath] = useState(store.vaultSshKeyPath)
  const [vaultSshPassword, setVaultSshPassword] = useState(store.vaultSshPassword)
  const [showVaultPass, setShowVaultPass] = useState(false)

  const save = () => {
    store.setApiKey(apiKey)
    store.setDeepseekApiKey(deepseekApiKey)
    store.setOpenaiApiKey(openaiApiKey)
    store.setNvidiaApiKey(nvidiaApiKey)
    store.setHetznerHost(hetznerHost)
    store.setMacMiniHost(macMiniHost)
    store.setOpenclawUrl(openclawUrl)
    store.setVaultEnabled(vaultEnabled)
    store.setVaultSshUser(vaultSshUser)
    store.setVaultSshKeyPath(vaultSshKeyPath)
    store.setVaultSshPassword(vaultSshPassword)
    store.setDefaultModel(defaultModel)
    store.setFallbackModel(fallbackModel)
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
              color="rgba(6,182,212,1)"
              title="Anthropic API Key"
              description="Used for Claude models"
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
            </SettingGroup>

            <SettingGroup
              icon={<span style={{fontSize:13}}>🔵</span>}
              color="rgba(16,163,127,1)"
              title="DeepSeek API Key"
              description="V4 Flash — $0.14/M input, $0.28/M output. Best for general tasks."
            >
              <div className="relative">
                <input
                  type={showDeepseekKey ? 'text' : 'password'}
                  className="input-glass w-full px-3 py-2.5 rounded-xl text-sm pr-10 font-mono"
                  placeholder="sk-c8c..."
                  value={deepseekApiKey}
                  onChange={(e) => setDeepseekApiKey(e.target.value)}
                />
                <button
                  onClick={() => setShowDeepseekKey(!showDeepseekKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showDeepseekKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Get your key at <span className="text-cyan-400">platform.deepseek.com</span> → API Keys
              </p>
            </SettingGroup>

            <SettingGroup
              icon={<span style={{fontSize:13}}>🟢</span>}
              color="rgba(118,185,0,1)"
              title="NVIDIA API Key (FREE)"
              description="DeepSeek V4 Flash via NVIDIA NIM — FREE. Get key at build.nvidia.com"
            >
              <div className="relative">
                <input
                  type={showNvidiaKey ? 'text' : 'password'}
                  className="input-glass w-full px-3 py-2.5 rounded-xl text-sm pr-10 font-mono"
                  placeholder="nvapi-... (FREE — build.nvidia.com)"
                  value={nvidiaApiKey}
                  onChange={(e) => setNvidiaApiKey(e.target.value)}
                />
                <button
                  onClick={() => setShowNvidiaKey(!showNvidiaKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showNvidiaKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
                Sign up at <span className="text-green-400">build.nvidia.com</span> → API Keys → Create API Key
              </p>
            </SettingGroup>

            <SettingGroup
              icon={<span style={{fontSize:13}}>🟢</span>}
              color="rgba(16,185,129,1)"
              title="OpenAI API Key (optional)"
              description="For GPT-4.1, o4-mini, and OpenAI models"
            >
              <div className="relative">
                <input
                  type={showOpenaiKey ? 'text' : 'password'}
                  className="input-glass w-full px-3 py-2.5 rounded-xl text-sm pr-10 font-mono"
                  placeholder="sk-... (optional)"
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                />
                <button
                  onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showOpenaiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </SettingGroup>

            {/* Model Defaults */}
            <SettingGroup
              icon={<Bot size={15} />}
              color="rgba(245,158,11,1)"
              title="Model Defaults"
              description="Default and fallback models for chat — can override per message"
            >
              <div className="space-y-3">
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                    Default model (used for most tasks)
                  </label>
                  <ModelSelect value={defaultModel} onChange={setDefaultModel} />
                </div>
                <div>
                  <label className="text-xs mb-1.5 block" style={{ color: 'var(--text-muted)' }}>
                    Fallback model (if default fails)
                  </label>
                  <ModelSelect value={fallbackModel} onChange={setFallbackModel} />
                </div>
                <div className="flex gap-2 flex-wrap mt-2">
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background:'rgba(16,163,127,0.15)', color:'#10a37f', border:'1px solid rgba(16,163,127,0.3)' }}>
                    💰 DeepSeek V4 Flash — $0.14/M tokens
                  </span>
                  <span className="text-xs px-2 py-1 rounded-lg" style={{ background:'rgba(0,210,255,0.1)', color:'#00d2ff', border:'1px solid rgba(0,210,255,0.2)' }}>
                    🔷 MiniMax — free
                  </span>
                </div>
              </div>
            </SettingGroup>

            <SettingGroup
              icon={<Server size={15} />}
              color="rgba(139,92,246,1)"
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
              color="rgba(168,85,247,1)"
              title="OpenClaw-Wiki Vault"
              description="Auto-save chats, journal, goals, and missions. Local (same-host) by default; SSH fallback for remote."
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

              {vaultEnabled && !hetznerHost && (
                <div
                  className="text-xs mb-3 px-2 py-1.5 rounded-lg flex items-center gap-2"
                  style={{
                    background: 'rgba(34,197,94,0.1)',
                    border: '1px solid rgba(34,197,94,0.3)',
                    color: 'rgba(134,239,172,1)',
                  }}
                >
                  <span>✓</span>
                  <span>
                    <strong>Local mode</strong> — saving directly to <code className="font-mono">/root/OpenClaw-Wiki/Multi-AgentOS/</code> on this VPS. No SSH needed.
                  </span>
                </div>
              )}

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
              color="rgba(245,158,11,1)"
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

            {/* Provider Status — live from server */}
            <ProviderStatusSection />
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

function ModelSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const providers = getProviders()
  const selectedModel = MODELS[value]

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm input-glass hover:border-cyan-500/40 transition-colors"
      >
        <span className="flex items-center gap-2">
          {selectedModel?.icon && <span>{selectedModel.icon}</span>}
          <span className="text-white font-medium">{selectedModel?.name || 'Select model'}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ background: `${selectedModel?.color}25`, color: selectedModel?.color, border: `1px solid ${selectedModel?.color}50` }}
          >
            {selectedModel?.providerName}
          </span>
          <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-xl"
          style={{ background: 'rgba(15,20,30,0.98)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}
        >
          {providers.map((prov) => {
            const models = getModelsByProvider(prov.id)
            return (
              <div key={prov.id}>
                <div
                  className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider"
                  style={{ color: prov.color, background: `${prov.color}10`, borderBottom: `1px solid ${prov.color}20` }}
                >
                  {prov.name} — {prov.id}
                </div>
                {models.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { onChange(m.id); setOpen(false) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-white/5 text-left transition-colors"
                    style={{ borderLeft: value === m.id ? `2px solid ${m.color}` : '2px solid transparent' }}
                  >
                    <span className="text-sm">{m.icon}</span>
                    <span className="flex-1">
                      <span className="text-white font-medium">{m.name}</span>
                      <span className="block text-xs" style={{ color: 'var(--text-muted)' }}>
                        ${m.costPerMillion.input}/M in · {m.bestFor.slice(0,2).join(', ')}
                      </span>
                    </span>
                    {value === m.id && (
                      <span className="text-xs" style={{ color: m.color }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            )
          })}
        </div>
      )}

      {/* Backdrop */}
      {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />}
    </div>
  )
}

/**
 * ProviderStatusSection
 * ---------------------
 * Shows the live status of every provider — where the API key lives
 * (env var, .credentials/ JSON file, or missing) and a live ping result
 * for each working provider.
 *
 * The keys themselves stay on the server. This component never sees them.
 */
function ProviderStatusSection() {
  const [status, setStatus] = useState<Array<{
    provider: string
    keySource: 'env' | 'file' | 'missing' | 'request'
    hasKey: boolean
    keyPreview?: string
  }> | null>(null)
  const [modelHealth, setModelHealth] = useState<Record<string, { status: string; latencyMs?: number; error?: string }>>({})
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  async function refresh(force = false) {
    if (force) setRefreshing(true)
    else setLoading(true)
    try {
      const [provR, modR] = await Promise.all([
        fetch('/api/providers').then((r) => r.json()),
        fetch(force ? '/api/models/health?force=true' : '/api/models/health').then((r) => r.json()),
      ])
      if (provR.providers) setStatus(provR.providers)
      if (modR.models) {
        const map: typeof modelHealth = {}
        for (const m of modR.models) {
          map[m.id] = { status: m.status, latencyMs: m.latencyMs, error: m.error }
        }
        setModelHealth(map)
      }
    } catch (e) {
      // ignore
    }
    setLoading(false)
    setRefreshing(false)
  }

  useEffect(() => { refresh(false) }, [])

  const workingCount = status?.filter((p) => p.hasKey).length ?? 0
  const totalCount = status?.length ?? 0

  // Count by status
  const okCount = Object.values(modelHealth).filter((m) => m.status === 'ok').length
  const failCount = Object.values(modelHealth).filter((m) => m.status === 'no-key' || m.status === 'auth' || m.status === 'quota').length

  return (
    <SettingGroup
      icon={<span style={{ fontSize: 13 }}>⚡</span>}
      color="rgba(52,211,153,1)"
      title="Provider Status"
      description={`${workingCount}/${totalCount} providers configured · ${okCount} models working`}
    >
      <div className="space-y-2">
        {/* Summary line */}
        <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgb(52,211,153)' }} />
            <span>{okCount} OK</span>
          </div>
          {failCount > 0 && (
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'rgb(251,113,133)' }} />
              <span>{failCount} not working</span>
            </div>
          )}
          <div className="flex-1" />
          <button
            onClick={() => refresh(true)}
            disabled={refreshing}
            className="text-[10px] px-2 py-1 rounded-md btn-glass"
            style={{ color: 'var(--text-2)' }}
            title="Ping all providers (slower — runs a real request to each)"
          >
            {refreshing ? 'Pinging…' : 'Refresh'}
          </button>
        </div>

        {/* Provider list */}
        <div className="space-y-1 max-h-48 overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
          {status === null && <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Loading…</div>}
          {status?.map((p) => {
            // Find any model from this provider
            const modelForProvider = Object.values(MODELS).find((m) => m.provider === p.provider)
            const h = modelForProvider ? modelHealth[modelForProvider.id] : undefined
            const color = p.hasKey ? 'rgb(52,211,153)' : 'rgba(255,255,255,0.3)'
            return (
              <div
                key={p.provider}
                className="flex items-center gap-2 text-[11px] py-1.5 px-2 rounded-md"
                style={{ background: 'rgba(255,255,255,0.02)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                <span className="font-mono font-semibold capitalize" style={{ color: 'var(--text-1)' }}>
                  {p.provider}
                </span>
                <span style={{ color: 'var(--text-4)' }}>·</span>
                {p.hasKey ? (
                  <>
                    <span className="text-[10px]" style={{ color: 'var(--text-3)' }}>
                      {p.keySource === 'env' ? 'env' : p.keySource === 'file' ? '.credentials/' : p.keySource}
                    </span>
                    {h && h.status === 'ok' && h.latencyMs && (
                      <span
                        className="text-[10px] ml-auto font-mono"
                        style={{ color: 'rgb(110,231,183)' }}
                      >
                        ● {h.latencyMs}ms
                      </span>
                    )}
                    {h && h.status === 'quota' && (
                      <span className="text-[10px] ml-auto" style={{ color: 'rgb(252,211,77)' }}>QUOTA</span>
                    )}
                    {h && h.status === 'auth' && (
                      <span className="text-[10px] ml-auto" style={{ color: 'rgb(252,165,165)' }}>AUTH</span>
                    )}
                    {!h && (
                      <span className="text-[10px] ml-auto" style={{ color: 'var(--text-4)' }}>
                        (untested)
                      </span>
                    )}
                  </>
                ) : (
                  <span className="text-[10px] ml-auto" style={{ color: 'var(--text-4)' }}>
                    no key
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <p className="text-[10px] mt-1" style={{ color: 'var(--text-4)' }}>
          Keys are read server-side from <code>ANTHROPIC_API_KEY</code> env or
          <code> ~/.openclaw/workspace/.credentials/&lt;provider&gt;.json</code>. Never sent to client.
        </p>
      </div>
    </SettingGroup>
  )
}
