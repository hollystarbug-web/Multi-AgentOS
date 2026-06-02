'use client'
import { motion } from 'framer-motion'

export type AvatarId = 'claude' | 'hetzner' | 'mac-mini' | 'macbook' | 'user' | 'system'

interface AgentAvatarProps {
  id: AvatarId
  size?: number
  glow?: boolean
  pulse?: boolean
  status?: 'online' | 'offline' | 'busy' | 'idle'
  className?: string
}

const STATUS_COLOR: Record<string, string> = {
  online: '#10b981',
  busy:   '#f59e0b',
  idle:   '#6366f1',
  offline:'#ef4444',
}

export default function AgentAvatar({
  id, size = 40, glow = false, pulse = false, status, className = ''
}: AgentAvatarProps) {
  const AVATARS: Record<AvatarId, React.ReactNode> = {
    claude:   <ClaudeAvatar size={size} />,
    hetzner:  <HetznerAvatar size={size} />,
    'mac-mini': <MacMiniAvatar size={size} />,
    macbook:  <MacbookAvatar size={size} />,
    user:     <UserAvatar size={size} />,
    system:   <SystemAvatar size={size} />,
  }

  const glowColor: Record<AvatarId, string> = {
    claude:    'rgba(139,92,246,',
    hetzner:   'rgba(245,158,11,',
    'mac-mini':'rgba(6,182,212,',
    macbook:   'rgba(236,72,153,',
    user:      'rgba(6,182,212,',
    system:    'rgba(255,255,255,',
  }

  const gc = glowColor[id] || 'rgba(6,182,212,'

  return (
    <div
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        whileHover={glow ? { scale: 1.06 } : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        style={{
          width: size, height: size,
          borderRadius: size * 0.28,
          overflow: 'hidden',
          boxShadow: glow ? `0 0 ${size * 0.6}px ${gc}0.35), 0 0 ${size * 0.2}px ${gc}0.2)` : undefined,
        }}
      >
        {AVATARS[id]}
      </motion.div>

      {/* Status dot */}
      {status && (
        <div
          className="absolute"
          style={{
            bottom: -1, right: -1,
            width: Math.max(8, size * 0.22),
            height: Math.max(8, size * 0.22),
          }}
        >
          <div
            className={`w-full h-full rounded-full relative ${pulse && status === 'online' ? 'ring-pulse' : ''}`}
            style={{
              background: STATUS_COLOR[status],
              border: '2px solid var(--bg-deep)',
              color: STATUS_COLOR[status],
              boxShadow: `0 0 6px ${STATUS_COLOR[status]}`,
            }}
          />
        </div>
      )}
    </div>
  )
}

/* ── Claude Avatar ── deep violet gradient with constellation marks */
function ClaudeAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4c1d95"/>
          <stop offset="50%" stopColor="#7c3aed"/>
          <stop offset="100%" stopColor="#a855f7"/>
        </linearGradient>
        <linearGradient id="cg2" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c084fc"/>
          <stop offset="100%" stopColor="#818cf8"/>
        </linearGradient>
        <radialGradient id="cglow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#c084fc" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="transparent"/>
        </radialGradient>
      </defs>
      {/* Background */}
      <rect width="40" height="40" rx="11" fill="url(#cg1)"/>
      <rect width="40" height="40" rx="11" fill="url(#cglow)"/>
      {/* Subtle grid */}
      <line x1="0" y1="20" x2="40" y2="20" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      <line x1="20" y1="0" x2="20" y2="40" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5"/>
      {/* C letterform */}
      <path d="M27 14.5C25.2 13 23 12 20.5 12C15.8 12 12 15.8 12 20.5C12 25.2 15.8 29 20.5 29C23 29 25.2 28 27 26.5"
        stroke="url(#cg2)" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Sparkles */}
      <circle cx="28" cy="12" r="1.2" fill="#e9d5ff" opacity="0.9"/>
      <circle cx="31" cy="18" r="0.8" fill="#c4b5fd" opacity="0.7"/>
      <circle cx="10" cy="28" r="0.9" fill="#a78bfa" opacity="0.6"/>
      <path d="M28 9 L28.5 11 L30 11 L28.9 12.1 L29.4 14 L28 13 L26.6 14 L27.1 12.1 L26 11 L27.5 11Z"
        fill="#f3e8ff" opacity="0.85" transform="scale(0.7) translate(12,4)"/>
    </svg>
  )
}

/* ── Hetzner / Openclaw Avatar ── amber server rack with claw motif */
function HetznerAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="hg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#78350f"/>
          <stop offset="60%" stopColor="#b45309"/>
          <stop offset="100%" stopColor="#d97706"/>
        </linearGradient>
        <linearGradient id="hg2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#fbbf24"/>
          <stop offset="100%" stopColor="#f59e0b"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#hg1)"/>
      <rect width="40" height="40" rx="11" fill="rgba(251,191,36,0.05)"/>
      {/* Server units */}
      <rect x="9" y="10" width="22" height="5.5" rx="1.5" fill="rgba(0,0,0,0.35)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.8"/>
      <rect x="9" y="17.25" width="22" height="5.5" rx="1.5" fill="rgba(0,0,0,0.35)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.8"/>
      <rect x="9" y="24.5" width="22" height="5.5" rx="1.5" fill="rgba(0,0,0,0.35)" stroke="rgba(251,191,36,0.3)" strokeWidth="0.8"/>
      {/* Status LEDs */}
      <circle cx="27" cy="12.75" r="1.2" fill="#10b981" opacity="0.9"/>
      <circle cx="27" cy="20" r="1.2" fill="#10b981" opacity="0.9"/>
      <circle cx="27" cy="27.25" r="1.2" fill="#f59e0b" opacity="0.8"/>
      {/* Drive slots */}
      <rect x="11" y="11.8" width="12" height="1.8" rx="0.6" fill="rgba(251,191,36,0.15)"/>
      <rect x="11" y="19.05" width="12" height="1.8" rx="0.6" fill="rgba(251,191,36,0.15)"/>
      <rect x="11" y="26.3" width="12" height="1.8" rx="0.6" fill="rgba(251,191,36,0.15)"/>
    </svg>
  )
}

/* ── Mac Mini Avatar ── silver minimal with Apple-like aesthetic */
function MacMiniAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0c4a6e"/>
          <stop offset="50%" stopColor="#0e7490"/>
          <stop offset="100%" stopColor="#06b6d4"/>
        </linearGradient>
        <linearGradient id="mg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.2)"/>
          <stop offset="100%" stopColor="rgba(255,255,255,0.0)"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#mg1)"/>
      <rect width="40" height="40" rx="11" fill="url(#mg2)"/>
      {/* Mac Mini body */}
      <rect x="9" y="15" width="22" height="10" rx="3" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
      {/* Vent slits */}
      <rect x="13" y="17" width="1" height="6" rx="0.5" fill="rgba(255,255,255,0.2)"/>
      <rect x="15.5" y="17" width="1" height="6" rx="0.5" fill="rgba(255,255,255,0.2)"/>
      <rect x="18" y="17" width="1" height="6" rx="0.5" fill="rgba(255,255,255,0.2)"/>
      <rect x="20.5" y="17" width="1" height="6" rx="0.5" fill="rgba(255,255,255,0.2)"/>
      {/* Power LED */}
      <circle cx="28" cy="20" r="1.5" fill="#22d3ee" opacity="0.9"/>
      {/* Globe/WiFi icon above */}
      <circle cx="20" cy="10" r="3" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none"/>
      <path d="M17 10 Q20 7.5 23 10 Q20 12.5 17 10Z" fill="rgba(255,255,255,0.2)"/>
      <line x1="20" y1="7" x2="20" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8"/>
    </svg>
  )
}

/* ── MacBook (control node) Avatar ── pink/rose gradient laptop */
function MacbookAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="mbg1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#831843"/>
          <stop offset="60%" stopColor="#be185d"/>
          <stop offset="100%" stopColor="#ec4899"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#mbg1)"/>
      <rect width="40" height="40" rx="11" fill="rgba(255,255,255,0.04)"/>
      {/* Screen */}
      <rect x="10" y="10" width="20" height="14" rx="2" fill="rgba(0,0,0,0.4)" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8"/>
      {/* Screen content lines */}
      <rect x="12.5" y="13" width="10" height="1.5" rx="0.75" fill="rgba(255,255,255,0.3)"/>
      <rect x="12.5" y="16" width="15" height="1" rx="0.5" fill="rgba(255,255,255,0.15)"/>
      <rect x="12.5" y="18.5" width="12" height="1" rx="0.5" fill="rgba(255,255,255,0.15)"/>
      {/* Hinge */}
      <rect x="9" y="24" width="22" height="1.2" rx="0.6" fill="rgba(255,255,255,0.12)"/>
      {/* Base */}
      <rect x="8" y="25" width="24" height="5" rx="2" fill="rgba(0,0,0,0.3)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.8"/>
      {/* Touchpad */}
      <rect x="17" y="26.5" width="6" height="2" rx="0.8" fill="rgba(255,255,255,0.12)"/>
    </svg>
  )
}

/* ── User Avatar ── cyan gradient with "J" initial */
function UserAvatar({ size }: { size: number }) {
  const fontSize = Math.round(size * 0.42)
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="ug1" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#164e63"/>
          <stop offset="50%" stopColor="#0891b2"/>
          <stop offset="100%" stopColor="#22d3ee"/>
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="11" fill="url(#ug1)"/>
      <rect width="40" height="40" rx="11" fill="rgba(255,255,255,0.06)"/>
      <text
        x="20" y="26"
        textAnchor="middle"
        fontFamily="'Inter','SF Pro Display',system-ui,sans-serif"
        fontWeight="600"
        fontSize={fontSize}
        fill="white"
        opacity="0.95"
      >J</text>
    </svg>
  )
}

/* ── System Avatar ── neutral gray */
function SystemAvatar({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="40" height="40" rx="11" fill="rgba(255,255,255,0.07)"/>
      <rect x="12" y="12" width="16" height="16" rx="4" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" fill="none"/>
      <circle cx="20" cy="20" r="3" fill="rgba(255,255,255,0.5)"/>
    </svg>
  )
}
