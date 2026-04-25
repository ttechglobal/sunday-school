'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, ArrowLeft,
  Users, DollarSign, Calendar,
  ChevronDown, FileText,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import EmptyState from '@/components/class/ui/EmptyState'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

// ── Utilities ─────────────────────────────────────────────────
function formatDateLong(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(str))
}
function formatDateShort(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(str))
}
function formatNaira(v) {
  const n = parseFloat(v) || 0
  return `₦ ${n.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ label, value, c }) {
  return (
    <div style={{
      background:   color.white,
      borderRadius: radius.xl,
      border:       `1px solid ${color.creamBorder}`,
      padding:      '16px',
      flex:         1,
    }}>
      <p style={{
        fontFamily:   font.heading,
        fontSize:     '28px',
        fontWeight:   '800',
        color:        c || color.navy,
        margin:       '0 0 4px',
        letterSpacing:'-0.02em',
        lineHeight:   1,
      }}>
        {value}
      </p>
      <p style={{
        fontSize:      fontSize.xs,
        fontWeight:    '700',
        color:         color.inkSubtle,
        margin:        0,
        fontFamily:    font.body,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </p>
    </div>
  )
}

// ── Member list inside expanded class ─────────────────────────
function MemberList({ records }) {
  if (!records?.length) {
    return (
      <p style={{ fontSize: fontSize.sm, color: color.inkSubtle, padding: '12px 16px', margin: 0, fontFamily: font.body }}>
        No records found for this class.
      </p>
    )
  }

  const present = records.filter(r => r.attendance === 'present')
  const absent  = records.filter(r => r.attendance === 'absent')

  function MemberRow({ r, isLast }) {
    const isPresent = r.attendance === 'present'
    const initials  = r.name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'

    return (
      <div style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '10px 16px',
        borderBottom: isLast ? 'none' : `1px solid ${color.creamBorder}`,
        background:   isPresent ? 'transparent' : 'rgba(254,242,242,0.3)',
      }}>
        <div style={{
          width:          '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
          background:     isPresent ? `linear-gradient(135deg, ${color.navy}, ${color.navyLight})` : color.creamDark,
          display:        'flex', alignItems: 'center', justifyContent: 'center',
          fontSize:       '10px', fontWeight: '700', fontFamily: font.heading,
          color:          isPresent ? color.cream : color.inkMuted,
        }}>
          {initials}
        </div>

        <p style={{
          flex: 1, fontSize: fontSize.sm, fontWeight: '600',
          color: color.ink, margin: 0, fontFamily: font.body,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {r.name}
          {r.memberType === 'visitor' && (
            <span style={{ marginLeft: '6px', fontSize: fontSize['2xs'], color: color.goldDark, fontWeight: '600' }}>(FT)</span>
          )}
        </p>

        {isPresent ? (
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            {r.onTime && (
              <span style={{ fontSize: fontSize['2xs'], color: color.navy, background: 'rgba(15,37,87,0.07)', padding: '2px 6px', borderRadius: radius.full, fontWeight: '600' }}>
                On Time
              </span>
            )}
            {r.bible && (
              <span style={{ fontSize: fontSize['2xs'], color: color.navyLight, background: 'rgba(30,58,110,0.07)', padding: '2px 6px', borderRadius: radius.full, fontWeight: '600' }}>
                Bible
              </span>
            )}
            {r.memoryVerse && (
              <span style={{ fontSize: fontSize['2xs'], color: '#7C3AED', background: 'rgba(124,58,237,0.07)', padding: '2px 6px', borderRadius: radius.full, fontWeight: '600' }}>
                Verse
              </span>
            )}
            {r.offering > 0 && (
              <span style={{ fontSize: fontSize['2xs'], color: color.goldDark, background: color.goldLight, padding: '2px 6px', borderRadius: radius.full, fontWeight: '600' }}>
                {formatNaira(r.offering)}
              </span>
            )}
          </div>
        ) : (
          <span style={{ fontSize: fontSize.xs, color: color.error, fontWeight: '600', fontFamily: font.body }}>
            Absent
          </span>
        )}
      </div>
    )
  }

  return (
    <div>
      {present.length > 0 && (
        <>
          <p style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.success, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, padding: '8px 16px 6px', background: color.cream, borderTop: `1px solid ${color.creamBorder}` }}>
            Present — {present.length}
          </p>
          {present.map((r, i) => <MemberRow key={i} r={r} isLast={i === present.length - 1 && absent.length === 0} />)}
        </>
      )}
      {absent.length > 0 && (
        <>
          <p style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.error, textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0, padding: '8px 16px 6px', background: 'rgba(254,242,242,0.4)', borderTop: `1px solid ${color.creamBorder}` }}>
            Absent — {absent.length}
          </p>
          {absent.map((r, i) => <MemberRow key={i} r={r} isLast={i === absent.length - 1} />)}
        </>
      )}
    </div>
  )
}

// ── Class row (expandable) ────────────────────────────────────
function ClassRow({ cls, isMobile }) {
  const [expanded, setExpanded] = useState(false)

  if (isMobile) {
    // Card layout on mobile
    return (
      <div style={{ background: color.white, borderRadius: radius.lg, border: `1px solid ${color.creamBorder}`, marginBottom: '8px', overflow: 'hidden' }}>
        <button
          onClick={() => setExpanded(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 16px', width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.ink, margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {cls.className}
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: fontSize.xs, color: color.success, fontWeight: '600', fontFamily: font.body }}>
                {cls.presentCount} present
              </span>
              <span style={{ fontSize: fontSize.xs, color: color.error, fontWeight: '600', fontFamily: font.body }}>
                {cls.absentCount} absent
              </span>
              {cls.offering > 0 && (
                <span style={{ fontSize: fontSize.xs, color: color.goldDark, fontWeight: '600', fontFamily: font.body }}>
                  {formatNaira(cls.offering)}
                </span>
              )}
            </div>
          </div>
          <ChevronDown size={16} color={color.inkSubtle} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
        </button>
        {expanded && <MemberList records={cls.records} />}
      </div>
    )
  }

  // Desktop table row
  return (
    <>
      <tr
        onClick={() => setExpanded(p => !p)}
        style={{ cursor: 'pointer', transition: 'background 0.1s' }}
        onMouseEnter={e => { e.currentTarget.style.background = color.cream }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <td style={{ padding: '13px 16px', fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', color: color.ink }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ChevronDown size={14} color={color.inkSubtle} style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
            {cls.className}
          </div>
        </td>
        <td style={{ padding: '13px 16px', fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.success }}>
          {cls.presentCount}
        </td>
        <td style={{ padding: '13px 16px', fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.error }}>
          {cls.absentCount}
        </td>
        <td style={{ padding: '13px 16px', fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: color.goldDark, whiteSpace: 'nowrap' }}>
          {cls.offering > 0 ? formatNaira(cls.offering) : '—'}
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={4} style={{ padding: 0, borderTop: `1px solid ${color.creamBorder}` }}>
            <MemberList records={cls.records} />
          </td>
        </tr>
      )}
    </>
  )
}

// ── Sunday detail ─────────────────────────────────────────────
function SundayDetail({ date, onBack, adminInfo }) {
  const [data,        setData]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [isMobile,    setIsMobile]    = useState(false)
  const [generating,  setGenerating]  = useState(false)

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch(`/api/admin/sunday-records?date=${date}`)
      .then(r => r.json())
      .then(d => {
        console.log('[SundayDetail] data:', d)
        setData(d)
        setLoading(false)
      })
      .catch(err => { console.error(err); setLoading(false) })
  }, [date])

  async function handleGeneratePDF() {
    if (!data) return
    setGenerating(true)
    try {
      const { generateSundayPDF } = await import('@/lib/generatePDF')
      await generateSundayPDF({
        date,
        churchName: adminInfo?.churchName || 'Sunday School',
        adminName:  adminInfo?.adminName  || '',
        classes:    data.classes,
        groups:     data.groups || [],
      })
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  // Group classes by group name
  const grouped = {}
  const notSub  = data?.notSubmitted || []
  for (const cls of (data?.classes || [])) {
    const g = cls.groupName || 'General'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(cls)
  }
  const groupKeys = Object.keys(grouped).sort()

  if (loading) {
    return (
      <div>
        <button onClick={onBack} style={backBtnStyle}>
          <ArrowLeft size={16} /> Back to Records
        </button>
        <SkeletonList count={3} height={80} />
      </div>
    )
  }

  if (!data) return null

  return (
    <div>
      {/* Back + Generate PDF */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <button onClick={onBack} style={backBtnStyle}>
          <ArrowLeft size={16} /> Back to Records
        </button>
        <button
          onClick={handleGeneratePDF}
          disabled={generating}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '6px',
            height:       '40px',
            padding:      '0 18px',
            background:   generating ? color.creamDark : color.navy,
            color:        generating ? color.inkMuted : color.cream,
            border:       'none',
            borderRadius: radius.md,
            cursor:       generating ? 'not-allowed' : 'pointer',
            fontSize:     fontSize.sm,
            fontWeight:   '700',
            fontFamily:   font.body,
            width:        isMobile ? '100%' : 'auto',
            justifyContent: isMobile ? 'center' : 'flex-start',
          }}
        >
          <FileText size={15} /> {generating ? 'Generating…' : 'Generate Report'}
        </button>
      </div>

      <h2 style={{ fontFamily: font.heading, fontSize: isMobile ? fontSize.lg : fontSize.xl, fontWeight: '800', color: color.ink, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
        {formatDateLong(date)}
      </h2>

      {/* Summary — 2×2 on mobile, row on desktop */}
      <div style={{
        display:             'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap:                 '10px',
        marginBottom:        '24px',
      }}>
        <StatCard label="Total Present"  value={data.totalPresent.toLocaleString()}        c={color.success}  />
        <StatCard label="Total Absent"   value={data.totalAbsent.toLocaleString()}         c={color.error}    />
        <StatCard label="Total Offering" value={formatNaira(data.totalOffering)}           c={color.goldDark} />
        <StatCard label="Classes"        value={`${data.classCount} submitted`}            c={color.navy}     />
      </div>

      {/* Class breakdown */}
      {groupKeys.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px', background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}` }}>
          <p style={{ fontSize: fontSize.sm, color: color.inkMuted, fontFamily: font.body, margin: 0 }}>No approved records for this Sunday.</p>
        </div>
      ) : isMobile ? (
        // Mobile: cards per class
        <div>
          {groupKeys.map(group => (
            <div key={group} style={{ marginBottom: '20px' }}>
              <p style={{
                fontSize: fontSize.xs, fontWeight: '700', color: color.navy,
                textTransform: 'uppercase', letterSpacing: '0.08em',
                margin: '0 0 8px', fontFamily: font.body,
              }}>
                {group} · {grouped[group].length} class{grouped[group].length !== 1 ? 'es' : ''}
              </p>
              {grouped[group].map((cls, i) => (
                <ClassRow key={i} cls={cls} isMobile />
              ))}
            </div>
          ))}
          {notSub.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontFamily: font.body }}>
                Not Submitted
              </p>
              {notSub.map((c, i) => (
                <div key={i} style={{ background: color.creamDark, borderRadius: radius.md, padding: '12px 16px', marginBottom: '6px' }}>
                  <p style={{ fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', color: color.inkMuted, margin: 0 }}>
                    {c.className}
                  </p>
                  <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: '2px 0 0', fontFamily: font.body }}>
                    {c.groupName} · No submission
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Desktop: proper table
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
          {groupKeys.map((group, gi) => (
            <div key={group}>
              {/* Group header row */}
              <div style={{
                padding:     '8px 16px',
                background:  color.cream,
                borderBottom:`1px solid ${color.creamBorder}`,
                borderTop:   gi > 0 ? `2px solid ${color.creamBorder}` : 'none',
                display:     'flex',
                alignItems:  'center',
                gap:         '8px',
              }}>
                <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.navy, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: font.body }}>
                  {group}
                </span>
                <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, background: color.creamDark, padding: '1px 8px', borderRadius: radius.full }}>
                  {grouped[group].length} class{grouped[group].length !== 1 ? 'es' : ''}
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                {gi === 0 && (
                  <thead>
                    <tr style={{ background: color.cream }}>
                      {['Class', 'Present', 'Absent', 'Offering'].map(h => (
                        <th key={h} style={{
                          padding:       '10px 16px',
                          fontSize:      fontSize['2xs'],
                          fontWeight:    '700',
                          color:         color.inkSubtle,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          textAlign:     'left',
                          fontFamily:    font.body,
                          borderBottom:  `1px solid ${color.creamBorder}`,
                        }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {grouped[group].map((cls, i) => (
                    <ClassRow key={i} cls={cls} isMobile={false} />
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Not submitted section */}
          {notSub.length > 0 && (
            <div style={{ borderTop: `2px solid ${color.creamBorder}` }}>
              <div style={{ padding: '8px 16px', background: color.creamDark }}>
                <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: font.body }}>
                  Not Submitted — {notSub.length}
                </span>
              </div>
              {notSub.map((c, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderBottom: i < notSub.length - 1 ? `1px solid ${color.creamBorder}` : 'none' }}>
                  <p style={{ flex: 1, fontFamily: font.body, fontSize: fontSize.sm, color: color.inkMuted, margin: 0 }}>{c.className}</p>
                  <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body }}>{c.groupName}</span>
                  <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontStyle: 'italic', fontFamily: font.body }}>No submission</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Month list ────────────────────────────────────────────────
export default function AdminRecordsPage() {
  const now  = new Date()
  const [month,      setMonth]      = useState(now.getMonth() + 1)
  const [year,       setYear]       = useState(now.getFullYear())
  const [sundays,    setSundays]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [selected,   setSelected]   = useState(null)
  const [adminInfo,  setAdminInfo]  = useState(null)
  const [isMobile,   setIsMobile]   = useState(false)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    function check() { setIsMobile(window.innerWidth < 768) }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  useEffect(() => {
    fetch('/api/admin/me')
      .then(r => r.json())
      .then(d => { if (d.adminName) setAdminInfo(d) })
      .catch(() => {})
  }, [])

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/admin/sunday-records?month=${month}&year=${year}`)
    const data = await res.json()
    if (res.ok) setSundays(data.sundays || [])
    setLoading(false)
  }, [month, year])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  async function handleGenerateMonthPDF() {
    if (!sundays.length) return
    setGenerating(true)
    try {
      const { generateMonthPDF } = await import('@/lib/generatePDF')
      await generateMonthPDF({
        month, year,
        churchName: adminInfo?.churchName || 'Sunday School',
        adminName:  adminInfo?.adminName  || '',
        sundays,
        groups:     [],
      })
    } catch (err) {
      console.error('PDF error:', err)
      alert('PDF generation failed: ' + err.message)
    } finally {
      setGenerating(false)
    }
  }

  if (selected) {
    return (
      <SundayDetail
        date={selected}
        adminInfo={adminInfo}
        onBack={() => { setSelected(null); fetchRecords() }}
      />
    )
  }

  const years = Array.from({ length: 5 }, (_, i) => now.getFullYear() - i)

  return (
    <div>
      <PageHeader title="Records" subtitle="Complete Sunday School attendance history" />

      {/* Controls row — compact on mobile */}
      <div style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '10px',
        marginBottom:   '20px',
        flexWrap:       'wrap',
      }}>
        {/* Month selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '160px' }}>
          <button
            onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1) } else setMonth(m => m - 1) }}
            style={navBtn}
          >
            <ChevronLeft size={16} color={color.navy} />
          </button>
          <select
            value={month}
            onChange={e => setMonth(Number(e.target.value))}
            style={selectStyle}
          >
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={e => setYear(Number(e.target.value))}
            style={{ ...selectStyle, width: '80px' }}
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button
            onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1) } else setMonth(m => m + 1) }}
            style={navBtn}
          >
            <ChevronRight size={16} color={color.navy} />
          </button>
        </div>

        {/* Generate month PDF */}
        {sundays.length > 0 && (
          <button
            onClick={handleGenerateMonthPDF}
            disabled={generating}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '6px',
              height:       '40px',
              padding:      '0 16px',
              background:   generating ? color.creamDark : color.navy,
              color:        generating ? color.inkMuted : color.cream,
              border:       'none',
              borderRadius: radius.md,
              cursor:       generating ? 'not-allowed' : 'pointer',
              fontSize:     fontSize.sm,
              fontWeight:   '700',
              fontFamily:   font.body,
              flexShrink:   0,
              whiteSpace:   'nowrap',
            }}
          >
            <FileText size={14} /> {generating ? 'Generating…' : 'Monthly Report'}
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonList count={4} height={80} />
      ) : sundays.length === 0 ? (
        <EmptyState
          icon={<Calendar size={28} />}
          title="No records for this month"
          message="Approved attendance submissions will appear here."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {sundays.map(s => (
            <button
              key={s.date}
              onClick={() => setSelected(s.date)}
              style={{
                display:      'flex',
                alignItems:   'center',
                justifyContent:'space-between',
                padding:      '16px 18px',
                background:   color.white,
                border:       `1px solid ${color.creamBorder}`,
                borderRadius: radius.xl,
                cursor:       'pointer',
                width:        '100%',
                textAlign:    'left',
                boxShadow:    shadow.card,
                gap:          '12px',
                transition:   'all 0.12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color.navy; e.currentTarget.style.boxShadow = shadow.hover }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = color.creamBorder; e.currentTarget.style.boxShadow = shadow.card }}
            >
              {/* Date */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {formatDateShort(s.date)}
                </p>
                <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: 0, fontFamily: font.body }}>
                  {s.classes} class{s.classes !== 1 ? 'es' : ''} approved
                </p>
              </div>

              {/* Pills */}
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'nowrap', flexShrink: 0 }}>
                <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.success, background: color.successBg, border: `1px solid ${color.successBorder}`, padding: '3px 10px', borderRadius: radius.full, whiteSpace: 'nowrap' }}>
                  {s.present} present
                </span>
                <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.goldDark, background: color.goldLight, border: `1px solid rgba(201,168,76,0.3)`, padding: '3px 10px', borderRadius: radius.full, whiteSpace: 'nowrap' }}>
                  {formatNaira(s.offering)}
                </span>
                <ChevronRight size={15} color={color.inkSubtle} style={{ flexShrink: 0 }} />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const backBtnStyle = {
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
  padding:    0,
}

const navBtn = {
  background:     color.white,
  border:         `1px solid ${color.creamBorder}`,
  borderRadius:   radius.md,
  width:          '36px',
  height:         '36px',
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  cursor:         'pointer',
  flexShrink:     0,
}

const selectStyle = {
  height:       '36px',
  padding:      '0 10px',
  fontFamily:   font.body,
  fontSize:     fontSize.sm,
  fontWeight:   '600',
  color:        color.ink,
  background:   color.white,
  border:       `1px solid ${color.creamBorder}`,
  borderRadius: radius.md,
  outline:      'none',
  cursor:       'pointer',
  flex:         1,
}