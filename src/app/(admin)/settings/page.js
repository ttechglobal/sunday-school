'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function Section({ title, children }) {
  return (
    <div style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, overflow: 'hidden' }}>
      <div style={{ padding: '18px 24px', borderBottom: `1px solid ${color.creamDark}` }}>
        <p style={{ fontFamily: font.display, fontSize: fontSize.md, color: color.navy, margin: 0 }}>{title}</p>
      </div>
      <div style={{ padding: '24px' }}>{children}</div>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: color.mist, letterSpacing: '0.07em', textTransform: 'uppercase' }}>{label}</label>
      {children}
    </div>
  )
}

export default function SettingsPage() {
  const supabase = createClient()

  const [church, setChurch]     = useState(null)
  const [profile, setProfile]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [saved, setSaved]       = useState(false)
  const [error, setError]       = useState('')

  const [form, setForm] = useState({
    name: '', address: '', timezone: 'Africa/Lagos',
    session_start: '06:00', session_end: '23:59',
  })

  useEffect(() => {
    async function load() {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [profileRes, churchRes] = await Promise.all([
        fetch('/api/admin/profile'),
        fetch('/api/admin/church'),
      ])
      const [profileData, churchData] = await Promise.all([
        profileRes.json(), churchRes.json(),
      ])

      if (profileData.profile) setProfile(profileData.profile)
      if (churchData.church) {
        setChurch(churchData.church)
        setForm({
          name:          churchData.church.name          || '',
          address:       churchData.church.address       || '',
          timezone:      churchData.church.timezone      || 'Africa/Lagos',
          session_start: churchData.church.session_start || '06:00',
          session_end:   churchData.church.session_end   || '23:59',
        })
      }
      setLoading(false)
    }
    load()
  }, [])

  function set(field, value) { setForm(p => ({ ...p, [field]: value })); setSaved(false) }

  async function handleSave() {
    if (!form.name.trim()) { setError('Church name is required.'); return }
    setSaving(true)
    setError('')
    try {
      const res  = await fetch('/api/admin/church', {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); setSaving(false); return }
      setChurch(data.church)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[140, 200, 100].map((h, i) => (
          <div key={i} style={{ background: color.creamDark, borderRadius: radius.lg, height: h, animation: 'shimmer 1.4s infinite' }} />
        ))}
        <style>{`@keyframes shimmer { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '680px' }}>
      <div>
        <h1 style={{ fontFamily: font.display, fontSize: fontSize.xl, color: color.navy, margin: '0 0 4px' }}>Settings</h1>
        <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>Manage your church and session settings.</p>
      </div>

      {/* My account */}
      {profile && (
        <Section title="My Account">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: color.navy, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <span style={{ fontSize: fontSize.base, fontWeight: '700', color: color.cream }}>
                {profile.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <p style={{ fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: '0 0 2px' }}>{profile.full_name}</p>
              <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>{profile.email}</p>
              <span className="badge badge-navy" style={{ marginTop: '6px', fontSize: '10px' }}>{profile.role}</span>
            </div>
          </div>
        </Section>
      )}

      {/* Church details */}
      <Section title="Church Details">
        <Field label="Church Name *">
          <input className="input" value={form.name} onChange={e => set('name', e.target.value)} style={{ background: color.cream }} />
        </Field>
        <Field label="Address">
          <input className="input" placeholder="e.g. 12 Broad Street, Lagos" value={form.address} onChange={e => set('address', e.target.value)} style={{ background: color.cream }} />
        </Field>
        <Field label="Timezone">
          <select className="input" value={form.timezone} onChange={e => set('timezone', e.target.value)} style={{ background: color.cream, appearance: 'auto' }}>
            <option value="Africa/Lagos">Africa/Lagos (WAT)</option>
            <option value="Africa/Accra">Africa/Accra (GMT)</option>
            <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
            <option value="Europe/London">Europe/London (GMT/BST)</option>
          </select>
        </Field>
      </Section>

      {/* Session window */}
      <Section title="Session Window">
        <p style={{ fontSize: fontSize.sm, color: color.mist, margin: '0 0 16px', lineHeight: 1.6 }}>
          Classes can only submit attendance during this time window on Sundays.
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Field label="Opens At">
            <input type="time" className="input" value={form.session_start} onChange={e => set('session_start', e.target.value)} style={{ background: color.cream }} />
          </Field>
          <Field label="Closes At">
            <input type="time" className="input" value={form.session_end} onChange={e => set('session_end', e.target.value)} style={{ background: color.cream }} />
          </Field>
        </div>
      </Section>

      {error && (
        <div style={{ background: color.errorBg, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: radius.md, padding: '14px 16px' }}>
          <p style={{ fontSize: fontSize.sm, color: color.error, fontWeight: '600', margin: 0 }}>{error}</p>
        </div>
      )}

      {saved && (
        <div style={{ background: color.successBg, border: `1px solid ${color.successBorder}`, borderRadius: radius.md, padding: '14px 16px' }}>
          <p style={{ fontSize: fontSize.sm, color: color.success, fontWeight: '600', margin: 0 }}>✓ Settings saved successfully.</p>
        </div>
      )}

      <button className="btn btn-primary btn-lg" onClick={handleSave} disabled={saving} style={{ alignSelf: 'flex-start', minWidth: '140px' }}>
        {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}