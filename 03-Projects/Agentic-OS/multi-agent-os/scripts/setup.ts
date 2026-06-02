#!/usr/bin/env tsx
/**
 * Setup wizard — first-run config for Multi-AgentOS.
 *
 *   npm run setup
 *
 * What it does:
 *   1. Detects OS, Node version, package manager
 *   2. Detects installed AI agents (claude, codex, ollama, openclaw, etc.)
 *   3. Probes likely vault locations
 *   4. Asks the user for missing pieces (vault path, API keys, nodes)
 *   5. Writes `config.yaml` and `.env.local`
 *
 * Idempotent — safe to re-run. If `config.yaml` exists, it asks before
 * overwriting.
 */

import { existsSync, writeFileSync, readFileSync, mkdirSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import os from 'node:os'
import yaml from 'js-yaml'
import prompts from 'prompts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// ─── Helpers ────────────────────────────────────────────────────────────

const c = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
}

function header(text: string) {
  console.log(`\n${c.cyan}${c.bold}━━━ ${text} ━━━${c.reset}`)
}

function ok(text: string) {
  console.log(`${c.green}✓${c.reset} ${text}`)
}

function warn(text: string) {
  console.log(`${c.yellow}⚠${c.reset} ${text}`)
}

function info(text: string) {
  console.log(`${c.dim}${text}${c.reset}`)
}

function expandHome(p: string): string {
  if (!p) return p
  return p.replace(/^~/, os.homedir())
}

function detectOS(): 'mac' | 'linux' | 'windows' {
  const p = process.platform
  if (p === 'darwin') return 'mac'
  if (p === 'win32') return 'windows'
  return 'linux'
}

function nodeVersion(): string {
  return process.version.replace(/^v/, '')
}

function hasCommand(cmd: string): boolean {
  try {
    execSync(`command -v ${cmd}`, { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
}

function hasCommandVersion(cmd: string): string | null {
  try {
    return execSync(`${cmd} --version 2>/dev/null | head -1`, { encoding: 'utf8' }).trim()
  } catch {
    return null
  }
}

/** Detect installed AI agents by checking $PATH. */
function detectAgents(): { name: string; cmd: string; version: string | null }[] {
  const candidates: { name: string; cmd: string }[] = [
    { name: 'Claude (Anthropic)', cmd: 'claude' },
    { name: 'Codex (OpenAI)', cmd: 'codex' },
    { name: 'OpenClaw', cmd: 'openclaw' },
    { name: 'Ollama', cmd: 'ollama' },
    { name: 'Aider', cmd: 'aider' },
    { name: 'Cursor', cmd: 'cursor' },
    { name: 'Continue', cmd: 'cn' },
    { name: 'LM Studio', cmd: 'lms' },
    { name: 'GPT4All', cmd: 'gpt4all' },
  ]
  const found: { name: string; cmd: string; version: string | null }[] = []
  for (const c of candidates) {
    if (hasCommand(c.cmd)) {
      found.push({ ...c, version: hasCommandVersion(c.cmd) })
    }
  }
  return found
}

/** Probe common vault locations. */
function probeVaultLocations(): { path: string; exists: boolean; note: string }[] {
  const home = os.homedir()
  const candidates = [
    { path: `${home}/Documents/Obsidian`, note: 'Default Obsidian on macOS' },
    { path: `${home}/Obsidian`, note: 'Common Linux vault' },
    { path: `${home}/Documents/ObsidianVault`, note: 'Alt Obsidian naming' },
    { path: `${home}/.openclaw-wiki`, note: 'OpenClaw wiki default' },
    { path: `${home}/OpenClaw-Wiki`, note: 'OpenClaw wiki (capital W)' },
    { path: `${home}/vault`, note: 'Generic vault' },
  ]
  return candidates.map(c => ({ ...c, exists: existsSync(c.path) }))
}

// ─── Main ───────────────────────────────────────────────────────────────

async function main() {
  console.log(`${c.magenta}${c.bold}
  ╔══════════════════════════════════════╗
  ║       Multi-AgentOS — Setup Wizard      ║
  ╚══════════════════════════════════════╝${c.reset}`)

  info(`This wizard will configure Multi-AgentOS for your machine.`)
  info(`Safe to re-run. Existing config.yaml is backed up before overwrite.`)
  console.log('')

  // ── 1. System detection ─────────────────────────────────────────────
  header('Step 1 · System detection')
  const platform = detectOS()
  const nv = nodeVersion()
  const majorVer = parseInt(nv.split('.')[0], 10)
  ok(`OS: ${platform} (${os.platform()} ${os.release()})`)
  ok(`Node: v${nv}`)
  ok(`Home: ${os.homedir()}`)
  if (majorVer < 20) {
    warn(`Node ${nv} is older than 20 — some features may not work.`)
    warn(`Recommended: install Node 20+ via nvm (https://github.com/nvm-sh/nvm).`)
  }

  // ── 2. AI agent detection ──────────────────────────────────────────
  header('Step 2 · AI agents on this machine')
  const agents = detectAgents()
  if (agents.length === 0) {
    warn('No AI agent CLIs found in $PATH.')
    info('  You can still use Multi-AgentOS — API keys are enough.')
  } else {
    for (const a of agents) {
      ok(`${a.name} — ${a.cmd} ${a.version ? `(${a.version})` : ''}`)
    }
  }
  console.log('')

  // ── 3. Vault detection ─────────────────────────────────────────────
  header('Step 3 · Obsidian vault location')
  const probes = probeVaultLocations()
  const choices = probes.map(p => ({
    title: `${p.exists ? '✓ ' : '  '}${p.path}  ${c.dim}${p.note}${c.reset}`,
    value: p.path,
    description: p.exists ? 'exists' : 'not found (will be created)',
  }))
  choices.push({ title: 'Custom path…', value: '__custom__', description: 'enter manually' })

  const vaultResponse = await prompts({
    type: 'select',
    name: 'path',
    message: 'Where is (or will be) your Obsidian vault?',
    choices,
    initial: probes.findIndex(p => p.exists),
  })

  let vaultPath: string
  if (vaultResponse.path === '__custom__') {
    const custom = await prompts({
      type: 'text',
      name: 'path',
      message: 'Enter vault path:',
      initial: `${os.homedir()}/Documents/Obsidian`,
    })
    vaultPath = expandHome(custom.path)
  } else {
    vaultPath = expandHome(vaultResponse.path)
  }
  ok(`Vault: ${vaultPath}`)

  // Ensure vault dir exists
  try {
    if (!existsSync(vaultPath)) {
      mkdirSync(vaultPath, { recursive: true })
      ok(`Created vault directory`)
    }
  } catch (e: any) {
    warn(`Could not create vault dir: ${e.message}`)
  }

  // ── 4. SSH remote (optional) ───────────────────────────────────────
  header('Step 4 · SSH remote vault (optional)')
  const sshResponse = await prompts({
    type: 'confirm',
    name: 'enable',
    message: 'Auto-save to a remote vault over SSH?',
    initial: false,
  })

  let sshConfig = { enabled: false, host: '', user: 'root', keyPath: '~/.ssh/id_ed25519', password: '' }
  if (sshResponse.enable) {
    const ssh = await prompts([
      { type: 'text', name: 'host', message: 'SSH host (IP or hostname):', initial: '100.87.207.10' },
      { type: 'text', name: 'user', message: 'SSH user:', initial: 'root' },
      { type: 'text', name: 'keyPath', message: 'SSH key path (blank for password auth):', initial: '~/.ssh/id_ed25519' },
    ])
    sshConfig = { enabled: true, ...ssh, password: '' }
    ok(`SSH: ${sshConfig.user}@${sshConfig.host}`)
  } else {
    ok('Using local vault (no SSH)')
  }

  // ── 5. API keys ────────────────────────────────────────────────────
  header('Step 5 · API keys (stored in .env.local, never in config)')
  const keyPrompts = await prompts([
    { type: 'text', name: 'anthropic', message: 'Anthropic API key (Claude):', initial: process.env.ANTHROPIC_API_KEY || '' },
    { type: 'text', name: 'openai', message: 'OpenAI API key (optional):', initial: process.env.OPENAI_API_KEY || '' },
    { type: 'text', name: 'deepseek', message: 'DeepSeek API key (optional):', initial: process.env.DEEPSEEK_API_KEY || '' },
    { type: 'text', name: 'openrouter', message: 'OpenRouter API key (optional):', initial: process.env.OPENROUTER_API_KEY || '' },
    { type: 'text', name: 'nvidia', message: 'NVIDIA NIM API key (FREE DeepSeek, optional):', initial: process.env.NVIDIA_API_KEY || '' },
    { type: 'text', name: 'gemini', message: 'Google Gemini API key (optional):', initial: process.env.GEMINI_API_KEY || '' },
  ])

  // ── 6. Nodes (machines to orchestrate) ─────────────────────────────
  header('Step 6 · Nodes (machines you orchestrate)')
  const nodesResponse = await prompts({
    type: 'confirm',
    name: 'useDefaults',
    message: 'Use default nodes (Hetzner VPS, Mac Mini, MacBook)?',
    initial: true,
  })
  let nodes = [
    { id: 'hetzner-vps', name: 'Hetzner VPS', role: 'Openclaw Host', host: '100.87.207.10', icon: '🖥️', color: 'cyan' },
    { id: 'mac-mini',    name: 'Mac Mini',    role: 'Browser Node', host: '100.91.33.1',   icon: '💻', color: 'violet' },
    { id: 'macbook',     name: 'MacBook Pro', role: 'Control Node', host: 'localhost',     icon: '🎯', color: 'pink' },
  ]
  if (!nodesResponse.useDefaults) {
    info('Enter your nodes one at a time. Blank name to finish.')
    const customNodes: typeof nodes = []
    let i = 1
    while (true) {
      const n = await prompts([
        { type: 'text', name: 'id',   message: `Node ${i} id (e.g. my-server):`, initial: `node-${i}` },
        { type: 'text', name: 'name', message: `Node ${i} display name (blank to finish):`, initial: '' },
        { type: 'text', name: 'host', message: `Node ${i} host/IP:`, initial: '' },
      ])
      if (!n.name) break
      customNodes.push({
        id: n.id, name: n.name, role: 'Custom', host: n.host, icon: '🖥️', color: 'cyan',
      })
      i++
    }
    if (customNodes.length > 0) nodes = customNodes
  }
  ok(`${nodes.length} node(s) configured`)

  // ── 7. Default model ───────────────────────────────────────────────
  header('Step 7 · Default model')
  const modelResponse = await prompts({
    type: 'select',
    name: 'model',
    message: 'Default model for new chats:',
    choices: [
      { title: `${c.green}FREE${c.reset} — nvidia/deepseek-v4-flash (NVIDIA NIM, 1M context)`, value: 'nvidia/deepseek-v4-flash' },
      { title: `${c.green}FREE${c.reset} — MiniMax-M2.7-highspeed`,                            value: 'MiniMax-M2.7-highspeed' },
      { title: '$0.10/M — deepseek/deepseek-v4-flash (OpenRouter)',                          value: 'deepseek/deepseek-v4-flash' },
      { title: '$3/M   — claude-sonnet-4-5 (Anthropic)',                                       value: 'claude-sonnet-4-5' },
      { title: '$15/M  — claude-opus-4-5 (Anthropic, complex reasoning)',                      value: 'claude-opus-4-5' },
    ],
    initial: 0,
  })
  ok(`Default: ${modelResponse.model}`)

  // ── 8. Write config + .env ─────────────────────────────────────────
  header('Step 8 · Writing config')

  // Back up existing config
  const userConfigPath = resolve(ROOT, 'config.yaml')
  if (existsSync(userConfigPath)) {
    const backup = `${userConfigPath}.bak.${new Date().toISOString().replace(/[:.]/g, '-')}`
    writeFileSync(backup, readFileSync(userConfigPath))
    info(`Backed up existing config to ${backup}`)
  }

  // Build the config object
  const config: any = {
    app: { name: 'Multi-AgentOS', port: 3000, accent: 'cyan' },
    vault: {
      enabled: true,
      localPath: vaultPath,
      projectDir: 'Multi-AgentOS',
      ssh: sshConfig,
      autoSave: true,
    },
    nodes,
    providers: {
      defaultModel: modelResponse.model,
      fallbackModel: 'MiniMax-M2.7-highspeed',
      priority: ['minimax', 'nvidia', 'kimi', 'openrouter', 'anthropic', 'openai', 'gemini', 'deepseek', 'hermes', 'openclaw'],
      endpoints: {},
    },
    panels: { overview: true, goals: true, journal: true, nodeMonitor: true, missionControl: true, terminal: true, openclaw: true },
    bugReports: { enabled: true, vaultPath: '03-Projects/Agentic-OS/bugs' },
  }

  writeFileSync(userConfigPath, yaml.dump(config, { lineWidth: 120 }))
  ok(`Wrote config.yaml`)

  // Write .env.local
  const envLines: string[] = [
    '# Multi-AgentOS — API keys',
    `# Generated by setup wizard at ${new Date().toISOString()}`,
    '',
  ]
  if (keyPrompts.anthropic)  envLines.push(`ANTHROPIC_API_KEY=${keyPrompts.anthropic}`)
  if (keyPrompts.openai)     envLines.push(`OPENAI_API_KEY=${keyPrompts.openai}`)
  if (keyPrompts.deepseek)   envLines.push(`DEEPSEEK_API_KEY=${keyPrompts.deepseek}`)
  if (keyPrompts.openrouter) envLines.push(`OPENROUTER_API_KEY=${keyPrompts.openrouter}`)
  if (keyPrompts.nvidia)     envLines.push(`NVIDIA_API_KEY=${keyPrompts.nvidia}`)
  if (keyPrompts.gemini)     envLines.push(`GEMINI_API_KEY=${keyPrompts.gemini}`)
  if (envLines.length === 3) envLines.push('# (no API keys configured — add them here or via the Settings modal)')

  const envPath = resolve(ROOT, '.env.local')
  writeFileSync(envPath, envLines.join('\n') + '\n')
  ok(`Wrote .env.local`)

  // ── Done ────────────────────────────────────────────────────────────
  console.log('')
  header('🎉 Setup complete')
  ok(`Config:  ${userConfigPath}`)
  ok(`Env:     ${envPath}`)
  ok(`Vault:   ${vaultPath}`)
  ok(`Nodes:   ${nodes.length}`)
  ok(`Default: ${modelResponse.model}`)
  console.log('')
  info(`Next step:`)
  console.log(`  ${c.cyan}${process.platform === 'win32' ? 'npm run dev' : 'npm run dev'}${c.reset}`)
  console.log('')
  info(`Then open ${c.bold}http://localhost:3000${c.reset}`)
  console.log('')
}

main().catch(e => {
  console.error('Setup failed:', e)
  process.exit(1)
})
