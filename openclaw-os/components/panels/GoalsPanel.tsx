'use client'
import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, Plus, Mic, MicOff, Archive, CheckCircle2, Circle, Trash2, CheckCircle, AlertCircle, Loader2, BookMarked, Tag } from 'lucide-react'
import { useStore, Goal } from '@/lib/store'
import {
  saveToVault, goalsFilePath, goalsFileHeader,
  formatGoalEntry, todayStr,
} from '@/lib/vault'
import { useVoiceInput } from '@/lib/useVoiceInput'

const PRIORITY_OPTIONS: Array<{ value: Goal['priority']; label: string; color: string }> = [
  { value: 'high',   label: 'High',   color: 'rgba(239,68,68,0.9)' },
  { value: 'medium', label: 'Medium', color: 'rgba(251,191,36,0.9)' },
  { value: 'low',    label: 'Low',    color: 'rgba(59,130,246,0.9)' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'all',       label: 'All' },
  { value: 'pending',   label: 'Active' },
  { value: 'completed', label: 'Done' },
  { value: 'archived',  label: 'Archived' },
] as const

export default function GoalsPanel() {
  const [title, setTitle]           = useState('')
  const [description, setDesc]     = useState('')
  const [priority, setPriority]     = useState<Goal['priority']>('medium')
  const [statusFilter, setFilter]   = useState<'all'|'pending'|'completed'|'archived'>('pending')
  const [saving, setSaving]        = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [saveError, setSaveError]  = useState('')
  const [editingId, setEditingId]  = useState<string | null>(null)
  const [editTitle, setEditTitle]   = useState('')
  const [voiceFor, setVoiceFor]    = useState<'title' | 'desc' | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const goals         = useStore((s) => s.goals)
  const addGoal       = useStore((s) => s.addGoal)
  const updateGoal   = useStore((s) => s.updateGoal)
  const deleteGoal   = useStore((s) => s.deleteGoal)
  const vaultEnabled  = useStore((s) => s.vaultEnabled)
  const hetznerHost   = useStore((s) => s.hetznerHost)
  const vaultSshUser  = useStore((s) => s.vaultSshUser)
  const vaultSshKeyPath = useStore((s) => s.vaultSshKeyPath)
  const vaultSshPassword = useStore((s) => s.vaultSshPassword)
  const setVaultSaveStatus = useStore((s) => s.setVaultSaveStatus)

  // Voice input for title field
  const voiceOnTitle = useVoiceInput({
    onFinalTranscript: useCallback((text: string) => {
      setTitle((prev) => (prev ? prev + ' ' + text : text))
      setVoiceFor(null)
    }, []),
  })

  // Voice input for description field
  const voiceOnDesc = useVoiceInput({
    onFinalTranscript: useCallback((text: string) => {
      setDesc((prev) => (prev ? prev + ' ' + text : text))
      setVoiceFor(null)
    }, []),
  })

  const filtered = goals.filter((g) => {
    if (statusFilter === 'all') return true
    return g.status === statusFilter
  })

  const stats = {
    total:    goals.length,
    pending:  goals.filter((g) => g.status === 'pending').length,
    done:     goals.filter((g) => g.status === 'completed').length,
    archived: goals.filter((g) => g.status === 'archived').length,
  }

  const save = async (goal?: Goal) => {
    const toSave = goal ?? (() => {
      if (!title.trim()) return null
      const g: Goal = {
        id: crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        status: 'pending',
        priority,
        createdAt: new Date(),
      }
      addGoal(g)
      return g
    })()
    if (!toSave) return

    if (vaultEnabled && hetznerHost) {
      setSaving('saving')
      setVaultSaveStatus('saving')
      const date    = todayStr()
      const filePath = goalsFilePath(date)
      // Check if any goal for this month already exists
      const monthGoals = goals.filter(
        (g) => g.createdAt.toISOString().slice(0, 7) === date.slice(0, 7)
      )
      const isFirst = monthGoals.length === 0

      const chunk = [
        isFirst ? goalsFileHeader(date) : '',
        formatGoalEntry(toSave),
      ].join('')

      const result = await saveToVault({
        remotePath: filePath,
        content: chunk,
        append: !isFirst,
        commitMessage: `goals: ${date.slice(0, 7)} update — Agentic OS`,
        host: hetznerHost,
        sshUser: vaultSshUser || 'root',
        sshKeyPath: vaultSshKeyPath || undefined,
        sshPassword: vaultSshPassword || undefined,
      })

      if (result.success) {
        setSaving('saved')
        setVaultSaveStatus('saved')
      } else {
        setSaving('error')
        setSaveError(result.error ?? 'Save failed')
        setVaultSaveStatus('error', result.error)
      }
    } else {
      setSaving('saved')
    }

    setTimeout(() => setSaving('idle'), 3000)
  }

  const handleToggle = async (goal: Goal) => {
    const newStatus: Goal['status'] =
      goal.status === 'pending' ? 'completed'
      : goal.status === 'completed' ? 'archived'
      : 'pending'
    const updates: Partial<Goal> = { status: newStatus }
    if (newStatus === 'completed') updates.completedAt = new Date()
    updateGoal(goal.id, updates)
    await save({ ...goal, ...updates })
  }

  const handleArchive = async (goal: Goal) => {
    updateGoal(goal.id, { status: 'archived' })
    await save({ ...goal, status: 'archived' })
  }

  const startEdit = (goal: Goal) => {
    setEditingId(goal.id)
    setEditTitle(goal.title)
  }

  const submitEdit = async (goal: Goal) => {
    if (!editTitle.trim()) return
    updateGoal(goal.id, { title: editTitle.trim() })
    await save({ ...goal, title: editTitle.trim() })
    setEditingId(null)
    setEditTitle('')
  }

  const voiceIcon = (field: 'title' | 'desc') => voiceFor === field
  const voiceActive = voiceFor !== null
  const voiceState = voiceFor === 'title' ? voiceOnTitle : voiceOnDesc

  const VoiceBtn = ({ field }: { field: 'title' | 'desc' }) => {
    const active = voiceFor === field
    const { state, start, stop, supported } = field === 'title' ? voiceOnTitle : voiceOnDesc
    if (!supported) return null
    return (
      <button
        type="button"
        onClick={() => {
          if (active) { stop(); setVoiceFor(null) }
          else { setVoiceFor(field); start() }
        }}
        className="ml-1 p-1 rounded-lg transition-all"
        style={{
          background: state === 'listening' ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${state === 'listening' ? 'rgba(239,68,68,0.4)' : 'var(--glass-border)'}`,
          color: state === 'listening' ? 'rgba(239,68,68,0.9)' : 'var(--text-3)',
        }}
        title={state === 'listening' ? 'Stop recording' : 'Voice input'}
      >
        {state === 'listening' ? <MicOff size={14} /> : <Mic size={14} />}
      </button>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.28)', color: 'rgba(249,115,22,1)' }}>
            <Target size={15} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Goals</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>
              {stats.pending} active · {stats.done} done
              {vaultEnabled && <span className="ml-2">· <span style={{ color: 'rgba(16,185,129,0.8)' }}>vault sync on</span></span>}
            </div>
          </div>
        </div>
        {vaultEnabled && (
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: 'rgba(16,185,129,0.9)' }}>
            <BookMarked size={11} />
            <span>OpenClaw-Wiki</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-hidden flex flex-col min-h-0">
        {/* Add goal form */}
        <div className="p-4 flex-shrink-0" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Plus size={14} style={{ color: 'rgba(249,115,22,0.7)' }} />
            <span className="text-xs font-semibold" style={{ color: 'var(--text-3)' }}>NEW GOAL</span>
          </div>

          {/* Title input */}
          <div className="mb-2">
            <div className="flex items-center mb-1">
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') save() }}
                placeholder="What do you want to achieve?"
                className="input-glass w-full px-3 py-2 rounded-xl text-sm"
                style={{ paddingRight: '2.5rem' }}
              />
              <VoiceBtn field="title" />
            </div>
            {/* Voice interim text */}
            {voiceFor === 'title' && voiceState.interimText && (
              <div className="text-xs px-3 py-1 rounded-lg mb-1"
                style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)', fontStyle: 'italic' }}>
                {voiceState.interimText}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="mb-2">
            <div className="flex items-center mb-1">
              <textarea
                ref={textareaRef}
                value={description}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Details (optional) — Enter to add, Shift+Enter for newline"
                className="w-full bg-transparent resize-none outline-none text-xs p-3 rounded-xl"
                style={{
                  color: 'var(--text-2)',
                  border: '1px solid var(--glass-border)',
                  background: 'rgba(255,255,255,0.02)',
                  minHeight: 64,
                  caretColor: 'rgba(249,115,22,0.8)',
                }}
                rows={2}
              />
              <VoiceBtn field="desc" />
            </div>
            {voiceFor === 'desc' && voiceState.interimText && (
              <div className="text-xs px-3 py-1 rounded-lg mb-1"
                style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)', fontStyle: 'italic' }}>
                {voiceState.interimText}
              </div>
            )}
          </div>

          {/* Priority selector + Save */}
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {PRIORITY_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setPriority(opt.value)}
                  className="px-2 py-1 rounded-lg text-xs transition-all"
                  style={{
                    background: priority === opt.value ? `${opt.color}18` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${priority === opt.value ? opt.color : 'var(--glass-border)'}`,
                    color: priority === opt.value ? opt.color : 'var(--text-4)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => save()}
              disabled={!title.trim() || saving === 'saving'}
              className="px-4 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              style={{
                background: title.trim() ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${title.trim() ? 'rgba(249,115,22,0.35)' : 'var(--glass-border)'}`,
                color: title.trim() ? 'rgba(249,115,22,0.9)' : 'var(--text-4)',
              }}
            >
              {saving === 'saving' ? <><Loader2 size={12} className="animate-spin" /> Saving…</>
               : saving === 'saved' ? <><CheckCircle2 size={12} /> Saved</>
               : <><Plus size={12} /> Add goal</>}
            </button>
          </div>

          {saving === 'error' && saveError && (
            <div className="mt-2 text-xs px-3 py-2 rounded-xl"
              style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(252,165,165,0.9)', border: '1px solid rgba(239,68,68,0.2)' }}>
              <AlertCircle size={11} className="inline mr-1" />{saveError}
            </div>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 px-4 py-2 flex-shrink-0" style={{ borderBottom: '1px solid var(--glass-border)' }}>
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value as typeof statusFilter)}
              className="px-3 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: statusFilter === opt.value ? 'rgba(249,115,22,0.12)' : 'transparent',
                border: `1px solid ${statusFilter === opt.value ? 'rgba(249,115,22,0.3)' : 'transparent'}`,
                color: statusFilter === opt.value ? 'rgba(249,115,22,0.9)' : 'var(--text-3)',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Goals list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 && (
            <div className="text-center py-10">
              <Target size={28} style={{ color: 'var(--text-4)', margin: '0 auto 8px' }} />
              <p className="text-xs" style={{ color: 'var(--text-4)' }}>
                {statusFilter === 'pending' ? 'No active goals — add one above' :
                 statusFilter === 'completed' ? 'No completed goals yet' :
                 statusFilter === 'archived' ? 'No archived goals' :
                 'No goals yet'}
              </p>
            </div>
          )}
          <AnimatePresence>
            {filtered.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                editingId={editingId}
                editTitle={editTitle}
                onToggle={() => handleToggle(goal)}
                onArchive={() => handleArchive(goal)}
                onDelete={() => deleteGoal(goal.id)}
                onStartEdit={startEdit}
                onEditTitleChange={setEditTitle}
                onSubmitEdit={submitEdit}
                onCancelEdit={() => { setEditingId(null); setEditTitle('') }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Vault path */}
        {vaultEnabled && (
          <div className="px-4 py-2 flex-shrink-0" style={{ borderTop: '1px solid var(--glass-border)' }}>
            <p className="text-xs text-center" style={{ color: 'var(--text-4)' }}>
              → <code className="font-terminal">03-Projects/Agentic-OS/goals/{todayStr().slice(0,7)}.md</code>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

function GoalCard({
  goal, editingId, editTitle,
  onToggle, onArchive, onDelete,
  onStartEdit, onEditTitleChange, onSubmitEdit, onCancelEdit,
}: {
  goal: Goal
  editingId: string | null
  editTitle: string
  onToggle: () => void
  onArchive: () => void
  onDelete: () => void
  onStartEdit: (g: Goal) => void
  onEditTitleChange: (t: string) => void
  onSubmitEdit: (g: Goal) => void
  onCancelEdit: () => void
}) {
  const isEditing = editingId === goal.id
  const priorityColor = {
    high: 'rgba(239,68,68,0.8)',
    medium: 'rgba(251,191,36,0.8)',
    low: 'rgba(59,130,246,0.8)',
  }[goal.priority]

  const cardBg = {
    pending:   'rgba(249,115,22,0.04)',
    completed: 'rgba(16,185,129,0.04)',
    archived:  'rgba(255,255,255,0.02)',
  }[goal.status]

  const borderColor = {
    pending:   'rgba(249,115,22,0.12)',
    completed: 'rgba(16,185,129,0.12)',
    archived:  'var(--glass-border)',
  }[goal.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
      className="p-3 rounded-xl group"
      style={{ background: cardBg, border: `1px solid ${borderColor}` }}
      whileHover={{ borderColor: 'rgba(249,115,22,0.25)' }}
    >
      <div className="flex items-start gap-3">
        {/* Toggle button */}
        <button onClick={onToggle} className="mt-0.5 flex-shrink-0 transition-all">
          {goal.status === 'completed' ? (
            <CheckCircle size={18} style={{ color: 'rgba(16,185,129,0.7)' }} />
          ) : goal.status === 'archived' ? (
            <Archive size={18} style={{ color: 'var(--text-4)' }} />
          ) : (
            <Circle size={18} style={{ color: priorityColor }} />
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <input
              value={editTitle}
              onChange={(e) => onEditTitleChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmitEdit(goal)
                if (e.key === 'Escape') onCancelEdit()
              }}
              autoFocus
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: 'var(--text-1)', borderBottom: '1px solid rgba(249,115,22,0.4)' }}
            />
          ) : (
            <p
              className="text-sm"
              style={{
                color: goal.status === 'completed' ? 'var(--text-4)' : 'var(--text-1)',
                textDecoration: goal.status === 'completed' ? 'line-through' : 'none',
              }}
            >
              {goal.title}
            </p>
          )}

          {goal.description && !isEditing && (
            <p className="text-xs mt-1" style={{ color: 'var(--text-4)' }}>{goal.description}</p>
          )}

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: `${priorityColor}15`,
                border: `1px solid ${priorityColor}40`,
                color: priorityColor,
              }}
            >
              {goal.priority}
            </span>
            <span className="text-xs" style={{ color: 'var(--text-4)' }}>
              {new Date(goal.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
            </span>
            {goal.completedAt && goal.status === 'completed' && (
              <span className="text-xs" style={{ color: 'rgba(16,185,129,0.6)' }}>
                done {new Date(goal.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          {isEditing ? (
            <>
              <button onClick={() => onSubmitEdit(goal)} className="p-1.5 rounded-lg" style={{ color: 'rgba(16,185,129,0.8)' }}>
                <CheckCircle2 size={14} />
              </button>
              <button onClick={onCancelEdit} className="p-1.5 rounded-lg" style={{ color: 'rgba(239,68,68,0.6)' }}>
                <AlertCircle size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => onStartEdit(goal)} className="p-1.5 rounded-lg btn-ghost" style={{ color: 'var(--text-4)' }}>
                <Tag size={13} />
              </button>
              <button onClick={onArchive} className="p-1.5 rounded-lg btn-ghost" style={{ color: 'var(--text-4)' }}>
                <Archive size={13} />
              </button>
              <button onClick={onDelete} className="p-1.5 rounded-lg btn-ghost" style={{ color: 'rgba(239,68,68,0.5)' }}>
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
