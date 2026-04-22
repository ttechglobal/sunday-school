'use client'

import { useState, useEffect, useCallback } from 'react'
import { Check, Clock, AlertCircle } from 'lucide-react'
import { SkeletonList } from '@/components/class/ui/LoadingSkeleton'
import EmptyState from '@/components/class/ui/EmptyState'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatNaira(amount) {
  if (!amount) return '₦0'
  if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`
  if (amount >= 1000)    return `₦${(amount / 1000).toFixed(1)}k`
  return `₦${Number(amount).toLocaleString('en-NG')}`
}

function KpiCard({ label, value, sub, valueColor }) {
  return (
    <div style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, padding: '20px' }}>
      <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.06em', color: color.mist, margin: '0 0 10px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ fontFamily: font.display, fontSize: '28px', fontWeight: '700', color: valueColor || color.navy, margin: '0 0 6px', lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>{sub}</p>}
    </div>
  )
}

function StatusChip({ status }) {
  const cfg = {
    submitted:     { label: 'Submitted',     cls: 'badge-green' },
    pending:       { label: 'Pending',       cls: 'badge-amber' },
    not_submitted: { label: 'Not Submitted', cls: 'badge-red'   },
  }[status] || { label: status, cls: 'badge-mist' }
  return <span className={`badge ${cfg.cls}`}>{cfg.label}</span>
}

export default function DashboardPage() {
  const [data, setData]           = useState(null)
  const [loading, setLoading]     = useState(true)
  const [toggling, setToggling]   = useState(false)
  const [error, setError]         = useState('')

  const fetchDashboard = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/dashboard')
      const json = await res.json()
      if (res.ok) setData(json)
      else setError(json.error || 'Failed to load dashboard.')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  async function toggleSession() {
    if (!data?.session) return
    setToggling(true)
    try {
      const res  = await fetch(`/api/admin/sessions/${data.session.id}/toggle`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ isOpen: !data.session.is_open }),
      })
      if (res.ok) await fetchDashboard()
    } finally {
      setToggling(false)
    }
  }

  const today = new Intl.DateTimeFormat('en-NG', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).format(new Date())

  const isToday = new Date().getDay() === 0 // Sunday

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
          <SkeletonList count={4} height={100} />
        </div>
        <SkeletonList count={4} height={60} />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ background: color.errorBg, borderRadius: radius.lg, padding: '20px' }}>
        <p style={{ color: color.error, margin: 0 }}>{error}</p>
      </div>
    )
  }

  const session       = data?.session
  const classes       = data?.classes || []
  const submitted     = classes.filter(c => c.status === 'submitted')
  const pending       = classes.filter(c => c.status === 'pending')
  const notSubmitted  = classes.filter(c => c.status === 'not_submitted')
  const progressPct   = classes.length > 0 ? Math.round((submitted.length / classes.length) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <h1 style={{ fontFamily: font.display, fontSize: fontSize.xl, color: color.navy, margin: '0 0 4px' }}>Dashboard</h1>
          <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>{today}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {session && (
            <>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                background: session.is_open ? color.successBg : color.errorBg,
                border: `1px solid ${session.is_open ? color.successBorder : 'rgba(220,38,38,0.2)'}`,
                padding: '6px 14px', borderRadius: radius.full,
              }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: session.is_open ? color.success : color.error }} />
                <span style={{ fontSize: fontSize.sm, fontWeight: '700', color: session.is_open ? '#15803D' : color.error }}>
                  {session.is_open ? 'Session Open' : 'Session Closed'}
                </span>
              </div>
              <button
                className={`btn btn-sm ${session.is_open ? 'btn-danger' : 'btn-primary'}`}
                onClick={toggleSession}
                disabled={toggling}
              >
                {toggling ? 'Updating…' : session.is_open ? 'Close Session' : 'Open Session'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* No session today */}
      {!session && !isToday && (
        <EmptyState
          icon="📅"
          title="No session today"
          message="Sessions are created automatically on Sundays when a class logs in. Come back on Sunday!"
        />
      )}

      {!session && isToday && (
        <div style={{ background: color.warningBg, border: `1px solid #FDE68A`, borderRadius: radius.lg, padding: '20px' }}>
          <p style={{ fontSize: fontSize.base, fontWeight: '700', color: '#92400E', margin: '0 0 4px' }}>
            Today's session hasn't started yet
          </p>
          <p style={{ fontSize: fontSize.sm, color: '#92400E', margin: 0 }}>
            A session will be created automatically when the first class logs in and submits attendance.
          </p>
        </div>
      )}

      {/* KPI cards */}
      {session && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <KpiCard label="Total Classes"   value={classes.length}       sub="in your church" />
            <KpiCard label="Submitted"       value={`${submitted.length}/${classes.length}`} sub={`${progressPct}% complete`} valueColor={color.success} />
            <KpiCard label="Total Present"   value={(data?.totalPresent || 0).toLocaleString()} sub="members church-wide" />
            <KpiCard label="Total Offering"  value={formatNaira(data?.totalOffering || 0)} sub="this Sunday" valueColor={color.gold} />
          </div>

          {/* Progress */}
          <div style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <p style={{ fontSize: fontSize.base, fontWeight: '700', color: color.navy, margin: 0 }}>Submission Progress</p>
              <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>{submitted.length} of {classes.length} classes</p>
            </div>
            <div style={{ height: '8px', background: color.creamDark, borderRadius: '99px', overflow: 'hidden', marginBottom: '14px' }}>
              <div style={{ width: `${progressPct}%`, height: '100%', background: color.navy, borderRadius: '99px', transition: 'width 0.4s ease' }} />
            </div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              {[
                { icon: <Check size={13} />, count: submitted.length,    label: 'submitted',     col: color.success },
                { icon: <Clock size={13} />, count: pending.length,      label: 'pending',       col: color.warning },
                { icon: <AlertCircle size={13} />, count: notSubmitted.length, label: 'not submitted', col: color.error },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', color: s.col }}>
                  {s.icon}
                  <span style={{ fontSize: fontSize.sm, fontWeight: '600' }}>{s.count} {s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Class list */}
          <div style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, overflow: 'hidden' }}>
            <div style={{ padding: '18px 20px', borderBottom: `1px solid ${color.creamDark}` }}>
              <p style={{ fontSize: fontSize.base, fontWeight: '700', color: color.navy, margin: 0 }}>All Classes Today</p>
            </div>
            {classes.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: color.mist }}>No class data yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {classes.map((cls, i) => (
                  <div key={cls.id} style={{
                    display: 'flex', alignItems: 'center', gap: '14px',
                    padding: '14px 20px',
                    borderBottom: i < classes.length - 1 ? `1px solid ${color.creamDark}` : 'none',
                    flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 2, minWidth: '120px' }}>
                      <p style={{ fontSize: fontSize.base, fontWeight: '600', color: color.navy, margin: '0 0 2px' }}>{cls.name}</p>
                      {cls.group_name && <span className="badge badge-mist" style={{ fontSize: '10px' }}>{cls.group_name}</span>}
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', minWidth: '60px' }}>
                      <p style={{ fontSize: fontSize.md, fontWeight: '700', color: cls.present != null ? color.navy : color.mist, margin: 0 }}>{cls.present ?? '—'}</p>
                      <p style={{ fontSize: '10px', color: color.mist, margin: 0 }}>present</p>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', minWidth: '80px' }}>
                      <p style={{ fontSize: fontSize.md, fontWeight: '700', color: cls.offering ? color.gold : color.mist, margin: 0 }}>
                        {cls.offering ? formatNaira(cls.offering) : '—'}
                      </p>
                      <p style={{ fontSize: '10px', color: color.mist, margin: 0 }}>offering</p>
                    </div>
                    <div style={{ flexShrink: 0 }}>
                      <StatusChip status={cls.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}