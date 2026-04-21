'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_SESSION = {
  isOpen: true,
  date: 'Sunday, 15 June 2025',
  submittedCount: 18,
  totalClasses: 24,
}

const MOCK_KPI = {
  totalClasses:  24,
  submitted:     18,
  totalPresent:  346,
  totalOffering: 12450000, // in kobo
}

const MOCK_CLASSES = [
  { id: '1', name: 'Youth A',           group: 'Youth',   status: 'submitted', present: 22, offering: 850000,  submittedAt: '8:42 AM' },
  { id: '2', name: 'Youth B',           group: 'Youth',   status: 'submitted', present: 19, offering: 620000,  submittedAt: '9:01 AM' },
  { id: '3', name: 'Youth C',           group: 'Youth',   status: 'submitted', present: 25, offering: 780000,  submittedAt: '8:55 AM' },
  { id: '4', name: "Men's Class A",     group: 'Men',     status: 'pending',   present: null, offering: null,  submittedAt: null },
  { id: '5', name: "Men's Class B",     group: 'Men',     status: 'submitted', present: 30, offering: 1200000, submittedAt: '9:15 AM' },
  { id: '6', name: "Women's Fellowship",group: 'Women',   status: 'not_submitted', present: null, offering: null, submittedAt: null },
  { id: '7', name: 'Senior Adults',     group: 'Seniors', status: 'submitted', present: 18, offering: 410000,  submittedAt: '9:22 AM' },
  { id: '8', name: 'Teens Class',       group: 'Youth',   status: 'submitted', present: 28, offering: 540000,  submittedAt: '8:38 AM' },
  { id: '9', name: 'Children A',        group: 'Children',status: 'not_submitted', present: null, offering: null, submittedAt: null },
]

// ── Helpers ───────────────────────────────────────────────────
function formatNaira(kobo) {
  const naira = kobo / 100
  if (naira >= 1000000) return `₦${(naira / 1000000).toFixed(1)}M`
  if (naira >= 1000)    return `₦${(naira / 1000).toFixed(1)}k`
  return `₦${naira.toLocaleString('en-NG')}`
}

function statusConfig(status) {
  if (status === 'submitted')     return { label: 'Submitted',     cls: 'badge-green' }
  if (status === 'pending')       return { label: 'Pending',       cls: 'badge-amber' }
  return                                 { label: 'Not Submitted', cls: 'badge-red'   }
}

// ── KPI Card ──────────────────────────────────────────────────
function KpiCard({ label, value, sub, color }) {
  return (
    <div style={styles.kpiCard}>
      <p style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '0.06em', color: 'var(--mist)', margin: '0 0 8px' }}>
        {label}
      </p>
      <p style={{
        fontFamily: 'var(--font-display)',
        fontSize: '28px', fontWeight: '700',
        color: color || 'var(--navy)', margin: 0, lineHeight: 1,
      }}>
        {value}
      </p>
      {sub && (
        <p style={{ fontSize: '11px', color: 'var(--mist)', margin: '6px 0 0' }}>{sub}</p>
      )}
    </div>
  )
}

// ── Class row ─────────────────────────────────────────────────
function ClassRow({ cls }) {
  const [expanded, setExpanded] = useState(false)
  const { label, cls: badgeCls } = statusConfig(cls.status)

  return (
    <div style={styles.classRow}>
      <div style={styles.classRowMain}>
        {/* Name + group */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)', margin: 0 }}>
            {cls.name}
          </p>
          <span className="badge badge-mist" style={{ fontSize: '9px', marginTop: '3px' }}>
            {cls.group}
          </span>
        </div>

        {/* Present */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: '700', color: cls.present ? 'var(--navy)' : 'var(--mist)', margin: 0 }}>
            {cls.present ?? '—'}
          </p>
          <p style={{ fontSize: '10px', color: 'var(--mist)', margin: 0 }}>present</p>
        </div>

        {/* Offering */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontSize: '15px', fontWeight: '700', color: cls.offering ? 'var(--gold)' : 'var(--mist)', margin: 0 }}>
            {cls.offering ? formatNaira(cls.offering) : '—'}
          </p>
          <p style={{ fontSize: '10px', color: 'var(--mist)', margin: 0 }}>offering</p>
        </div>

        {/* Status + time */}
        <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <span className={`badge ${badgeCls}`}>{label}</span>
          {cls.submittedAt && (
            <span style={{ fontSize: '10px', color: 'var(--mist)' }}>{cls.submittedAt}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function DashboardPage() {
  const [sessionOpen, setSessionOpen] = useState(MOCK_SESSION.isOpen)
  const [toggling, setToggling]       = useState(false)

  async function toggleSession() {
    setToggling(true)
    await new Promise(r => setTimeout(r, 600))
    setSessionOpen(p => !p)
    setToggling(false)
  }

  const submitted    = MOCK_CLASSES.filter(c => c.status === 'submitted')
  const pending      = MOCK_CLASSES.filter(c => c.status === 'pending')
  const notSubmitted = MOCK_CLASSES.filter(c => c.status === 'not_submitted')
  const progressPct  = Math.round((submitted.length / MOCK_CLASSES.length) * 100)

  return (
    <div style={styles.page}>

      {/* ── Page header ── */}
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Dashboard</h1>
          <p style={styles.pageDate}>{MOCK_SESSION.date}</p>
        </div>

        {/* Session toggle */}
        <div style={styles.sessionControls}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: sessionOpen ? '#DCFCE7' : '#FEE2E2',
            border: `1px solid ${sessionOpen ? '#BBF7D0' : '#FECACA'}`,
            padding: '6px 12px', borderRadius: 'var(--radius-full)',
          }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: sessionOpen ? 'var(--success)' : 'var(--error)',
            }} />
            <span style={{
              fontSize: '12px', fontWeight: '700',
              color: sessionOpen ? '#15803D' : '#991B1B',
            }}>
              {sessionOpen ? 'Session Open' : 'Session Closed'}
            </span>
          </div>
          <button
            className={`btn ${sessionOpen ? 'btn-danger' : 'btn-primary'} btn-sm`}
            onClick={toggleSession}
            disabled={toggling}
          >
            {toggling
              ? 'Updating…'
              : sessionOpen ? 'Close Session' : 'Open Session'
            }
          </button>
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div style={styles.kpiGrid}>
        <KpiCard
          label="TOTAL CLASSES"
          value={MOCK_KPI.totalClasses}
          sub="active this session"
        />
        <KpiCard
          label="SUBMITTED"
          value={`${MOCK_KPI.submitted}/${MOCK_KPI.totalClasses}`}
          sub={`${progressPct}% complete`}
          color="var(--success)"
        />
        <KpiCard
          label="TOTAL PRESENT"
          value={MOCK_KPI.totalPresent.toLocaleString()}
          sub="members church-wide"
          color="var(--navy)"
        />
        <KpiCard
          label="TOTAL OFFERING"
          value={formatNaira(MOCK_KPI.totalOffering)}
          sub="this Sunday"
          color="var(--gold)"
        />
      </div>

      {/* ── Progress bar ── */}
      <div style={styles.progressCard}>
        <div style={styles.progressHeader}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)', margin: 0 }}>
            Today's Submissions
          </p>
          <p style={{ fontSize: '13px', color: 'var(--mist)', margin: 0 }}>
            {submitted.length} of {MOCK_CLASSES.length} classes · {progressPct}%
          </p>
        </div>
        <div style={styles.progressTrack}>
          <div style={{ ...styles.progressFill, width: `${progressPct}%` }} />
        </div>

        {/* Quick stats row */}
        <div style={styles.quickStats}>
          <div style={styles.quickStat}>
            <Check size={13} color="var(--success)" />
            <span style={{ fontSize: '12px', color: 'var(--success)', fontWeight: '600' }}>
              {submitted.length} submitted
            </span>
          </div>
          <div style={styles.quickStat}>
            <Clock size={13} color="var(--warning)" />
            <span style={{ fontSize: '12px', color: 'var(--warning)', fontWeight: '600' }}>
              {pending.length} pending
            </span>
          </div>
          <div style={styles.quickStat}>
            <AlertCircle size={13} color="var(--error)" />
            <span style={{ fontSize: '12px', color: 'var(--error)', fontWeight: '600' }}>
              {notSubmitted.length} not submitted
            </span>
          </div>
        </div>
      </div>

      {/* ── Class list ── */}
      <div style={styles.classTable}>
        <div style={styles.classTableHeader}>
          <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)', margin: 0 }}>
            All Classes
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '12px' }}>
          {/* Submitted */}
          {submitted.length > 0 && (
            <>
              <p style={styles.groupLabel}>✅ Submitted ({submitted.length})</p>
              {submitted.map(c => <ClassRow key={c.id} cls={c} />)}
            </>
          )}

          {/* Pending */}
          {pending.length > 0 && (
            <>
              <p style={{ ...styles.groupLabel, marginTop: '12px' }}>⏳ Pending ({pending.length})</p>
              {pending.map(c => <ClassRow key={c.id} cls={c} />)}
            </>
          )}

          {/* Not submitted */}
          {notSubmitted.length > 0 && (
            <>
              <p style={{ ...styles.groupLabel, marginTop: '12px' }}>❌ Not Submitted ({notSubmitted.length})</p>
              {notSubmitted.map(c => <ClassRow key={c.id} cls={c} />)}
            </>
          )}
        </div>
      </div>

    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page:           { display: 'flex', flexDirection: 'column', gap: '20px' },
  pageHeader:     { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' },
  pageTitle:      { fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--navy)', margin: '0 0 4px' },
  pageDate:       { fontSize: '13px', color: 'var(--mist)', margin: 0 },
  sessionControls:{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' },
  kpiGrid:        { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' },
  kpiCard:        { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '20px' },
  progressCard:   { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  progressHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  progressTrack:  { height: '8px', background: 'var(--cream-dark)', borderRadius: '99px', overflow: 'hidden' },
  progressFill:   { height: '100%', background: 'var(--navy)', borderRadius: '99px', transition: 'width 0.4s ease' },
  quickStats:     { display: 'flex', gap: '20px', flexWrap: 'wrap' },
  quickStat:      { display: 'flex', alignItems: 'center', gap: '5px' },
  classTable:     { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' },
  classTableHeader: { padding: '16px 20px', borderBottom: '1px solid var(--cream-dark)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  classRow:       { background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '2px' },
  classRowMain:   { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' },
  groupLabel:     { fontSize: '11px', fontWeight: '700', letterSpacing: '0.05em', color: 'var(--mist)', margin: '0 0 6px', paddingLeft: '4px' },
}