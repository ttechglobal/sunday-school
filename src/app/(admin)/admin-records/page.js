'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ArrowLeft, Calendar, Users, DollarSign,
  Filter, FileText, Check, X,
  ChevronRight, Clock,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import StatusBadge from '@/components/class/ui/StatusBadge'
import EmptyState from '@/components/class/ui/EmptyState'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { FilterTabs, SearchInput, MonthYearPicker } from '@/components/class/ui/FilterBar'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(str))
}
function formatNaira(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}
function formatTime(str) {
  if (!str) return ''
  return new Intl.DateTimeFormat('en-NG', { hour: '2-digit', minute: '2-digit', hour12: true }).format(new Date(str))
}

// ── Summary stat card ─────────────────────────────────────────
function SummaryCard({ label, value, c }) {
  return (
    <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '16px 20px', flex: 1, minWidth: '130px' }}>
      <p style={{ fontFamily: font.heading, fontSize: fontSize['2xl'], fontWeight: '800', color: c || color.ink, margin: '0 0 4px', lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </p>
      <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: 0, fontFamily: font.body, fontWeight: '500' }}>
        {label}
      </p>
    </div>
  )
}

// ── Batch list row ────────────────────────────────────────────
function BatchRow({ batch, onClick, isLast }) {
  const pct = batch.record_count > 0
    ? Math.round((batch.present_count / batch.record_count) * 100)
    : 0
  const barColor = pct >= 75 ? color.success : pct >= 50 ? color.warning : color.error

  return (
    <button
      onClick={onClick}
      style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '14px',
        padding:     '16px 20px',
        background:  'transparent',
        border:      'none',
        borderBottom: isLast ? 'none' : `1px solid ${color.creamBorder}`,
        cursor:      'pointer',
        width:       '100%',
        textAlign:   'left',
        transition:  'background 0.12s ease',
        flexWrap:    'wrap',
      }}
      onMouseEnter={e => e.currentTarget.style.background = color.cream}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {/* Class + date */}
      <div style={{ flex: '2', minWidth: '140px' }}>
        <p style={{ fontFamily: font.body, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 3px' }}>
          {batch.classes?.name || '—'}
        </p>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
          {batch.classes?.group_name && (
            <span style={{ fontSize: fontSize['2xs'], fontWeight: '600', color: color.inkSubtle, background: color.creamDark, padding: '1px 7px', borderRadius: radius.full }}>
              {batch.classes.group_name}
            </span>
          )}
          <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body }}>
            {formatDate(batch.sessions?.session_date)}
          </span>
        </div>
      </div>

      {/* Present + bar */}
      <div style={{ flex: 1, minWidth: '80px' }}>
        <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: '0 0 4px' }}>
          {batch.present_count}/{batch.record_count}
        </p>
        <div style={{ height: '4px', background: color.creamDark, borderRadius: '2px', overflow: 'hidden', width: '60px' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: barColor, borderRadius: '2px', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Offering */}
      <div style={{ flex: 1, minWidth: '80px' }}>
        <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.goldDark, margin: 0 }}>
          {formatNaira(batch.total_offering)}
        </p>
      </div>

      {/* Time */}
      <div style={{ minWidth: '70px' }}>
        <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: 0, fontFamily: font.body }}>
          {formatTime(batch.submitted_at)}
        </p>
      </div>

      <StatusBadge status={batch.status} />
      <ChevronRight size={16} color={color.inkSubtle} style={{ flexShrink: 0 }} />
    </button>
  )
}

// ── Reject modal ──────────────────────────────────────────────
function RejectModal({ onConfirm, onClose, loading }) {
  const [reason, setReason] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(2px)', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '440px', boxShadow: shadow.modal, animation: 'scaleIn 0.2s ease' }}>
        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 6px' }}>
          Reject Submission
        </h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 16px', fontFamily: font.body }}>
          Give a reason so the class teacher knows what to correct.
        </p>
        <textarea
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="e.g. Attendance numbers don't match expected count…"
          autoFocus
          style={{ width: '100%', height: '90px', padding: '12px 14px', fontFamily: font.body, fontSize: fontSize.base, color: color.ink, background: color.cream, border: `1.5px solid ${color.creamBorder}`, borderRadius: radius.md, outline: 'none', resize: 'none', marginBottom: '16px', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cream btn-full" onClick={onClose} disabled={loading} style={{ fontFamily: font.body }}>Cancel</button>
          <button className="btn btn-danger btn-full btn-lg" onClick={() => onConfirm(reason)} disabled={loading} style={{ fontFamily: font.body }}>
            {loading ? 'Rejecting…' : 'Confirm Rejection'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Member row in detail ──────────────────────────────────────
function DetailMemberRow({ record, index, total }) {
  const name = record.member_type === 'visitor'
    ? record.visitor_name
    : record.members ? `${record.members.first_name} ${record.members.last_name}` : '—'
  const isPresent = record.attendance === 'present'

  return (
    <div style={{
      display:              'grid',
      gridTemplateColumns:  '2fr 1fr 1fr 1fr 1fr 1fr',
      gap:                  '8px',
      padding:              '12px 20px',
      borderBottom:         index < total - 1 ? `1px solid ${color.creamBorder}` : 'none',
      alignItems:           'center',
      background:           record.attendance === 'absent' ? 'rgba(254,242,242,0.4)' : 'transparent',
    }}>
      {/* Name + avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
        <div style={{
          width:          '30px',
          height:         '30px',
          borderRadius:   '50%',
          flexShrink:     0,
          background:     isPresent ? `linear-gradient(135deg, ${color.navy}, ${color.navyLight})` : color.creamDark,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontSize:       '10px',
          fontWeight:     '700',
          color:          isPresent ? color.cream : color.inkMuted,
          fontFamily:     font.heading,
        }}>
          {name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontSize: fontSize.sm, fontWeight: '600', color: color.ink, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: font.body }}>
            {name}
          </p>
          {record.member_type === 'visitor' && (
            <span style={{ fontSize: fontSize['2xs'], color: color.goldDark, fontWeight: '600' }}>First Timer</span>
          )}
        </div>
      </div>

      {/* Status */}
      <StatusBadge
        status={record.attendance === 'present' ? 'approved' : record.attendance === 'absent' ? 'rejected' : 'pending'}
        label={record.attendance === 'present' ? 'Present' : record.attendance === 'absent' ? 'Absent' : 'Unmarked'}
        size="sm"
      />

      {/* Attributes */}
      {[record.on_time, record.bible, record.memory_verse].map((val, j) => (
        <div key={j}>
          {val ? <Check size={15} color={color.success} /> : <span style={{ fontSize: fontSize.xs, color: color.creamBorder }}>—</span>}
        </div>
      ))}

      {/* Offering */}
      <p style={{ fontSize: fontSize.sm, fontWeight: '600', color: record.offering > 0 ? color.goldDark : color.inkSubtle, margin: 0, fontFamily: font.body }}>
        {record.offering > 0 ? formatNaira(record.offering) : '—'}
      </p>
    </div>
  )
}

// ── Batch detail view ─────────────────────────────────────────
function BatchDetail({ batchId, onBack, onRefresh }) {
  const [batch,   setBatch]   = useState(null)
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [acting,  setActing]  = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  useEffect(() => {
    async function load() {
      const res  = await fetch(`/api/admin/records?batchId=${batchId}`)
      const data = await res.json()
      if (res.ok) { setBatch(data.batch); setRecords(data.records || []) }
      setLoading(false)
    }
    load()
  }, [batchId])

  async function handleApprove() {
    setActing(true)
    const res = await fetch(`/api/admin/approvals/${batchId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'approve' }),
    })
    if (res.ok) { setBatch(p => ({ ...p, status: 'approved' })); onRefresh?.() }
    setActing(false)
  }

  async function handleReject(reason) {
    setActing(true)
    const res = await fetch(`/api/admin/approvals/${batchId}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ action: 'reject', rejectionReason: reason }),
    })
    if (res.ok) { setBatch(p => ({ ...p, status: 'rejected', rejection_reason: reason })); setShowRejectModal(false); onRefresh?.() }
    setActing(false)
  }

  if (loading) return <div style={{ padding: '20px 24px' }}><SkeletonList count={5} height={60} /></div>
  if (!batch)  return null

  const isPending = batch.status === 'pending'

  return (
    <div>
      {/* Back */}
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '0 0 20px' }}>
        <ArrowLeft size={16} /> Back to Records
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
            <StatusBadge status={batch.status} />
            {batch.classes?.group_name && (
              <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, background: color.creamDark, padding: '2px 10px', borderRadius: radius.full }}>
                {batch.classes.group_name}
              </span>
            )}
          </div>
          <h2 style={{ fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800', color: color.ink, margin: '0 0 4px', letterSpacing: '-0.02em' }}>
            {batch.classes?.name || '—'}
          </h2>
          <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
            {formatDate(batch.sessions?.session_date)} · Submitted {formatTime(batch.submitted_at)}
          </p>
        </div>

        {/* Approve / Reject — only for pending */}
        {isPending && (
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={acting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: color.errorBg, color: color.error, border: `1px solid ${color.errorBorder}`, borderRadius: radius.md, padding: '9px 18px', cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body, height: '40px' }}
            >
              <X size={15} /> Reject
            </button>
            <button
              onClick={handleApprove}
              disabled={acting}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: color.success, color: 'white', border: 'none', borderRadius: radius.md, padding: '9px 18px', cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body, height: '40px', boxShadow: '0 2px 8px rgba(5,150,105,0.3)' }}
            >
              <Check size={15} /> {acting ? 'Approving…' : 'Approve'}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <SummaryCard label="Present"  value={batch.present_count}                          c={color.success}  />
        <SummaryCard label="Absent"   value={batch.record_count - batch.present_count}     c={color.error}    />
        <SummaryCard label="Offering" value={formatNaira(batch.total_offering)}            c={color.goldDark} />
        <SummaryCard label="Total"    value={batch.record_count}                           c={color.navy}     />
      </div>

      {/* Rejection reason */}
      {batch.rejection_reason && (
        <div style={{ padding: '14px 18px', background: color.errorBg, border: `1px solid ${color.errorBorder}`, borderRadius: radius.xl, marginBottom: '20px' }}>
          <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, fontFamily: font.body }}>
            <strong>Rejection reason:</strong> {batch.rejection_reason}
          </p>
        </div>
      )}

      {/* Records table */}
      <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr', gap: '8px', padding: '12px 20px', background: color.cream, borderBottom: `1px solid ${color.creamBorder}` }}>
          {['Member', 'Status', 'On Time', 'Bible', 'Verse', 'Offering'].map(h => (
            <p key={h} style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, fontFamily: font.body }}>
              {h}
            </p>
          ))}
        </div>
        {records.map((r, i) => (
          <DetailMemberRow key={i} record={r} index={i} total={records.length} />
        ))}
      </div>

      {showRejectModal && (
        <RejectModal onConfirm={handleReject} onClose={() => setShowRejectModal(false)} loading={acting} />
      )}
    </div>
  )
}

// ── Main admin records page ───────────────────────────────────
export default function AdminRecordsPage() {
  const [batches,     setBatches]     = useState([])
  const [classes,     setClasses]     = useState([])
  const [loading,     setLoading]     = useState(true)
  const [filter,      setFilter]      = useState('all')
  const [search,      setSearch]      = useState('')
  const [month,       setMonth]       = useState(0)
  const [year,        setYear]        = useState(new Date().getFullYear())
  const [classFilter, setClassFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedId,  setSelectedId]  = useState(null)

  const fetchBatches = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filter !== 'all') params.set('status',  filter)
      if (month  > 0)       params.set('month',   month)
      if (year   > 0)       params.set('year',    year)
      if (classFilter)      params.set('classId', classFilter)

      const [batchRes, classRes] = await Promise.all([
        fetch(`/api/admin/records?${params}`),
        fetch('/api/admin/classes'),
      ])
      const [batchData, classData] = await Promise.all([batchRes.json(), classRes.json()])
      if (batchRes.ok) setBatches(batchData.batches || [])
      if (classRes.ok) setClasses(classData.classes || [])
    } finally { setLoading(false) }
  }, [filter, month, year, classFilter])

  useEffect(() => { fetchBatches() }, [fetchBatches])

  // Client-side search
  const searched = search.trim()
    ? batches.filter(b => {
        const s = search.toLowerCase()
        return (
          b.classes?.name?.toLowerCase().includes(s) ||
          b.classes?.group_name?.toLowerCase().includes(s) ||
          b.sessions?.session_date?.includes(s)
        )
      })
    : batches

  const tabs = [
    { id: 'all',      label: 'All',      count: batches.length },
    { id: 'pending',  label: 'Pending',  count: batches.filter(b => b.status === 'pending').length  },
    { id: 'approved', label: 'Approved', count: batches.filter(b => b.status === 'approved').length },
    { id: 'rejected', label: 'Rejected', count: batches.filter(b => b.status === 'rejected').length },
  ]

  const approvedBatches  = batches.filter(b => b.status === 'approved')
  const totalPresent     = approvedBatches.reduce((s, b) => s + b.present_count, 0)
  const totalOffering    = approvedBatches.reduce((s, b) => s + (b.total_offering || 0), 0)
  const totalPending     = batches.filter(b => b.status === 'pending').length

  if (selectedId) {
    return (
      <BatchDetail
        batchId={selectedId}
        onBack={() => { setSelectedId(null); fetchBatches() }}
        onRefresh={fetchBatches}
      />
    )
  }

  return (
    <div>
      <PageHeader title="Records" subtitle="All class attendance submissions" />

      {/* Summary */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
        <SummaryCard label="Present (Approved)"  value={totalPresent.toLocaleString()}  c={color.success}                           />
        <SummaryCard label="Offering (Approved)" value={formatNaira(totalOffering)}     c={color.goldDark}                          />
        <SummaryCard label="Pending Review"      value={totalPending}                   c={totalPending > 0 ? color.warning : color.inkMuted} />
        <SummaryCard label="Total Submissions"   value={batches.length}                 c={color.navy}                              />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '16px' }}>
        <FilterTabs tabs={tabs} active={filter} onChange={v => { setFilter(v); setSelectedId(null) }} />
        <button
          onClick={() => setShowFilters(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: showFilters ? color.navy : color.white, color: showFilters ? color.cream : color.inkMuted, border: `1.5px solid ${showFilters ? color.navy : color.creamBorder}`, borderRadius: radius.md, padding: '7px 14px', cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body, transition: 'all 0.15s' }}
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {showFilters && (
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '20px', marginBottom: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', animation: 'slideUp 0.2s ease' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <p style={filterLabel}>Search</p>
            <SearchInput value={search} onChange={setSearch} placeholder="Class name or date…" />
          </div>
          <div>
            <p style={filterLabel}>Period</p>
            <MonthYearPicker month={month} year={year} onMonthChange={setMonth} onYearChange={setYear} />
          </div>
          <div>
            <p style={filterLabel}>Class</p>
            <select
              value={classFilter}
              onChange={e => setClassFilter(e.target.value)}
              style={{ height: '40px', padding: '0 12px', fontFamily: font.body, fontSize: fontSize.sm, color: color.ink, background: color.white, border: `1.5px solid ${color.creamBorder}`, borderRadius: radius.md, outline: 'none', cursor: 'pointer', minWidth: '160px' }}
            >
              <option value="">All classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <button onClick={() => { setSearch(''); setMonth(0); setYear(new Date().getFullYear()); setClassFilter('') }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: color.error, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '8px 0' }}>
            Clear
          </button>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <SkeletonList count={6} height={72} />
      ) : searched.length === 0 ? (
        <EmptyState
          icon={<FileText size={28} />}
          title="No records found"
          message={search || filter !== 'all' || classFilter ? 'Try adjusting your filters.' : 'Records appear here as classes submit attendance.'}
        />
      ) : (
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
          {/* Table header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr auto', gap: '8px', padding: '12px 20px', background: color.cream, borderBottom: `1px solid ${color.creamBorder}` }}>
            {['Class / Date', 'Present', 'Offering', 'Submitted', 'Status', ''].map((h, i) => (
              <p key={i} style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, fontFamily: font.body }}>
                {h}
              </p>
            ))}
          </div>
          {searched.map((batch, i) => (
            <BatchRow
              key={batch.id}
              batch={batch}
              isLast={i === searched.length - 1}
              onClick={() => setSelectedId(batch.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const filterLabel = {
  fontSize:      fontSize.xs,
  fontWeight:    '700',
  color:         color.inkMuted,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  margin:        '0 0 8px',
  fontFamily:    font.body,
}