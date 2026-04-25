'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  ChevronLeft, ChevronRight, ArrowLeft,
  Users, DollarSign, Calendar, FileText,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import EmptyState from '@/components/class/ui/EmptyState'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(str))
}
function formatShort(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date(str))
}
function formatNaira(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function StatCard({ icon, label, value, c }) {
  return (
    <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '18px 20px', flex: 1, minWidth: '130px' }}>
      <div style={{ width: '36px', height: '36px', borderRadius: radius.md, background: `${c}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px', color: c }}>
        {icon}
      </div>
      <p style={{ fontFamily: font.heading, fontSize: fontSize['2xl'], fontWeight: '800', color: c, margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: 0, fontFamily: font.body }}>{label}</p>
    </div>
  )
}

function MemberRow({ record, isLast }) {
  const name = record.member_type === 'visitor'
    ? (record.visitor_name || 'First Timer')
    : (record.members?.full_name || `${record.members?.first_name || ''} ${record.members?.last_name || ''}`.trim() || '—')

  const isPresent = record.attendance === 'present'

  return (
    <div style={{
      display:     'flex',
      alignItems:  'center',
      gap:         '12px',
      padding:     '10px 16px',
      borderBottom: isLast ? 'none' : `1px solid ${color.creamBorder}`,
      background:  isPresent ? 'transparent' : 'rgba(254,242,242,0.3)',
    }}>
      <div style={{
        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
        background: isPresent ? `linear-gradient(135deg, ${color.navy}, ${color.navyLight})` : color.creamDark,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '10px', fontWeight: '700', fontFamily: font.heading,
        color: isPresent ? color.cream : color.inkMuted,
      }}>
        {name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'}
      </div>
      <p style={{ flex: 1, fontSize: fontSize.sm, fontWeight: '600', color: color.ink, margin: 0, fontFamily: font.body, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {name}
        {record.member_type === 'visitor' && (
          <span style={{ marginLeft: '6px', fontSize: fontSize['2xs'], color: color.goldDark, fontWeight: '600' }}>(FT)</span>
        )}
      </p>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {isPresent && [
          record.on_time      && { label: 'On Time', c: color.navy      },
          record.bible        && { label: 'Bible',   c: color.navyLight  },
          record.memory_verse && { label: 'Verse',   c: '#7C3AED'       },
        ].filter(Boolean).map(b => (
          <span key={b.label} style={{ fontSize: fontSize['2xs'], color: b.c, background: `${b.c}10`, padding: '2px 6px', borderRadius: radius.full, fontWeight: '600' }}>
            {b.label}
          </span>
        ))}
        {isPresent && record.offering > 0 && (
          <span style={{ fontSize: fontSize['2xs'], color: color.goldDark, background: color.goldLight, padding: '2px 6px', borderRadius: radius.full, fontWeight: '600' }}>
            {formatNaira(record.offering)}
          </span>
        )}
        {!isPresent && (
          <span style={{ fontSize: fontSize['2xs'], color: color.error, fontWeight: '600' }}>Absent</span>
        )}
      </div>
    </div>
  )
}

function ClassAccordion({ cls }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ background: color.white, borderRadius: radius.lg, border: `1px solid ${color.creamBorder}`, overflow: 'hidden', marginBottom: '8px' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 16px',
          width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 3px' }}>
            {cls.className}
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {cls.groupName && (
              <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, background: color.creamDark, padding: '1px 8px', borderRadius: radius.full }}>{cls.groupName}</span>
            )}
            <span style={{ fontSize: fontSize.xs, color: color.inkSubtle }}>{cls.presentCount}/{cls.recordCount} present</span>
            {cls.offering > 0 && (
              <span style={{ fontSize: fontSize.xs, color: color.goldDark, fontWeight: '600' }}>{formatNaira(cls.offering)}</span>
            )}
          </div>
        </div>
        <ChevronRight size={16} color={color.inkSubtle} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }} />
      </button>

      {open && cls.records.length > 0 && (
        <div style={{ borderTop: `1px solid ${color.creamBorder}` }}>
          {cls.records.map((r, i) => (
            <MemberRow key={i} record={r} isLast={i === cls.records.length - 1} />
          ))}
        </div>
      )}
    </div>
  )
}

function SundayDetail({ date, onBack }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/sunday-records?date=${date}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [date])

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '0 0 20px' }}>
        <ArrowLeft size={16} /> Back to Records
      </button>

      {loading ? (
        <SkeletonList count={3} height={80} />
      ) : data ? (
        <>
          <h2 style={{ fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800', color: color.ink, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
            {formatDate(date)}
          </h2>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <StatCard icon={<Users size={18} />}      label="Total Present"  value={data.totalPresent.toLocaleString()} c={color.success}  />
            <StatCard icon={<Users size={18} />}      label="Total Absent"   value={data.totalAbsent.toLocaleString()}  c={color.error}    />
            <StatCard icon={<DollarSign size={18} />} label="Total Offering" value={formatNaira(data.totalOffering)}    c={color.goldDark} />
          </div>

          <h3 style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 12px' }}>
            {data.classes.length} Classes
          </h3>

          {data.classes.map((cls, i) => (
            <ClassAccordion key={i} cls={cls} />
          ))}
        </>
      ) : (
        <p style={{ color: color.inkMuted, fontFamily: font.body }}>No data found.</p>
      )}
    </div>
  )
}

export default function AdminRecordsPage() {
  const now   = new Date()
  const [month,    setMonth]    = useState(now.getMonth() + 1)
  const [year,     setYear]     = useState(now.getFullYear())
  const [sundays,  setSundays]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [selected, setSelected] = useState(null)

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    const res  = await fetch(`/api/admin/sunday-records?month=${month}&year=${year}`)
    const data = await res.json()
    if (res.ok) setSundays(data.sundays || [])
    setLoading(false)
  }, [month, year])

  useEffect(() => { fetchRecords() }, [fetchRecords])

  function prevMonth() {
    if (month === 1) { setMonth(12); setYear(y => y - 1) }
    else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 12) { setMonth(1); setYear(y => y + 1) }
    else setMonth(m => m + 1)
  }

  if (selected) {
    return (
      <div>
        <SundayDetail date={selected} onBack={() => { setSelected(null); fetchRecords() }} />
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Records" subtitle="Complete Sunday School attendance history" />

      {/* Month navigator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`,
        padding: '12px 16px', marginBottom: '20px', width: 'fit-content',
      }}>
        <button onClick={prevMonth} style={{ background: color.cream, border: 'none', borderRadius: radius.md, width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={18} color={color.navy} />
        </button>
        <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: color.ink, margin: 0, minWidth: '160px', textAlign: 'center' }}>
          {MONTHS[month - 1]} {year}
        </p>
        <button onClick={nextMonth} style={{ background: color.cream, border: 'none', borderRadius: radius.md, width: '34px', height: '34px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronRight size={18} color={color.navy} />
        </button>
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
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px', padding: '10px 20px', background: color.cream, borderBottom: `1px solid ${color.creamBorder}` }}>
            {['Date', 'Present', 'Absent', 'Offering', ''].map((h, i) => (
              <p key={i} style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, letterSpacing: '0.06em', textTransform: 'uppercase', margin: 0, fontFamily: font.body }}>{h}</p>
            ))}
          </div>

          {sundays.map((s, i) => (
            <button
              key={s.date}
              onClick={() => setSelected(s.date)}
              style={{
                display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr auto', gap: '8px',
                padding: '14px 20px', background: 'transparent', border: 'none',
                borderBottom: i < sundays.length - 1 ? `1px solid ${color.creamBorder}` : 'none',
                cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.12s',
                alignItems: 'center',
              }}
              onMouseEnter={e => e.currentTarget.style.background = color.cream}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>
                <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 2px' }}>
                  {formatShort(s.date)}
                </p>
                <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: 0, fontFamily: font.body }}>
                  {s.classes} class{s.classes !== 1 ? 'es' : ''} approved
                </p>
              </div>
              <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.success, margin: 0 }}>{s.present}</p>
              <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.error, margin: 0 }}>{s.absent}</p>
              <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.goldDark, margin: 0, whiteSpace: 'nowrap' }}>{formatNaira(s.offering)}</p>
              <ChevronRight size={16} color={color.inkSubtle} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}