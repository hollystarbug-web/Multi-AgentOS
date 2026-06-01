'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { PanelRightOpen, PanelRightClose } from 'lucide-react'
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
import AgentChatPanel from './panels/AgentChatPanel'
import ModelRail from './ModelRail'
import BugReportButton from './BugReportButton'
import { AGENTS, type AgentId } from '@/lib/agents'

const PANEL_ACCENT: Record<string, string> = {
  overview:  'rgba(255,255,255,',
  chat:      'rgba(168,85,247,',
  nodes:     'rgba(6,182,212,',
  missions:  'rgba(236,72,153,',
  terminal:  'rgba(16,185,129,',
  openclaw:  'rgba(245,158,11,',
  journal:   'rgba(168,85,247,',
  goals:     'rgba(249,115,22,',
  'agent-holly':  'rgba(6,182,212,',
  'agent-kryten': 'rgba(249,115,22,',
  'agent-sally':  'rgba(139,92,246,',
  'agent-grim':   'rgba(239,68,68,',
  'agent-oscar':  'rgba(251,191,36,',
  'agent-reggie': 'rgba(16,185,129,',
  'agent-claude': 'rgba(168,85,247,',
  'agent-hermes': 'rgba(251,191,36,',
  'agent-direct': 'rgba(255,255,255,',
}

const AGENT_IDS = Object.keys(AGENTS) as AgentId[]

function isAgent(id: string): id is AgentId {
  return (AGENT_IDS as string[]).includes(id)
}

export default function Dashboard() {
  const activePanel    = useStore((s) => s.activePanel)
  const [showSettings, setShowSettings] = useState(false)
  const [railOpen, setRailOpen] = useState(true)
  const accent = PANEL_ACCENT[activePanel] || 'rgba(255,255,255,'

  // Resolve which agent is active (for the model rail)
  const activeAgentId: AgentId | null = isAgent(activePanel) ? activePanel : null
  const activeAgent = activeAgentId ? AGENTS[activeAgentId] : null

  // Per-agent model resolution
  const agentModels = useStore((s) => s.agentModels)
  const setAgentModel = useStore((s) => s.setAgentModel)
  const activeModelId =
    (activeAgentId && agentModels[activeAgentId]) ||
    (activeAgent?.defaultModel) ||
    'MiniMax-M3'

  return (
    <div
      className="flex flex-col"
      style={{ height: '100vh', overflow: 'hidden', background: 'var(--bg-deep)' }}
    >
      <AnimatedBackground />

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

      <TopBar onSettings={() => setShowSettings(true)} />

      <div className="flex flex-1 overflow-hidden" style={{ position: 'relative', zIndex: 10 }}>
        <Sidebar />

        <main className="flex-1 overflow-hidden p-4 min-w-0">
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
              <div
                className="absolute top-0 left-[10%] right-[10%] h-px pointer-events-none"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accent}0.5), transparent)`,
                  zIndex: 2,
                }}
              />
              <div className="h-full overflow-hidden flex">
                {/* Main panel content */}
                <div className="flex-1 min-w-0 h-full overflow-hidden">
                  {activePanel === 'overview' && <OverviewPanel />}
                  {activePanel === 'chat' && <ChatPanel />}
                  {activePanel === 'nodes' && <AgentMonitorPanel />}
                  {activePanel === 'missions' && <MissionControlPanel />}
                  {activePanel === 'terminal' && <TerminalPanel />}
                  {activePanel === 'openclaw' && <OpenclawPanel />}
                  {activePanel === 'journal' && <JournalPanel />}
                  {activePanel === 'goals' && <GoalsPanel />}
                  {activeAgentId && <AgentChatPanel agentId={activeAgentId} />}
                </div>

                {/* Model rail (only when an agent is active) */}
                {activeAgentId && (
                  <>
                    {!railOpen && (
                      <div className="p-2 flex items-start">
                        <button
                          onClick={() => setRailOpen(true)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                          style={{
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--glass-border)',
                            color: 'var(--text-3)',
                          }}
                          title="Show model rail"
                        >
                          <PanelRightOpen size={14} />
                        </button>
                      </div>
                    )}
                    <AnimatePresence>
                      {railOpen && (
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{ width: 300, opacity: 1 }}
                          exit={{ width: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full overflow-hidden flex-shrink-0"
                        >
                          <ModelRail
                            agentId={activeAgentId}
                            currentModelId={activeModelId}
                            onSelect={(modelId) => setAgentModel(activeAgentId, modelId)}
                            onAddModel={() => setShowSettings(true)}
                            onToggleCollapse={() => setRailOpen(false)}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      </AnimatePresence>

      <BugReportButton />
    </div>
  )
}
