/**
 * Error capture — ring buffer of the last 50 errors and warnings.
 *
 * Wired up in BugReportContextProvider at the root of the app. Captures:
 *  - unhandled errors  (window.onerror)
 *  - unhandled promise rejections
 *  - React render errors  (via componentDidCatch boundary)
 *  - manual capture via captureError()
 *
 * Persisted to localStorage so errors that happened before a refresh are
 * still in the report.
 *
 * When the user clicks "Report a bug", the buffer is included in the
 * bug report payload so Holly can see the actual error trace.
 */

export interface CapturedError {
  ts: number            // epoch ms
  kind: 'error' | 'warn' | 'unhandled' | 'promise' | 'react' | 'manual'
  message: string
  source?: string       // file:line
  stack?: string
  context?: Record<string, any>
}

const BUFFER_KEY = 'openclaw-os-errors'
const MAX_ERRORS = 50

function readBuffer(): CapturedError[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(BUFFER_KEY)
    if (!raw) return []
    const arr = JSON.parse(raw)
    if (!Array.isArray(arr)) return []
    return arr
  } catch {
    return []
  }
}

function writeBuffer(buf: CapturedError[]) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(BUFFER_KEY, JSON.stringify(buf.slice(-MAX_ERRORS)))
  } catch {
    // localStorage full or unavailable — silently drop
  }
}

export function captureError(
  err: Error | string | { message: string; stack?: string },
  kind: CapturedError['kind'] = 'manual',
  context?: Record<string, any>,
) {
  const e = typeof err === 'string'
    ? { message: err }
    : 'message' in err
      ? { message: err.message, stack: (err as any).stack }
      : { message: String(err) }
  const entry: CapturedError = {
    ts: Date.now(),
    kind,
    message: e.message,
    stack: e.stack,
    source: typeof window !== 'undefined' ? window.location.href : undefined,
    context,
  }
  const buf = readBuffer()
  buf.push(entry)
  writeBuffer(buf)
  // Also log to console so devs see it
  // eslint-disable-next-line no-console
  console.error('[captureError]', entry)
}

export function getRecentErrors(): CapturedError[] {
  return readBuffer()
}

export function clearErrorBuffer() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(BUFFER_KEY)
}

/**
 * Install global error handlers. Idempotent — safe to call multiple times.
 */
export function installGlobalErrorHandlers() {
  if (typeof window === 'undefined') return
  if ((window as any).__openclawErrorHandlersInstalled) return
  ;(window as any).__openclawErrorHandlersInstalled = true

  // Uncaught errors
  window.addEventListener('error', (event) => {
    captureError(
      { message: event.message, stack: event.error?.stack },
      'unhandled',
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
    )
  })

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    const message = reason instanceof Error ? reason.message : String(reason)
    const stack = reason instanceof Error ? reason.stack : undefined
    captureError({ message, stack }, 'promise')
  })

  // Console.error — capture but don't go recursive
  const origError = console.error
  console.error = function (...args: any[]) {
    try {
      const msg = args
        .map((a) => (typeof a === 'string' ? a : a?.message || JSON.stringify(a)))
        .join(' ')
      captureError(msg, 'error')
    } catch {
      // ignore
    }
    origError.apply(console, args)
  }

  const origWarn = console.warn
  console.warn = function (...args: any[]) {
    try {
      const msg = args
        .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
        .join(' ')
      captureError(msg, 'warn')
    } catch {
      // ignore
    }
    origWarn.apply(console, args)
  }
}
