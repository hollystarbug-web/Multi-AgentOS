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
