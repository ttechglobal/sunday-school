'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight, Check, Clock, AlertCircle, X } from 'lucide-react'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_SESSIONS = [
  {
    id: 's1',
    date: 'Sunday, 15 June 2025',
    type: 'normal',
    status: 'open',
    submitted: 18,
    total: 24,
    totalPresent: 346,
    totalOffering: 12450000,
    classes: [
      { id: 'c1', name: 'Youth A',            group: 'Youth',    status: 'submitted', present: 22, onTime: 18, bible: 20, verse: 15, offering: 850000,  submittedAt: '8:42 AM' },
      { id: 'c2', name: 'Youth B',            group: 'Youth',    status: 'submitted', present: 19, onTime: 15, bible: 17, verse: 12, offering: 620000,  submittedAt: '9:01 AM' },
      { id: 'c3', name: "Men's Class A",      group: 'Men',      status: 'pending',   present: null, onTime: null, bible: null, verse: null, offering: null, submittedAt: null },
      { id: 'c4', name: "Women's Fellowship", group: 'Women',    status: 'not_submitted', present: null, onTime: null, bible: null, verse: null, offering: null, submittedAt: null },
      { id: 'c5', name: 'Senior Adults',      group: 'Seniors',  status: 'submitted', present: 18, onTime: 14, bible: 16, verse: 10, offering: 410000,  submittedAt: '9:22 AM' },
    ],
  },
  {
    id: 's2',
    date: 'Sunday, 8 June 2025',
    type: 'normal',
    status: 'finalized',
    submitted: 24,
    total: 24,
    totalPresent: 389,
    totalOffering: 15800000,
    classes: [
      { id: 'c1', name: 'Youth A',            group: 'Youth',   status: 'submitted', present: 24, onTime: 20, bible: 22, verse: 18, offering: 960000,  submittedAt: '8:30 AM' },
      { id: 'c2', name: 'Youth B',            group: 'Youth',   status: 'submitted', present: 21, onTime: 17, bible: 19, verse: 14, offering: 740000,  submittedAt: '8:45 AM' },
      { id: 'c3', name: "Men's Class A",      group: 'Men',     status: 'submitted', present: 32, onTime: 28, bible: 30, verse: 20, offering: 1400000, submittedAt: '9:00 AM' },
      { id: 'c4', name: "Women's Fellowship", group: 'Women',   status: 'submitted', present: 28, onTime: 24, bible: 26, verse: 19, offering: 1200000, submittedAt: '9:10 AM' },
      { id: 'c5', name: 'Senior Adults',      group: 'Seniors', status: 'submitted', present: 20, onTime: 16, bible: 18, verse: 12, offering: 500000,  submittedAt: '9:20 AM' },
    ],
  },
  {
    id: 's3',
    date: 'Sunday, 1 June 2025',
    type: 'special',
    label: 'Children\'s Day Service',
    status: 'finalized',
    submitted: 22,
    total: 24,
    totalPresent: 312,
    totalOffering: 9800000,
    classes: [
      { id: 'c1', name: 'Youth A',            group: 'Youth',   status: 'submitted', present: 20, onTime: 16, bible: 18, verse: 14, offering: 720000,  submittedAt: '8:55 AM' },
      { id: 'c2', name: 'Youth B',            group: 'Youth',   status: 'submitted', present: 17, onTime: 13, bible: 15, verse: 11, offering: 580000,  submittedAt: '9:05 AM' },
      { id: 'c3', name: "Men's Class A",      group: 'Men',     status: 'not_submitted', present: null, onTime: null, bible: null, verse: null, offering: null, submittedAt: null },
      { id: 'c4', name: "Women's Fellowship", group: 'Women',   status: 'not_submitted', present: null, onTime: null, bible: null, verse: null, offering: null, submittedAt: null },
      { id: 'c5', name: 'Senior Adults',      group: 'Seniors', status: 'submitted', present: 16, onTime: 12, bible: 14, verse: 9,  offering: 380000,  submittedAt: '9:30 AM' },
    ],
  },
]

// ── Helpers ───────────────────────────────────────────────────
function formatNaira(kobo) {
  const n = kobo / 100
  if (n >= 1000000) return `₦${(n / 1000000).toFixed(1)}M`
  if (n >= 1000)    return `₦${(n / 1000).toFixed(1)}k`
  return `₦${n.toLocaleString('en-NG')}`
}

function statusBadge(status) {
  if (status === 'open')          return { label: 'Open',          cls: 'badge-green' }
  if (status === 'finalized')     return { label: 'Finalized',     cls: 'badge-navy'  }
  if (status === 'submitted')     return { label: 'Submitted',     cls: 'badge-green' }
  if (status === 'pending')       return { label: 'Pending',       cls: 'badge-amber' }
  if (status === 'not_submitted') return { label: 'Not Submitted', cls: 'badge-red'   }
  return { label: status, cls: 'badge-mist' }
}

// ── Session list card ─────────────────────────────────────────
function SessionCard({ session, onClick }) {
  const { label, cls } = statusBadge(session.status)
  const pct = Math.round((session.submitted / session.total) * 100)

  return (
    <button onClick={onClick} style={styles.sessionCard}>
      <div style={styles.sessionCardTop}>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy)', margin: 0 }}>
              {session.date}
            </p>
            {session.type === 'special' && (
              <span className="badge badge-gold" style={{ fontSize: '9px' }}>Special</span>
            )}
          </div>
          {session.label && (
            <p style={{ fontSize: '12px', color: 'var(--mist)', margin: '0 0 8px' }}>{session.label}</p>
          )}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className={`badge ${cls}`}>{label}</span>
            <span className="badge badge-mist">{session.submitted}/{session.total} submitted</span>
          </div>
        </div>
        <ChevronRight size={16} color="var(--mist)" style={{ flexShrink: 0 }} />
      </div>

      {/* Stats row */}
      <div style={styles.sessionStats}>
        <div style={styles.sessionStat}>
          <p style={styles.sessionStatValue}>{session.totalPresent.toLocaleString()}</p>
          <p style={styles.sessionStatLabel}>present</p>
        </div>
        <div style={styles.sessionStatDivider} />
        <div style={styles.sessionStat}>
          <p style={{ ...styles.sessionStatValue, color: 'var(--gold)' }}>
            {formatNaira(session.totalOffering)}
          </p>
          <p style={styles.sessionStatLabel}>offering</p>
        </div>
        <div style={styles.sessionStatDivider} />
        <div style={styles.sessionStat}>
          <p style={styles.sessionStatValue}>{pct}%</p>
          <p style={styles.sessionStatLabel}>submitted</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={styles.progressTrack}>
        <div style={{ ...styles.progressFill, width: `${pct}%` }} />
      </div>
    </button>
  )
}

// ── Session Detail ────────────────────────────────────────────
function SessionDetail({ session, onBack }) {
  const [sessionStatus, setSessionStatus] = useState(session.status)

  const totals = session.classes.reduce((acc, c) => ({
    present:  acc.present  + (c.present  || 0),
    onTime:   acc.onTime   + (c.onTime   || 0),
    bible:    acc.bible    + (c.bible    || 0),
    verse:    acc.verse    + (c.verse    || 0),
    offering: acc.offering + (c.offering || 0),
  }), { present: 0, onTime: 0, bible: 0, verse: 0, offering: 0 })

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
        <button
          onClick={onBack}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '14px', fontWeight: '600', color: 'var(--mist)',
            padding: 0,
          }}
        >
          <ArrowLeft size={16} />
          Sessions
        </button>
        <span style={{ color: 'var(--mist)' }}>›</span>
        <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)', margin: 0 }}>
          {session.date}
        </p>
      </div>

      {/* Session header card */}
      <div style={{ ...styles.detailCard, marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <span className={`badge ${statusBadge(sessionStatus).cls}`}>
                {statusBadge(sessionStatus).label}
              </span>
              {session.type === 'special' && (
                <span className="badge badge-gold">Special Session</span>
              )}
            </div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--navy)', margin: 0 }}>
              {session.date}
            </h2>
            {session.label && (
              <p style={{ fontSize: '13px', color: 'var(--mist)', margin: '4px 0 0' }}>{session.label}</p>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sessionStatus === 'open' && (
              <button
                className="btn btn-danger btn-sm"
                onClick={() => setSessionStatus('finalized')}
              >
                Close & Finalize
              </button>
            )}
            {sessionStatus === 'finalized' && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSessionStatus('open')}
              >
                Re-open Session
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Totals grid */}
      <div style={styles.totalsGrid}>
        {[
          { label: 'Total Present',  value: totals.present,  color: 'var(--success)' },
          { label: 'On Time',        value: totals.onTime,   color: 'var(--navy)' },
          { label: 'With Bible',     value: totals.bible,    color: 'var(--navy-lite)' },
          { label: 'Memory Verse',   value: totals.verse,    color: '#7C3AED' },
          { label: 'Total Offering', value: formatNaira(totals.offering), color: 'var(--gold)' },
          { label: 'Classes Done',   value: `${session.submitted}/${session.total}`, color: 'var(--navy)' },
        ].map(s => (
          <div key={s.label} style={styles.totalBox}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: '700', color: s.color, margin: 0 }}>
              {s.value}
            </p>
            <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--mist)', margin: '4px 0 0', letterSpacing: '0.05em' }}>
              {s.label.toUpperCase()}
            </p>
          </div>
        ))}
      </div>

      {/* Per-class table */}
      <div style={styles.detailCard}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)', margin: '0 0 16px' }}>
          Per-Class Breakdown
        </p>

        {/* Table header */}
        <div style={styles.tableHeader}>
          {['Class', 'Group', 'Present', 'On Time', 'Bible', 'Verse', 'Offering', 'Status'].map(h => (
            <p key={h} style={styles.tableHeadCell}>{h}</p>
          ))}
        </div>

        {/* Rows */}
        {session.classes.map(c => {
          const { label, cls } = statusBadge(c.status)
          return (
            <div key={c.id} style={styles.tableRow}>
              <p style={styles.tableCell}>{c.name}</p>
              <div style={styles.tableCell}>
                <span className="badge badge-mist" style={{ fontSize: '9px' }}>{c.group}</span>
              </div>
              <p style={{ ...styles.tableCell, fontWeight: '700', color: c.present ? 'var(--navy)' : 'var(--mist)' }}>
                {c.present ?? '—'}
              </p>
              <p style={{ ...styles.tableCell, color: c.onTime ? 'var(--navy)' : 'var(--mist)' }}>
                {c.onTime ?? '—'}
              </p>
              <p style={{ ...styles.tableCell, color: c.bible ? 'var(--navy-lite)' : 'var(--mist)' }}>
                {c.bible ?? '—'}
              </p>
              <p style={{ ...styles.tableCell, color: c.verse ? '#7C3AED' : 'var(--mist)' }}>
                {c.verse ?? '—'}
              </p>
              <p style={{ ...styles.tableCell, fontWeight: '700', color: c.offering ? 'var(--gold)' : 'var(--mist)' }}>
                {c.offering ? formatNaira(c.offering) : '—'}
              </p>
              <div style={styles.tableCell}>
                <span className={`badge ${cls}`} style={{ fontSize: '9px' }}>{label}</span>
              </div>
            </div>
          )
        })}

        {/* Totals row */}
        <div style={{ ...styles.tableRow, background: 'var(--navy)', borderRadius: 'var(--radius-md)', marginTop: '8px' }}>
          <p style={{ ...styles.tableCell, fontWeight: '700', color: 'var(--cream)' }}>TOTAL</p>
          <div style={styles.tableCell} />
          <p style={{ ...styles.tableCell, fontWeight: '700', color: 'var(--cream)' }}>{totals.present}</p>
          <p style={{ ...styles.tableCell, fontWeight: '700', color: 'var(--cream)' }}>{totals.onTime}</p>
          <p style={{ ...styles.tableCell, fontWeight: '700', color: 'var(--cream)' }}>{totals.bible}</p>
          <p style={{ ...styles.tableCell, fontWeight: '700', color: 'var(--cream)' }}>{totals.verse}</p>
          <p style={{ ...styles.tableCell, fontWeight: '700', color: 'var(--gold)' }}>{formatNaira(totals.offering)}</p>
          <div style={styles.tableCell} />
        </div>
      </div>
    </div>
  )
}

// ── Main Sessions Page ────────────────────────────────────────
export default function SessionsPage() {
  const [selected, setSelected] = useState(null)
  const [tab, setTab]           = useState('all')

  if (selected) {
    return <SessionDetail session={selected} onBack={() => setSelected(null)} />
  }

  const tabs = [
    { id: 'all',   label: 'All Sessions' },
    { id: 'month', label: 'This Month' },
    { id: 'year',  label: 'This Year' },
  ]

  return (
    <div style={styles.page}>
      {/* Page header */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Sessions</h1>
          <p style={styles.pageSub}>All Sunday sessions for your church</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              ...styles.tab,
              background: tab === t.id ? 'var(--navy)' : 'transparent',
              color: tab === t.id ? 'var(--cream)' : 'var(--mist)',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Session list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {MOCK_SESSIONS.map(s => (
          <SessionCard
            key={s.id}
            session={s}
            onClick={() => setSelected(s)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page:             { display: 'flex', flexDirection: 'column', gap: '20px' },
  pageHeader:       { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
  pageTitle:        { fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--navy)', margin: '0 0 4px' },
  pageSub:          { fontSize: '13px', color: 'var(--mist)', margin: 0 },
  tabs:             { display: 'flex', gap: '4px', background: 'var(--cream-dark)', padding: '4px', borderRadius: 'var(--radius-md)', width: 'fit-content' },
  tab:              { padding: '6px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-body)', transition: 'all 0.15s' },
  sessionCard:      { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '16px 20px', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'box-shadow 0.15s' },
  sessionCardTop:   { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  sessionStats:     { display: 'flex', alignItems: 'center', gap: '0' },
  sessionStat:      { flex: 1, textAlign: 'center' },
  sessionStatValue: { fontSize: '18px', fontWeight: '700', color: 'var(--navy)', margin: 0, fontFamily: 'var(--font-display)' },
  sessionStatLabel: { fontSize: '10px', color: 'var(--mist)', margin: '2px 0 0', fontWeight: '600', letterSpacing: '0.04em' },
  sessionStatDivider: { width: '1px', height: '32px', background: 'var(--cream-dark)', flexShrink: 0 },
  progressTrack:    { height: '4px', background: 'var(--cream-dark)', borderRadius: '99px', overflow: 'hidden' },
  progressFill:     { height: '100%', background: 'var(--navy)', borderRadius: '99px' },
  detailCard:       { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '20px' },
  totalsGrid:       { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '16px' },
  totalBox:         { background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', padding: '16px', textAlign: 'center' },
  tableHeader:      { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.2fr 1.2fr', gap: '8px', padding: '0 8px 8px', borderBottom: '1px solid var(--cream-dark)', marginBottom: '6px' },
  tableHeadCell:    { fontSize: '9px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--mist)', margin: 0 },
  tableRow:         { display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1.2fr 1.2fr', gap: '8px', padding: '10px 8px', borderBottom: '1px solid rgba(237,229,208,0.5)', alignItems: 'center' },
  tableCell:        { fontSize: '13px', color: 'var(--ink)', margin: 0 },
}