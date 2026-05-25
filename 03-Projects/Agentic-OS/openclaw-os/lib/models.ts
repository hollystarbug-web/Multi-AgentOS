// Model registry — all available models, their providers, and metadata

export interface ModelConfig {
  id: string
  name: string
  provider: 'anthropic' | 'openai' | 'deepseek' | 'openrouter' | 'minimax'
  providerName: string
  contextWindow: number       // tokens
  maxOutput: number          // tokens
  costPerMillion: { input: number; output: number; cacheRead?: number }
  defaultFor?: string[]      // default tasks
  bestFor: string[]          // use cases
  color: string              // accent color for UI
  icon?: string              // emoji or icon
}

export const MODELS: Record<string, ModelConfig> = {
  // ─── DeepSeek ───────────────────────────────────────────────
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
    color: '#10a37f',
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
    color: '#10a37f',
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
    color: '#10a37f',
    icon: '🔵',
  },

  // ─── Anthropic ─────────────────────────────────────────────
  'claude-opus-4-5': {
    id: 'claude-opus-4-5',
    name: 'Claude Opus 4',
    provider: 'anthropic',
    providerName: 'Anthropic',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 15, output: 75 },
    bestFor: ['Complex reasoning', 'Long documents', 'Analysis', 'Research'],
    color: '#d4a574',
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
    color: '#d4a574',
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
    color: '#d4a574',
    icon: '🟠',
  },

  // ─── OpenAI ────────────────────────────────────────────────
  'gpt-4.5': {
    id: 'gpt-4.5',
    name: 'GPT-4.5',
    provider: 'openai',
    providerName: 'OpenAI',
    contextWindow: 128_000,
    maxOutput: 32_768,
    costPerMillion: { input: 75, output: 150 },
    bestFor: ['General purpose', 'Complex reasoning', 'Creative'],
    color: '#10a37f',
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
    color: '#10a37f',
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
    color: '#10a37f',
    icon: '🟢',
  },

  // ─── MiniMax ───────────────────────────────────────────────
  'MiniMax-M2.7-highspeed': {
    id: 'MiniMax-M2.7-highspeed',
    name: 'MiniMax M2.7 Highspeed',
    provider: 'minimax',
    providerName: 'MiniMax',
    contextWindow: 200_000,
    maxOutput: 8_192,
    costPerMillion: { input: 0, output: 0 },
    defaultFor: ['fallback', 'free'],
    bestFor: ['Quick lookups', 'Fallback', 'Free tasks'],
    color: '#00d2ff',
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
    color: '#00d2ff',
    icon: '🔷',
  },
}

// Default model for each provider (used when user hasn't picked anything)
export const DEFAULTS = {
  defaultModel: 'deepseek/deepseek-v4-flash',
  fallbackModel: 'MiniMax-M2.7-highspeed',
  providerOrder: ['openrouter', 'deepseek', 'anthropic', 'openai', 'minimax'] as const,
}

// Get models by provider
export function getModelsByProvider(provider: string): ModelConfig[] {
  return Object.values(MODELS).filter((m) => m.provider === provider)
}

// Get all unique providers
export function getProviders(): Array<{ id: string; name: string; color: string }> {
  const seen = new Set<string>()
  const providers: Array<{ id: string; name: string; color: string }> = []
  for (const model of Object.values(MODELS)) {
    if (!seen.has(model.provider)) {
      seen.add(model.provider)
      providers.push({
        id: model.provider,
        name: model.providerName,
        color: model.color,
      })
    }
  }
  return providers
}

// ─── OpenRouter ─────────────────────────────────────────────
// DeepSeek V4 Flash via OpenRouter (cheaper than direct)
'deepseek/deepseek-v4-flash': {
  id: 'deepseek/deepseek-v4-flash',
  name: 'DeepSeek V4 Flash',
  provider: 'openrouter',
  providerName: 'OpenRouter',
  contextWindow: 1_000_000,
  maxOutput: 32_768,
  costPerMillion: { input: 0.10, output: 0.20 },
  defaultFor: ['general', 'quick', 'free'],
  bestFor: ['General chat', 'Drafts', 'Quick tasks', 'Free tier'],
  color: '#7c3aed',
  icon: '🔷',
},

// GPT-5.5 via OpenRouter (expensive but powerful)
'openai/gpt-5.5': {
  id: 'openai/gpt-5.5',
  name: 'GPT-5.5',
  provider: 'openrouter',
  providerName: 'OpenRouter',
  contextWindow: 1_000_000,
  maxOutput: 128_000,
  costPerMillion: { input: 5.0, output: 30.0 },
  bestFor: ['Complex professional workloads', 'Research', 'Advanced reasoning'],
  color: '#10a37f',
  icon: '🟢',
},

// Qwen 3.6 Plus via OpenRouter
'qwen/qwen3.6-plus': {
  id: 'qwen/qwen3.6-plus',
  name: 'Qwen 3.6 Plus',
  provider: 'openrouter',
  providerName: 'OpenRouter',
  contextWindow: 1_000_000,
  maxOutput: 32_768,
  costPerMillion: { input: 0, output: 0 },  // free tier
  bestFor: ['Free tier', 'General tasks'],
  color: '#7c3aed',
  icon: '🔷',
},
