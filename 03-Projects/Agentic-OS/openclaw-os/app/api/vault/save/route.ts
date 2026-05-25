/**
 * POST /api/vault/save
 *
 * Writes content to a file on the Hetzner VPS via SSH, then runs:
 *   cd /root/OpenClaw-Wiki && git add . && git commit -m "..." && git push
 *
 * Content is base64-encoded before transmission to safely handle any
 * special characters, newlines, quotes, etc. in the markdown.
 *
 * Auth: SSH private key (read from MacBook filesystem) or password.
 */

import { NextRequest } from 'next/server'
import { Client } from 'ssh2'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { VAULT_ROOT } from '@/lib/vault'

export const runtime = 'nodejs'
export const maxDuration = 30

interface SaveRequest {
  remotePath: string
  content: string
  append: boolean
  commitMessage: string
  host: string
  sshUser: string
  sshKeyPath?: string
  sshPassword?: string
}

// Expand ~ to home directory
function expandPath(p: string): string {
  if (p.startsWith('~/')) return path.join(os.homedir(), p.slice(2))
  if (p === '~') return os.homedir()
  return p
}

// Run a single command over an open SSH connection, return stdout
function exec(conn: Client, command: string): Promise<string> {
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

async function doSave(body: SaveRequest): Promise<void> {
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
    const conn = new Client()

    conn.on('ready', async () => {
      try {
        // 1. Ensure directory exists
        await exec(conn, `mkdir -p "${remoteDir}"`)

        // 2. Write file (base64 → decode → write/append)
        //    Using printf + base64 -d for reliable multi-line content
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
  if (!remotePath || content === undefined || !host || !sshUser) {
    return Response.json(
      { error: 'Missing required fields: remotePath, content, host, sshUser' },
      { status: 400 },
    )
  }

  try {
    await doSave(body)
    return Response.json({ success: true })
  } catch (err: any) {
    console.error('[vault/save]', err?.message)
    return Response.json({ error: err?.message ?? 'SSH save failed' }, { status: 500 })
  }
}
