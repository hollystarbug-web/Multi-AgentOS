/**
 * Config loader — single source of truth for paths, nodes, agents, models.
 *
 * Resolution order (first wins):
 *   1. `config.yaml` in the project root (user-editable)
 *   2. Built-in `BUILTIN_DEFAULTS` (ship with the app)
 *
 * Anything you set in `config.yaml` overrides the built-in defaults.
 * Anything you omit falls back to the defaults.
 *
 * Server-side only — this module reads the filesystem. Client code should
 * use `/api/config` to fetch the active config.
 */

import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import yaml from 'js-yaml'
import { z } from 'zod'

// ─── Schema ──────────────────────────────────────────────────────────────

const NodeConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  host: z.string(),
  icon: z.string().default('🖥️'),
  color: z.string().default('cyan'),
})

const AgentConfigSchema = z.object({
  id: z.string(),
  name: z.string(),
  icon: z.string(),
  accent: z.string(),
  provider: z.string(),
  defaultModel: z.string(),
  tagline: z.string().optional().default(''),
  promptFile: z.string().optional(),
})

const ConfigSchema = z.object({
  app: z.object({
    name: z.string().default('Multi-AgentOS'),
    port: z.number().int().positive().default(3000),
    accent: z.string().default('cyan'),
  }).default({}),
  vault: z.object({
    enabled: z.boolean().default(true),
    localPath: z.string().default('~/Documents/Obsidian'),
    projectDir: z.string().default('Multi-AgentOS'),
    ssh: z.object({
      enabled: z.boolean().default(false),
      host: z.string().default(''),
      user: z.string().default('root'),
      keyPath: z.string().default('~/.ssh/id_ed25519'),
      password: z.string().default(''),
    }).default({}),
    autoSave: z.boolean().default(true),
  }).default({}),
  nodes: z.array(NodeConfigSchema).default([]),
  providers: z.object({
    defaultModel: z.string().default('nvidia/deepseek-v4-flash'),
    fallbackModel: z.string().default('MiniMax-M2.7-highspeed'),
    priority: z.array(z.string()).default([]),
    endpoints: z.record(z.string()).default({}),
  }).default({}),
  agents: z.array(AgentConfigSchema).default([]),
  panels: z.object({
    overview: z.boolean().default(true),
    goals: z.boolean().default(true),
    journal: z.boolean().default(true),
    nodeMonitor: z.boolean().default(true),
    missionControl: z.boolean().default(true),
    terminal: z.boolean().default(true),
    openclaw: z.boolean().default(true),
  }).default({}),
  bugReports: z.object({
    enabled: z.boolean().default(true),
    vaultPath: z.string().default('03-Projects/Agentic-OS/bugs'),
  }).default({}),
})

export type AppConfig = z.infer<typeof ConfigSchema>
export type NodeConfig = z.infer<typeof NodeConfigSchema>
export type AgentYamlConfig = z.infer<typeof AgentConfigSchema>

// ─── Built-in defaults (shipped with the app) ────────────────────────────

const BUILTIN_DEFAULTS: AppConfig = {
  app: { name: 'Multi-AgentOS', port: 3000, accent: 'cyan' },
  vault: {
    enabled: true,
    localPath: '~/Documents/Obsidian',
    projectDir: 'Multi-AgentOS',
    ssh: { enabled: false, host: '', user: 'root', keyPath: '~/.ssh/id_ed25519', password: '' },
    autoSave: true,
  },
  nodes: [
    { id: 'hetzner-vps', name: 'Hetzner VPS',   role: 'Openclaw Host', host: '100.87.207.10', icon: '🖥️', color: 'cyan' },
    { id: 'mac-mini',    name: 'Mac Mini',      role: 'Browser Node',  host: '100.91.33.1',   icon: '💻', color: 'violet' },
    { id: 'macbook',     name: 'MacBook Pro',   role: 'Control Node',  host: 'localhost',     icon: '🎯', color: 'pink' },
  ],
  providers: {
    defaultModel: 'nvidia/deepseek-v4-flash',
    fallbackModel: 'MiniMax-M2.7-highspeed',
    priority: ['minimax', 'nvidia', 'kimi', 'openrouter', 'anthropic', 'openai', 'gemini', 'deepseek', 'hermes', 'openclaw'],
    endpoints: {},
  },
  agents: [],
  panels: {
    overview: true, goals: true, journal: true, nodeMonitor: true,
    missionControl: true, terminal: true, openclaw: true,
  },
  bugReports: { enabled: true, vaultPath: '03-Projects/Agentic-OS/bugs' },
}

// ─── Loader ──────────────────────────────────────────────────────────────

/** Resolve ~ and $HOME in path strings. */
function expandHome(p: string): string {
  if (!p) return p
  if (p.startsWith('~')) {
    return p.replace(/^~/, process.env.HOME || '/root')
  }
  return p
}

/** Find the project root (where package.json lives). */
function findProjectRoot(): string {
  // When called from Next.js, cwd is the project root.
  // When called from CLI scripts, cwd may differ — fall back to the file's dir.
  if (existsSync(resolve(process.cwd(), 'package.json'))) {
    return process.cwd()
  }
  return resolve(__dirname, '..')
}

let cached: AppConfig | null = null

/**
 * Load the active config. Reads `config.yaml` from the project root if it
 * exists, otherwise returns built-in defaults. Cached after first load.
 */
export function loadConfig(force = false): AppConfig {
  if (cached && !force) return cached

  const root = findProjectRoot()
  const userPath = resolve(root, 'config.yaml')

  if (existsSync(userPath)) {
    try {
      const raw = readFileSync(userPath, 'utf8')
      const parsed = yaml.load(raw) as Record<string, unknown>
      // Deep-merge with defaults so partial config files work
      const merged = deepMerge(structuredClone(BUILTIN_DEFAULTS), parsed)
      const validated = ConfigSchema.parse(merged)
      // Expand ~ in vault.localPath
      validated.vault.localPath = expandHome(validated.vault.localPath)
      cached = validated
      return validated
    } catch (e: any) {
      console.error(`[config] Failed to load config.yaml: ${e.message}`)
      console.error('[config] Falling back to built-in defaults.')
    }
  }

  cached = structuredClone(BUILTIN_DEFAULTS)
  return cached
}

/** Get the path to the user's config.yaml (may not exist). */
export function configPath(): string {
  return resolve(findProjectRoot(), 'config.yaml')
}

/** Path to the example config (shipped with the app). */
export function configExamplePath(): string {
  return resolve(findProjectRoot(), 'config.example.yaml')
}

/** Check if a user config.yaml exists. */
export function hasUserConfig(): boolean {
  return existsSync(configPath())
}

/** Reset cache (used by tests and after config write). */
export function resetConfigCache(): void {
  cached = null
}

// ─── Deep merge helper (for partial config files) ────────────────────────

function deepMerge(target: any, source: any): any {
  if (Array.isArray(source)) return source
  if (typeof source !== 'object' || source === null) return source
  const out: any = { ...target }
  for (const key of Object.keys(source)) {
    if (
      typeof source[key] === 'object' &&
      source[key] !== null &&
      !Array.isArray(source[key]) &&
      typeof target[key] === 'object' &&
      target[key] !== null
    ) {
      out[key] = deepMerge(target[key], source[key])
    } else {
      out[key] = source[key]
    }
  }
  return out
}
