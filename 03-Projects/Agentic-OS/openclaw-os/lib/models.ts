// Model registry — the source of truth for all available models.
//
// HOW TO ADD A MODEL
// ──────────────────
// 1. Append an entry to MODELS below. Required fields:
//      id, name, provider, providerName, contextWindow, maxOutput,
//      costPerMillion: { input, output }, bestFor, color
// 2. If you're adding a new PROVIDER, also:
//      a) Add it to the Provider type below
//      b) Add detection logic in app/api/chat/route.ts getProvider()
//      c) Add baseUrl + headers in getBaseUrl() and getHeaders()
//      d) Add the model prefix mapping in buildRequestBody()
// 3. Models added in the UI via Settings → Models are stored under
//    `userModels` in the Zustand store and merged with MODELS at lookup.
//
// NEW IN THIS BUILD (2026-06-01)
// ─────────────────────────────
// Added the lineup Justin is bringing online:
//   • MiniMax M3  (minimax provider, replaces M2.7 default)
//   • Kimi        (moonshot/kimi via openrouter)
//   • Claude      (already present — kept)
//   • GPT 5.5 thinking (openai direct, with reasoning_effort flag)
//   • Gemini-Remy (gemini provider, OpenAI-compat endpoint)
//   • Hermes      (custom provider, calls a configurable URL)
//   • OpenClaw    (custom provider, calls our agent routing endpoint)
// All these are added as new entries plus a docblock for future additions.

export type Provider =
  | 'anthropic'
  | 'openai'
  | 'deepseek'
  | 'minimax'
  | 'openrouter'
  | 'nvidia'
  | 'gemini'
  | 'hermes'
  | 'openclaw'

export interface ModelConfig {
  id: string
  name: string
  provider: Provider
  providerName: string
  contextWindow: number
  maxOutput: number
  costPerMillion: { input: number; output: number; cacheRead?: number }
  defaultFor?: string[]
  bestFor: string[]
  color: string
  icon?: string
  /** Set true if the model supports chain-of-thought / reasoning tokens */
  thinking?: boolean
  /** OpenAI-style reasoning effort: 'low' | 'medium' | 'high' */
  reasoningEffort?: 'low' | 'medium' | 'high'
}

// ─── Provider colour map (used for badges, model tiles, dropdowns) ────────
export const PROVIDER_COLORS: Record<Provider, string> = {
  anthropic:  '#d4a574',  // warm tan
  openai:     '#10a37f',  // teal
  deepseek:   '#1d4ed8',  // deep blue
  minimax:    '#00d2ff',  // cyan
  openrouter: '#7c3aed',  // violet
  nvidia:     '#76b900',  // NVIDIA green
  gemini:     '#4285f4',  // Google blue
  hermes:     '#f59e0b',  // amber
  openclaw:   '#06b6d4',  // OpenClaw cyan
}

export const MODELS: Record<string, ModelConfig> = {
  // ─── NVIDIA NIM ────────────────────────────────────────────────────
  'nvidia/deepseek-v4-flash': {
    id: 'nvidia/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash (NVIDIA)',
    provider: 'nvidia',
    providerName: 'NVIDIA NIM',
    contextWindow: 1_000_000,
    maxOutput: 32_768,
    costPerMillion: { input: 0, output: 0 },
    defaultFor: ['general', 'quick', 'free'],
    bestFor: ['General chat', 'Coding', 'Agents', 'Free tier'],
    color: PROVIDER_COLORS.nvidia,
    icon: '🟢',
  },

  // ─── Direct DeepSeek ───────────────────────────────────────────────
  'deepseek-v4-flash': {
    id: 'deepseek-v4-flash',
    name: 'DeepSeek V4 Flash',
    provider: 'deepseek',
    providerName: 'DeepSeek',
    contextWindow: 1_000_000,
    maxOutput: 32_768,
    costPerMillion: { input: 0.14, output: 0.28, cacheRead: 0.0028 },
    defaultFor: ['general', 'quick'],
    bestFor: ['General chat', 'Drafts', 'Quick tasks', 'Admin'],
    color: PROVIDER_COLORS.deepseek,
    icon: '🔵',
  },
  'deepseek-v4-pro': {
    id: 'deepseek-v4-pro',
    name: 'DeepSeek V4 Pro',
    provider: 'deepseek',
    providerName: 'DeepSeek',
    contextWindow: 1_000_000,
    maxOutput: 32_768,
    costPerMillion: { input: 0.435, output: 0.87, cacheRead: 0.0036 },
    bestFor: ['Complex reasoning', 'Long documents', 'Deep analysis'],
    color: PROVIDER_COLORS.deepseek,
    icon: '🔵',
  },
  'deepseek-chat': {
    id: 'deepseek-chat',
    name: 'DeepSeek V3',
    provider: 'deepseek',
    providerName: 'DeepSeek',
    contextWindow: 64_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0.14, output: 0.28 },
    bestFor: ['General chat', 'Code completion', 'Writing'],
    color: PROVIDER_COLORS.deepseek,
    icon: '🔵',
  },

  // ─── OpenRouter ────────────────────────────────────────────────────
  'deepseek/deepseek-v4-flash': {
    id: 'deepseek/deepseek-v4-flash',
    name: 'DeepSeek V4 Flash (OpenRouter)',
    provider: 'openrouter',
    providerName: 'OpenRouter',
    contextWindow: 1_000_000,
    maxOutput: 32_768,
    costPerMillion: { input: 0.10, output: 0.20 },
    defaultFor: ['general', 'quick', 'free'],
    bestFor: ['General chat', 'Drafts', 'Quick tasks', 'Free tier'],
    color: PROVIDER_COLORS.openrouter,
    icon: '🔷',
  },
  'openai/gpt-5.5': {
    id: 'openai/gpt-5.5',
    name: 'GPT-5.5',
    provider: 'openrouter',
    providerName: 'OpenRouter',
    contextWindow: 1_000_000,
    maxOutput: 128_000,
    costPerMillion: { input: 5.0, output: 30.0 },
    bestFor: ['Complex professional workloads', 'Research', 'Advanced reasoning'],
    color: PROVIDER_COLORS.openrouter,
    icon: '🔷',
  },
  'qwen/qwen3.6-plus': {
    id: 'qwen/qwen3.6-plus',
    name: 'Qwen 3.6 Plus',
    provider: 'openrouter',
    providerName: 'OpenRouter',
    contextWindow: 1_000_000,
    maxOutput: 32_768,
    costPerMillion: { input: 0, output: 0 },
    bestFor: ['Free tier', 'General tasks'],
    color: PROVIDER_COLORS.openrouter,
    icon: '🔷',
  },
  'moonshotai/kimi': {
    id: 'moonshotai/kimi',
    name: 'Kimi (Moonshot)',
    provider: 'openrouter',
    providerName: 'OpenRouter',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0.15, output: 0.60 },
    bestFor: ['Long-context Chinese/English', 'Web-aware Q&A', 'Document analysis'],
    color: PROVIDER_COLORS.openrouter,
    icon: '🔷',
  },
  'google/gemini-remy': {
    id: 'google/gemini-remy',
    name: 'Gemini-Remy',
    provider: 'openrouter',
    providerName: 'OpenRouter',
    contextWindow: 1_000_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0.075, output: 0.30 },
    bestFor: ['Multimodal', 'Long context', 'Vision', 'Fast reasoning'],
    color: PROVIDER_COLORS.gemini,
    icon: '✨',
  },

  // ─── Anthropic ─────────────────────────────────────────────────────
  'claude-opus-4-5': {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    providerName: 'Anthropic',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 15, output: 75 },
    bestFor: ['Complex reasoning', 'Long documents', 'Analysis', 'Research'],
    color: PROVIDER_COLORS.anthropic,
    icon: '🟠',
  },
  'claude-sonnet-4-5': {
    id: 'claude-sonnet-4-5',
    name: 'Claude Sonnet 4',
    provider: 'anthropic',
    providerName: 'Anthropic',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 3, output: 15 },
    defaultFor: ['analysis', 'coding'],
    bestFor: ['Coding', 'Analysis', 'Balanced tasks'],
    color: PROVIDER_COLORS.anthropic,
    icon: '🟠',
  },
  'claude-haiku-4': {
    id: 'claude-haiku-4',
    name: 'Claude Haiku 4',
    provider: 'anthropic',
    providerName: 'Anthropic',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0.8, output: 4 },
    bestFor: ['Quick responses', 'Simple tasks', 'High volume'],
    color: PROVIDER_COLORS.anthropic,
    icon: '🟠',
  },

  // ─── OpenAI direct ────────────────────────────────────────────────
  'gpt-4.5': {
    id: 'gpt-4.5',
    name: 'GPT-4.5',
    provider: 'openai',
    providerName: 'OpenAI',
    contextWindow: 128_000,
    maxOutput: 32_768,
    costPerMillion: { input: 75, output: 150 },
    bestFor: ['General purpose', 'Complex reasoning', 'Creative'],
    color: PROVIDER_COLORS.openai,
    icon: '🟢',
  },
  'gpt-4.1': {
    id: 'gpt-4.1',
    name: 'GPT-4.1',
    provider: 'openai',
    providerName: 'OpenAI',
    contextWindow: 128_000,
    maxOutput: 32_768,
    costPerMillion: { input: 2, output: 8 },
    bestFor: ['Coding', 'Instruction following', 'Balanced'],
    color: PROVIDER_COLORS.openai,
    icon: '🟢',
  },
  'o4-mini': {
    id: 'o4-mini',
    name: 'OpenAI o4-mini',
    provider: 'openai',
    providerName: 'OpenAI',
    contextWindow: 100_000,
    maxOutput: 32_768,
    costPerMillion: { input: 1.1, output: 4.4 },
    bestFor: ['Coding', 'Reasoning', 'Quick tasks'],
    color: PROVIDER_COLORS.openai,
    icon: '🟢',
  },
  'gpt-5.5-thinking': {
    id: 'gpt-5.5-thinking',
    name: 'GPT-5.5 Thinking',
    provider: 'openai',
    providerName: 'OpenAI',
    contextWindow: 256_000,
    maxOutput: 32_768,
    costPerMillion: { input: 5.0, output: 30.0 },
    thinking: true,
    reasoningEffort: 'high',
    bestFor: ['Deep reasoning', 'Research', 'Multi-step problems', 'Chain-of-thought'],
    color: PROVIDER_COLORS.openai,
    icon: '🧠',
  },

  // ─── MiniMax ───────────────────────────────────────────────────────
  'MiniMax-M3': {
    id: 'MiniMax-M3',
    name: 'MiniMax M3',
    provider: 'minimax',
    providerName: 'MiniMax',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0, output: 0 },
    defaultFor: ['fallback', 'free', 'agent-fleet'],
    bestFor: ['Agent fleet', 'Long context', 'Free tier', 'Multi-agent orchestration'],
    color: PROVIDER_COLORS.minimax,
    icon: '🔷',
  },
  'MiniMax-M2.7-highspeed': {
    id: 'MiniMax-M2.7-highspeed',
    name: 'MiniMax M2.7 Highspeed',
    provider: 'minimax',
    providerName: 'MiniMax',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0, output: 0 },
    bestFor: ['Quick lookups', 'Fallback', 'Free tasks'],
    color: PROVIDER_COLORS.minimax,
    icon: '🔷',
  },
  'MiniMax-M2.7': {
    id: 'MiniMax-M2.7',
    name: 'MiniMax M2.7',
    provider: 'minimax',
    providerName: 'MiniMax',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0, output: 0 },
    bestFor: ['Complex reasoning', 'General tasks'],
    color: PROVIDER_COLORS.minimax,
    icon: '🔷',
  },

  // ─── Gemini direct (new provider) ────────────────────────────────
  'gemini-remy': {
    id: 'gemini-remy',
    name: 'Gemini-Remy (direct)',
    provider: 'gemini',
    providerName: 'Google AI',
    contextWindow: 1_000_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0.075, output: 0.30 },
    bestFor: ['Long context', 'Vision', 'Multimodal', 'Fast'],
    color: PROVIDER_COLORS.gemini,
    icon: '✨',
  },

  // ─── Hermes (custom endpoint) ─────────────────────────────────────
  'hermes-fast': {
    id: 'hermes-fast',
    name: 'Hermes Fast',
    provider: 'hermes',
    providerName: 'Hermes',
    contextWindow: 32_000,
    maxOutput: 4_096,
    costPerMillion: { input: 0, output: 0 },
    bestFor: ['Quick lookups', 'Local inference', 'No-cost'],
    color: PROVIDER_COLORS.hermes,
    icon: '⚡',
  },

  // ─── OpenClaw (custom agent routing) ──────────────────────────────
  'openclaw-agent': {
    id: 'openclaw-agent',
    name: 'OpenClaw Agent',
    provider: 'openclaw',
    providerName: 'OpenClaw',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0, output: 0 },
    bestFor: ['Local agent routing', 'Multi-model fallback', 'Self-hosted'],
    color: PROVIDER_COLORS.openclaw,
    icon: '🌀',
  },
}

// Default model for each provider (used when user hasn't picked anything)
export const DEFAULTS = {
  defaultModel: 'MiniMax-M3',
  fallbackModel: 'nvidia/deepseek-v4-flash',
  providerOrder: [
    'minimax', 'nvidia', 'openrouter', 'anthropic', 'openai', 'gemini', 'deepseek', 'hermes', 'openclaw',
  ] as Provider[],
}

// Get models by provider
export function getModelsByProvider(provider: string): ModelConfig[] {
  return Object.values(MODELS).filter((m) => m.provider === provider)
}

// Get all unique providers (in display order)
export function getProviders(): Array<{ id: Provider; name: string; color: string }> {
  const order = DEFAULTS.providerOrder
  const seen = new Set<string>()
  const providers: Array<{ id: Provider; name: string; color: string }> = []
  for (const providerId of order) {
    if (seen.has(providerId)) continue
    seen.add(providerId)
    providers.push({
      id: providerId,
      name: MODELS[Object.keys(MODELS).find((k) => MODELS[k].provider === providerId) || '']?.providerName || providerId,
      color: PROVIDER_COLORS[providerId] || '#888',
    })
  }
  // Add any providers not in the order list (defensive)
  for (const m of Object.values(MODELS)) {
    if (!seen.has(m.provider)) {
      seen.add(m.provider)
      providers.push({ id: m.provider, name: m.providerName, color: PROVIDER_COLORS[m.provider] || '#888' })
    }
  }
  return providers
}
