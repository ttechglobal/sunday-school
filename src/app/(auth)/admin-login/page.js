'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function BibleLogo() {
  return (
    <div style={{
      width: '56px', height: '56px', borderRadius: '16px',
      background: `linear-gradient(135deg, ${color.navyDark}, ${color.navy})`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 8px 24px rgba(10,26,61,0.3)', flexShrink: 0, margin: '0 auto 14px',
    }}>
      <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
        <path d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
        <path d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
        <rect x="22.5" y="9" width="3" height="30" rx="1.5" fill={color.cream} />
        <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={color.gold} />
        <rect x="25.5" y="20" width="12" height="2.5" rx="1.25" fill={color.gold} />
        <path d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z" fill={color.gold} />
      </svg>
    </div>
  )
}

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
        autoComplete="current-password"
        style={{
          width: '100%', height: '48px',
          padding: '0 44px 0 14px',
          fontFamily: font.body, fontSize: fontSize.base,
          color: color.ink, background: color.cream,
          border: `1.5px solid ${error ? color.error : color.creamBorder}`,
          borderRadius: radius.md, outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s',
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

function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.'
  const m = msg.toLowerCase()
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('invalid email or password')) {
    return 'Incorrect email or password. Please check and try again.'
  }
  if (m.includes('email not confirmed')) {
    return 'Your email has not been confirmed. Check your inbox for a confirmation link.'
  }
  if (m.includes('too many requests')) {
    return 'Too many attempts. Please wait a few minutes before trying again.'
  }
  if (m.includes('user not found')) {
    return 'No account found with this email. Please sign up first.'
  }
  return msg
}

export default function AdminLoginPage() {
  const router   = useRouter()
  const supabase = createClient()

  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [loading,  setLoading]  = useState(false)
  const [errors,   setErrors]   = useState({})
  const [apiError, setApiError] = useState('')

  function validate() {
    const e = {}
    if (!email.trim())       e.email    = 'Email is required.'
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address.'
    if (!password)           e.password = 'Password is required.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(ev) {
    ev.preventDefault()
    if (!validate()) return
    setLoading(true)
    setApiError('')

    const { error } = await supabase.auth.signInWithPassword({
      email:    email.trim(),
      password,
    })

    if (error) {
      setApiError(friendlyError(error.message))
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div style={{
      minHeight:      '100vh',
      background:     color.cream,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px 16px',
      fontFamily:     font.body,
    }}>
      <div style={{
        width:         '100%',
        maxWidth:      '400px',
        background:    color.white,
        borderRadius:  radius['2xl'],
        boxShadow:     shadow.modal,
        overflow:      'hidden',
      }}>
        {/* Navy header strip */}
        <div style={{
          background:  `linear-gradient(135deg, ${color.navyDark}, ${color.navy})`,
          padding:     '32px 28px 28px',
          textAlign:   'center',
        }}>
          <BibleLogo />
          <h1 style={{
            fontFamily:   font.heading,
            fontSize:     fontSize.xl,
            fontWeight:   '800',
            color:        color.cream,
            margin:       0,
            letterSpacing:'-0.02em',
          }}>
            Sunday School
          </h1>
          <p style={{ fontSize: fontSize.sm, color: 'rgba(250,246,240,0.65)', margin: '4px 0 0', fontFamily: font.body }}>
            Admin Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '28px' }}>
          <h2 style={{
            fontFamily:   font.heading,
            fontSize:     fontSize.lg,
            fontWeight:   '700',
            color:        color.ink,
            margin:       '0 0 20px',
            letterSpacing:'-0.01em',
          }}>
            Sign in to your account
          </h2>

          {/* API error */}
          {apiError && (
            <div style={{
              display:      'flex',
              alignItems:   'flex-start',
              gap:          '8px',
              padding:      '12px 14px',
              background:   color.errorBg,
              border:       `1px solid ${color.errorBorder}`,
              borderRadius: radius.md,
              marginBottom: '16px',
            }}>
              <AlertCircle size={15} color={color.error} style={{ flexShrink: 0, marginTop: '1px' }} />
              <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, fontFamily: font.body, lineHeight: 1.5 }}>
                {apiError}
              </p>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email */}
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); setApiError('') }}
                placeholder="admin@yourchurch.com"
                autoComplete="email"
                style={{
                  width: '100%', height: '48px',
                  padding: '0 14px',
                  fontFamily: font.body, fontSize: fontSize.base,
                  color: color.ink, background: color.cream,
                  border: `1.5px solid ${errors.email ? color.error : color.creamBorder}`,
                  borderRadius: radius.md, outline: 'none',
                  boxSizing: 'border-box', transition: 'border-color 0.15s',
                }}
                onFocus={e => { if (!errors.email) e.target.style.borderColor = color.navy }}
                onBlur={e =>  { if (!errors.email) e.target.style.borderColor = color.creamBorder }}
              />
              <FieldError msg={errors.email} />
            </div>

            {/* Password */}
            <div>
              <label style={labelStyle}>Password</label>
              <PasswordInput
                id="password"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); setApiError('') }}
                placeholder="Your password"
                error={!!errors.password}
              />
              <FieldError msg={errors.password} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '8px',
              width:          '100%',
              height:         '48px',
              background:     loading ? color.creamDark : color.navy,
              color:          loading ? color.inkMuted : color.cream,
              border:         'none',
              borderRadius:   radius.md,
              fontFamily:     font.heading,
              fontSize:       fontSize.base,
              fontWeight:     '700',
              cursor:         loading ? 'not-allowed' : 'pointer',
              marginTop:      '24px',
              transition:     'all 0.15s',
              letterSpacing:  '-0.01em',
            }}
          >
            {loading ? (
              <><Loader2 size={18} style={{ animation: 'spin 0.8s linear infinite' }} /> Signing in…</>
            ) : (
              'Sign In'
            )}
          </button>

          <p style={{ textAlign: 'center', fontSize: fontSize.sm, color: color.inkMuted, margin: '20px 0 0', fontFamily: font.body }}>
            Don't have an account?{' '}
            <Link href="/register" style={{ color: color.navy, fontWeight: '700', textDecoration: 'none' }}>
              Sign up
            </Link>
          </p>
        </form>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
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