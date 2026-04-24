'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Check, X, Clock, FileText,
  Calendar, Users, DollarSign,
  ChevronRight, RefreshCw,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import StatusBadge from '@/components/class/ui/StatusBadge'
import EmptyState from '@/components/class/ui/EmptyState'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { FilterTabs } from '@/components/class/ui/FilterBar'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(str))
}

function formatTime(str) {
  if (!str) return ''
  return new Intl.DateTimeFormat('en-NG', {
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(new Date(str))
}

function formatNaira(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

// ── Reject reason modal ───────────────────────────────────────
function RejectModal({ onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('')

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(10,26,61,0.5)',
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      zIndex:         200,
      padding:        '20px',
      backdropFilter: 'blur(3px)',
      animation:      'fadeIn 0.2s ease',
    }}>
      <div style={{
        background:    color.white,
        borderRadius:  radius['2xl'],
        padding:       '28px',
        width:         '100%',
        maxWidth:      '440px',
        boxShadow:     shadow.modal,
        animation:     'scaleIn 0.2s ease',
      }}>
        <div style={{
          width:          '48px',
          height:         '48px',
          borderRadius:   radius.lg,
          background:     color.errorBg,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          marginBottom:   '16px',
        }}>
          <X size={22} color={color.error} />
        </div>

        <h3 style={{
          fontFamily:   font.heading,
          fontSize:     fontSize.lg,
          fontWeight:   '700',
          color:        color.ink,
          margin:       '0 0 6px',
        }}>
          Reject Submission
        </h3>
        <p style={{
          fontSize:   fontSize.sm,
          color:      color.inkMuted,
          margin:     '0 0 18px',
          fontFamily: font.body,
          lineHeight: 1.6,
        }}>
          Provide a reason so the class teacher knows what to correct and resubmit.
        </p>

        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Member count doesn't match — please recount and resubmit…"
          autoFocus
          style={{
            width:        '100%',
            height:       '96px',
            padding:      '12px 14px',
            fontFamily:   font.body,
            fontSize:     fontSize.base,
            color:        color.ink,
            background:   color.cream,
            border:       `1.5px solid ${color.creamBorder}`,
            borderRadius: radius.md,
            outline:      'none',
            resize:       'none',
            marginBottom: '16px',
            boxSizing:    'border-box',
            lineHeight:   1.6,
          }}
        />

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={onClose}
            disabled={loading}
            style={{
              flex:         1,
              height:       '44px',
              background:   color.cream,
              border:       `1.5px solid ${color.creamBorder}`,
              borderRadius: radius.md,
              cursor:       'pointer',
              fontSize:     fontSize.sm,
              fontWeight:   '600',
              color:        color.inkMuted,
              fontFamily:   font.body,
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={loading}
            style={{
              flex:         1,
              height:       '44px',
              background:   color.error,
              border:       'none',
              borderRadius: radius.md,
              cursor:       loading ? 'not-allowed' : 'pointer',
              fontSize:     fontSize.sm,
              fontWeight:   '700',
              color:        'white',
              fontFamily:   font.body,
              opacity:      loading ? 0.7 : 1,
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              gap:          '6px',
            }}
          >
            <X size={15} />
            {loading ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Pending submission card ───────────────────────────────────
function PendingCard({ submission, onApprove, onReject, acting }) {
  const cls     = submission.classes
  const session = submission.sessions
  const pct     = submission.record_count > 0
    ? Math.round((submission.present_count / submission.record_count) * 100)
    : 0

  return (
    <div style={{
      background:   color.white,
      borderRadius: radius.xl,
      border:       `1px solid ${color.creamBorder}`,
      boxShadow:    shadow.card,
      overflow:     'hidden',
    }}>
      {/* Pending indicator strip */}
      <div style={{
        height:     '4px',
        background: `linear-gradient(90deg, ${color.warning}, #FCD34D)`,
      }} />

      <div style={{ padding: '18px 20px' }}>
        {/* Header */}
        <div style={{
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          gap:            '12px',
          marginBottom:   '14px',
          flexWrap:       'wrap',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <p style={{
                fontFamily:   font.heading,
                fontSize:     fontSize.md,
                fontWeight:   '700',
                color:        color.ink,
                margin:       0,
                letterSpacing:'-0.01em',
              }}>
                {cls?.name || 'Unknown Class'}
              </p>
              {cls?.group_name && (
                <span style={{
                  fontSize:     fontSize['2xs'],
                  fontWeight:   '600',
                  color:        color.inkSubtle,
                  background:   color.creamDark,
                  padding:      '2px 8px',
                  borderRadius: radius.full,
                }}>
                  {cls.group_name}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: color.inkMuted }}>
              <Calendar size={13} />
              <span style={{ fontSize: fontSize.sm, fontFamily: font.body }}>
                {formatDate(session?.session_date)}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: color.inkSubtle, marginTop: '2px' }}>
              <Clock size={13} />
              <span style={{ fontSize: fontSize.xs, fontFamily: font.body }}>
                Submitted {formatTime(submission.submitted_at)}
              </span>
            </div>
          </div>

          <div style={{
            display:      'inline-flex',
            alignItems:   'center',
            gap:          '6px',
            background:   color.warningBg,
            border:       `1px solid ${color.warningBorder}`,
            borderRadius: radius.full,
            padding:      '5px 12px',
            flexShrink:   0,
          }}>
            <Clock size={12} color={color.warning} />
            <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: '#92400E', fontFamily: font.body }}>
              Awaiting Review
            </span>
          </div>
        </div>

        {/* Stats */}
        <div style={{
          display:      'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap:          '8px',
          marginBottom: '16px',
        }}>
          {[
            { icon: <Users size={14} color={color.navy} />,       label: 'Present',  value: `${submission.present_count}/${submission.record_count}`, c: color.navy     },
            { icon: <DollarSign size={14} color={color.goldDark} />, label: 'Offering', value: formatNaira(submission.total_offering),                  c: color.goldDark },
            { icon: null,                                            label: 'Attendance', value: `${pct}%`,                                              c: pct >= 75 ? color.success : pct >= 50 ? color.warning : color.error },
          ].map(s => (
            <div key={s.label} style={{
              background:   color.cream,
              borderRadius: radius.lg,
              padding:      '10px 12px',
              textAlign:    'center',
            }}>
              <p style={{
                fontFamily:   font.heading,
                fontSize:     fontSize.lg,
                fontWeight:   '800',
                color:        s.c,
                margin:       '0 0 2px',
                lineHeight:   1,
                letterSpacing:'-0.01em',
              }}>
                {s.value}
              </p>
              <p style={{
                fontSize:      fontSize['2xs'],
                fontWeight:    '600',
                color:         color.inkSubtle,
                margin:        0,
                textTransform: 'uppercase',
                letterSpacing: '0.04em',
                fontFamily:    font.body,
              }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => onReject(submission.id)}
            disabled={!!acting}
            style={{
              flex:         1,
              height:       '44px',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              gap:          '7px',
              background:   color.errorBg,
              border:       `1.5px solid ${color.errorBorder}`,
              borderRadius: radius.lg,
              cursor:       acting ? 'not-allowed' : 'pointer',
              fontSize:     fontSize.sm,
              fontWeight:   '700',
              color:        color.error,
              fontFamily:   font.body,
              transition:   'all 0.15s',
              opacity:      acting ? 0.6 : 1,
            }}
          >
            <X size={16} strokeWidth={2.5} />
            Reject
          </button>
          <button
            onClick={() => onApprove(submission.id)}
            disabled={!!acting}
            style={{
              flex:         2,
              height:       '44px',
              display:      'flex',
              alignItems:   'center',
              justifyContent:'center',
              gap:          '7px',
              background:   acting === `approve-${submission.id}`
                ? '#047857'
                : `linear-gradient(135deg, ${color.success}, #047857)`,
              border:       'none',
              borderRadius: radius.lg,
              cursor:       acting ? 'not-allowed' : 'pointer',
              fontSize:     fontSize.sm,
              fontWeight:   '700',
              color:        'white',
              fontFamily:   font.body,
              boxShadow:    '0 2px 8px rgba(5,150,105,0.3)',
              transition:   'all 0.15s',
              opacity:      acting ? 0.7 : 1,
            }}
          >
            <Check size={16} strokeWidth={2.5} />
            {acting === `approve-${submission.id}` ? 'Approving…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Reviewed card (approved / rejected) ───────────────────────
function ReviewedCard({ submission }) {
  const isApproved = submission.status === 'approved'
  const cls        = submission.classes
  const session    = submission.sessions

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          '14px',
      padding:      '14px 18px',
      background:   color.white,
      borderRadius: radius.xl,
      border:       `1px solid ${isApproved ? color.successBorder : color.errorBorder}`,
      boxShadow:    shadow.card,
      flexWrap:     'wrap',
    }}>
      {/* Icon */}
      <div style={{
        width:          '40px',
        height:         '40px',
        borderRadius:   radius.md,
        background:     isApproved ? color.successBg : color.errorBg,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        {isApproved
          ? <Check size={18} color={color.success} strokeWidth={2.5} />
          : <X     size={18} color={color.error}   strokeWidth={2.5} />
        }
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: '160px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: 0 }}>
            {cls?.name || '—'}
          </p>
          {cls?.group_name && (
            <span style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, background: color.creamDark, padding: '1px 7px', borderRadius: radius.full, fontWeight: '500' }}>
              {cls.group_name}
            </span>
          )}
        </div>
        <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
          {formatDate(session?.session_date)} · {submission.present_count}/{submission.record_count} present · {formatNaira(submission.total_offering)}
        </p>
        {!isApproved && submission.rejection_reason && (
          <p style={{ fontSize: fontSize.xs, color: color.error, margin: '4px 0 0', fontFamily: font.body, background: color.errorBg, padding: '4px 10px', borderRadius: radius.sm, display: 'inline-block' }}>
            {submission.rejection_reason}
          </p>
        )}
      </div>

      <StatusBadge status={submission.status} />
    </div>
  )
}

// ── Main approvals page ───────────────────────────────────────
export default function ApprovalsPage() {
  const [tab,         setTab]         = useState('pending')
  const [submissions, setSubmissions] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [acting,      setActing]      = useState(null)
  const [error,       setError]       = useState('')
  const [rejectingId, setRejectingId] = useState(null)

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/admin/approvals?status=${tab}`)
      const data = await res.json()
      if (res.ok) setSubmissions(data.submissions || [])
      else        setError(data.error || 'Failed to load submissions.')
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [tab])

  useEffect(() => { fetchSubmissions() }, [fetchSubmissions])

  async function handleApprove(id) {
    setActing(`approve-${id}`)
    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'approve' }),
      })
      if (res.ok) {
        setSubmissions(p => p.filter(s => s.id !== id))
      } else {
        const d = await res.json()
        setError(d.error || 'Failed to approve.')
      }
    } catch {
      setError('Connection error.')
    } finally {
      setActing(null)
    }
  }

  async function handleRejectConfirm(reason) {
    const id = rejectingId
    setRejectingId(null)
    setActing(`reject-${id}`)
    try {
      const res = await fetch(`/api/admin/approvals/${id}`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ action: 'reject', rejectionReason: reason }),
      })
      if (res.ok) {
        setSubmissions(p => p.filter(s => s.id !== id))
      } else {
        const d = await res.json()
        setError(d.error || 'Failed to reject.')
      }
    } catch {
      setError('Connection error.')
    } finally {
      setActing(null)
    }
  }

  const tabs = [
    { id: 'pending',  label: 'Pending Review' },
    { id: 'approved', label: 'Approved'        },
    { id: 'rejected', label: 'Rejected'        },
  ]

  const pendingCount = tab === 'pending' ? submissions.length : 0

  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Review and approve attendance submissions from your classes"
        action={
          <button
            onClick={fetchSubmissions}
            style={{
              display:        'flex',
              alignItems:     'center',
              gap:            '6px',
              background:     color.cream,
              border:         `1.5px solid ${color.creamBorder}`,
              borderRadius:   radius.md,
              padding:        '8px 14px',
              cursor:         'pointer',
              fontSize:       fontSize.sm,
              fontWeight:     '600',
              color:          color.inkMuted,
              fontFamily:     font.body,
              transition:     'all 0.15s',
            }}
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        }
      />

      {/* Pending count banner */}
      {tab === 'pending' && !loading && submissions.length > 0 && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          padding:      '14px 18px',
          background:   color.warningBg,
          border:       `1px solid ${color.warningBorder}`,
          borderRadius: radius.xl,
          marginBottom: '20px',
        }}>
          <div style={{
            width:          '36px',
            height:         '36px',
            borderRadius:   radius.md,
            background:     color.warning,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            flexShrink:     0,
          }}>
            <Clock size={18} color="white" />
          </div>
          <div>
            <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: '#92400E', margin: 0 }}>
              {submissions.length} submission{submissions.length > 1 ? 's' : ''} waiting for your review
            </p>
            <p style={{ fontSize: fontSize.xs, color: '#B45309', margin: '2px 0 0', fontFamily: font.body }}>
              Classes cannot see their attendance as confirmed until you approve
            </p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display:      'flex',
          gap:          '2px',
          background:   color.creamDark,
          padding:      '3px',
          borderRadius: radius.lg,
          width:        'fit-content',
          flexWrap:     'wrap',
        }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                padding:      '8px 18px',
                borderRadius: radius.md,
                border:       'none',
                cursor:       'pointer',
                fontFamily:   font.body,
                fontSize:     fontSize.sm,
                fontWeight:   tab === t.id ? '700' : '500',
                background:   tab === t.id ? color.white : 'transparent',
                color:        tab === t.id ? color.navy  : color.inkMuted,
                boxShadow:    tab === t.id ? '0 1px 4px rgba(15,37,87,0.1)' : 'none',
                transition:   'all 0.15s',
                whiteSpace:   'nowrap',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '8px',
          padding:      '12px 16px',
          background:   color.errorBg,
          border:       `1px solid ${color.errorBorder}`,
          borderRadius: radius.lg,
          marginBottom: '16px',
        }}>
          <X size={14} color={color.error} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: fontSize.sm, color: '#991B1B', fontWeight: '500', margin: 0, fontFamily: font.body }}>
            {error}
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <SkeletonList count={3} height={180} gap={12} />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={
            tab === 'pending'
              ? <Clock size={28} />
              : tab === 'approved'
              ? <Check size={28} />
              : <X size={28} />
          }
          title={
            tab === 'pending'  ? 'No pending submissions' :
            tab === 'approved' ? 'No approved submissions' :
                                 'No rejected submissions'
          }
          message={
            tab === 'pending'
              ? 'When a class submits attendance it will appear here for your review.'
              : `Submissions you ${tab} will appear here.`
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'pending' ? (
            submissions.map(s => (
              <PendingCard
                key={s.id}
                submission={s}
                onApprove={handleApprove}
                onReject={id => setRejectingId(id)}
                acting={acting}
              />
            ))
          ) : (
            submissions.map(s => (
              <ReviewedCard key={s.id} submission={s} />
            ))
          )}
        </div>
      )}

      {/* Reject modal */}
      {rejectingId && (
        <RejectModal
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectingId(null)}
          loading={!!acting}
        />
      )}
    </div>
  )
}