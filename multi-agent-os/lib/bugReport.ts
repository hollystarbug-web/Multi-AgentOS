/**
 * Bug report payload builder.
 *
 * Auto-collects the context Holly needs to diagnose issues:
 *  - current agent + model
 *  - recent console errors (from errorCapture)
 *  - vault status
 *  - user description
 *  - URL, user agent, viewport, build version
 *  - last few chat messages (so conversation context is preserved)
 *
 * Why: the user shouldn't have to remember what they were doing or copy
 * error text. The dashboard knows. Capture everything at click-time.
 */

import { useStore } from './store'
import { getRecentErrors } from './errorCapture'

export interface BugReportPayload {
  // User input
  description: string
  expected?: string
  severity: 'annoyance' | 'broken' | 'data-loss' | 'critical'
  
  // Auto-collected context
  capturedAt: string         // ISO timestamp
  context: {
    url: string
    userAgent: string
    viewport: { w: number; h: number }
    buildVersion: string
    activePanel: string
    activeAgentId: string | null
    activeModelId: string | null
    vaultEnabled: boolean
    vaultSshUser: string
    vaultSshKeyPath: string
    vaultLastSaved: string | null
    vaultSaveStatus: string
    railOpen: boolean
    showSettings: boolean
  }
  errors: ReturnType<typeof getRecentErrors>
  recentMessages: Array<{
    agentId: string
    role: 'user' | 'assistant' | 'system'
    text: string
    ts: number
  }>
  storeSnapshot: {
    agentMessagesKeys: string[]   // list of agent ids with history (no content)
    messageCount: number          // total messages across all agents
    goalsCount: number
    journalEntriesCount: number
  }
}

export function buildBugReport(
  description: string,
  severity: BugReportPayload['severity'],
  expected?: string,
): BugReportPayload {
  const state = useStore.getState()
  const recentMessages: BugReportPayload['recentMessages'] = []
  
  // Pull last 3 messages from each agent (if any) for context
  for (const [agentId, messages] of Object.entries(state.agentMessages)) {
    const last = (messages as any[]).slice(-3)
    for (const m of last) {
      recentMessages.push({
        agentId,
        role: m.role,
        text: typeof m.text === 'string' ? m.text.slice(0, 200) : '[non-text content]',
        ts: m.ts || 0,
      })
    }
  }
  // Sort by timestamp, take most recent 12
  recentMessages.sort((a, b) => b.ts - a.ts)
  recentMessages.splice(12)

  let activeAgentId: string | null = null
  let activeModelId: string | null = null
  if (state.activePanel && state.activePanel.startsWith('agent-')) {
    activeAgentId = state.activePanel
    activeModelId = state.agentModels[activeAgentId] || null
  }

  return {
    description,
    expected,
    severity,
    capturedAt: new Date().toISOString(),
    context: {
      url: typeof window !== 'undefined' ? window.location.href : 'server',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      viewport: {
        w: typeof window !== 'undefined' ? window.innerWidth : 0,
        h: typeof window !== 'undefined' ? window.innerHeight : 0,
      },
      buildVersion: process.env.NEXT_PUBLIC_BUILD_VERSION || 'dev',
      activePanel: state.activePanel,
      activeAgentId,
      activeModelId,
      vaultEnabled: state.vaultEnabled,
      vaultSshUser: state.vaultSshUser || '',
      vaultSshKeyPath: state.vaultSshKeyPath || '',
      vaultSaveStatus: state.vaultSaveStatus || 'idle',
      vaultLastSaved: state.vaultLastSaved ? state.vaultLastSaved.toISOString() : null,
      railOpen: true, // local UI state, not in store
    },
    errors: getRecentErrors(),
    recentMessages,
    storeSnapshot: {
      agentMessagesKeys: Object.keys(state.agentMessages),
      messageCount: Object.values(state.agentMessages).reduce(
        (sum: number, msgs) => sum + (msgs as any[]).length,
        0,
      ),
      goalsCount: (state.goals || []).length,
      journalEntriesCount: (state.journalEntries || []).length,
    },
  }
}
