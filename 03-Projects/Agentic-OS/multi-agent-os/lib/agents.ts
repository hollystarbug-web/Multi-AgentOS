// Agent registry — driven by `config.yaml` agents: list.
//
// To add a new agent:
//   1. Add an entry to `config.yaml` under `agents:`
//   2. Create `prompts/<agent-id>.md` with the system prompt
//   3. (Optional) Override the persona via Settings modal → writes to config.yaml
//
// Each agent has: name, icon (lucide-react), accent colour, default model,
// provider, tagline, and a system prompt loaded from `prompts/<id>.md`.
//
// Server-only because prompts are read from disk. For client-side use,
// fetch the active config via `/api/config`.

import type { LucideIcon } from 'lucide-react'
import {
  Sparkles, Bot, ClipboardList, Anchor, Star, Shield, Brain, Zap, MessageSquare,
} from 'lucide-react'
import { readFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadConfig } from './config'

export type AgentId = string  // Configurable now — not just the 9 hardcoded

export interface AgentConfig {
  id: AgentId
  name: string
  shortName?: string
  icon: LucideIcon
  /** RGBA prefix used for sidebar dot, message tint, header strip. e.g. 'rgba(6,182,212,' */
  accent: string
  /** Background accent (for tile fills) — usually same as accent but with 0.18 alpha */
  accentBg: string
  provider: string
  defaultModel: string
  tagline: string
  systemPrompt: string
  freeAgent?: boolean
}

// ─── Icon mapping (config → lucide-react component) ──────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles, Bot, ClipboardList, Anchor, Star, Shield, Brain, Zap, MessageSquare,
}

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? MessageSquare
}

// ─── Prompt loader (reads prompts/<id>.md) ───────────────────────────────

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
// __dirname is `.../Multi-AgentOS/lib/`, so project root is one up.
const PROJECT_ROOT = resolve(__dirname, '..')

function loadPrompt(promptFile: string | undefined, agentId: string): string {
  if (!promptFile) return ''
  // Resolve relative paths against project root
  const absPath = promptFile.startsWith('/')
    ? promptFile
    : resolve(PROJECT_ROOT, promptFile)
  if (!existsSync(absPath)) {
    console.warn(`[agents] Prompt file not found: ${absPath} (agent: ${agentId})`)
    return ''
  }
  try {
    return readFileSync(absPath, 'utf8').trim()
  } catch (e: any) {
    console.warn(`[agents] Failed to read ${absPath}: ${e.message}`)
    return ''
  }
}

// ─── Agent registry (built from config) ─────────────────────────────────

/**
 * Build the AGENTS map from the current config. Re-evaluated on each call
 * so config changes take effect without a server restart.
 */
export function buildAgents(): Record<AgentId, AgentConfig> {
  const cfg = loadConfig()
  const agents: Record<AgentId, AgentConfig> = {}

  for (const a of cfg.agents) {
    const systemPrompt = loadPrompt(a.promptFile, a.id)
    // Skip agents with no name (defensive)
    if (!a.name) continue
    agents[a.id] = {
      id: a.id,
      name: a.name,
      icon: resolveIcon(a.icon),
      accent: a.accent,
      accentBg: `${a.accent}0.18)`,  // add alpha suffix
      provider: a.provider,
      defaultModel: a.defaultModel,
      tagline: a.tagline || '',
      systemPrompt,
      freeAgent: a.id === 'agent-direct',
    }
  }

  return agents
}

// Cached for fast access — but rebuilt when config changes
let _cached: Record<AgentId, AgentConfig> | null = null

/** Backwards-compatible AGENTS map. Use getAgent() for safety. */
export const AGENTS: Record<AgentId, AgentConfig> = new Proxy({} as any, {
  get(_t, prop: string) {
    if (!_cached) _cached = buildAgents()
    return _cached[prop]
  },
  ownKeys() {
    if (!_cached) _cached = buildAgents()
    return Reflect.ownKeys(_cached)
  },
  getOwnPropertyDescriptor(_t, prop) {
    if (!_cached) _cached = buildAgents()
    return Reflect.getOwnPropertyDescriptor(_cached, prop)
  },
})

/** Force rebuild on next access (call after writing to config). */
export function rebuildAgents(): void {
  _cached = null
}

/** Get an agent config by id with a safe fallback to the first defined agent. */
export function getAgent(id: string): AgentConfig {
  if (!_cached) _cached = buildAgents()
  return _cached[id] ?? _cached[Object.keys(_cached)[0]]
}

/** List of agents (in config order) for selector dropdowns. */
export function getAgentList(): AgentConfig[] {
  if (!_cached) _cached = buildAgents()
  return Object.values(_cached)
}

/** All agent IDs in config display order. */
export function getAgentIds(): AgentId[] {
  if (!_cached) _cached = buildAgents()
  return Object.keys(_cached)
}
