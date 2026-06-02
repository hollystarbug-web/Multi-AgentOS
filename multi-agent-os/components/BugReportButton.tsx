'use client'

/**
 * BugReportButton — floating "🐛 Report" pill, bottom-right.
 *
 * On click → opens a modal where the user describes what went wrong.
 * The modal auto-collects context (current agent, recent errors, store
 * snapshot) so Holly can diagnose without asking follow-up questions.
 *
 * Submits to POST /api/bug-report which writes a vault file:
 *   Multi-Agent OS/Bug Reports/YYYY-MM-DD-HHMM-{slug}.md
 *
 * Keyboard shortcut: ⌘K (or Ctrl+K) toggles the modal from anywhere.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bug, X, Send, Loader2, CheckCircle2, AlertTriangle, ChevronRight, Sparkles } from 'lucide-react'
import { buildBugReport, type BugReportPayload } from '@/lib/bugReport'
import { captureError, installGlobalErrorHandlers } from '@/lib/errorCapture'

type Severity = BugReportPayload['severity']

const SEVERITIES: Array<{ value: Severity; label: string; emoji: string; hint: string }> = [
  { value: 'annoyance', label: 'Annoyance', emoji: '🔔', hint: 'Cosmetic, works around it' },
  { value: 'broken',    label: 'Broken',    emoji: '🛠️', hint: "Feature doesn't work" },
  { value: 'data-loss', label: 'Data loss', emoji: '💾', hint: 'Lost work or wrong save' },
  { value: 'critical',  label: 'Critical',  emoji: '🚨', hint: 'Blocks me from working' },
]

const EXAMPLE_REPORTS = [
  'When I send a message to OpenClaw, I see "no output"',
  "Hermes chat doesn't remember my conversation when I switch tabs",
  'Agent panel says "degraded" but I don\'t know what that means',
]

export default function BugReportButton() {
  const [open, setOpen] = useState(false)
  const [description, setDescription] = useState('')
  const [expected, setExpected] = useState('')
  const [severity, setSeverity] = useState<Severity>('broken')
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ success: true; file: string } | { success: false; error: string } | null>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)

  // Install global error handlers once on mount
  useEffect(() => {
    installGlobalErrorHandlers()
  }, [])

  // ⌘K / Ctrl+K toggles the modal
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      } else if (e.key === 'Escape' && open) {
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  // Auto-focus description when modal opens
  useEffect(() => {
    if (open) {
      // Small delay so the modal can render before focus
      setTimeout(() => descRef.current?.focus(), 80)
    }
  }, [open])

  async function submit() {
    if (description.trim().length < 3) return
    setSubmitting(true)
    setResult(null)
    try {
      const payload = buildBugReport(description.trim(), severity, expected.trim() || undefined)
      const resp = await fetch('/api/bug-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await resp.json()
      if (data.success) {
        setResult({ success: true, file: data.file })
        // Clear the form for next time
        setDescription('')
        setExpected('')
        setSeverity('broken')
        // Auto-close after 3s on success
        setTimeout(() => {
          setOpen(false)
          setResult(null)
        }, 3500)
      } else {
        setResult({ success: false, error: data.error || 'submit failed' })
        captureError(`Bug report submit failed: ${data.error}`, 'manual')
      }
    } catch (e: any) {
      setResult({ success: false, error: e?.message || 'network error' })
      captureError(`Bug report network error: ${e?.message}`, 'manual')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full font-medium text-sm"
        style={{
          background: 'linear-gradient(135deg, rgba(239,68,68,0.18), rgba(251,191,36,0.18))',
          border: '1px solid rgba(239,68,68,0.35)',
          color: 'var(--text-1)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05) inset',
        }}
        title="Report a bug — ⌘K (or Ctrl+K)"
      >
        <Bug size={15} />
        <span>Report bug</span>
        <span
          className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono"
          style={{
            background: 'rgba(255,255,255,0.08)',
            color: 'var(--text-3)',
          }}
        >
          ⌘K
        </span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
            onClick={(e) => { if (e.target === e.currentTarget) setOpen(false) }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl flex flex-col"
              style={{
                background: 'rgba(15,15,22,0.98)',
                border: '1px solid rgba(239,68,68,0.25)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset',
              }}
            >
              {/* Header */}
              <div
                className="flex items-center justify-between p-4 border-b"
                style={{ borderColor: 'rgba(255,255,255,0.08)' }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(251,191,36,0.25))',
                      border: '1px solid rgba(239,68,68,0.4)',
                    }}
                  >
                    <Bug size={16} />
                  </div>
                  <div>
                    <div className="font-semibold text-[15px]" style={{ color: 'var(--text-1)' }}>
                      Report a bug to Holly
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                      <Sparkles size={10} className="inline" /> Auto-collects context — agent, model,
                      recent errors, vault status. Holly triages from here.
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/5"
                  style={{ color: 'var(--text-3)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {result?.success ? (
                  <div
                    className="p-5 rounded-xl flex flex-col items-center text-center gap-3"
                    style={{
                      background: 'rgba(16,185,129,0.1)',
                      border: '1px solid rgba(16,185,129,0.3)',
                    }}
                  >
                    <CheckCircle2 size={36} className="text-emerald-400" />
                    <div>
                      <div className="font-semibold text-emerald-300">Bug report sent</div>
                      <div className="text-xs mt-1 font-mono" style={{ color: 'var(--text-3)' }}>
                        {result.file}
                      </div>
                      <div className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>
                        Holly will investigate and report back.
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wider mb-2 block"
                        style={{ color: 'var(--text-3)' }}
                      >
                        What happened?
                      </label>
                      <textarea
                        ref={descRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="When I did X, I saw Y. I expected Z."
                        rows={4}
                        className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none transition-all"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--text-1)',
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                            submit()
                          }
                        }}
                      />
                      <div className="text-[11px] mt-1.5 flex items-center gap-1" style={{ color: 'var(--text-3)' }}>
                        <span>Tip:</span>
                        <span className="font-mono px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.06)' }}>⌘↵</span>
                        <span>to send</span>
                      </div>
                    </div>

                    {/* Quick-pick examples */}
                    {description.length === 0 && (
                      <div>
                        <div
                          className="text-[11px] font-medium uppercase tracking-wider mb-2"
                          style={{ color: 'var(--text-3)' }}
                        >
                          Common reports (click to use)
                        </div>
                        <div className="flex flex-col gap-1.5">
                          {EXAMPLE_REPORTS.map((ex) => (
                            <button
                              key={ex}
                              onClick={() => setDescription(ex)}
                              className="text-left text-xs px-3 py-2 rounded-lg transition-all hover:translate-x-0.5"
                              style={{
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.06)',
                                color: 'var(--text-2)',
                              }}
                            >
                              <ChevronRight size={11} className="inline mr-1" />
                              {ex}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wider mb-2 block"
                        style={{ color: 'var(--text-3)' }}
                      >
                        What did you expect? (optional)
                      </label>
                      <textarea
                        value={expected}
                        onChange={(e) => setExpected(e.target.value)}
                        placeholder="I expected the model to respond with the answer."
                        rows={2}
                        className="w-full px-3 py-2.5 rounded-lg text-sm resize-none outline-none"
                        style={{
                          background: 'rgba(255,255,255,0.04)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          color: 'var(--text-1)',
                        }}
                      />
                    </div>

                    <div>
                      <label
                        className="text-xs font-medium uppercase tracking-wider mb-2 block"
                        style={{ color: 'var(--text-3)' }}
                      >
                        How bad is it?
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {SEVERITIES.map((s) => (
                          <button
                            key={s.value}
                            onClick={() => setSeverity(s.value)}
                            className="text-left px-3 py-2 rounded-lg transition-all"
                            style={{
                              background:
                                severity === s.value
                                  ? 'rgba(239,68,68,0.15)'
                                  : 'rgba(255,255,255,0.03)',
                              border:
                                severity === s.value
                                  ? '1px solid rgba(239,68,68,0.5)'
                                  : '1px solid rgba(255,255,255,0.06)',
                            }}
                          >
                            <div className="flex items-center gap-1.5 text-sm font-medium" style={{ color: 'var(--text-1)' }}>
                              <span>{s.emoji}</span>
                              {s.label}
                            </div>
                            <div className="text-[11px] mt-0.5" style={{ color: 'var(--text-3)' }}>
                              {s.hint}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {result && !result.success && (
                      <div
                        className="p-3 rounded-lg flex items-start gap-2"
                        style={{
                          background: 'rgba(239,68,68,0.1)',
                          border: '1px solid rgba(239,68,68,0.3)',
                        }}
                      >
                        <AlertTriangle size={14} className="text-red-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs" style={{ color: 'var(--text-2)' }}>
                          Failed to send: <code className="font-mono">{result.error}</code>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Footer */}
              {!result?.success && (
                <div
                  className="flex items-center justify-between p-4 border-t"
                  style={{ borderColor: 'rgba(255,255,255,0.08)' }}
                >
                  <div className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                    Context auto-attached: agent, model, recent errors, vault state.
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{ color: 'var(--text-2)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={submit}
                      disabled={submitting || description.trim().length < 3}
                      className="px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all"
                      style={{
                        background:
                          submitting || description.trim().length < 3
                            ? 'rgba(239,68,68,0.2)'
                            : 'linear-gradient(135deg, rgba(239,68,68,0.5), rgba(251,191,36,0.5))',
                        color: 'var(--text-1)',
                        opacity: submitting || description.trim().length < 3 ? 0.5 : 1,
                      }}
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Send to Holly
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
