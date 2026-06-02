'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Trash2, CheckCircle2, Loader2, XCircle, Clock, ChevronRight } from 'lucide-react'
import { useStore, Mission, AgentNode } from '@/lib/store'
import PanelHeader from '@/components/ui/PanelHeader'
import {
  saveToVault, missionsFilePath, missionsFileHeader,
  formatMissionEntry,
} from '@/lib/vault'

const PRIORITY_CONFIG = {
  critical: { color: 'rgba(239,68,68,', label: 'CRITICAL' },
  high: { color: 'rgba(245,158,11,', label: 'HIGH' },
  medium: { color: 'rgba(6,182,212,', label: 'MED' },
  low: { color: 'rgba(255,255,255,0.', label: 'LOW' },
}

const STATUS_CONFIG = {
  pending: { icon: <Clock size={13} />, color: 'rgba(255,255,255,0.4)' },
  running: { icon: <Loader2 size={13} className="animate-spin" />, color: 'rgba(6,182,212,1)' },
  completed: { icon: <CheckCircle2 size={13} />, color: 'rgba(16,185,129,1)' },
  failed: { icon: <XCircle size={13} />, color: 'rgba(239,68,68,1)' },
}

export default function MissionControlPanel() {
  const missions        = useStore((s) => s.missions)
  const addMission      = useStore((s) => s.addMission)
  const updateMission   = useStore((s) => s.updateMission)
  const deleteMission   = useStore((s) => s.deleteMission)
  const nodes           = useStore((s) => s.nodes)
  const vaultEnabled    = useStore((s) => s.vaultEnabled)
  const hetznerHost     = useStore((s) => s.hetznerHost)
  const vaultSshUser    = useStore((s) => s.vaultSshUser)
  const vaultSshKeyPath = useStore((s) => s.vaultSshKeyPath)
  const vaultSshPassword = useStore((s) => s.vaultSshPassword)
  const setVaultSaveStatus = useStore((s) => s.setVaultSaveStatus)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', priority: 'medium' as Mission['priority'],
    assignedTo: 'hetzner-vps',
  })

  // Saves a single mission entry to the vault's missions.md (always appends)
  const saveToMissionsVault = async (mission: Mission) => {
    if (!vaultEnabled) return
    setVaultSaveStatus('saving')
    const isFirstMission = missions.length === 0
    const chunk = (isFirstMission ? missionsFileHeader() : '') +
      formatMissionEntry({
        title: mission.title,
        description: mission.description,
        priority: mission.priority,
        status: mission.status,
        assignedTo: mission.assignedTo,
        createdAt: mission.createdAt,
        completedAt: mission.completedAt,
      })
    const result = await saveToVault({
      remotePath: missionsFilePath(),
      content: chunk,
      append: !isFirstMission,
      commitMessage: `missions: ${mission.title} — Multi-AgentOS`,
      host: hetznerHost,
      sshUser: vaultSshUser || 'root',
      sshKeyPath: vaultSshKeyPath || undefined,
      sshPassword: vaultSshPassword || undefined,
    })
    setVaultSaveStatus(result.success ? 'saved' : 'error', result.error)
  }

  const submit = async () => {
    if (!form.title.trim()) return
    const mission: Mission = {
      id: Date.now().toString(),
      title: form.title,
      description: form.description,
      status: 'pending',
      assignedTo: form.assignedTo,
      priority: form.priority,
      createdAt: new Date(),
      progress: 0,
    }
    addMission(mission)
    setForm({ title: '', description: '', priority: 'medium', assignedTo: 'hetzner-vps' })
    setShowForm(false)
    await saveToMissionsVault(mission)
  }

  const running = missions.filter((m) => m.status === 'running').length
  const completed = missions.filter((m) => m.status === 'completed').length
  const pending = missions.filter((m) => m.status === 'pending').length

  return (
    <div className="flex flex-col h-full">
      <PanelHeader
        title="Mission Control"
        subtitle="Dispatch & track agent tasks"
        color="pink"
        icon={<Target size={15} />}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-3 flex-shrink-0">
        {[
          { label: 'Running', value: running, color: 'rgba(6,182,212,' },
          { label: 'Pending', value: pending, color: 'rgba(245,158,11,' },
          { label: 'Done', value: completed, color: 'rgba(16,185,129,' },
        ].map((s) => (
          <div
            key={s.label}
            className="text-center py-2 rounded-xl"
            style={{ background: `${s.color}0.07)`, border: `1px solid ${s.color}0.15)` }}
          >
            <div className="text-2xl font-bold" style={{ color: `${s.color}1)` }}>{s.value}</div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* New mission button */}
      <div className="px-4 pb-3 flex-shrink-0">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={() => setShowForm(!showForm)}
          className="w-full py-2 rounded-xl flex items-center justify-center gap-2 text-sm font-medium btn-cyan"
        >
          <Plus size={15} />
          New Mission
        </motion.button>
      </div>

      {/* Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-3 overflow-hidden flex-shrink-0"
          >
            <div
              className="p-3 rounded-xl space-y-2"
              style={{ background: 'rgba(236,72,153,0.06)', border: '1px solid rgba(236,72,153,0.15)' }}
            >
              <input
                className="input-glass w-full px-3 py-2 rounded-lg text-sm"
                placeholder="Mission title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
              <textarea
                className="input-glass w-full px-3 py-2 rounded-lg text-sm resize-none"
                placeholder="Description (optional)"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <div className="flex gap-2">
                <select
                  className="input-glass flex-1 px-3 py-1.5 rounded-lg text-sm"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value as Mission['priority'] })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
                <select
                  className="input-glass flex-1 px-3 py-1.5 rounded-lg text-sm"
                  value={form.assignedTo}
                  onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
                >
                  {nodes.map((n) => (
                    <option key={n.id} value={n.id}>{n.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-1.5 rounded-lg text-sm btn-glass"
                >Cancel</button>
                <button
                  onClick={submit}
                  className="flex-1 py-1.5 rounded-lg text-sm btn-cyan font-medium"
                >Deploy</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mission list */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 min-h-0">
        <AnimatePresence>
          {[...missions].reverse().map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              nodes={nodes}
              onUpdate={async (id, updates) => {
                updateMission(id, updates)
                // Vault-save on terminal state changes
                if (updates.status === 'completed' || updates.status === 'failed') {
                  const updated: Mission = {
                    ...mission,
                    ...updates,
                    completedAt: updates.status === 'completed' ? new Date() : undefined,
                  }
                  await saveToMissionsVault(updated)
                }
              }}
              onDelete={deleteMission}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function MissionCard({ mission, nodes, onUpdate, onDelete }: {
  mission: Mission
  nodes: AgentNode[]
  onUpdate: (id: string, u: Partial<Mission>) => Promise<void>
  onDelete: (id: string) => void
}) {
  const pc = PRIORITY_CONFIG[mission.priority]
  const sc = STATUS_CONFIG[mission.status]
  const node = nodes.find((n: any) => n.id === mission.assignedTo)

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      layout
      className="p-3 rounded-xl group"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      whileHover={{ borderColor: 'rgba(255,255,255,0.12)' }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          <div style={{ color: sc.color, marginTop: 1, flexShrink: 0 }}>{sc.icon}</div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-white truncate">{mission.title}</span>
              <span
                className="text-xs px-1.5 py-0.5 rounded font-mono font-bold"
                style={{ background: `${pc.color}0.12)`, color: `${pc.color}1)`, border: `1px solid ${pc.color}0.25)` }}
              >
                {pc.label}
              </span>
            </div>
            {mission.description && (
              <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                {mission.description}
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              {node && (
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {node.icon} {node.name}
                </span>
              )}
              {mission.status === 'running' && (
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)', maxWidth: 80 }}>
                  <motion.div
                    className="h-full rounded-full"
                    animate={{ width: `${mission.progress}%` }}
                    transition={{ duration: 1 }}
                    style={{ background: 'linear-gradient(90deg, rgba(6,182,212,0.8), rgba(139,92,246,0.8))' }}
                  />
                </div>
              )}
              {mission.status === 'running' && (
                <span className="text-xs" style={{ color: 'rgba(6,182,212,0.7)' }}>{mission.progress}%</span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {mission.status === 'pending' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(mission.id, { status: 'running', progress: 5 })}
              className="w-6 h-6 rounded-lg flex items-center justify-center btn-glass"
              title="Start"
            >
              <ChevronRight size={12} />
            </motion.button>
          )}
          {mission.status === 'running' && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onUpdate(mission.id, { status: 'completed', progress: 100 })}
              className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', color: '#10b981' }}
              title="Complete"
            >
              <CheckCircle2 size={12} />
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(mission.id)}
            className="w-6 h-6 rounded-lg flex items-center justify-center btn-glass"
            style={{ color: 'rgba(239,68,68,0.7)' }}
            title="Delete"
          >
            <Trash2 size={12} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
