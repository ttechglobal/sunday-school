'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

function CrossLogo({ size = 48 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 36">
      <rect x="15" y="2" width="6" height="32" rx="3" fill="var(--cream)" />
      <rect x="2" y="14" width="32" height="6" rx="3" fill="var(--gold)" />
    </svg>
  )
}

// Mock credentials — replace with Supabase auth later
const MOCK_ADMIN = {
  email:    'admin@covenant.org',
  password: 'admin123',
}

export default function AdminLoginPage() {
  const router = useRouter()

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleLogin() {
    setError('')
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 800))

    if (email !== MOCK_ADMIN.email || password !== MOCK_ADMIN.password) {
      setError('Incorrect email or password.')
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div style={styles.page}>

      {/* Left panel — navy (desktop only) */}
      <div style={styles.leftPanel}>
        <CrossLogo size={56} />
        <h1 style={styles.leftTitle}>Sunday School</h1>
        <p style={styles.leftSub}>
          Attendance & offering management for your church
        </p>
        <div style={styles.leftFeatures}>
          {[
            'Track attendance across all classes',
            'Record and tally offerings',
            'Generate printable reports',
            'Manage members & classes',
          ].map(f => (
            <div key={f} style={styles.leftFeatureRow}>
              <div style={styles.leftFeatureDot} />
              <span style={styles.leftFeatureText}>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div style={styles.rightPanel}>
        <div style={styles.formCard}>

          {/* Mobile logo */}
          <div style={styles.mobileLogo}>
            <svg width="36" height="36" viewBox="0 0 36 36">
              <rect x="15" y="2" width="6" height="32" rx="3" fill="var(--navy)" />
              <rect x="2" y="14" width="32" height="6" rx="3" fill="var(--gold)" />
            </svg>
          </div>

          <h2 style={styles.formTitle}>Admin Sign In</h2>
          <p style={styles.formSub}>Covenant Chapel · Lagos</p>

          {/* Email */}
          <div style={styles.field}>
            <label style={styles.label}>Email Address</label>
            <input
              className="input"
              type="email"
              placeholder="admin@church.org"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{ background: '#fff' }}
            />
          </div>

          {/* Password */}
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                style={{ background: '#fff', paddingRight: '44px' }}
              />
              <button
                onClick={() => setShowPw(p => !p)}
                style={styles.eyeBtn}
                type="button"
              >
                {showPw
                  ? <EyeOff size={16} color="var(--mist)" />
                  : <Eye    size={16} color="var(--mist)" />
                }
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <p style={{ fontSize: '13px', color: 'var(--error)', fontWeight: '600', margin: 0 }}>
                {error}
              </p>
            </div>
          )}

          {/* Submit */}
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleLogin}
            disabled={loading}
            style={{ marginTop: '4px' }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>

          {/* Demo hint */}
          <div style={styles.demoHint}>
            <p style={{ fontSize: '11px', color: 'var(--mist)', margin: 0, textAlign: 'center' }}>
              Demo: <strong>admin@covenant.org</strong> / <strong>admin123</strong>
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'row',
  },
  leftPanel: {
    background: 'var(--navy)',
    flex: '0 0 420px',
    padding: '60px 48px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '20px',
    // Hide on mobile
    '@media (max-width: 767px)': { display: 'none' },
  },
  leftTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '32px',
    color: 'var(--cream)',
    margin: 0,
  },
  leftSub: {
    fontSize: '15px',
    color: 'rgba(245,240,232,0.55)',
    lineHeight: 1.6,
    maxWidth: '300px',
  },
  leftFeatures: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px',
  },
  leftFeatureRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  leftFeatureDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--gold)',
    flexShrink: 0,
  },
  leftFeatureText: {
    fontSize: '14px',
    color: 'rgba(245,240,232,0.75)',
  },
  rightPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 24px',
    background: 'var(--cream)',
  },
  formCard: {
    background: '#fff',
    borderRadius: 'var(--radius-xl)',
    boxShadow: 'var(--shadow-modal)',
    padding: '40px 32px',
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  mobileLogo: {
    display: 'none',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  formTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '26px',
    color: 'var(--navy)',
    margin: 0,
  },
  formSub: {
    fontSize: '13px',
    color: 'var(--mist)',
    margin: '-8px 0 4px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--mist)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  eyeBtn: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    padding: '4px',
  },
  errorBox: {
    background: 'rgba(220,38,38,0.06)',
    border: '1px solid rgba(220,38,38,0.2)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
  },
  demoHint: {
    background: 'var(--cream)',
    borderRadius: 'var(--radius-sm)',
    padding: '10px 14px',
    marginTop: '4px',
  },
}