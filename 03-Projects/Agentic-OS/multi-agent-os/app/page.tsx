'use client'
import dynamic from 'next/dynamic'

// Disable SSR — Zustand persist reads localStorage which only exists on the client.
// Without this, Next.js hydrates a mismatched tree and hangs.
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  ssr: false,
  loading: () => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#03050f',
        color: 'rgba(6,182,212,0.8)',
        fontFamily: 'monospace',
        fontSize: 13,
        letterSpacing: '0.1em',
        gap: 10,
      }}
    >
      <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
      INITIALIZING MULTI-AGENTOS…
    </div>
  ),
})

export default function Home() {
  return <Dashboard />
}
