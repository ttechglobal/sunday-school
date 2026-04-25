'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  ArrowLeft, Calendar, Users, DollarSign,
  Clock, BookOpen, Mic, Check, X,
  Filter, FileText, ChevronRight,
} from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import StatusBadge from '@/components/class/ui/StatusBadge'
import EmptyState from '@/components/class/ui/EmptyState'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { FilterTabs, MonthYearPicker } from '@/components/class/ui/FilterBar'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(str))
}

function formatNaira(v) {
  if (!v && v !== 0) return '₦0'
  return `₦${Number(v).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

// ── Record card ───────────────────────────────────────────────
function RecordCard({ batch, onClick }) {
  const isRejected = batch.status === 'rejected'
  const isApproved = batch.status === 'approved'

  return (
    <button
      onClick={onClick}
      style={{
        display:       'flex',
        flexDirection: 'column',
        gap:           '12px',
        background:    color.white,
        borderRadius:  radius.xl,
        border:        `1.5px solid ${isApproved ? color.successBorder : isRejected ? color.errorBorder : color.creamBorder}`,
        boxShadow:     shadow.card,
        padding:       '16px 18px',
        cursor:        'pointer',
        width:         '100%',
        textAlign:     'left',
        transition:    'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = shadow.hover }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = shadow.card  }}
    >
      {/* Date + status */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
            <Calendar size={14} color={color.navy} />
            <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: 0 }}>
              {formatDate(batch.sessions?.session_date)}
            </p>
          </div>
          <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: 0, fontFamily: font.body }}>
            Submitted {new Intl.DateTimeFormat('en-NG', {
              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
            }).format(new Date(batch.submitted_at))}
          </p>
        </div>
        <StatusBadge status={batch.status} />
      </div>

      {/* Stats */}
      <div style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '16px',
        padding:     '12px 14px',
        background:  color.cream,
        borderRadius: radius.lg,
        flexWrap:    'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Users size={13} color={color.navy} />
          <span style={{ fontSize: fontSize.xs, fontWeight: '600', color: color.navy, fontFamily: font.body }}>
            {batch.present_count}/{batch.record_count} present
          </span>
        </div>
        <div style={{ width: '1px', height: '14px', background: color.creamBorder }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <DollarSign size={13} color={color.goldDark} />
          <span style={{ fontSize: fontSize.xs, fontWeight: '600', color: color.goldDark, fontFamily: font.body }}>
            {formatNaira(batch.total_offering)}
          </span>
        </div>
      </div>

      {/* Rejection reason */}
      {isRejected && batch.rejection_reason && (
        <div style={{
          display:      'flex',
          alignItems:   'flex-start',
          gap:          '8px',
          padding:      '10px 12px',
          background:   color.errorBg,
          borderRadius: radius.md,
          border:       `1px solid ${color.errorBorder}`,
        }}>
          <X size={13} color={color.error} style={{ flexShrink: 0, marginTop: '1px' }} />
          <p style={{ fontSize: fontSize.xs, color: '#991B1B', margin: 0, fontFamily: font.body, lineHeight: 1.5 }}>
            <strong>Rejected:</strong> {batch.rejection_reason}
          </p>
        </div>
      )}
    </button>
  )
}

// ── Member row in detail ──────────────────────────────────────
function MemberRow({ record, isLast }) {
  const name = record.member_type === 'visitor'
    ? record.visitor_name
    : record.members
      ? (record.members.full_name || `${record.members.first_name || ''} ${record.members.last_name || ''}`.trim())
      : '—'

  const isPresent = record.attendance === 'present'
  const isAbsent  = record.attendance === 'absent'

  return (
    <div style={{
      display:      'flex',
      alignItems:   'center',
      gap:          '12px',
      padding:      '12px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${color.creamBorder}`,
      background:   isAbsent ? 'rgba(254,242,242,0.4)' : 'transparent',
    }}>
      {/* Avatar */}
      <div style={{
        width:          '36px',
        height:         '36px',
        borderRadius:   '50%',
        flexShrink:     0,
        background:     isPresent
          ? `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`
          : isAbsent ? color.errorBg : color.creamDark,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        fontSize:       '11px',
        fontWeight:     '700',
        fontFamily:     font.heading,
        color:          isPresent ? color.cream : isAbsent ? color.error : color.inkMuted,
      }}>
        {name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'}
      </div>

      {/* Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize:     fontSize.sm,
          fontWeight:   '600',
          color:        color.ink,
          margin:       0,
          fontFamily:   font.body,
          overflow:     'hidden',
          textOverflow: 'ellipsis',
          whiteSpace:   'nowrap',
        }}>
          {name}
        </p>
        {record.member_type === 'visitor' && (
          <span style={{ fontSize: fontSize['2xs'], fontWeight: '600', color: color.goldDark }}>First Timer</span>
        )}
      </div>

      {/* Attributes */}
      {isPresent && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          {record.on_time && (
            <span style={{ fontSize: fontSize['2xs'], color: color.navy, background: 'rgba(15,37,87,0.07)', padding: '2px 7px', borderRadius: radius.full, fontWeight: '600' }}>On Time</span>
          )}
          {record.bible && (
            <span style={{ fontSize: fontSize['2xs'], color: color.navyLight, background: 'rgba(30,58,110,0.07)', padding: '2px 7px', borderRadius: radius.full, fontWeight: '600' }}>Bible</span>
          )}
          {record.memory_verse && (
            <span style={{ fontSize: fontSize['2xs'], color: '#7C3AED', background: 'rgba(124,58,237,0.07)', padding: '2px 7px', borderRadius: radius.full, fontWeight: '600' }}>Verse</span>
          )}
          {record.offering > 0 && (
            <span style={{ fontSize: fontSize['2xs'], color: color.goldDark, background: color.goldLight, padding: '2px 7px', borderRadius: radius.full, fontWeight: '600' }}>
              {formatNaira(record.offering)}
            </span>
          )}
        </div>
      )}

      {isAbsent && (
        <span style={{ fontSize: fontSize.xs, color: color.error, fontWeight: '600', fontFamily: font.body }}>Absent</span>
      )}
    </div>
  )
}

// ── Batch detail view ─────────────────────────────────────────
function RecordDetail({ batchId, onBack }) {
  const [batch,   setBatch]   = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res  = await fetch(`/api/class/records?batchId=${batchId}`)
      const data = await res.json()
      if (res.ok) { setBatch(data.batch); setRecords(data.records || []) }
      setLoading(false)
    }
    load()
  }, [batchId])

  if (loading) {
    return (
      <div style={{ padding: '20px 16px' }}>
        <SkeletonList count={4} height={70} />
      </div>
    )
  }

  if (!batch) return null

  const present  = records.filter(r => r.attendance === 'present')
  const absent   = records.filter(r => r.attendance === 'absent')
  const visitors = records.filter(r => r.member_type === 'visitor' && r.attendance === 'present')

  function Section({ title, c, items }) {
    if (!items.length) return null
    return (
      <div style={{ marginBottom: '14px' }}>
        <p style={{
          fontSize:      fontSize.xs,
          fontWeight:    '700',
          color:         c,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          margin:        '0 0 8px',
          paddingLeft:   '4px',
          fontFamily:    font.body,
        }}>
          {title}
        </p>
        <div style={{
          background:   color.white,
          borderRadius: radius.xl,
          border:       `1px solid ${color.creamBorder}`,
          overflow:     'hidden',
          boxShadow:    shadow.card,
        }}>
          {items.map((r, i) => (
            <MemberRow key={i} record={r} isLast={i === items.length - 1} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{
      maxWidth:  '560px',
      margin:    '0 auto',
      width:     '100%',
      padding:   '0 16px 100px',
    }}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '6px',
          background: 'none',
          border:     'none',
          cursor:     'pointer',
          color:      color.navy,
          fontFamily: font.body,
          fontSize:   fontSize.sm,
          fontWeight: '600',
          padding:    '16px 0 12px',
        }}
      >
        <ArrowLeft size={16} /> Back to Records
      </button>

      {/* Header card */}
      <div style={{
        background:   color.white,
        borderRadius: radius.xl,
        boxShadow:    shadow.card,
        padding:      '20px',
        marginBottom: '16px',
      }}>
        <div style={{
          display:        'flex',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
          marginBottom:   '14px',
          flexWrap:       'wrap',
          gap:            '8px',
        }}>
          <div>
            <p style={{
              fontFamily:   font.heading,
              fontSize:     fontSize.lg,
              fontWeight:   '800',
              color:        color.ink,
              margin:       '0 0 3px',
              letterSpacing:'-0.01em',
            }}>
              {formatDate(batch.sessions?.session_date)}
            </p>
            <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: 0, fontFamily: font.body }}>
              Submitted {new Intl.DateTimeFormat('en-NG', {
                day: 'numeric', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit',
              }).format(new Date(batch.submitted_at))}
            </p>
          </div>
          <StatusBadge status={batch.status} />
        </div>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { label: 'Present',  value: batch.present_count,                          c: color.success  },
            { label: 'Absent',   value: batch.record_count - batch.present_count,     c: color.error    },
            { label: 'Offering', value: formatNaira(batch.total_offering),            c: color.goldDark },
          ].map(s => (
            <div key={s.label} style={{
              background:   color.cream,
              borderRadius: radius.lg,
              padding:      '12px',
              textAlign:    'center',
            }}>
              <p style={{
                fontFamily:   font.heading,
                fontSize:     fontSize.lg,
                fontWeight:   '800',
                color:        s.c,
                margin:       '0 0 3px',
                letterSpacing:'-0.02em',
              }}>
                {s.value}
              </p>
              <p style={{
                fontSize:      fontSize['2xs'],
                fontWeight:    '700',
                color:         color.inkSubtle,
                margin:        0,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontFamily:    font.body,
              }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Rejection reason */}
        {batch.rejection_reason && (
          <div style={{
            marginTop:    '12px',
            padding:      '12px 14px',
            background:   color.errorBg,
            borderRadius: radius.md,
            border:       `1px solid ${color.errorBorder}`,
          }}>
            <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, fontFamily: font.body }}>
              <strong>Rejected:</strong> {batch.rejection_reason}
            </p>
          </div>
        )}
      </div>

      <Section title={`Present (${present.length})`}      c={color.success} items={present}  />
      <Section title={`First Timers (${visitors.length})`} c={color.gold}   items={visitors} />
      <Section title={`Absent (${absent.length})`}        c={color.error}   items={absent}   />
    </div>
  )
}

// ── Inner page — uses useSearchParams so must be inside Suspense ──
function HistoryInner() {
  const searchParams = useSearchParams()

  const [batches,     setBatches]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('all')
  const [month,       setMonth]       = useState(0)
  const [year,        setYear]        = useState(new Date().getFullYear())
  const [showFilters, setShowFilters] = useState(false)
  const [selectedId,  setSelectedId]  = useState(searchParams.get('session'))
  const [classInfo,   setClassInfo]   = useState(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (month > 0) params.set('month', month)
      if (year  > 0) params.set('year',  year)
      const [res, meRes] = await Promise.all([
        fetch(`/api/class/records?${params}`),
        fetch('/api/class/me'),
      ])
      const [data, me] = await Promise.all([res.json(), meRes.json()])
      if (res.ok)  setBatches(data.batches || [])
      if (meRes.ok) setClassInfo(me)
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  const tabs = [
    { id: 'all',      label: 'All',      count: batches.length },
    { id: 'approved', label: 'Approved', count: batches.filter(b => b.status === 'approved').length },
    { id: 'pending',  label: 'Pending',  count: batches.filter(b => b.status === 'pending').length  },
    { id: 'rejected', label: 'Rejected', count: batches.filter(b => b.status === 'rejected').length },
  ]

  const filtered = filter === 'all'
    ? batches
    : batches.filter(b => b.status === filter)

  if (selectedId) {
    return (
      <ClassShell
        className={classInfo?.className}
        churchName={classInfo?.churchName}
        isAdminView={classInfo?.isAdminView}
      >
        <RecordDetail
          batchId={selectedId}
          onBack={() => setSelectedId(null)}
        />
      </ClassShell>
    )
  }

  return (
    <ClassShell
      className={classInfo?.className}
      churchName={classInfo?.churchName}
      isAdminView={classInfo?.isAdminView}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto', width: '100%' }}>

        {/* Header */}
        <div style={{
          padding:        '20px 20px 0',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '12px',
        }}>
          <div>
            <h1 style={{
              fontFamily:   font.heading,
              fontSize:     fontSize.xl,
              fontWeight:   '800',
              color:        color.ink,
              margin:       '0 0 2px',
              letterSpacing:'-0.02em',
            }}>
              Records
            </h1>
            <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
              All attendance submissions
            </p>
          </div>
          <button
            onClick={() => setShowFilters(p => !p)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
              background:   showFilters ? color.navy : color.white,
              color:        showFilters ? color.cream : color.navy,
              border:       `1.5px solid ${showFilters ? color.navy : color.creamBorder}`,
              borderRadius: radius.lg,
              padding:      '8px 14px',
              cursor:       'pointer',
              fontSize:     fontSize.sm,
              fontWeight:   '600',
              fontFamily:   font.body,
              transition:   'all 0.15s',
            }}
          >
            <Filter size={14} /> Filter
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div style={{ padding: '14px 20px', animation: 'slideUp 0.2s ease' }}>
            <MonthYearPicker
              month={month}
              year={year}
              onMonthChange={setMonth}
              onYearChange={setYear}
            />
          </div>
        )}

        {/* Tabs */}
        <div style={{ padding: '14px 20px 0', overflowX: 'auto' }}>
          <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
        </div>

        {/* Content */}
        <div style={{
          padding:       '14px 16px 100px',
          display:       'flex',
          flexDirection: 'column',
          gap:           '10px',
        }}>
          {loading ? (
            <SkeletonList count={4} height={130} />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<FileText size={28} />}
              title="No records found"
              message={
                filter !== 'all'
                  ? `No ${filter} records for this period.`
                  : 'Submit attendance to see records here.'
              }
            />
          ) : (
            filtered.map(batch => (
              <RecordCard
                key={batch.id}
                batch={batch}
                onClick={() => setSelectedId(batch.id)}
              />
            ))
          )}
        </div>
      </div>

      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </ClassShell>
  )
}

// ── Default export — wraps in Suspense for useSearchParams ────
export default function HistoryPage() {
  return (
    <Suspense fallback={
      <div style={{ padding: '24px 16px' }}>
        <SkeletonList count={4} height={130} />
      </div>
    }>
      <HistoryInner />
    </Suspense>
  )
}