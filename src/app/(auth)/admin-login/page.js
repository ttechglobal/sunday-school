'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function BibleLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z" fill="rgba(245,240,232,0.85)" />
      <path d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z" fill="rgba(245,240,232,0.85)" />
      <rect x="22.5" y="9" width="3" height="30" rx="1.5" fill={color.cream} />
      <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={color.gold} />
      <rect x="25.5" y="20" width="12" height="2.5" rx="1.25" fill={color.gold} />
      <path d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z" fill={color.gold} />
    </svg>
  )
}

const AUTH_ERRORS = {
  'Invalid login credentials': 'Incorrect email or password.',
  'Email not confirmed':       'Please confirm your email before signing in.',
  'Too many requests':         'Too many attempts. Please wait a moment and try again.',
}

function friendlyError(msg) {
  for (const [key, val] of Object.entries(AUTH_ERRORS)) {
    if (msg?.includes(key)) return val
  }
  return msg || 'Sign in failed. Please try again.'
}

export default function AdminLoginPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const registered   = searchParams.get('registered')
  const supabase     = createClient()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    setError('')
    if (!email.trim()) { setError('Email is required.'); return }
    if (!password)     { setError('Password is required.'); return }

    setLoading(true)

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password,
    })

    if (authError) {
      setError(friendlyError(authError.message))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={s.page}>
      {/* Left panel — desktop only */}
      <div style={s.left}>
        <BibleLogo size={52} />
        <h1 style={s.leftTitle}>Sunday School</h1>
        <p style={s.leftSub}>
          Attendance and offering management for your church — simple, fast, and reliable.
        </p>
        <div style={s.features}>
          {[
            'Track attendance across all classes',
            'Record individual member offerings',
            'Follow up with absent members',
            'Generate church-wide reports',
          ].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: color.gold, flexShrink: 0 }} />
              <span style={{ fontSize: fontSize.base, color: 'rgba(245,240,232,0.75)' }}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={s.right}>
        <div style={s.card}>

          {registered && (
            <div style={{ background: color.successBg, border: `1px solid ${color.successBorder}`, borderRadius: radius.sm, padding: '12px 16px' }}>
              <p style={{ fontSize: fontSize.sm, fontWeight: '600', color: color.success, margin: 0 }}>
                ✓ Account created successfully. Sign in below.
              </p>
            </div>
          )}

          <div>
            <h2 style={{ fontFamily: font.display, fontSize: fontSize.xl, color: color.navy, margin: '0 0 4px' }}>
              Admin Sign In
            </h2>
            <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>
              Welcome back — sign in to your dashboard.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={s.field}>
              <label style={s.label}>Email Address</label>
              <input
                className="input"
                type="email"
                placeholder="admin@church.org"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoFocus
                style={{ background: color.white }}
              />
            </div>

            <div style={s.field}>
              <label style={s.label}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  style={{ background: color.white, paddingRight: '48px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(p => !p)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', padding: '4px' }}
                >
                  {showPw
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.mist} strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.mist} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div style={{ background: color.errorBg, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: radius.sm, padding: '12px 16px' }}>
              <p style={{ fontSize: fontSize.sm, color: color.error, fontWeight: '600', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          <p style={{ fontSize: fontSize.sm, color: color.mist, textAlign: 'center', margin: 0 }}>
            New church?{' '}
            <button
              onClick={() => router.push('/register')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontWeight: '700', fontSize: fontSize.sm, fontFamily: font.body }}
            >
              Create a free account →
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

const s = {
  page:      { minHeight: '100vh', display: 'flex', fontFamily: font.body },
  left:      { background: color.navy, flex: '0 0 420px', padding: '60px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '24px' },
  leftTitle: { fontFamily: font.display, fontSize: '2.25rem', color: color.cream, margin: 0 },
  leftSub:   { fontSize: fontSize.base, color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, maxWidth: '300px' },
  features:  { display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '8px' },
  right:     { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: color.cream },
  card:      { background: color.white, borderRadius: radius.xl, boxShadow: shadow.modal, padding: '40px 32px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', gap: '20px' },
  field:     { display: 'flex', flexDirection: 'column', gap: '8px' },
  label:     { fontSize: '11px', fontWeight: '700', color: color.mist, letterSpacing: '0.07em', textTransform: 'uppercase' },
}