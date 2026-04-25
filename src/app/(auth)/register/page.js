'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Loader2, Check } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function PasswordInput({ value, onChange, placeholder, id, error }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          width: '100%', height: '48px',
          padding: '0 44px 0 14px',
          fontFamily: font.body, fontSize: fontSize.base,
          color: color.ink, background: color.cream,
          border: `1.5px solid ${error ? color.error : color.creamBorder}`,
          borderRadius: radius.md, outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.15s',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = color.navy }}
        onBlur={e =>  { if (!error) e.target.style.borderColor = color.creamBorder }}
      />
      <button
        type="button"
        onClick={() => setShow(p => !p)}
        style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: color.inkSubtle, display: 'flex', padding: '4px' }}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p style={{ fontSize: fontSize.xs, color: color.error, margin: '5px 0 0', fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '4px' }}>
      <AlertCircle size={12} /> {msg}
    </p>
  )
}

const labelStyle = {
  display:       'block',
  fontSize:      fontSize.xs,
  fontWeight:    '700',
  color:         color.inkMuted,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  marginBottom:  '6px',
  fontFamily:    font.body,
}

function InputField({ label, type = 'text', value, onChange, placeholder, error, autoComplete }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{
          width: '100%', height: '48px', padding: '0 14px',
          fontFamily: font.body, fontSize: fontSize.base,
          color: color.ink, background: color.cream,
          border: `1.5px solid ${error ? color.error : color.creamBorder}`,
          borderRadius: radius.md, outline: 'none',
          boxSizing: 'border-box', transition: 'border-color 0.15s',
        }}
        onFocus={e => { if (!error) e.target.style.borderColor = color.navy }}
        onBlur={e =>  { if (!error) e.target.style.borderColor = color.creamBorder }}
      />
      <FieldError msg={error} />
    </div>
  )
}

export default function RegisterPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [form, setForm] = useState({
    churchName: '',
    fullName:   '',
    email:      '',
    password:   '',
    confirm:    '',
  })
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')
  const [success,  setSuccess]  = useState(false)

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    setErrors(p => ({ ...p, [field]: '' }))
    setApiError('')
  }

  function validate() {
    const e = {}
    if (!form.churchName.trim()) e.churchName = 'Church name is required.'
    if (!form.fullName.trim())   e.fullName   = 'Your full name is required.'
    if (!form.email.trim())      e.email      = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.'
    if (!form.password)          e.password   = 'Password is required.'
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (!form.confirm)           e.confirm    = 'Please confirm your password.'
    else if (form.password !== form.confirm) e.confirm = 'Passwords do not match.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return

    setLoading(true)
    setApiError('')

    try {
      // 1. Create church
      const churchRes  = await fetch('/api/admin/setup-church', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ churchName: form.churchName.trim() }),
      })
      const churchData = await churchRes.json()

      if (!churchRes.ok) {
        setApiError(churchData.error || 'Failed to create church. Please try again.')
        setLoading(false)
        return
      }

      // 2. Sign up
      const { error: signUpError } = await supabase.auth.signUp({
        email:    form.email.trim(),
        password: form.password,
        options:  {
          data: {
            full_name:  form.fullName.trim(),
            church_id:  churchData.churchId,
          },
        },
      })

      if (signUpError) {
        setApiError(signUpError.message)
        setLoading(false)
        return
      }

      setSuccess(true)

    } catch (err) {
      setApiError('Unexpected error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{
        minHeight: '100vh', background: color.cream,
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px',
      }}>
        <div style={{
          width: '100%', maxWidth: '400px', background: color.white,
          borderRadius: radius['2xl'], boxShadow: shadow.modal, padding: '40px 28px', textAlign: 'center',
        }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', background: color.successBg,
            border: `2px solid ${color.successBorder}`, display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 20px',
          }}>
            <Check size={28} color={color.success} strokeWidth={2.5} />
          </div>
          <h2 style={{ fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800', color: color.ink, margin: '0 0 10px' }}>
            Account Created!
          </h2>
          <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 24px', fontFamily: font.body, lineHeight: 1.6 }}>
            Check your email for a confirmation link, then sign in to access your dashboard.
          </p>
          <Link
            href="/admin-login"
            style={{
              display: 'block', width: '100%', height: '48px', lineHeight: '48px',
              background: color.navy, color: color.cream, borderRadius: radius.md,
              fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700',
              textDecoration: 'none', textAlign: 'center',
            }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{
      minHeight: '100vh', background: color.cream,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', fontFamily: font.body,
    }}>
      <div style={{
        width: '100%', maxWidth: '440px', background: color.white,
        borderRadius: radius['2xl'], boxShadow: shadow.modal, overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${color.navyDark}, ${color.navy})`,
          padding: '28px 28px 24px', textAlign: 'center',
        }}>
          <h1 style={{
            fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800',
            color: color.cream, margin: 0, letterSpacing: '-0.02em',
          }}>
            Sunday School
          </h1>
          <p style={{ fontSize: fontSize.sm, color: 'rgba(250,246,240,0.65)', margin: '4px 0 0' }}>
            Create your church account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
          <h2 style={{
            fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700',
            color: color.ink, margin: '0 0 20px', letterSpacing: '-0.01em',
          }}>
            Get started
          </h2>

          {apiError && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px',
              padding: '12px 14px', background: color.errorBg,
              border: `1px solid ${color.errorBorder}`, borderRadius: radius.md, marginBottom: '16px',
            }}>
              <AlertCircle size={15} color={color.error} style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, lineHeight: 1.5 }}>{apiError}</p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <InputField
              label="Church Name *"
              value={form.churchName}
              onChange={e => set('churchName', e.target.value)}
              placeholder="e.g. Redeemed Parish Lagos"
              error={errors.churchName}
              autoComplete="organization"
            />
            <InputField
              label="Your Full Name *"
              value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              placeholder="e.g. Pastor James Okafor"
              error={errors.fullName}
              autoComplete="name"
            />
            <InputField
              label="Email Address *"
              type="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              placeholder="admin@yourchurch.com"
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <label style={labelStyle}>Password *</label>
              <PasswordInput
                id="password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                placeholder="At least 8 characters"
                error={!!errors.password}
              />
              <FieldError msg={errors.password} />
            </div>
            <div>
              <label style={labelStyle}>Confirm Password *</label>
              <PasswordInput
                id="confirm"
                value={form.confirm}
                onChange={e => set('confirm', e.target.value)}
                placeholder="Repeat your password"
                error={!!errors.confirm}
              />
              <FieldError msg={errors.confirm} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              width: '100%', height: '48px',
              background: loading ? color.creamDark : color.navy,
              color: loading ? color.inkMuted : color.cream,
              border: 'none', borderRadius: radius.md,
              fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: '24px',
              transition: 'all 0.15s', letterSpacing: '-0.01em',
            }}
          >
            {loading
              ? <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Creating account…</>
              : 'Create Account'
            }
          </button>

          <p style={{ textAlign: 'center', fontSize: fontSize.sm, color: color.inkMuted, margin: '20px 0 0' }}>
            Already have an account?{' '}
            <Link href="/admin-login" style={{ color: color.navy, fontWeight: '700', textDecoration: 'none' }}>
              Sign in
            </Link>
          </p>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}