'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Save, Trash2, Tag, CheckCircle2, AlertCircle, Loader2, BookMarked, Mic, MicOff } from 'lucide-react'
import { useStore, JournalEntry } from '@/lib/store'
import {
  saveToVault, journalFilePath, journalFileHeader,
  formatJournalEntry, todayStr,
} from '@/lib/vault'
import { useVoiceInput } from '@/lib/useVoiceInput'

const SUGGESTED_TAGS = ['insight', 'decision', 'idea', 'blocker', 'win', 'learning', 'todo']

export default function JournalPanel() {
  const [content, setContent]   = useState('')
  const [tags, setTags]         = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving]     = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveError, setSaveError] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [voiceActive, setVoiceActive] = useState(false)

  const onFinal = useCallback((text: string) => {
    setContent((prev) => (prev ? prev + ' ' + text : text))
    setVoiceActive(false)
  }, [])
  const voice = useVoiceInput({ onFinalTranscript: onFinal })

  const entries        = useStore((s) => s.journalEntries)
  const addEntry       = useStore((s) => s.addJournalEntry)
  const deleteEntry    = useStore((s) => s.deleteJournalEntry)
  const vaultEnabled   = useStore((s) => s.vaultEnabled)
  const hetznerHost    = useStore((s) => s.hetznerHost)
  const vaultSshUser   = useStore((s) => s.vaultSshUser)
  const vaultSshKeyPath = useStore((s) => s.vaultSshKeyPath)
  const vaultSshPassword = useStore((s) => s.vaultSshPassword)
  const setVaultSaveStatus = useStore((s) => s.setVaultSaveStatus)

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 260) + 'px'
  }, [content])

  const addTag = (t: string) => {
    const clean = t.trim().toLowerCase().replace(/\s+/g, '-')
    if (clean && !tags.includes(clean)) setTags((prev) => [...prev, clean])
    setTagInput('')
  }

  const removeTag = (t: string) => setTags((prev) => prev.filter((x) => x !== t))

  const save = async () => {
    if (!content.trim()) return
    setSaving('saving')
    setSaveError('')

    const entry: JournalEntry = {
      id: crypto.randomUUID(),
      content: content.trim(),
      tags,
      timestamp: new Date(),
    }

    // Persist locally
    addEntry(entry)

    // Save to vault if enabled
    if (vaultEnabled) {
      setVaultSaveStatus('saving')
      const date    = todayStr()
      const filePath = journalFilePath(date)
      const isNew   = entries.filter((e) =>
        new Date(e.timestamp).toISOString().slice(0, 10) === date
      ).length === 0

      const chunk = [
        isNew ? journalFileHeader(date) : '',
        formatJournalEntry(entry.content, entry.tags, entry.timestamp),
      ].join('')

      const result = await saveToVault({
        remotePath: filePath,
        content: chunk,
        append: !isNew,
        commitMessage: `journal: ${date} entry — Agentic OS`,
        host: hetznerHost,
        sshUser: vaultSshUser || 'root',
        sshKeyPath: vaultSshKeyPath || undefined,
        sshPassword: vaultSshPassword || undefined,
      })

      if (result.success) {
        setVaultSaveStatus('saved')
        setSaving('saved')
      } else {
        setVaultSaveStatus('error', result.error)
        setSaving('error')
        setSaveError(result.error ?? 'Save failed')
      }
    } else {
      setSaving('saved')
    }

    setContent('')
    setTags([])
    setTimeout(() => setSaving('idle'), 3000)
  }

  const charCount = content.length
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.28)', color: 'rgba(168,85,247,1)' }}>
            <BookOpen size={15} />
          </div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--text-1)' }}>Journal</div>
            <div className="text-xs" style={{ color: 'var(--text-3)' }}>
              {todayStr()} · {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
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

      <div className="flex-1 overflow-hidden flex flex-col md:flex-row min-h-0">
        {/* Write area */}
        <div className="flex flex-col flex-1 p-4 min-h-0" style={{ borderRight: '1px solid var(--glass-border)' }}>
          {/* Textarea */}
          <div
            className="flex-shrink-0 rounded-2xl overflow-hidden mb-3 transition-all duration-200"
            style={{
              background: 'var(--glass-2)',
              border: `1px solid ${content ? 'rgba(168,85,247,0.3)' : 'var(--glass-border)'}`,
              boxShadow: content ? '0 0 20px rgba(168,85,247,0.07)' : 'none',
            }}
          >
            <div className="flex items-start">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Write today's thoughts, decisions, and insights…\n\nThis will be saved to:\n03-Projects/Agentic-OS/journal/${todayStr()}.md`}
                className="flex-1 bg-transparent resize-none outline-none text-sm p-4"
                style={{
                  color: 'var(--text-1)',
                  lineHeight: '1.7',
                  minHeight: 160,
                  caretColor: 'rgba(168,85,247,0.8)',
                }}
              />
              {/* Mic button */}
              {voice.supported && (
                <button
                  onClick={() => {
                    if (voice.state === 'listening') { voice.stop(); setVoiceActive(false) }
                    else { setVoiceActive(true); voice.start() }
                  }}
                  className="m-3 p-2 rounded-xl transition-all flex-shrink-0"
                  style={{
                    background: voice.state === 'listening' ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.08)',
                    border: `1px solid ${voice.state === 'listening' ? 'rgba(239,68,68,0.4)' : 'rgba(168,85,247,0.2)'}`,
                    color: voice.state === 'listening' ? 'rgba(239,68,68,0.9)' : 'rgba(168,85,247,0.6)',
                  }}
                  title={voice.state === 'listening' ? 'Stop recording' : 'Voice input'}
                >
                  {voice.state === 'listening' ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              )}
            </div>
            {/* Voice interim text */}
            {voice.state === 'listening' && voice.interimText && (
              <div className="px-4 pb-2">
                <div className="text-xs px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)', fontStyle: 'italic' }}>
                  {voice.interimText}
                </div>
              </div>
            )}
            {/* Voice error */}
            {voice.errorMessage && (
              <div className="px-4 pb-2">
                <div className="text-xs px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', color: 'rgba(239,68,68,0.7)' }}>
                  {voice.errorMessage}
                </div>
              </div>
            )}
            {/* Metadata bar */}
            <div
              className="flex items-center justify-between px-4 py-2"
              style={{ borderTop: '1px solid var(--glass-border)', color: 'var(--text-4)' }}
            >
              <span className="text-xs">{wordCount} words · {charCount} chars</span>
              <span className="text-xs">Shift+Enter for newline</span>
            </div>
          </div>

          {/* Tag input */}
          <div className="mb-3 flex-shrink-0">
            <div className="flex items-center gap-2 mb-2">
              <Tag size={12} style={{ color: 'var(--text-3)' }} />
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>Tags</span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {tags.map((t) => (
                <motion.span
                  key={t}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs cursor-pointer"
                  style={{ background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', color: 'rgba(168,85,247,0.9)' }}
                  onClick={() => removeTag(t)}
                  title="Click to remove"
                >
                  #{t} ×
                </motion.span>
              ))}
            </div>
            {/* Quick tag suggestions */}
            <div className="flex flex-wrap gap-1 mb-2">
              {SUGGESTED_TAGS.filter((t) => !tags.includes(t)).map((t) => (
                <button
                  key={t}
                  onClick={() => addTag(t)}
                  className="px-2 py-0.5 rounded-full text-xs transition-all btn-ghost"
                  style={{ border: '1px solid var(--glass-border)', color: 'var(--text-3)' }}
                >
                  +{t}
                </button>
              ))}
            </div>
            <input
              className="input-glass w-full px-3 py-1.5 rounded-lg text-sm"
              placeholder="Custom tag (Enter to add)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(tagInput) }
              }}
            />
          </div>

          {/* Error */}
          <AnimatePresence>
            {saving === 'error' && saveError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2 p-3 rounded-xl text-xs mb-3"
                style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: 'rgba(252,165,165,0.9)' }}
              >
                <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
                <span>{saveError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Save button */}
          <motion.button
            whileHover={content.trim() ? { scale: 1.01 } : {}}
            whileTap={content.trim() ? { scale: 0.99 } : {}}
            onClick={save}
            disabled={!content.trim() || saving === 'saving'}
            className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 flex-shrink-0"
            style={{
              background: saving === 'saved'
                ? 'rgba(16,185,129,0.15)'
                : saving === 'error'
                ? 'rgba(239,68,68,0.1)'
                : content.trim()
                ? 'rgba(168,85,247,0.15)'
                : 'rgba(255,255,255,0.04)',
              border: saving === 'saved'
                ? '1px solid rgba(16,185,129,0.35)'
                : saving === 'error'
                ? '1px solid rgba(239,68,68,0.3)'
                : content.trim()
                ? '1px solid rgba(168,85,247,0.35)'
                : '1px solid var(--glass-border)',
              color: saving === 'saved'
                ? '#10b981'
                : saving === 'error'
                ? '#f87171'
                : content.trim()
                ? 'rgba(168,85,247,0.9)'
                : 'var(--text-4)',
              boxShadow: saving === 'saved'
                ? '0 0 20px rgba(16,185,129,0.12)'
                : content.trim() && saving === 'idle'
                ? '0 0 20px rgba(168,85,247,0.1)'
                : 'none',
            }}
          >
            <AnimatePresence mode="wait">
              {saving === 'saving' && (
                <motion.span key="saving" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Loader2 size={15} className="animate-spin" /> Saving to vault…
                </motion.span>
              )}
              {saving === 'saved' && (
                <motion.span key="saved" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <CheckCircle2 size={15} /> Saved to OpenClaw-Wiki
                </motion.span>
              )}
              {saving === 'error' && (
                <motion.span key="error" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <AlertCircle size={15} /> Save failed — retry
                </motion.span>
              )}
              {saving === 'idle' && (
                <motion.span key="idle" className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <Save size={15} /> {vaultEnabled ? 'Save to vault' : 'Save entry'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {vaultEnabled && (
            <p className="text-xs text-center mt-2" style={{ color: 'var(--text-4)' }}>
              → <code className="font-terminal">03-Projects/Agentic-OS/journal/{todayStr()}.md</code>
            </p>
          )}
        </div>

        {/* Past entries */}
        <div className="w-full md:w-72 flex flex-col min-h-0 flex-shrink-0">
          <div className="px-4 py-3 text-xs font-bold tracking-widest" style={{ color: 'var(--text-3)', borderBottom: '1px solid var(--glass-border)' }}>
            RECENT ENTRIES
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {entries.length === 0 && (
              <div className="text-center py-8 text-xs" style={{ color: 'var(--text-4)' }}>
                No entries yet
              </div>
            )}
            <AnimatePresence>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDelete={deleteEntry} />
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

function EntryCard({ entry, onDelete }: { entry: JournalEntry; onDelete: (id: string) => void }) {
  const ts = new Date(entry.timestamp).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true,
  })
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: 20 }}
      layout
      className="p-3 rounded-xl group relative"
      style={{ background: 'rgba(168,85,247,0.05)', border: '1px solid rgba(168,85,247,0.1)' }}
      whileHover={{ borderColor: 'rgba(168,85,247,0.2)' }}
    >
      <div className="text-xs mb-1.5" style={{ color: 'rgba(168,85,247,0.6)' }}>{ts}</div>
      <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'var(--text-2)' }}>
        {entry.content}
      </p>
      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {entry.tags.map((t) => (
            <span key={t} className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: 'rgba(168,85,247,0.08)', color: 'rgba(168,85,247,0.6)', border: '1px solid rgba(168,85,247,0.15)' }}>
              #{t}
            </span>
          ))}
        </div>
      )}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => onDelete(entry.id)}
        className="absolute top-2 right-2 w-6 h-6 rounded-lg items-center justify-center btn-ghost hidden group-hover:flex"
        style={{ color: 'rgba(239,68,68,0.6)' }}
      >
        <Trash2 size={11} />
      </motion.button>
    </motion.div>
  )
}
