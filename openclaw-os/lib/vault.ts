/**
 * Vault helpers — OpenClaw-Wiki conventions
 *
 * Vault root on Hetzner VPS: /root/OpenClaw-Wiki/
 * Agentic OS project folder:  03-Projects/Agentic-OS/
 *
 * Structure:
 *   03-Projects/Agentic-OS/chats/YYYY-MM-DD.md     ← daily chat logs
 *   03-Projects/Agentic-OS/journal/YYYY-MM-DD.md   ← daily journal
 *   03-Projects/Agentic-OS/missions.md             ← rolling mission log
 *   03-Projects/Agentic-OS/goals/YYYY-MM.md        ← monthly goals (checkbox lists)
 */

export const VAULT_ROOT  = '/root/OpenClaw-Wiki'
export const PROJECT_DIR = '03-Projects/Agentic-OS'

// ── Path builders ────────────────────────────────────────────────────────────

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10) // YYYY-MM-DD
}

export function chatFilePath(date = todayStr()): string {
  return `${VAULT_ROOT}/${PROJECT_DIR}/chats/${date}.md`
}

export function journalFilePath(date = todayStr()): string {
  return `${VAULT_ROOT}/${PROJECT_DIR}/journal/${date}.md`
}

export function missionsFilePath(): string {
  return `${VAULT_ROOT}/${PROJECT_DIR}/missions.md`
}

export function goalsFilePath(date = todayStr()): string {
  // YYYY-MM.md — one file per month
  return `${VAULT_ROOT}/${PROJECT_DIR}/goals/${date.slice(0, 7)}.md`
}

export function goalsFileHeader(date = todayStr()): string {
  const [year, month] = date.slice(0, 7).split('-')
  const monthName = new Date(parseInt(year), parseInt(month) - 1, 1)
    .toLocaleString('en-US', { month: 'long' })
  return [
    frontmatter(`Goals — ${monthName} ${year}`, ['agentic-os', 'goals', 'monthly'], date),
    `# 🎯 Goals — ${monthName} ${year}`,
    '',
    '> Auto-saved from Agentic OS dashboard. Update checkbox status here or in the app.',
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

export function chatFileHeader(date: string): string {
  return [
    frontmatter(`Chat Log — ${date}`, ['agentic-os', 'chat', 'daily-log'], date),
    `# 🤖 Chat Log — ${date}`,
    '',
    `> Auto-saved from Agentic OS dashboard · [[${PROJECT_DIR.replace('03-Projects/', '')}]]`,
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
    `> Auto-saved from Agentic OS dashboard · [[${PROJECT_DIR.replace('03-Projects/', '')}]]`,
    '',
    '---',
    '',
  ].join('\n')
}

export function missionsFileHeader(): string {
  return [
    frontmatter('Agentic OS — Missions', ['agentic-os', 'missions', 'goals']),
    '# 🎯 Agentic OS — Mission Log',
    '',
    '> Tracks all missions deployed from the Agentic OS dashboard.',
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
): string {
  const ts = (timestamp ?? new Date()).toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  })
  return [
    `### ${ts}`,
    '',
    `**Justin:** ${userContent}`,
    '',
    `**Claude:** ${assistantContent}`,
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
  // SSH config
  host: string
  sshUser: string
  sshKeyPath?: string
  sshPassword?: string
}

export interface VaultSaveResult {
  success: boolean
  error?: string
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
    return { success: true }
  } catch (e: any) {
    return { success: false, error: e.message ?? 'Network error' }
  }
}
