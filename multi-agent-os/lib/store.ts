'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ModelConfig } from './models'
import type { AgentId } from './agents'

export type NodeStatus = 'online' | 'offline' | 'busy' | 'idle'

export interface AgentNode {
  id: string
  name: string
  role: string
  host: string
  status: NodeStatus
  cpu: number
  memory: number
  uptime: string
  tasks: number
  icon: string
  color: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface Mission {
  id: string
  title: string
  description: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  assignedTo: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  createdAt: Date
  completedAt?: Date
  progress: number
}

export interface LogEntry {
  id: string
  timestamp: Date
  level: 'info' | 'warn' | 'error' | 'success' | 'debug'
  source: string
  message: string
}

export interface JournalEntry {
  id: string
  content: string
  tags: string[]
  timestamp: Date
}

export interface Goal {
  id: string
  title: string
  description: string
  status: 'pending' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  completedAt?: Date
}

export type VaultSaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AppState {
  // Settings
  apiKey: string                      // Anthropic
  deepseekApiKey: string              // DeepSeek
  openaiApiKey: string                // OpenAI
  openrouterApiKey: string           // OpenRouter
  nvidiaApiKey: string                // NVIDIA NIM
  geminiApiKey: string                // Google Gemini (direct)
  hermesApiKey: string                // Hermes custom endpoint
  openclawApiKey: string              // OpenClaw agent routing
  hetznerHost: string
  macMiniHost: string
  openclawUrl: string
  setApiKey: (key: string) => void
  setDeepseekApiKey: (key: string) => void
  setOpenaiApiKey: (key: string) => void
  setNvidiaApiKey: (key: string) => void
  setOpenrouterApiKey: (key: string) => void
  setGeminiApiKey: (key: string) => void
  setHermesApiKey: (key: string) => void
  setOpenclawApiKey: (key: string) => void
  setHetznerHost: (host: string) => void
  setMacMiniHost: (host: string) => void
  setOpenclawUrl: (url: string) => void

  // Model selection
  selectedModel: string
  defaultModel: string
  fallbackModel: string
  setSelectedModel: (model: string) => void
  setDefaultModel: (model: string) => void
  setFallbackModel: (model: string) => void

  // Vault / SSH settings
  vaultEnabled: boolean
  vaultSshUser: string
  vaultSshKeyPath: string
  vaultSshPassword: string
  vaultSaveStatus: VaultSaveStatus
  vaultLastSaved: Date | null
  vaultLastError: string | null
  setVaultEnabled: (v: boolean) => void
  setVaultSshUser: (v: string) => void
  setVaultSshKeyPath: (v: string) => void
  setVaultSshPassword: (v: string) => void
  setVaultSaveStatus: (s: VaultSaveStatus, error?: string) => void

  // Active panel
  activePanel: string
  setActivePanel: (panel: string) => void

  // Chat
  /** Master chat (no persona). Used for the legacy 'chat' panel if visited. */
  messages: ChatMessage[]
  addMessage: (msg: ChatMessage) => void
  clearMessages: () => void
  /** Per-agent chat history, keyed by AgentId. */
  agentMessages: Partial<Record<AgentId, ChatMessage[]>>
  addAgentMessage: (agentId: AgentId, msg: ChatMessage) => void
  clearAgentMessages: (agentId: AgentId) => void
  /** Per-agent currently-selected model, keyed by AgentId. */
  agentModels: Partial<Record<AgentId, string>>
  setAgentModel: (agentId: AgentId, modelId: string) => void
  isStreaming: boolean
  setIsStreaming: (v: boolean) => void

  // User-added models (merged with stock MODELS at lookup)
  userModels: Record<string, ModelConfig>
  addUserModel: (m: ModelConfig) => void
  removeUserModel: (id: string) => void
  // Custom provider endpoints (for hermes, openclaw, etc.)
  providerEndpoints: Record<string, string>
  setProviderEndpoint: (provider: string, url: string) => void

  // Missions
  missions: Mission[]
  addMission: (m: Mission) => void
  updateMission: (id: string, updates: Partial<Mission>) => void
  deleteMission: (id: string) => void

  // Journal
  journalEntries: JournalEntry[]
  addJournalEntry: (e: JournalEntry) => void
  deleteJournalEntry: (id: string) => void

  // Goals
  goals: Goal[]
  addGoal: (g: Goal) => void
  updateGoal: (id: string, updates: Partial<Goal>) => void
  deleteGoal: (id: string) => void

  // Terminal logs
  logs: LogEntry[]
  addLog: (log: LogEntry) => void
  clearLogs: () => void

  // Nodes
  nodes: AgentNode[]
  updateNode: (id: string, updates: Partial<AgentNode>) => void
}

const defaultNodes: AgentNode[] = [
  {
    id: 'hetzner-vps',
    name: 'Hetzner VPS',
    role: 'Openclaw Host',
    host: process.env.NEXT_PUBLIC_HETZNER_HOST || '65.21.x.x',
    status: 'online',
    cpu: 23,
    memory: 41,
    uptime: '14d 6h 22m',
    tasks: 3,
    icon: '🖥️',
    color: 'cyan',
  },
  {
    id: 'mac-mini',
    name: 'Mac Mini',
    role: 'Browser Node',
    host: process.env.NEXT_PUBLIC_MAC_MINI_HOST || '192.168.1.x',
    status: 'idle',
    cpu: 4,
    memory: 18,
    uptime: '2d 14h 5m',
    tasks: 0,
    icon: '💻',
    color: 'violet',
  },
  {
    id: 'macbook',
    name: 'MacBook Pro',
    role: 'Control Node',
    host: 'localhost',
    status: 'online',
    cpu: 11,
    memory: 55,
    uptime: '6h 44m',
    tasks: 1,
    icon: '🎯',
    color: 'pink',
  },
]

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      apiKey: '',
      deepseekApiKey: '',
      nvidiaApiKey: '',
      openaiApiKey: '',
      openrouterApiKey: '',
      geminiApiKey: '',
      hermesApiKey: '',
      openclawApiKey: '',
      hetznerHost: '',
      macMiniHost: '',
      openclawUrl: '',
      setApiKey: (apiKey) => set({ apiKey }),
      setDeepseekApiKey: (deepseekApiKey) => set({ deepseekApiKey }),
      setOpenaiApiKey: (openaiApiKey) => set({ openaiApiKey }),
      setNvidiaApiKey: (nvidiaApiKey) => set({ nvidiaApiKey }),
      setOpenrouterApiKey: (openrouterApiKey) => set({ openrouterApiKey }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
      setHermesApiKey: (hermesApiKey) => set({ hermesApiKey }),
      setOpenclawApiKey: (openclawApiKey) => set({ openclawApiKey }),
      setHetznerHost: (hetznerHost) => set({ hetznerHost }),
      setMacMiniHost: (macMiniHost) => set({ macMiniHost }),
      setOpenclawUrl: (openclawUrl) => set({ openclawUrl }),

      // Model selection
      selectedModel: 'nvidia/deepseek-v4-flash',
      defaultModel: 'nvidia/deepseek-v4-flash',
      fallbackModel: 'MiniMax-M2.7-highspeed',
      setSelectedModel: (selectedModel) => set({ selectedModel }),
      setDefaultModel: (defaultModel) => set({ defaultModel }),
      setFallbackModel: (fallbackModel) => set({ fallbackModel }),

      // Vault
      vaultEnabled: true,
      vaultSshUser: 'root',
      vaultSshKeyPath: '',
      vaultSshPassword: '',
      vaultSaveStatus: 'idle',
      vaultLastSaved: null,
      vaultLastError: null,
      setVaultEnabled: (vaultEnabled) => set({ vaultEnabled }),
      setVaultSshUser: (vaultSshUser) => set({ vaultSshUser }),
      setVaultSshKeyPath: (vaultSshKeyPath) => set({ vaultSshKeyPath }),
      setVaultSshPassword: (vaultSshPassword) => set({ vaultSshPassword }),
      setVaultSaveStatus: (vaultSaveStatus, error) => set({
        vaultSaveStatus,
        vaultLastError: error ?? null,
        vaultLastSaved: vaultSaveStatus === 'saved' ? new Date() : undefined,
      }),

      activePanel: 'agent-holly',
      setActivePanel: (activePanel) => set({ activePanel }),

      messages: [],
      addMessage: (msg) => set((s) => ({ messages: [...s.messages, msg] })),
      clearMessages: () => set({ messages: [] }),
      agentMessages: {},
      addAgentMessage: (agentId, msg) =>
        set((s) => ({
          agentMessages: {
            ...s.agentMessages,
            [agentId]: [...(s.agentMessages[agentId] || []), msg],
          },
        })),
      clearAgentMessages: (agentId) =>
        set((s) => ({ agentMessages: { ...s.agentMessages, [agentId]: [] } })),
      agentModels: {},
      setAgentModel: (agentId, modelId) =>
        set((s) => ({ agentModels: { ...s.agentModels, [agentId]: modelId } })),
      isStreaming: false,
      setIsStreaming: (isStreaming) => set({ isStreaming }),

      userModels: {},
      addUserModel: (m) => set((s) => ({ userModels: { ...s.userModels, [m.id]: m } })),
      removeUserModel: (id) =>
        set((s) => {
          const next = { ...s.userModels }
          delete next[id]
          return { userModels: next }
        }),
      providerEndpoints: {},
      setProviderEndpoint: (provider, url) =>
        set((s) => ({ providerEndpoints: { ...s.providerEndpoints, [provider]: url } })),

      missions: [
        {
          id: 'm1',
          title: 'Scrape competitor pricing',
          description: 'Browse 5 competitor sites and extract pricing tables',
          status: 'completed',
          assignedTo: 'mac-mini',
          priority: 'high',
          createdAt: new Date(Date.now() - 3600000 * 2),
          completedAt: new Date(Date.now() - 3600000),
          progress: 100,
        },
        {
          id: 'm2',
          title: 'Generate weekly report',
          description: 'Compile analytics data into a markdown summary',
          status: 'running',
          assignedTo: 'hetzner-vps',
          priority: 'medium',
          createdAt: new Date(Date.now() - 1800000),
          progress: 62,
        },
        {
          id: 'm3',
          title: 'Monitor uptime alerts',
          description: 'Watch all nodes and alert on any downtime',
          status: 'running',
          assignedTo: 'hetzner-vps',
          priority: 'critical',
          createdAt: new Date(Date.now() - 86400000),
          progress: 100,
        },
      ],
      addMission: (m) => set((s) => ({ missions: [...s.missions, m] })),
      updateMission: (id, updates) =>
        set((s) => ({
          missions: s.missions.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        })),
      deleteMission: (id) =>
        set((s) => ({ missions: s.missions.filter((m) => m.id !== id) })),

      journalEntries: [],
      addJournalEntry: (e) => set((s) => ({ journalEntries: [e, ...s.journalEntries] })),
      deleteJournalEntry: (id) =>
        set((s) => ({ journalEntries: s.journalEntries.filter((e) => e.id !== id) })),

      goals: [],
      addGoal: (g) => set((s) => ({ goals: [g, ...s.goals] })),
      updateGoal: (id, updates) =>
        set((s) => ({ goals: s.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)) })),
      deleteGoal: (id) =>
        set((s) => ({ goals: s.goals.filter((g) => g.id !== id) })),

      logs: [],
      addLog: (log) => set((s) => ({ logs: [log, ...s.logs].slice(0, 500) })),
      clearLogs: () => set({ logs: [] }),

      nodes: defaultNodes,
      updateNode: (id, updates) =>
        set((s) => ({
          nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)),
        })),
    }),
    {
      name: 'multi-agent-os-state',
      version: 3,
      migrate: (persistedState: any, version) => {
        // v1 → v2: migrate master 'messages' into agentMessages['agent-claude'].
        if (version < 2 && persistedState) {
          const oldMessages = persistedState.messages || []
          if (oldMessages.length > 0 && !persistedState.agentMessages) {
            persistedState.agentMessages = { 'agent-claude': oldMessages }
          }
          if (!persistedState.agentModels) persistedState.agentModels = {}
          if (!persistedState.userModels) persistedState.userModels = {}
          if (!persistedState.providerEndpoints) persistedState.providerEndpoints = {}
        }
        // v2 → v3: default vault to enabled (per Justin, 2026-06-01 — vault
        // saves should be automatic, not opt-in).
        if (version < 3 && persistedState) {
          if (persistedState.vaultEnabled === undefined) {
            persistedState.vaultEnabled = true
          }
        }
        return persistedState
      },
      partialize: (s) => ({
        apiKey: s.apiKey,
        deepseekApiKey: s.deepseekApiKey,
        nvidiaApiKey: s.nvidiaApiKey,
        openaiApiKey: s.openaiApiKey,
        openrouterApiKey: s.openrouterApiKey,
        geminiApiKey: (s as any).geminiApiKey,
        hermesApiKey: (s as any).hermesApiKey,
        openclawApiKey: (s as any).openclawApiKey,
        hetznerHost: s.hetznerHost,
        macMiniHost: s.macMiniHost,
        openclawUrl: s.openclawUrl,
        selectedModel: s.selectedModel,
        defaultModel: s.defaultModel,
        fallbackModel: s.fallbackModel,
        vaultEnabled: s.vaultEnabled,
        vaultSshUser: s.vaultSshUser,
        vaultSshKeyPath: s.vaultSshKeyPath,
        vaultSshPassword: s.vaultSshPassword,
        messages: s.messages,
        agentMessages: s.agentMessages,
        agentModels: s.agentModels,
        userModels: s.userModels,
        providerEndpoints: s.providerEndpoints,
        missions: s.missions,
        journalEntries: s.journalEntries,
        goals: s.goals,
      }),
    }
  )
)
