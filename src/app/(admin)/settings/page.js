'use client'

import { useState, useEffect } from 'react'
import { Check, AlertCircle, Loader2 } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function Field({ label, optional, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{
          fontSize:      fontSize.xs,
          fontWeight:    '700',
          color:         color.inkMuted,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily:    font.body,
        }}>
          {label}
        </label>
        {optional && (
          <span style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, fontFamily: font.body }}>
            Optional
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position:      'fixed',
      top:           '20px',
      right:         '20px',
      zIndex:        300,
      background:    type === 'success' ? color.navyDark : color.error,
      color:         color.cream,
      padding:       '12px 20px',
      borderRadius:  radius.xl,
      boxShadow:     shadow.modal,
      display:       'flex',
      alignItems:    'center',
      gap:           '10px',
      fontSize:      fontSize.sm,
      fontWeight:    '600',
      fontFamily:    font.body,
      animation:     'slideDown 0.3s ease',
    }}>
      {type === 'success'
        ? <Check size={16} />
        : <AlertCircle size={16} />
      }
      {msg}
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <div style={{
      background:   color.white,
      borderRadius: radius.xl,
      border:       `1px solid ${color.creamBorder}`,
      overflow:     'hidden',
    }}>
      <div style={{
        padding:      '20px 24px',
        borderBottom: `1px solid ${color.creamBorder}`,
        background:   color.cream,
      }}>
        <h2 style={{
          fontFamily:   font.heading,
          fontSize:     fontSize.base,
          fontWeight:   '800',
          color:        color.ink,
          margin:       '0 0 2px',
          letterSpacing:'-0.01em',
        }}>
          {title}
        </h2>
        {subtitle && (
          <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
            {subtitle}
          </p>
        )}
      </div>
      <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {children}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [church,  setChurch]  = useState({ name: '', address: '', timezone: 'Africa/Lagos' })
  const [profile, setProfile] = useState({ fullName: '', email: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState('')
  const [toast,   setToast]   = useState(null)

  // Load data on mount — createClient only called inside useEffect (client-side only)
  useEffect(() => {
    async function load() {
      try {
        const [meRes, churchRes] = await Promise.all([
          fetch('/api/admin/me'),
          fetch('/api/admin/church'),
        ])
        const [me, ch] = await Promise.all([meRes.json(), churchRes.json()])

        if (meRes.ok) {
          setProfile({
            fullName: me.adminName  || '',
            email:    me.email      || '',
          })
        }
        if (churchRes.ok && ch.church) {
          setChurch({
            name:     ch.church.name     || '',
            address:  ch.church.address  || '',
            timezone: ch.church.timezone || 'Africa/Lagos',
          })
        }
      } catch (err) {
        console.error('[settings] load error:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function saveChurch() {
    setSaving('church')
    try {
      const res  = await fetch('/api/admin/church', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(church),
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ msg: 'Church details saved', type: 'success' })
      } else {
        setToast({ msg: data.error || 'Failed to save', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Connection error', type: 'error' })
    } finally {
      setSaving('')
    }
  }

  async function saveProfile() {
    setSaving('profile')
    try {
      // Update display name via API
      const res  = await fetch('/api/admin/profile', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ fullName: profile.fullName }),
      })
      const data = await res.json()
      if (res.ok) {
        setToast({ msg: 'Profile updated', type: 'success' })
      } else {
        setToast({ msg: data.error || 'Failed to save', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Connection error', type: 'error' })
    } finally {
      setSaving('')
    }
  }

  async function changePassword() {
    setSaving('password')
    try {
      // Use Supabase reset — send reset email
      const res  = await fetch('/api/admin/reset-password', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setToast({ msg: 'Password reset email sent', type: 'success' })
      } else {
        setToast({ msg: data.error || 'Failed', type: 'error' })
      }
    } catch {
      setToast({ msg: 'Connection error', type: 'error' })
    } finally {
      setSaving('')
    }
  }

  const inputStyle = {
    width:        '100%',
    height:       '46px',
    padding:      '0 14px',
    fontFamily:   font.body,
    fontSize:     fontSize.base,
    color:        color.ink,
    background:   color.cream,
    border:       `1.5px solid ${color.creamBorder}`,
    borderRadius: radius.md,
    outline:      'none',
    boxSizing:    'border-box',
    transition:   'border-color 0.15s',
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Settings" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[120, 100, 80].map((h, i) => (
            <div key={i} className="skeleton" style={{ height: `${h}px`, borderRadius: radius.xl }} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Manage your church and account settings"
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '680px' }}>

        {/* Church details */}
        <Section
          title="Church Details"
          subtitle="This information appears throughout the app"
        >
          <Field label="Church Name">
            <input
              style={inputStyle}
              value={church.name}
              onChange={e => setChurch(p => ({ ...p, name: e.target.value }))}
              placeholder="e.g. Redeemed Parish Lagos"
              onFocus={e => e.target.style.borderColor = color.navy}
              onBlur={e =>  e.target.style.borderColor = color.creamBorder}
            />
          </Field>

          <Field label="Address" optional>
            <input
              style={inputStyle}
              value={church.address}
              onChange={e => setChurch(p => ({ ...p, address: e.target.value }))}
              placeholder="e.g. 12 Church Street, Lagos"
              onFocus={e => e.target.style.borderColor = color.navy}
              onBlur={e =>  e.target.style.borderColor = color.creamBorder}
            />
          </Field>

          <Field label="Timezone">
            <select
              style={{ ...inputStyle, cursor: 'pointer' }}
              value={church.timezone}
              onChange={e => setChurch(p => ({ ...p, timezone: e.target.value }))}
            >
              <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
              <option value="Africa/Accra">Africa/Accra (GMT, UTC+0)</option>
              <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
              <option value="Africa/Johannesburg">Africa/Johannesburg (SAST, UTC+2)</option>
              <option value="Europe/London">Europe/London (GMT/BST)</option>
              <option value="America/New_York">America/New_York (EST/EDT)</option>
            </select>
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={saveChurch}
              disabled={saving === 'church'}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '8px',
                height:       '44px',
                padding:      '0 24px',
                background:   saving === 'church' ? color.creamDark : color.navy,
                color:        saving === 'church' ? color.inkMuted : color.cream,
                border:       'none',
                borderRadius: radius.md,
                cursor:       saving === 'church' ? 'not-allowed' : 'pointer',
                fontFamily:   font.body,
                fontSize:     fontSize.sm,
                fontWeight:   '700',
                transition:   'all 0.15s',
              }}
            >
              {saving === 'church'
                ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                : 'Save Changes'
              }
            </button>
          </div>
        </Section>

        {/* Admin profile */}
        <Section
          title="My Account"
          subtitle="Your admin profile information"
        >
          <Field label="Full Name">
            <input
              style={inputStyle}
              value={profile.fullName}
              onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))}
              placeholder="Your full name"
              onFocus={e => e.target.style.borderColor = color.navy}
              onBlur={e =>  e.target.style.borderColor = color.creamBorder}
            />
          </Field>

          <Field label="Email">
            <input
              style={{ ...inputStyle, background: color.creamDark, cursor: 'not-allowed', color: color.inkMuted }}
              value={profile.email}
              readOnly
            />
            <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: '4px 0 0', fontFamily: font.body }}>
              Email cannot be changed. Contact support if needed.
            </p>
          </Field>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={changePassword}
              disabled={!!saving}
              style={{
                height:       '44px',
                padding:      '0 20px',
                background:   color.cream,
                color:        color.navy,
                border:       `1.5px solid ${color.creamBorder}`,
                borderRadius: radius.md,
                cursor:       saving ? 'not-allowed' : 'pointer',
                fontFamily:   font.body,
                fontSize:     fontSize.sm,
                fontWeight:   '600',
              }}
            >
              Send Password Reset
            </button>
            <button
              onClick={saveProfile}
              disabled={saving === 'profile'}
              style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '8px',
                height:       '44px',
                padding:      '0 24px',
                background:   saving === 'profile' ? color.creamDark : color.navy,
                color:        saving === 'profile' ? color.inkMuted : color.cream,
                border:       'none',
                borderRadius: radius.md,
                cursor:       saving === 'profile' ? 'not-allowed' : 'pointer',
                fontFamily:   font.body,
                fontSize:     fontSize.sm,
                fontWeight:   '700',
                transition:   'all 0.15s',
              }}
            >
              {saving === 'profile'
                ? <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Saving…</>
                : 'Save Profile'
              }
            </button>
          </div>
        </Section>

        {/* Danger zone */}
        <Section title="Danger Zone" subtitle="Irreversible actions — proceed carefully">
          <div style={{
            display:      'flex',
            alignItems:   'center',
            justifyContent:'space-between',
            padding:      '14px 16px',
            background:   color.errorBg,
            borderRadius: radius.lg,
            border:       `1px solid ${color.errorBorder}`,
            flexWrap:     'wrap',
            gap:          '12px',
          }}>
            <div>
              <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: '#991B1B', margin: 0 }}>
                Delete Church Account
              </p>
              <p style={{ fontSize: fontSize.xs, color: '#DC2626', margin: '2px 0 0', fontFamily: font.body }}>
                Permanently removes all data. This cannot be undone.
              </p>
            </div>
            <button
              style={{
                height:       '38px',
                padding:      '0 16px',
                background:   color.error,
                color:        'white',
                border:       'none',
                borderRadius: radius.md,
                cursor:       'pointer',
                fontFamily:   font.body,
                fontSize:     fontSize.sm,
                fontWeight:   '700',
                flexShrink:   0,
              }}
              onClick={() => alert('Please contact support to delete your account.')}
            >
              Delete Account
            </button>
          </div>
        </Section>
      </div>

      {toast && (
        <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />
      )}

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
}