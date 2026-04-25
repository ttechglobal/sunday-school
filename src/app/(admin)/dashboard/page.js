'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Check, Clock, ChevronRight,
  Eye, EyeOff, Users, DollarSign,
  CalendarDays, RefreshCw, CheckCircle,
  AlertCircle, Building2,
} from 'lucide-react'
import StatusBadge from '@/components/class/ui/StatusBadge'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatNaira(v, hidden) {
  if (hidden) return '₦ ••,•••'
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(str))
}

function formatShortDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(str))
}

function formatTime(str) {
  if (!str) return ''
  return new Intl.DateTimeFormat('en-NG', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(str))
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value, c, hidden, style: extraStyle = {} }) {
  return (
    <div style={{
      background: color.white,
      borderRadius: radius.xl,
      border: `1px solid ${color.creamBorder}`,
      padding: '20px',
      ...extraStyle,
    }}>
      <div style={{
        width: '38px',
        height: '38px',
        borderRadius: radius.md,
        background: `${c}14`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px',
        color: c,
        flexShrink: 0,
      }}>
        {icon}
      </div>
      <p style={{
        fontFamily: font.heading,
        fontSize: fontSize['2xl'],
        fontWeight: '800',
        color: c || color.ink,
        margin: '0 0 4px',
        letterSpacing: '-0.02em',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',    // ← never wrap
        overflow: 'visible',   // ← never clip
        filter: hidden ? 'blur(6px)' : 'none',
        userSelect: hidden ? 'none' : 'auto',
        transition: 'filter 0.25s ease',
      }}>
        {hidden ? '••••' : value}
      </p>
      <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: 0, fontFamily: font.body, fontWeight: '500' }}>
        {label}
      </p>
    </div>
  )
}

// ── Pending card ──────────────────────────────────────────────
function PendingCard({ submission, onReview }) {
  const cls = submission.classes
  const pct = submission.record_count > 0
    ? Math.round((submission.present_count / submission.record_count) * 100)
    : 0
  const barColor = pct >= 75 ? color.success : pct >= 50 ? color.warning : color.error

  return (
    <div style={{
      background: color.white,
      borderRadius: radius.xl,
      border: `1px solid ${color.warningBorder}`,
      overflow: 'hidden',
      flex: '1',
      minWidth: '220px',
      maxWidth: '340px',
    }}>
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${color.warning}, #FCD34D)` }} />
      <div style={{ padding: '16px' }}>
        <div style={{ marginBottom: '12px' }}>
          <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 3px' }}>
            {cls?.name || '—'}
          </p>
          {cls?.group_name && (
            <span style={{ fontSize: fontSize['2xs'], fontWeight: '600', color: color.inkSubtle, background: color.creamDark, padding: '1px 8px', borderRadius: radius.full }}>
              {cls.group_name}
            </span>
          )}
          <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: '6px 0 0', fontFamily: font.body }}>
            {formatDate(submission.sessions?.session_date)} · {formatTime(submission.submitted_at)}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          <div style={{ flex: 1, background: color.cream, borderRadius: radius.md, padding: '8px 10px', textAlign: 'center' }}>
            <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '800', color: color.navy, margin: 0 }}>
              {submission.present_count}/{submission.record_count}
            </p>
            <p style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', fontFamily: font.body }}>
              Present
            </p>
          </div>
          <div style={{ flex: 1, background: color.cream, borderRadius: radius.md, padding: '8px 10px', textAlign: 'center' }}>
            <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '800', color: color.goldDark, margin: 0 }}>
              ₦{Number(submission.total_offering || 0).toLocaleString('en-NG')}
            </p>
            <p style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontWeight: '600', fontFamily: font.body }}>
              Offering
            </p>
          </div>
        </div>

        {/* Attendance bar */}
        <div style={{ marginBottom: '14px' }}>
          <div style={{ height: '4px', background: color.creamDark, borderRadius: '2px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, margin: '4px 0 0', fontFamily: font.body }}>
            {pct}% attendance rate
          </p>
        </div>

        <button
          onClick={() => onReview(submission)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            height: '40px',
            background: color.navy,
            color: color.cream,
            border: 'none',
            borderRadius: radius.md,
            fontSize: fontSize.sm,
            fontWeight: '700',
            fontFamily: font.body,
            cursor: 'pointer',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = color.navyLight}
          onMouseLeave={e => e.currentTarget.style.background = color.navy}
        >
          Review & Confirm <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Review modal ──────────────────────────────────────────────
function ReviewModal({ submission, onApprove, onReject, onClose }) {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')
  const [rejecting, setRejecting] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [acting, setActing] = useState(false)

  // Fetch on modal open immediately
  useEffect(() => {
    let cancelled = false

    async function loadRecords() {
      setLoading(true)
      setFetchError('')
      try {
        const res = await fetch(`/api/admin/records?batchId=${submission.id}`)
        const data = await res.json()

        if (cancelled) return

        if (!res.ok) {
          setFetchError(data.error || 'Failed to load records.')
          return
        }
        setRecords(data.records || [])
      } catch (err) {
        if (!cancelled) setFetchError('Connection error loading records.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRecords()
    return () => { cancelled = true }
  }, [submission.id])

  const cls = submission.classes
  const session = submission.sessions
  const present = records.filter(r => r.attendance === 'present')
  const absent = records.filter(r => r.attendance === 'absent')
  const totalOff = records.reduce((s, r) => s + (parseFloat(r.offering) || 0), 0)

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(10,26,61,0.55)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 200,
      backdropFilter: 'blur(3px)',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div style={{
        background: color.white,
        borderRadius: `${radius['2xl']} ${radius['2xl']} 0 0`,
        width: '100%',
        maxWidth: '720px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease',
        boxShadow: shadow.modal,
      }}>
        {/* Handle */}
        <div style={{ flexShrink: 0, padding: '12px 0 0', display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: color.creamBorder }} />
        </div>

        {/* Header */}
        <div style={{ padding: '14px 24px', borderBottom: `1px solid ${color.creamBorder}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <p style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '800', color: color.ink, margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                {cls?.name || '—'}
              </p>
              <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
                {formatDate(session?.session_date)} · Submitted {formatTime(submission.submitted_at)}
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ background: color.creamDark, border: 'none', borderRadius: radius.md, width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: color.inkMuted, fontSize: '18px' }}
            >
              ✕
            </button>
          </div>

          {/* Summary pills */}
          {!loading && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {[
                { label: `${present.length}/${records.length} present`, c: color.navy },
                { label: `${absent.length} absent`, c: color.error },
                { label: `₦${totalOff.toLocaleString('en-NG', { minimumFractionDigits: 2 })} offering`, c: color.goldDark },
              ].map(p => (
                <span key={p.label} style={{ fontSize: fontSize.xs, fontWeight: '700', color: p.c, background: `${p.c}12`, padding: '4px 12px', borderRadius: radius.full, fontFamily: font.body }}>
                  {p.label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Member list */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ padding: '24px' }}>
              <SkeletonList count={6} height={48} gap={8} />
            </div>
          ) : fetchError ? (
            <div style={{ padding: '32px 24px', textAlign: 'center' }}>
              <AlertCircle size={28} color={color.error} style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: fontSize.sm, color: color.error, fontFamily: font.body, margin: 0 }}>{fetchError}</p>
              <button
                onClick={() => {
                  setLoading(true)
                  fetch(`/api/admin/records?batchId=${submission.id}`)
                    .then(r => r.json())
                    .then(d => { setRecords(d.records || []); setFetchError('') })
                    .catch(() => setFetchError('Retry failed.'))
                    .finally(() => setLoading(false))
                }}
                style={{ marginTop: '12px', background: color.navy, color: color.cream, border: 'none', borderRadius: radius.md, padding: '8px 18px', cursor: 'pointer', fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600' }}
              >
                Retry
              </button>
            </div>
          ) : records.length === 0 ? (
            <div style={{ padding: '40px 24px', textAlign: 'center' }}>
              <p style={{ fontSize: fontSize.sm, color: color.inkMuted, fontFamily: font.body }}>
                No member records found for this submission.
              </p>
            </div>
          ) : (
            <>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '10px 24px', background: color.cream, borderBottom: `1px solid ${color.creamBorder}`, position: 'sticky', top: 0 }}>
                {['Member', 'Status', 'On Time', 'Bible', 'Verse', 'Offering'].map(h => (
                  <p key={h} style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, fontFamily: font.body }}>{h}</p>
                ))}
              </div>

              {records.map((r, i) => {
                const name = r.member_type === 'visitor'
                  ? (r.visitor_name || 'First Timer')
                  : r.members
                    ? `${r.members.first_name || ''} ${r.members.last_name || ''}`.trim()
                    : '—'
                const isPresent = r.attendance === 'present'

                return (
                  <div key={i} style={{
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                    gap: '8px',
                    padding: '12px 24px',
                    borderBottom: `1px solid ${color.creamBorder}`,
                    background: r.attendance === 'absent' ? 'rgba(254,242,242,0.4)' : 'transparent',
                    alignItems: 'center',
                    transition: 'background 0.1s',
                  }}>
                    {/* Name + avatar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <div style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: isPresent
                          ? `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`
                          : color.creamDark,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '700',
                        fontFamily: font.heading,
                        color: isPresent ? color.cream : color.inkMuted,
                      }}>
                        {name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'}
                      </div>
                      <span style={{
                        fontSize: fontSize.sm,
                        fontWeight: '600',
                        color: color.ink,
                        fontFamily: font.body,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {name}
                        {r.member_type === 'visitor' && (
                          <span style={{ marginLeft: '6px', fontSize: fontSize['2xs'], color: color.goldDark, fontWeight: '600' }}>
                            (First Timer)
                          </span>
                        )}
                      </span>
                    </div>

                    {/* Status */}
                    <span style={{
                      fontSize: fontSize['2xs'],
                      fontWeight: '700',
                      color: isPresent ? color.success : r.attendance === 'absent' ? color.error : color.inkSubtle,
                      background: isPresent ? color.successBg : r.attendance === 'absent' ? color.errorBg : color.creamDark,
                      padding: '3px 8px',
                      borderRadius: radius.full,
                      border: `1px solid ${isPresent ? color.successBorder : r.attendance === 'absent' ? color.errorBorder : color.creamBorder}`,
                      fontFamily: font.body,
                      whiteSpace: 'nowrap',
                    }}>
                      {isPresent ? 'Present' : r.attendance === 'absent' ? 'Absent' : 'Unmarked'}
                    </span>

                    {/* On Time / Bible / Verse */}
                    {[r.on_time, r.bible, r.memory_verse].map((v, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center' }}>
                        {v
                          ? <Check size={15} color={color.success} strokeWidth={2.5} />
                          : <span style={{ fontSize: fontSize.sm, color: color.creamBorder, fontWeight: '400' }}>—</span>
                        }
                      </div>
                    ))}

                    {/* Offering */}
                    <span style={{
                      fontSize: fontSize.sm,
                      fontWeight: '600',
                      color: r.offering > 0 ? color.goldDark : color.inkSubtle,
                      fontFamily: font.body,
                      whiteSpace: 'nowrap',
                    }}>
                      {r.offering > 0 ? `₦${Number(r.offering).toLocaleString('en-NG')}` : '—'}
                    </span>
                  </div>
                )
              })}

              {/* Totals row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr',
                gap: '8px',
                padding: '12px 24px',
                background: color.cream,
                borderTop: `2px solid ${color.creamBorder}`,
                alignItems: 'center',
              }}>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.ink, margin: 0 }}>
                  Totals
                </p>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.navy, margin: 0 }}>
                  {present.length}/{records.length}
                </p>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.navy, margin: 0 }}>
                  {records.filter(r => r.on_time).length}
                </p>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.navy, margin: 0 }}>
                  {records.filter(r => r.bible).length}
                </p>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.navy, margin: 0 }}>
                  {records.filter(r => r.memory_verse).length}
                </p>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.goldDark, margin: 0, whiteSpace: 'nowrap' }}>
                  ₦{totalOff.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div style={{ padding: '16px 24px', borderTop: `1px solid ${color.creamBorder}`, flexShrink: 0, background: color.white }}>
          {!rejecting ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setRejecting(true)}
                disabled={loading || acting}
                style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color.errorBg, border: `1.5px solid ${color.errorBorder}`, borderRadius: radius.lg, cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '700', color: color.error, fontFamily: font.body, opacity: loading ? 0.5 : 1 }}
              >
                Send Back
              </button>
              <button
                onClick={() => onApprove(submission)}
                disabled={loading || acting || !!fetchError}
                style={{
                  flex: 2,
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  background: loading || fetchError ? color.creamDark : `linear-gradient(135deg, ${color.success}, #047857)`,
                  border: 'none',
                  borderRadius: radius.lg,
                  cursor: loading || acting || fetchError ? 'not-allowed' : 'pointer',
                  fontSize: fontSize.base,
                  fontWeight: '700',
                  color: loading || fetchError ? color.inkMuted : 'white',
                  fontFamily: font.body,
                  boxShadow: loading || fetchError ? 'none' : '0 2px 8px rgba(5,150,105,0.3)',
                  opacity: acting ? 0.7 : 1,
                  transition: 'all 0.2s ease',
                }}
              >
                {acting ? (
                  <>
                    <svg style={{ animation: 'spin 0.8s linear infinite' }} width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.3)" strokeWidth="3" />
                      <path d="M12 2 A10 10 0 0 1 22 12" stroke="white" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Approving…
                  </>
                ) : loading ? (
                  'Loading records…'
                ) : (
                  <><Check size={17} strokeWidth={2.5} /> Confirm & Approve</>
                )}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Reason for sending back (optional)…"
                autoFocus
                style={{ width: '100%', height: '80px', padding: '10px 14px', fontFamily: font.body, fontSize: fontSize.sm, color: color.ink, background: color.cream, border: `1.5px solid ${color.creamBorder}`, borderRadius: radius.md, outline: 'none', resize: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setRejecting(false)} style={{ flex: 1, height: '44px', background: color.cream, border: `1.5px solid ${color.creamBorder}`, borderRadius: radius.md, cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '600', color: color.inkMuted, fontFamily: font.body }}>
                  Cancel
                </button>
                <button
                  onClick={() => onReject(submission, rejectReason)}
                  disabled={acting}
                  style={{ flex: 1, height: '44px', background: color.error, border: 'none', borderRadius: radius.md, cursor: acting ? 'not-allowed' : 'pointer', fontSize: fontSize.sm, fontWeight: '700', color: 'white', fontFamily: font.body, opacity: acting ? 0.7 : 1 }}
                >
                  {acting ? 'Sending…' : 'Send Back'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div style={{
      position: 'fixed',
      top: '72px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 300,
      background: color.navyDark,
      color: color.cream,
      padding: '12px 22px',
      borderRadius: radius.xl,
      boxShadow: shadow.modal,
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      fontSize: fontSize.sm,
      fontWeight: '600',
      fontFamily: font.body,
      whiteSpace: 'nowrap',
      animation: 'slideUp 0.3s ease',
      pointerEvents: 'none',
    }}>
      <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Check size={13} color="white" strokeWidth={3} />
      </div>
      {message}
    </div>
  )
}

// ── Activity row ──────────────────────────────────────────────
function ActivityRow({ batch, onReview, isLast }) {
  const cls        = batch.classes
  const isSubmitted = batch.status === 'pending'
  const isApproved  = batch.status === 'approved'
  const isRejected  = batch.status === 'rejected'

  function formatTime(str) {
    if (!str) return ''
    return new Intl.DateTimeFormat('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(str))
  }

  return (
    <div
      onClick={isSubmitted ? () => onReview(batch) : undefined}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '14px',
        padding:        '14px 20px',
        borderBottom:   isLast ? 'none' : `1px solid ${color.creamBorder}`,
        cursor:         isSubmitted ? 'pointer' : 'default',
        transition:     'background 0.12s',
        flexWrap:       'wrap',
      }}
      onMouseEnter={e => { if (isSubmitted) e.currentTarget.style.background = color.cream }}
      onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
    >
      {/* Class info */}
      <div style={{ flex: 1, minWidth: '140px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <p style={{ fontFamily: font.body, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: 0 }}>
            {cls?.name || '—'}
          </p>
          {cls?.group_name && (
            <span style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, background: color.creamDark, padding: '1px 8px', borderRadius: radius.full, fontWeight: '600' }}>
              {cls.group_name}
            </span>
          )}
        </div>
        {batch.submitted_at && (
          <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: 0, fontFamily: font.body }}>
            {isSubmitted ? 'Submitted' : isApproved ? 'Approved' : 'Rejected'} at {formatTime(batch.submitted_at)}
          </p>
        )}
      </div>

      {/* Stats */}
      {batch.present_count !== undefined && (
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body, whiteSpace: 'nowrap' }}>
          {batch.present_count}/{batch.record_count} present
        </p>
      )}

      {/* Status */}
      <StatusBadge status={batch.status} />

      {/* Chevron for submitted */}
      {isSubmitted && <ChevronRight size={16} color={color.inkSubtle} style={{ flexShrink: 0 }} />}
    </div>
  )
}
// ── Main page ─────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter()

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [reviewing, setReviewing] = useState(null)
  const [acting, setActing] = useState(false)
  const [toast, setToast] = useState(null)
  const [error, setError] = useState('')

  const fetchData = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/dashboard')
      const json = await res.json()
      if (res.ok) {
        setData(json)
        console.log('[dashboard] pending count:', json.pending?.length)
      } else {
        setError(json.error || 'Failed to load.')
      }
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    window.addEventListener('focus', fetchData)
    // Poll every 30 seconds as realtime fallback
    const poll = setInterval(fetchData, 30_000)
    return () => {
      window.removeEventListener('focus', fetchData)
      clearInterval(poll)
    }
  }, [fetchData])

  async function handleApprove(submission) {
    setActing(true)
    try {
      const res = await fetch(`/api/admin/approvals/${submission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      })
      const result = await res.json()
      if (res.ok) {
        setToast(`${submission.classes?.name} approved for ${formatShortDate(submission.sessions?.session_date)}`)
        setReviewing(null)
        await fetchData()
      } else {
        setError(result.error || 'Approval failed.')
      }
    } catch {
      setError('Connection error.')
    } finally {
      setActing(false)
    }
  }

  async function handleReject(submission, reason) {
    setActing(true)
    try {
      const res = await fetch(`/api/admin/approvals/${submission.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason: reason }),
      })
      if (res.ok) {
        setToast(`${submission.classes?.name} sent back`)
        setReviewing(null)
        await fetchData()
      }
    } catch {
      setError('Connection error.')
    } finally {
      setActing(false)
    }
  }

  const pending = data?.pending || []
  const approved = data?.approved || {}
  const pastSundays = data?.pastSundays || []
  const churchName = data?.churchName || data?.church?.name || ''
  const adminName = data?.adminName || ''

  // Page title
  const pageTitle = churchName || (adminName ? `Welcome, ${adminName.split(' ')[0]}` : 'Sunday School')

  return (
    <div>

      {/* Page header — church name instead of "Dashboard" */}
      <div style={{ marginBottom: '28px' }}>

        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
          {new Intl.DateTimeFormat('en-NG', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())}
        </p>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: color.errorBg, border: `1px solid ${color.errorBorder}`, borderRadius: radius.lg, marginBottom: '20px' }}>
          <AlertCircle size={14} color={color.error} />
          <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, fontFamily: font.body }}>{error}</p>
          <button onClick={fetchData} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontSize: fontSize.xs, fontWeight: '700', fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <RefreshCw size={12} /> Retry
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonList count={4} height={100} gap={16} />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

{/* ── SECTION 1: Live Sunday summary ── */}
<section>
  {/* Section label — small, above the stats */}
  <p style={{
    fontSize:      fontSize.xs,
    fontWeight:    '700',
    color:         color.inkSubtle,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin:        '0 0 12px',
    fontFamily:    font.body,
  }}>
    Today's Summary · {approved.count || 0} of {data?.totalClasses || 0} classes approved
  </p>

  {/* Stats row + eye button inline */}
  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '14px' }}>
    <div style={{ display: 'flex', gap: '12px', flex: 1, flexWrap: 'wrap' }}>
      <StatCard icon={<Users size={18} />}      label="Total Present"  value={(approved.totalPresent  || 0).toLocaleString()} c={color.success}  hidden={hidden} style={{ flex: '1', minWidth: '120px' }} />
      <StatCard icon={<Users size={18} />}      label="Total Absent"   value={(approved.totalAbsent   || 0).toLocaleString()} c={color.error}    hidden={hidden} style={{ flex: '1', minWidth: '120px' }} />
      <StatCard icon={<DollarSign size={18} />} label="Total Offering" value={formatNaira(approved.totalOffering, false)}     c={color.goldDark} hidden={hidden} style={{ flex: '2', minWidth: '180px' }} />
    </div>

    {/* Eye toggle — right of stats */}
    <button
      onClick={() => setHidden(p => !p)}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '6px',
        background:     hidden ? color.navy : color.white,
        border:         `1.5px solid ${hidden ? color.navy : color.creamBorder}`,
        borderRadius:   radius.md,
        padding:        '10px 14px',
        cursor:         'pointer',
        transition:     'all 0.2s ease',
        flexShrink:     0,
        height:         'fit-content',
        alignSelf:      'flex-start',
        marginTop:      '0',
      }}
    >
      {hidden ? <EyeOff size={15} color={color.cream} /> : <Eye size={15} color={color.inkMuted} />}
      <span style={{ fontSize: fontSize.xs, fontWeight: '600', color: hidden ? color.cream : color.inkMuted, fontFamily: font.body }}>
        {hidden ? 'Show' : 'Hide'}
      </span>
    </button>
  </div>

  {/* Progress bar */}
  {data?.totalClasses > 0 && (
    <div>
      <div style={{ height: '6px', background: color.creamDark, borderRadius: '3px', overflow: 'hidden' }}>
        <div style={{
          height:     '100%',
          width:      `${Math.round(((approved.count || 0) / data.totalClasses) * 100)}%`,
          background: `linear-gradient(90deg, ${color.success}, #047857)`,
          borderRadius:'3px',
          transition: 'width 0.5s ease',
        }} />
      </div>
    </div>
  )}
</section>
          {/* ── SECTION 2: Pending approvals (SECOND) ── */}
          <section>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '800', color: color.ink, margin: '0 0 3px', letterSpacing: '-0.01em' }}>
                  Pending Approvals
                  {pending.length > 0 && (
                    <span style={{ marginLeft: '10px', fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '700', color: color.warning, background: color.warningBg, padding: '2px 10px', borderRadius: radius.full }}>
                      {pending.length}
                    </span>
                  )}
                </h2>
                <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
                  {pending.length > 0
                    ? `${pending.length} submission${pending.length > 1 ? 's' : ''} waiting for review`
                    : 'All submissions reviewed'}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                {pending.length > 3 && (
                  <button
                    onClick={() => router.push('/approvals')}
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '700', padding: '4px 0' }}
                  >
                    View all {pending.length} <ChevronRight size={14} />
                  </button>
                )}
                <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: color.cream, border: `1.5px solid ${color.creamBorder}`, borderRadius: radius.md, padding: '6px 12px', cursor: 'pointer', fontSize: fontSize.xs, fontWeight: '600', color: color.inkMuted, fontFamily: font.body }}>
                  <RefreshCw size={12} /> Refresh
                </button>
              </div>
            </div>

            {pending.length === 0 ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '18px 20px', background: color.successBg, border: `1px solid ${color.successBorder}`, borderRadius: radius.xl }}>
                <div style={{ width: '40px', height: '40px', borderRadius: radius.md, background: color.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <CheckCircle size={20} color="white" />
                </div>
                <div>
                  <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: '#065F46', margin: 0 }}>
                    All submissions reviewed
                  </p>
                  <p style={{ fontSize: fontSize.xs, color: '#047857', margin: '2px 0 0', fontFamily: font.body }}>
                    No pending approvals right now
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                {pending.slice(0, 3).map(s => (
                  <PendingCard key={s.id} submission={s} onReview={sub => setReviewing(sub)} />
                ))}
              </div>
            )}
          </section>

         {/* ── SECTION 3: Today's Activity Feed ── */}
<section>
  <h2 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '800', color: color.ink, margin: '0 0 4px', letterSpacing: '-0.01em' }}>
    Today's Activity
  </h2>
  <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 14px', fontFamily: font.body }}>
    Live status of all classes for today
  </p>

  {(() => {
    // Build activity list: submitted+rejected first (need action), then approved, then classes with no submission (pending)
    const submittedIds = new Set(pending.map(b => b.class_id))
    const approvedIds  = new Set((data?.approvedBatches || []).map(b => b.class_id))

    // pending = submitted, not yet reviewed
    const needsAction = pending // already sorted by submitted_at desc
    const approved    = (data?.approvedBatches || [])

    if (!data?.totalClasses || data.totalClasses === 0) {
      return (
        <div style={{ padding: '32px 20px', textAlign: 'center', background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}` }}>
          <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
            No active session today. Activity will appear here once classes begin submitting.
          </p>
        </div>
      )
    }

    const allActivity = [
      ...needsAction.map(b => ({ ...b, _sort: 0 })),
      ...approved.map(b => ({ ...b, _sort: 1 })),
    ].sort((a, b) => a._sort - b._sort)

    if (allActivity.length === 0) {
      return (
        <div style={{ padding: '32px 20px', textAlign: 'center', background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}` }}>
          <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
            No submissions yet today. Approved records will appear here as classes submit.
          </p>
        </div>
      )
    }

    return (
      <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
        {allActivity.map((batch, i) => (
          <ActivityRow
            key={batch.id}
            batch={batch}
            onReview={sub => setReviewing(sub)}
            isLast={i === allActivity.length - 1}
          />
        ))}
      </div>
    )
  })()}
</section>

        </div>
      )}

      {reviewing && (
        <ReviewModal
          submission={reviewing}
          onApprove={handleApprove}
          onReject={handleReject}
          onClose={() => setReviewing(null)}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <style>{`
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  )
}