'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

export default function RegisterPage() {
  const router    = useRouter()
  const supabase  = createClient()

  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [showPw, setShowPw]   = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [form, setForm] = useState({
    churchName:    '',
    churchAddress: '',
    fullName:      '',
    email:         '',
    password:      '',
    confirmPassword: '',
  })

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    setError('')
  }

  function validateStep1() {
    if (!form.churchName.trim()) { setError('Church name is required.'); return false }
    return true
  }

  function validateStep2() {
    if (!form.fullName.trim())   { setError('Your name is required.'); return false }
    if (!form.email.trim())      { setError('Email is required.'); return false }
    if (form.password.length < 6){ setError('Password must be at least 6 characters.'); return false }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match.'); return false }
    return true
  }

  async function handleSubmit() {
    if (!validateStep2()) return

    setLoading(true)
    setError('')

    try {
      // 1. Create the church first via service-role API
      const churchRes = await fetch('/api/admin/setup-church', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          churchName:    form.churchName.trim(),
          churchAddress: form.churchAddress.trim(),
        }),
      })
      const churchData = await churchRes.json()

      if (!churchRes.ok) {
        setError(churchData.error || 'Failed to create church.')
        setLoading(false)
        return
      }

      const churchId = churchData.churchId

      // 2. Sign up with Supabase Auth — pass church_id and name in metadata
      //    The DB trigger will auto-create the profile row
      const { error: signUpError } = await supabase.auth.signUp({
        email:    form.email.trim().toLowerCase(),
        password: form.password,
        options: {
          data: {
            full_name: form.fullName.trim(),
            church_id: churchId,
          },
        },
      })

      if (signUpError) {
        // Church was created but signup failed — delete the church
        await fetch(`/api/admin/setup-church?churchId=${churchId}`, {
          method: 'DELETE',
        })

        if (signUpError.message.toLowerCase().includes('already registered')) {
          setError('An account with this email already exists.')
        } else {
          setError(signUpError.message)
        }
        setLoading(false)
        return
      }

      // 3. Success — redirect to dashboard
      router.push('/dashboard')

    } catch (err) {
      console.error(err)
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={s.page}>
      <div style={s.card}>

        {/* Logo */}
        <div style={s.logoArea}>
          <div style={s.logoRing}>
            <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
              <path d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z" fill="rgba(245,240,232,0.9)" />
              <path d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z" fill="rgba(245,240,232,0.9)" />
              <rect x="22.5" y="9" width="3" height="30" rx="1.5" fill={color.cream} />
              <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={color.gold} />
              <rect x="25.5" y="20" width="12" height="2.5" rx="1.25" fill={color.gold} />
              <path d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z" fill={color.gold} />
            </svg>
          </div>
          <h1 style={s.title}>Create Your Church Account</h1>
          <p style={s.sub}>Set up Sunday School for your church</p>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {['Church', 'Account'].map((label, i) => {
            const num    = i + 1
            const active = step === num
            const done   = step > num
            return (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%', flexShrink: 0,
                  background: done ? color.success : active ? color.navy : color.creamDark,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {done
                    ? <Check size={14} color="#fff" strokeWidth={3} />
                    : <span style={{ fontSize: '12px', fontWeight: '700', color: active ? color.cream : color.mist }}>{num}</span>
                  }
                </div>
                <span style={{ fontSize: fontSize.sm, fontWeight: active ? '700' : '400', color: active ? color.navy : color.mist }}>
                  {label}
                </span>
                {i === 0 && (
                  <div style={{ flex: 1, height: '1px', background: done ? color.success : color.creamDark }} />
                )}
              </div>
            )
          })}
        </div>

        <div style={{ height: '1px', background: color.creamDark }} />

        {/* Step 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Church Name *">
              <input
                className="input"
                placeholder="e.g. Covenant Chapel"
                value={form.churchName}
                onChange={e => set('churchName', e.target.value)}
                onKeyDown={e => e.key === 'Enter' && validateStep1() && setStep(2)}
                autoFocus
                style={{ background: color.white }}
              />
            </Field>
            <Field label="Church Address (optional)">
              <input
                className="input"
                placeholder="e.g. 12 Broad Street, Lagos"
                value={form.churchAddress}
                onChange={e => set('churchAddress', e.target.value)}
                style={{ background: color.white }}
              />
            </Field>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={() => validateStep1() && setStep(2)}
            >
              Continue →
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Field label="Your Full Name *">
              <input
                className="input"
                placeholder="e.g. Elder Amaka Obi"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                autoFocus
                style={{ background: color.white }}
              />
            </Field>
            <Field label="Email Address *">
              <input
                className="input"
                type="email"
                placeholder="admin@church.org"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                style={{ background: color.white }}
              />
            </Field>
            <Field label="Password *">
              <PasswordInput
                value={form.password}
                onChange={v => set('password', v)}
                show={showPw}
                onToggle={() => setShowPw(p => !p)}
                placeholder="At least 6 characters"
              />
            </Field>
            <Field label="Confirm Password *">
              <PasswordInput
                value={form.confirmPassword}
                onChange={v => set('confirmPassword', v)}
                show={showConfirm}
                onToggle={() => setShowConfirm(p => !p)}
                placeholder="Repeat your password"
                onEnter={handleSubmit}
              />
            </Field>
            {error && <ErrorMsg>{error}</ErrorMsg>}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => { setStep(1); setError('') }}
                style={{ flexShrink: 0 }}
              >
                ← Back
              </button>
              <button
                className="btn btn-primary btn-full btn-lg"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </div>
          </div>
        )}

        <p style={{ fontSize: fontSize.sm, color: color.mist, textAlign: 'center' }}>
          Already have an account?{' '}
          <button
            onClick={() => router.push('/admin-login')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontWeight: '700', fontSize: fontSize.sm, fontFamily: font.body }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  )
}

// ── Small helper components ───────────────────────────────────
function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: color.mist, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function PasswordInput({ value, onChange, show, onToggle, placeholder, onEnter }) {
  return (
    <div style={{ position: 'relative' }}>
      <input
        className="input"
        type={show ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && onEnter?.()}
        style={{ background: color.white, paddingRight: '44px' }}
      />
      <button
        type="button"
        onClick={onToggle}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
      >
        {show
          ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.mist} strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color.mist} strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }
      </button>
    </div>
  )
}

function ErrorMsg({ children }) {
  return (
    <div style={{ background: color.errorBg, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: radius.sm, padding: '12px 14px' }}>
      <p style={{ fontSize: fontSize.sm, color: color.error, fontWeight: '600', margin: 0 }}>{children}</p>
    </div>
  )
}

const s = {
  page:    { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: color.cream, fontFamily: font.body },
  card:    { background: color.white, borderRadius: radius.xl, boxShadow: shadow.modal, padding: '36px 28px', width: '100%', maxWidth: '460px', display: 'flex', flexDirection: 'column', gap: '24px' },
  logoArea:{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  logoRing:{ width: '72px', height: '72px', borderRadius: '20px', background: color.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 8px 24px rgba(10,22,40,0.25)` },
  title:   { fontFamily: font.display, fontSize: fontSize.lg, color: color.navy, margin: 0, textAlign: 'center' },
  sub:     { fontSize: fontSize.sm, color: color.mist, margin: 0, textAlign: 'center' },
}