/**
 * POST /api/vault/save
 *
 * Two modes:
 *   1. SAME-HOST (default): writes directly to local disk + git commit/push.
 *      No SSH, no credentials. The dashboard and the vault are on the same
 *      VPS, so this is the common path. Auto-enabled.
 *   2. REMOTE HOST: SSHes to a remote vault host (e.g. a Mac Mini),
 *      then writes + commits. Requires sshKeyPath or sshPassword.
 *
 * Content is base64-encoded before transmission to safely handle any
 * special characters, newlines, quotes, etc. in the markdown.
 */

import { NextRequest } from 'next/server'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { exec as childExec } from 'child_process'
import { promisify } from 'util'
import { VAULT_ROOT } from '@/lib/vault'

// Use a structural type for SSHClient so we don't import the ssh2 module
// at the top level (its native .node binary crashes webpack bundling).
type SSHClient = any

const pexec = promisify(childExec)

export const runtime = 'nodejs'
export const maxDuration = 30

interface SaveRequest {
  remotePath: string
  content: string
  append: boolean
  commitMessage: string
  host?: string         // empty / 'localhost' / '127.0.0.1' = same-host (no SSH)
  sshUser?: string
  sshKeyPath?: string
  sshPassword?: string
}

const isLocalHost = (h?: string) => !h || h === 'localhost' || h === '127.0.0.1' || h === '::1'

// Expand ~ to home directory
function expandPath(p: string): string {
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2))
  if (p === '~') return os.homedir()
  return p
}

// Run a single command over an open SSH connection, return stdout
function exec(conn: SSHClient, command: string): Promise<string> {
  return new Promise((resolve, reject) => {
    conn.exec(command, (err: Error | undefined, stream: any) => {
      if (err) return reject(err)
      let out = ''
      let errOut = ''
      stream
        .on('close', (code: number) => {
          if (code === 0) resolve(out.trim())
          else reject(new Error(`[ssh] exit ${code}: ${errOut.trim() || out.trim()}`))
        })
        .on('data', (d: Buffer) => { out += d.toString() })
        .stderr.on('data', (d: Buffer) => { errOut += d.toString() })
    })
  })
}

/**
 * Same-host save: write directly to the local vault, then git commit + push.
 * No SSH, no credentials. The dashboard lives on the same VPS as the vault,
 * so this is the common path.
 */
async function doLocalSave(body: SaveRequest): Promise<void> {
  const { remotePath, content, append, commitMessage } = body
  const dir = path.posix.dirname(remotePath)
  const localDir = dir.replace(/^\/root\/OpenClaw-Wiki/, VAULT_ROOT)

  // 1. Ensure directory exists
  fs.mkdirSync(localDir, { recursive: true })

  // 2. Write or append
  if (append && fs.existsSync(remotePath)) {
    fs.appendFileSync(remotePath, content, 'utf8')
  } else {
    fs.writeFileSync(remotePath, content, 'utf8')
  }

  // 3. Git: add, commit, push (best-effort — vault save should not fail on git issues)
  try {
    await pexec(
      `cd ${VAULT_ROOT} && git add . && git -c user.email="holly@openclaw.local" -c user.name="Holly" commit -m ${JSON.stringify(commitMessage)} --allow-empty`,
      { timeout: 30_000, shell: '/bin/bash' },
    )
  } catch (e: any) {
    // Commit might fail if nothing changed — that's fine. We still wrote the file.
    if (!/nothing to commit/i.test(e?.message ?? '')) {
      console.warn('[vault/save] git commit warning:', e?.message)
    }
  }
  // Push is async and best-effort — if remote is missing it just no-ops.
  try {
    await pexec(`cd ${VAULT_ROOT} && git push origin master 2>&1 || git push origin main 2>&1 || true`, {
      timeout: 60_000,
      shell: '/bin/bash',
    })
  } catch {
    // ignore
  }
}

async function doSave(body: SaveRequest): Promise<void> {
  // Dynamic import — ssh2 ships a native .node binary that webpack chokes on.
  // We only pay the cost when the user actually configures a remote host.
  const { Client } = await import('ssh2')

  const {
    remotePath, content, append,
    commitMessage, host, sshUser,
    sshKeyPath, sshPassword,
  } = body

  // Build SSH connect config
  const connectConfig: Record<string, any> = {
    host,
    port: 22,
    username: sshUser,
    readyTimeout: 15000,
  }

  if (sshKeyPath) {
    const keyFile = expandPath(sshKeyPath)
    if (!fs.existsSync(keyFile)) {
      throw new Error(`SSH key not found at: ${keyFile}`)
    }
    connectConfig.privateKey = fs.readFileSync(keyFile)
  } else if (sshPassword) {
    connectConfig.password = sshPassword
  } else {
    // Try default key locations
    const defaults = ['~/.ssh/id_ed25519', '~/.ssh/id_rsa'].map(expandPath)
    const found = defaults.find(fs.existsSync)
    if (found) connectConfig.privateKey = fs.readFileSync(found)
    else throw new Error('No SSH key or password provided. Set one in Settings → Vault.')
  }

  // Encode content as base64 so any character is safe over exec
  const b64 = Buffer.from(content, 'utf8').toString('base64')
  const remoteDir = path.posix.dirname(remotePath)
  const op = append ? '>>' : '>'

  await new Promise<void>((resolve, reject) => {
    const conn: SSHClient = new Client()

    conn.on('ready', async () => {
      try {
        // 1. Ensure directory exists
        await exec(conn, `mkdir -p "${remoteDir}"`)

        // 2. Write file (base64 → decode → write/append)
        await exec(conn, `printf '%s' "$(echo '${b64}' | base64 -d)" ${op} "${remotePath}"`)

        // 3. Git: add, commit, push
        const gitCmd = [
          `cd ${VAULT_ROOT}`,
          `git add .`,
          `git commit -m "${commitMessage.replace(/"/g, "'")}" --allow-empty`,
          `git push`,
        ].join(' && ')

        await exec(conn, gitCmd)

        conn.end()
        resolve()
      } catch (e) {
        conn.end()
        reject(e)
      }
    })

    conn.on('error', (e: Error) => reject(e))
    conn.connect(connectConfig)
  })
}

export async function POST(req: NextRequest) {
  let body: SaveRequest
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { remotePath, content, host, sshUser } = body
  if (!remotePath || content === undefined) {
    return Response.json(
      { error: 'Missing required fields: remotePath, content' },
      { status: 400 },
    )
  }

  try {
    if (isLocalHost(host)) {
      // Same-host fast path — no SSH, no creds needed.
      await doLocalSave(body)
      return Response.json({ success: true, mode: 'local' })
    } else {
      if (!sshUser) {
        return Response.json(
          { error: 'sshUser is required for remote (non-local) host' },
          { status: 400 },
        )
      }
      await doSave(body)
      return Response.json({ success: true, mode: 'remote' })
    }
  } catch (err: any) {
    console.error('[vault/save]', err?.message)
    return Response.json({ error: err?.message ?? 'Save failed' }, { status: 500 })
  }
}
