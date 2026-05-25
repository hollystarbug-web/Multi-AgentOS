'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '@/lib/store'
import AnimatedBackground from './ui/AnimatedBackground'
import TopBar from './TopBar'
import Sidebar from './Sidebar'
import SettingsModal from './SettingsModal'
import ChatPanel from './panels/ChatPanel'
import AgentMonitorPanel from './panels/AgentMonitorPanel'
import MissionControlPanel from './panels/MissionControlPanel'
import TerminalPanel from './panels/TerminalPanel'
import OpenclawPanel from './panels/OpenclawPanel'
import OverviewPanel from './panels/OverviewPanel'
import JournalPanel from './panels/JournalPanel'
import GoalsPanel from './panels/GoalsPanel'
import AgentPlaceholder from './panels/AgentPlaceholder'

// Agent panel IDs (these don't have real panels yet — they show AgentPlaceholder)
const AGENT_PANELS = [
  'agent-holly', 'agent-kryten', 'agent-sally', 'agent-grim',
  'agent-oscar', 'agent-reggie', 'agent-claude', 'agent-hermes',
]

const PANELS: Record<string, React.ReactNode> = {
  overview: <OverviewPanel />,
  chat:     <ChatPanel />,
  nodes:    <AgentMonitorPanel />,
  missions: <MissionControlPanel />,
  terminal: <TerminalPanel />,
  openclaw: <OpenclawPanel />,
  journal:  <JournalPanel />,
  goals:    <GoalsPanel />,
  // Agent placeholders
  'agent-holly':  <AgentPlaceholder agentId="agent-holly" />,
  'agent-kryten': <AgentPlaceholder agentId="agent-kryten" />,
  'agent-sally':  <AgentPlaceholder agentId="agent-sally" />,
  'agent-grim':   <AgentPlaceholder agentId="agent-grim" />,
  'agent-oscar':  <AgentPlaceholder agentId="agent-oscar" />,
  'agent-reggie': <AgentPlaceholder agentId="agent-reggie" />,
  'agent-claude': <AgentPlaceholder agentId="agent-claude" />,
  'agent-hermes': <AgentPlaceholder agentId="agent-hermes" />,
}

const PANEL_ACCENT: Record<string, string> = {
  overview: 'rgba(255,255,255,',
  chat:     'rgba(168,85,247,',
  nodes:    'rgba(6,182,212,',
  missions: 'rgba(236,72,153,',
  terminal: 'rgba(16,185,129,',
  openclaw: 'rgba(245,158,11,',
  journal:  'rgba(168,85,247,',
  goals:    'rgba(249,115,22,',
  // Agent panels
  'agent-holly':  'rgba(6,182,212,',
  'agent-kryten': 'rgba(249,115,22,',
  'agent-sally':  'rgba(139,92,246,',
  'agent-grim':   'rgba(239,68,68,',
  'agent-oscar':  'rgba(251,191,36,',
  'agent-reggie': 'rgba(16,185,129,',
  'agent-claude': 'rgba(168,85,247,',
  'agent-hermes': 'rgba(251,191,36,',
}

export default function Dashboard() {
  const activePanel    = useStore((s) => s.activePanel)
  const [showSettings, setShowSettings] = useState(false)
  const accent = PANEL_ACCENT[activePanel] || 'rgba(255,255,255,'

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg-deep)' }}
    >
      <AnimatedBackground />

      {/* Ambient glow that shifts per-panel */}
      <motion.div
        key={activePanel + '-glow'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        className="fixed pointer-events-none"
        style={{
          inset: 0,
          background: [
            `radial-gradient(ellipse 55% 45% at 65% 55%, ${accent}0.05) 0%, transparent 70%)`,
            `radial-gradient(ellipse 35% 35% at 15% 25%, ${accent}0.03) 0%, transparent 60%)`,
          ].join(', '),
          zIndex: 1,
        }}
      />

      {/* Top bar */}
      <TopBar onSettings={() => setShowSettings(true)} />

      {/* Body */}
      <div className="flex flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>
        <Sidebar />

        {/* Main panel area */}
        <main className="flex-1 overflow-hidden p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activePanel}
              initial={{ opacity: 0, y: 10, scale: 0.995 }}
              animate={{ opacity: 1, y: 0,  scale: 1 }}
              exit={{   opacity: 0, y: -6,  scale: 0.995 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="glass relative h-full overflow-hidden rounded-3xl noise"
              style={{
                border: `1px solid ${accent}0.18)`,
                boxShadow: [
                  `0 0 80px ${accent}0.06)`,
                  `0 24px 64px rgba(0,0,0,0.5)`,
                  `inset 0 1px 0 rgba(255,255,255,0.055)`,
                ].join(', '),
              }}
            >
              {/* Top shimmer line */}
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}0.5), transparent)`,
                  zIndex: 2,
                }}
              />
              <div className="h-full overflow-hidden">
                {PANELS[activePanel] ?? <AgentPlaceholder agentId={activePanel} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Settings overlay */}
      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>
    </div>
  )
}
