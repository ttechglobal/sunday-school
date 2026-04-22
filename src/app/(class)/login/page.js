'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, AlertCircle } from 'lucide-react'
import BibleLogo from '@/components/class/BibleLogo'
import { color, font, radius, shadow } from '@/styles/tokens'

const MOCK_CODES = {
  'XKP739M2': { className: 'Youth A',            church: 'Covenant Chapel · Lagos' },
  'BTR412N8': { className: 'Youth B',            church: 'Covenant Chapel · Lagos' },
  'LQZ856P1': { className: "Men's Class",         church: 'Covenant Chapel · Lagos' },
  'WJC293K7': { className: "Women's Fellowship",  church: 'Covenant Chapel · Lagos' },
  'RNM571Q4': { className: 'Senior Adults',       church: 'Covenant Chapel · Lagos' },
}

export default function ClassLoginPage() {
  const router = useRouter()

  const [code, setCode]       = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake]     = useState(false)

  function handleCodeChange(e) {
    const raw = e.target.value
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .slice(0, 8)
    setCode(raw)
    setError('')
  }

  async function handleSubmit() {
    const trimmed = code.replace(/-/g, '').toUpperCase()
    if (trimmed.length < 6) {
      setError('Please enter a complete class code.')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/class/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Code not found. Check with your admin.')
        setCode('')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setLoading(false)
        return
      }

      router.push('/home')

    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  const displayCode = code.length > 4 ? code.slice(0, 4) + '-' + code.slice(4) : code
  const resolvedClass = MOCK_CODES[code]

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Logo */}
        <div style={s.logoArea}>
          <div style={s.logoRing}>
            <BibleLogo size={44} />
          </div>
          <h1 style={s.appTitle}>Sunday School</h1>
          <p style={s.appSub}>Attendance & Offering Tracker</p>
        </div>

        {/* Divider */}
        <div style={s.divider} />

        {/* Form */}
        <div style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Class Code</label>
            <div
              style={{
                ...s.codeInputWrap,
                animation: shake ? 'shake 0.4s ease' : 'none',
                borderColor: error
                  ? color.error
                  : resolvedClass
                  ? color.success
                  : color.border,
                boxShadow: resolvedClass
                  ? `0 0 0 3px rgba(22,163,74,0.12)`
                  : error
                  ? `0 0 0 3px rgba(220,38,38,0.1)`
                  : 'none',
              }}
            >
              <input
                style={s.codeInput}
                placeholder="XXXX-XXXX"
                value={displayCode}
                onChange={handleCodeChange}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                autoFocus
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            {/* Resolved class name */}
            {resolvedClass && !error && (
              <div style={s.resolvedBadge}>
                <div style={s.resolvedDot} />
                <p style={s.resolvedText}>
                  {resolvedClass.className} · {resolvedClass.church}
                </p>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={s.errorBox}>
                <AlertCircle size={14} color={color.error} style={{ flexShrink: 0 }} />
                <p style={s.errorText}>{error}</p>
              </div>
            )}

            <p style={s.hint}>Ask your Sunday School admin for your class code</p>
          </div>

          <button
            style={{
              ...s.submitBtn,
              opacity: loading || code.length < 6 ? 0.55 : 1,
              cursor: loading || code.length < 6 ? 'not-allowed' : 'pointer',
            }}
            onClick={handleSubmit}
            disabled={loading || code.length < 6}
          >
            {loading ? (
              <span>Checking…</span>
            ) : (
              <>
                <span>Enter Class</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>

        {/* Demo codes */}
        <div style={s.demoSection}>
          <p style={s.demoTitle}>Demo Codes</p>
          <div style={s.demoGrid}>
            {Object.entries(MOCK_CODES).slice(0, 4).map(([c, v]) => (
              <button
                key={c}
                onClick={() => { setCode(c); setError('') }}
                style={s.demoBtn}
              >
                <span style={s.demoBtnCode}>{c.slice(0,4)}-{c.slice(4)}</span>
                <span style={s.demoBtnName}>{v.className}</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        input::placeholder { color: ${color.mist}; opacity: 1; }
      `}</style>
    </div>
  )
}

const s = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    background: color.cream,
    fontFamily: font.body,
  },
  card: {
    background: color.white,
    borderRadius: radius.xl,
    boxShadow: shadow.modal,
    padding: '36px 28px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  logoArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  logoRing: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    background: color.navy,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: `0 8px 24px rgba(10,22,40,0.25)`,
  },
  appTitle: {
    fontFamily: font.display,
    fontSize: '26px',
    fontWeight: '700',
    color: color.navy,
    margin: 0,
    textAlign: 'center',
  },
  appSub: {
    fontSize: '13px',
    color: color.mist,
    margin: 0,
    textAlign: 'center',
  },
  divider: {
    height: '1px',
    background: color.creamDark,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '700',
    color: color.mist,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
  },
  codeInputWrap: {
    borderRadius: radius.md,
    border: `1.5px solid ${color.border}`,
    background: color.cream,
    transition: 'all 0.2s ease',
    overflow: 'hidden',
  },
  codeInput: {
    width: '100%',
    height: '56px',
    padding: '0 16px',
    fontSize: '24px',
    fontWeight: '700',
    color: color.navy,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    textAlign: 'center',
    letterSpacing: '0.15em',
    fontFamily: font.body,
  },
  resolvedBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 12px',
    background: color.successBg,
    borderRadius: radius.sm,
    border: `1px solid ${color.successBorder}`,
  },
  resolvedDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color.success,
    flexShrink: 0,
  },
  resolvedText: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#15803D',
    margin: 0,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    background: color.errorBg,
    borderRadius: radius.sm,
    border: `1px solid rgba(220,38,38,0.2)`,
  },
  errorText: {
    fontSize: '13px',
    fontWeight: '600',
    color: color.error,
    margin: 0,
  },
  hint: {
    fontSize: '12px',
    color: color.mist,
    margin: 0,
    textAlign: 'center',
  },
  submitBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    height: '52px',
    background: color.navy,
    color: color.cream,
    border: 'none',
    borderRadius: radius.md,
    fontSize: '16px',
    fontWeight: '700',
    fontFamily: font.body,
    transition: 'opacity 0.15s ease',
  },
  demoSection: {
    background: color.cream,
    borderRadius: radius.md,
    padding: '14px',
  },
  demoTitle: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.07em',
    color: color.mist,
    textAlign: 'center',
    margin: '0 0 10px',
    textTransform: 'uppercase',
  },
  demoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '6px',
  },
  demoBtn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    background: color.white,
    border: `1px solid ${color.creamDark}`,
    borderRadius: radius.sm,
    padding: '8px 10px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'border-color 0.12s ease',
  },
  demoBtnCode: {
    fontSize: '12px',
    fontWeight: '700',
    color: color.navy,
    letterSpacing: '0.08em',
    fontFamily: font.body,
  },
  demoBtnName: {
    fontSize: '11px',
    color: color.mist,
    fontFamily: font.body,
  },
}