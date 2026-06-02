/**
 * Vault helpers — paths come from `config.yaml` (set by the setup wizard).
 *
 * Structure (auto-saved):
 *   <vault>/<projectDir>/chats/<agent-slug>/YYYY-MM-DD.md   ← daily chat logs per agent
 *   <vault>/<projectDir>/chats/YYYY-MM-DD.md                ← legacy / no-agent
 *   <vault>/<projectDir>/journal/YYYY-MM-DD.md              ← daily journal
 *   <vault>/<projectDir>/goals/YYYY-MM.md                   ← monthly goals
 *   <vault>/<projectDir>/missions.md                        ← rolling mission log
 *
 * All paths are resolved from `loadConfig()` so the app is portable —
 * no hardcoded `/root/OpenClaw-Wiki` here. The setup wizard writes the
 * config; see `config.example.yaml` for the full schema.
 */

import { loadConfig } from './config'

/**
 * Resolve the active vault root from config. Called at every path-build
 * so config changes (e.g. via Settings modal → /api/config) take effect
 * without a server restart.
 */
function vaultRoot(): string {
  return loadConfig().vault.localPath
}

function projectDir(): string {
  return loadConfig().vault.projectDir
}

/** @deprecated Use loadConfig().vault.localPath — kept for backwards compat. */
export const VAULT_ROOT  = '__read_from_config__'
/** @deprecated Use loadConfig().vault.projectDir — kept for backwards compat. */
export const PROJECT_DIR = '__read_from_config__'

// ── Path builders ────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export function chatFilePath(date = todayStr(), agentName?: string): string {
  const root = vaultRoot()
  const proj = projectDir()
  if (agentName) {
    const slug = agentName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    return `${root}/${proj}/chats/${slug}/${date}.md`
  }
  return `${root}/${proj}/chats/${date}.md`
}

export function journalFilePath(date = todayStr()): string {
  return `${vaultRoot()}/${projectDir()}/journal/${date}.md`
}

export function missionsFilePath(): string {
  return `${vaultRoot()}/${projectDir()}/missions.md`
}

export function goalsFilePath(date = todayStr()): string {
  return `${vaultRoot()}/${projectDir()}/goals/${date.slice(0, 7)}.md`
}

export function goalsFileHeader(date = todayStr()): string {
  const [year, month] = date.slice(0, 7).split('-')
  const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
    .toLocaleString('en-US', { month: 'long' })
  return [
    frontmatter(`Goals — ${monthName} ${year}`, ['agentic-os', 'goals', 'monthly'], date),
    `# 🎯 Goals — ${monthName} ${year}`,
    '',
    '> Auto-saved from Multi-Agent OS dashboard. Update checkbox status here or in the app.',
    '',
    '---',
    '',
  ].join('\n')
}

export function formatGoalEntry(goal: {
  title: string
  description: string
  priority: string
  status: string
  createdAt: Date
  completedAt?: Date
}): string {
  const created = goal.createdAt.toISOString().slice(0, 10)
  const checkbox = goal.status === 'completed' ? 'x' : ' '
  const priorityBadge = { low: '🔵', medium: '🟡', high: '🔴' }[goal.priority] ?? '•'
  const meta = `*[${created}] ${priorityBadge} ${goal.priority.toUpperCase()}*`
  const desc = goal.description ? `\n  > ${goal.description}` : ''
  if (goal.status === 'completed' && goal.completedAt) {
    const done = goal.completedAt.toISOString().slice(0, 10)
    return [`- [x] ${goal.title}${desc}
  ${meta} · completed ${done}`, '', '  ---', ''].join('\n')
  }
  return [`- [ ] ${goal.title}${desc}
  ${meta}`, '', '  ---', ''].join('\n')
}

// ── Frontmatter ──────────────────────────────────────────────────────────────

export function frontmatter(title: string, tags: string[], date = todayStr()): string {
  return `---\ntitle: ${title}\ncreated: ${date}\ntags: [${tags.join(', ')}]\n---\n`
}

// ── File header builders (written once when file is new) ─────────────────────

export function chatFileHeader(date: string, agentName?: string): string {
  const title = agentName ? `Chat Log — ${agentName} — ${date}` : `Chat Log — ${date}`
  return [
    frontmatter(title, ['agentic-os', 'chat', 'daily-log'], date),
    `# 🤖 ${title}`,
    '',
    `> Auto-saved from Multi-Agent OS dashboard · [[Multi-Agent OS]]`,
    '',
    '---',
    '',
  ].join('\n')
}

export function journalFileHeader(date: string): string {
  return [
    frontmatter(`Journal — ${date}`, ['agentic-os', 'journal', 'daily-log'], date),
    `# 📓 Journal — ${date}`,
    '',
    `> Auto-saved from Multi-Agent OS dashboard · [[Multi-Agent OS]]`,
    '',
    '---',
    '',
  ].join('\n')
}

export function missionsFileHeader(): string {
  return [
    frontmatter('Multi-Agent OS — Missions', ['agentic-os', 'missions', 'goals']),
    '# 🎯 Multi-Agent OS — Mission Log',
    '',
    '> Tracks all missions deployed from the Multi-Agent OS dashboard.',
    '',
    '---',
    '',
  ].join('\n')
}

// ── Content formatters ───────────────────────────────────────────────────────

export function formatChatEntry(
  userContent: string,
  assistantContent: string,
  timestamp?: Date,
  agentName?: string,
  modelName?: string,
): string {
  const ts = (timestamp ?? new Date()).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  const agent = agentName || 'Claude'
  const modelLine = modelName ? ` _(${modelName})_` : ''
  return [
    `### ${ts}`,
    '',
    `**Justin:** ${userContent}`,
    '',
    `**${agent}:**${modelLine} ${assistantContent}`,
    '',
    '---',
    '',
  ].join('\n')
}

export function formatJournalEntry(content: string, tags: string[], timestamp?: Date): string {
  const ts = (timestamp ?? new Date()).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  const tagLine = tags.length ? `\`${tags.join('` `')}\`` : ''
  return [
    `### ${ts}${tagLine ? `  ·  ${tagLine}` : ''}`,
    '',
    content.trim(),
    '',
    '---',
    '',
  ].join('\n')
}

export function formatMissionEntry(mission: {
  title: string
  description: string
  priority: string
  status: string
  assignedTo: string
  createdAt: Date
  completedAt?: Date
}): string {
  const created = mission.createdAt.toISOString().slice(0, 16).replace('T', ' ')
  const completed = mission.completedAt
    ? mission.completedAt.toISOString().slice(0, 16).replace('T', ' ')
    : '—'
  const statusEmoji = {
    completed: '✅', running: '🔄', pending: '⏳', failed: '❌',
  }[mission.status] ?? '•'

  return [
    `### ${statusEmoji} ${mission.title}`,
    '',
    mission.description ? `> ${mission.description}` : '',
    '',
    `| Field | Value |`,
    `|-------|-------|`,
    `| Priority | **${mission.priority.toUpperCase()}** |`,
    `| Status | ${mission.status} |`,
    `| Agent | ${mission.assignedTo} |`,
    `| Created | ${created} |`,
    `| Completed | ${completed} |`,
    '',
    '---',
    '',
  ].filter(Boolean).join('\n')
}

// ── Client-side save helper ──────────────────────────────────────────────────
// Calls the local Next.js API route which handles SSH + git.

export interface VaultSaveRequest {
  remotePath: string
  content: string
  append: boolean
  commitMessage: string
  // Vault location. If host is empty / 'localhost' / '127.0.0.1', the API
  // writes directly to the local vault (no SSH). Otherwise SSH is used.
  host?: string
  sshUser?: string
  sshKeyPath?: string
  sshPassword?: string
}

export interface VaultSaveResult {
  success: boolean
  error?: string
  /** 'local' if same-host fast path, 'remote' if SSH used. */
  mode?: 'local' | 'remote'
}

export async function saveToVault(req: VaultSaveRequest): Promise<VaultSaveResult> {
  try {
    const res = await fetch('/api/vault/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    })
    const data = await res.json()
    if (!res.ok) return { success: false, error: data.error ?? 'Save failed' }
    return { success: true, mode: data.mode }
  } catch (e: any) {
    return { success: false, error: e.message ?? 'Network error' }
  }
}
