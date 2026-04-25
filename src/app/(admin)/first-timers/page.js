'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Search, UserCheck, Trash2, X,
  Users, Phone, Calendar,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import EmptyState from '@/components/class/ui/EmptyState'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(str))
}

function ConfirmModal({ title, message, confirmLabel, danger, onConfirm, onClose, loading }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '400px', boxShadow: shadow.modal }}>
        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 8px' }}>{title}</h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 20px', fontFamily: font.body, lineHeight: 1.6 }}>{message}</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cream btn-full" onClick={onClose} disabled={loading} style={{ fontFamily: font.body }}>Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ flex: 1, height: '44px', background: danger ? color.error : color.navy, color: 'white', border: 'none', borderRadius: radius.md, cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '700', fontFamily: font.body }}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FirstTimersPage() {
  const [firstTimers, setFirstTimers] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [search,      setSearch]      = useState('')
  const [enrolling,   setEnrolling]   = useState(null)
  const [removing,    setRemoving]    = useState(null)
  const [acting,      setActing]      = useState(false)
  const [toast,       setToast]       = useState('')

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/first-timers${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      const data = await res.json()
      if (res.ok) setFirstTimers(data.firstTimers || [])
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => {
    const t = setTimeout(() => fetchData(), 300)
    return () => clearTimeout(t)
  }, [fetchData])

  async function handleEnrol(id) {
    setActing(true)
    try {
      const res = await fetch(`/api/admin/first-timers/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enrol' }),
      })
      if (res.ok) {
        setFirstTimers(p => p.filter(f => f.id !== id))
        setEnrolling(null)
        setToast('Member enrolled successfully')
      }
    } finally { setActing(false) }
  }

  async function handleRemove(id) {
    setActing(true)
    try {
      const res = await fetch(`/api/admin/first-timers/${id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove' }),
      })
      if (res.ok) {
        setFirstTimers(p => p.filter(f => f.id !== id))
        setRemoving(null)
        setToast('First timer removed')
      }
    } finally { setActing(false) }
  }

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(''), 2500)
    return () => clearTimeout(t)
  }, [toast])

  return (
    <div>
      <PageHeader
        title="First Timers"
        subtitle="Visitors recorded during attendance — enrol them as members when ready"
      />

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px', marginBottom: '20px' }}>
        <Search size={15} color={color.inkSubtle} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="input"
          placeholder="Search by name or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '40px', background: color.white }}
        />
      </div>

      {loading ? (
        <SkeletonList count={4} height={90} />
      ) : firstTimers.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={search ? 'No results found' : 'No first timers yet'}
          message={search ? 'Try a different name or phone number.' : 'First timers added during attendance will appear here.'}
        />
      ) : (
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
          {firstTimers.map((ft, i) => {
            const initials = ft.name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'

            return (
              <div key={ft.id} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', borderBottom: i < firstTimers.length - 1 ? `1px solid ${color.creamBorder}` : 'none', flexWrap: 'wrap' }}>
                {/* Avatar */}
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', flexShrink: 0, background: color.goldLight, border: `1.5px solid rgba(201,168,76,0.3)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.heading, fontSize: '14px', fontWeight: '700', color: color.goldDark }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: '140px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: 0 }}>
                      {ft.name}
                    </p>
                    <span style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.goldDark, background: color.goldLight, padding: '2px 8px', borderRadius: radius.full }}>
                      First Timer
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    {ft.classes?.name && (
                      <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        {ft.classes.name}
                      </span>
                    )}
                    {ft.phone_number && (
                      <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Phone size={11} /> {ft.phone_number}
                      </span>
                    )}
                    <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Calendar size={11} /> {formatDate(ft.created_at)}
                    </span>
                    <span style={{ fontSize: fontSize.xs, color: color.navy, fontWeight: '600', fontFamily: font.body }}>
                      {ft.attendance_count} attendance{ft.attendance_count !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    onClick={() => setEnrolling(ft)}
                    style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '36px', padding: '0 12px', background: color.successBg, border: `1px solid ${color.successBorder}`, borderRadius: radius.md, cursor: 'pointer', fontSize: fontSize.xs, fontWeight: '700', color: color.success, fontFamily: font.body }}
                  >
                    <UserCheck size={13} /> Enrol as Member
                  </button>
                  <button
                    onClick={() => setRemoving(ft)}
                    style={{ width: '36px', height: '36px', background: color.errorBg, border: 'none', borderRadius: radius.md, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} color={color.error} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {enrolling && (
        <ConfirmModal
          title="Enrol as Member"
          message={`This will convert ${enrolling.name} from a first timer to a regular member. Their attendance history is preserved.`}
          confirmLabel="Enrol as Member"
          onConfirm={() => handleEnrol(enrolling.id)}
          onClose={() => setEnrolling(null)}
          loading={acting}
        />
      )}

      {removing && (
        <ConfirmModal
          title="Remove First Timer"
          message={`This will remove ${removing.name} from the system. Their attendance records are preserved.`}
          confirmLabel="Remove"
          danger
          onConfirm={() => handleRemove(removing.id)}
          onClose={() => setRemoving(null)}
          loading={acting}
        />
      )}

      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 300, background: color.navyDark, color: color.cream, padding: '10px 18px', borderRadius: radius.xl, boxShadow: shadow.modal, fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Check size={14} color={color.success} /> {toast}
        </div>
      )}
    </div>
  )
}