'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, X, Check, Clock, Book, Mic } from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

const MOCK_MEMBERS = [
  { id: '1', firstName: 'Adaeze',   lastName: 'Obi' },
  { id: '2', firstName: 'Chidi',    lastName: 'Eze' },
  { id: '3', firstName: 'Ngozi',    lastName: 'Okafor' },
  { id: '4', firstName: 'Emeka',    lastName: 'Nwosu' },
  { id: '5', firstName: 'Blessing', lastName: 'Uche' },
  { id: '6', firstName: 'Kelechi',  lastName: 'Onu' },
  { id: '7', firstName: 'Tochi',    lastName: 'Ibe' },
  { id: '8', firstName: 'Amara',    lastName: 'Okonkwo' },
]

// attendance: null = neutral, true = present, false = absent
function defaultRecord() {
  return { attendance: null, onTime: false, bible: false, memoryVerse: false, offering: '' }
}

// ── 3-state attendance button ─────────────────────────────────
// null → true → false → null
function AttendanceToggle({ value, onChange }) {
  function next() {
    if (value === null)  return onChange(true)
    if (value === true)  return onChange(false)
    if (value === false) return onChange(null)
  }

  const config = {
    null: {
      label: 'Mark',
      bg: 'transparent',
      border: color.creamDark,
      color: color.mist,
      icon: null,
    },
    true: {
      label: 'Present',
      bg: color.successBg,
      border: color.success,
      color: color.success,
      icon: <Check size={14} strokeWidth={3} />,
    },
    false: {
      label: 'Absent',
      bg: color.errorBg,
      border: color.error,
      color: color.error,
      icon: <X size={14} strokeWidth={3} />,
    },
  }

  const key = value === null ? 'null' : value === true ? 'true' : 'false'
  const c = config[key]

  return (
    <button
      onClick={next}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        height: '36px', padding: '0 14px',
        borderRadius: radius.full,
        border: `2px solid ${c.border}`,
        background: c.bg,
        color: c.color,
        cursor: 'pointer',
        fontFamily: font.body,
        fontSize: fontSize.sm,
        fontWeight: '700',
        flexShrink: 0,
        transition: 'all 0.2s ease',
        minWidth: '90px',
        justifyContent: 'center',
      }}
    >
      {c.icon}
      {c.label}
    </button>
  )
}

// ── Chip toggle ───────────────────────────────────────────────
function Chip({ checked, onChange, label, icon, activeColor, disabled }) {
  return (
    <button
      onClick={() => !disabled && onChange()}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '5px',
        height: '34px', padding: '0 12px',
        borderRadius: radius.full,
        border: `1.5px solid ${checked && !disabled ? activeColor : color.creamDark}`,
        background: checked && !disabled ? `${activeColor}15` : 'transparent',
        color: checked && !disabled ? activeColor : color.mist,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.38 : 1,
        fontFamily: font.body,
        fontSize: fontSize.sm,
        fontWeight: '600',
        whiteSpace: 'nowrap',
        transition: 'all 0.2s ease',
        flexShrink: 0,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  )
}

// ── Member card ───────────────────────────────────────────────
function MemberCard({ member, record, onChange, isVisitor, onRemove }) {
  const isPresent = record.attendance === true
  const isAbsent  = record.attendance === false
  const isNeutral = record.attendance === null

  function handleAttendance(val) {
    if (val !== true) {
      // Clear dependent fields when not present
      onChange({ ...record, attendance: val, onTime: false, bible: false, memoryVerse: false, offering: '' })
    } else {
      onChange({ ...record, attendance: val })
    }
  }

  return (
    <div style={{
      background: color.white,
      borderRadius: radius.lg,
      boxShadow: shadow.card,
      overflow: 'hidden',
      borderLeft: isPresent
        ? `4px solid ${color.success}`
        : isAbsent
        ? `4px solid ${color.error}`
        : isVisitor
        ? `4px solid ${color.gold}`
        : `4px solid transparent`,
      transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    }}>
      {/* Top: avatar + name + toggle */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '14px', padding: '16px 16px',
      }}>
        {/* Avatar */}
        <div style={{
          width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
          background: isPresent ? color.navy : isAbsent ? color.errorBg : color.creamDark,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s ease',
        }}>
          <span style={{
            fontSize: fontSize.sm, fontWeight: '700',
            color: isPresent ? color.cream : isAbsent ? color.error : color.mist,
          }}>
            {member.firstName[0]}{member.lastName ? member.lastName[0] : ''}
          </span>
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: font.display,
            fontSize: fontSize.md,
            fontWeight: '700',
            color: isPresent ? color.navy : isAbsent ? color.mist : color.navy,
            margin: 0,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {member.firstName} {member.lastName}
          </p>
          {isVisitor && (
            <span className="badge badge-amber" style={{ marginTop: '4px', fontSize: '11px' }}>First Timer</span>
          )}
          {isNeutral && (
            <p style={{ fontSize: fontSize.xs, color: color.mist, margin: '3px 0 0' }}>Not yet marked</p>
          )}
        </div>

        {/* Attendance 3-state toggle */}
        <AttendanceToggle value={record.attendance} onChange={handleAttendance} />

        {isVisitor && (
          <button onClick={onRemove} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0, marginLeft: '-8px' }}>
            <X size={16} color={color.mist} />
          </button>
        )}
      </div>

      {/* Bottom: chips + offering (only when present) */}
      {isPresent && (
        <div style={{
          padding: '0 16px 16px',
          display: 'flex', flexWrap: 'wrap', gap: '8px',
          alignItems: 'center',
          animation: 'slideUp 0.2s ease',
          borderTop: `1px solid ${color.creamDark}`,
          paddingTop: '12px',
        }}>
          <Chip
            checked={record.onTime}
            onChange={() => onChange({ ...record, onTime: !record.onTime })}
            label="On Time"
            icon={<Clock size={13} />}
            activeColor={color.navy}
          />
          <Chip
            checked={record.bible}
            onChange={() => onChange({ ...record, bible: !record.bible })}
            label="Bible"
            icon={<Book size={13} />}
            activeColor={color.navyLite}
          />
          <Chip
            checked={record.memoryVerse}
            onChange={() => onChange({ ...record, memoryVerse: !record.memoryVerse })}
            label="Verse"
            icon={<Mic size={13} />}
            activeColor="#7C3AED"
          />

          {/* Offering */}
          <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
            <span style={{
              position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
              fontSize: fontSize.base, fontWeight: '700', color: color.gold, pointerEvents: 'none', zIndex: 1,
            }}>₦</span>
            <input
              type="number" min="0" step="0.01" placeholder="0.00"
              value={record.offering}
              onChange={e => onChange({ ...record, offering: e.target.value })}
              style={{
                width: '100%', height: '36px',
                paddingLeft: '28px', paddingRight: '10px',
                fontSize: fontSize.base, fontWeight: '600', color: color.navy,
                background: color.cream,
                border: `1.5px solid ${color.creamDark}`,
                borderRadius: radius.sm, outline: 'none',
                fontFamily: font.body,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Add visitor sheet ─────────────────────────────────────────
function AddVisitorSheet({ onAdd, onClose }) {
  const [name, setName] = useState('')
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.55)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
      <div style={{ background: color.white, borderRadius: '24px 24px 0 0', padding: '8px 24px 48px', width: '100%', maxWidth: '560px', margin: '0 auto' }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: color.creamDark, margin: '14px auto 22px' }} />
        <h3 style={{ fontFamily: font.display, fontSize: fontSize.lg, color: color.navy, margin: '0 0 8px' }}>Add First Timer</h3>
        <p style={{ fontSize: fontSize.base, color: color.mist, margin: '0 0 20px' }}>
          Record attendance for a visitor not on your class list.
        </p>
        <input
          className="input" placeholder="Full name" value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && name.trim() && (onAdd(name.trim()), onClose())}
          autoFocus style={{ marginBottom: '14px', background: color.white }}
        />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" disabled={!name.trim()} onClick={() => { onAdd(name.trim()); onClose() }}>
            Add Visitor
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Submit sheet ──────────────────────────────────────────────
function SubmitSheet({ totals, onConfirm, onClose, loading }) {
  const rows = [
    { label: 'Present',       value: totals.present,     color: color.success },
    { label: 'Absent',        value: totals.absent,       color: color.error },
    { label: 'Unmarked',      value: totals.unmarked,     color: color.mist },
    { label: 'On Time',       value: totals.onTime,       color: color.navy },
    { label: 'With Bible',    value: totals.bible,        color: color.navyLite },
    { label: 'Memory Verse',  value: totals.memoryVerse,  color: '#7C3AED' },
    { label: 'First Timers',  value: totals.visitors,     color: color.gold },
    { label: 'Total Offering',value: `₦${totals.offering.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`, color: color.goldDark },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.55)', display: 'flex', alignItems: 'flex-end', zIndex: 50 }}>
      <div style={{ background: color.white, borderRadius: '24px 24px 0 0', padding: '8px 24px 48px', width: '100%', maxWidth: '560px', margin: '0 auto', maxHeight: '85vh', overflowY: 'auto' }}>
        <div style={{ width: '40px', height: '4px', borderRadius: '2px', background: color.creamDark, margin: '14px auto 22px' }} />
        <h3 style={{ fontFamily: font.display, fontSize: fontSize.lg, color: color.navy, margin: '0 0 6px' }}>Submit Attendance?</h3>
        <p style={{ fontSize: fontSize.base, color: color.mist, margin: '0 0 20px' }}>Review totals before submitting.</p>
        <div style={{ background: color.cream, borderRadius: radius.lg, padding: '4px 16px', marginBottom: '20px' }}>
          {rows.map((r, i) => (
            <div key={r.label} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '13px 0',
              borderBottom: i < rows.length - 1 ? `1px solid ${color.creamDark}` : 'none',
            }}>
              <span style={{ fontSize: fontSize.base, color: color.mist }}>{r.label}</span>
              <span style={{ fontSize: fontSize.md, fontWeight: '700', color: r.color }}>{r.value}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-full" onClick={onClose}>Go Back</button>
          <button className="btn btn-primary btn-full btn-lg" onClick={onConfirm} disabled={loading}>
            {loading ? 'Submitting…' : 'Confirm & Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function AttendancePage() {
  const router = useRouter()

  const [records, setRecords] = useState(() => {
    const m = {}
    MOCK_MEMBERS.forEach(mb => { m[mb.id] = defaultRecord() })
    return m
  })
  const [visitors, setVisitors]             = useState([])
  const [showAddVisitor, setShowAddVisitor] = useState(false)
  const [showSubmit, setShowSubmit]         = useState(false)
  const [submitted, setSubmitted]           = useState(false)
  const [loading, setLoading]               = useState(false)
  const [submittedTotals, setSubmittedTotals] = useState(null)

  function getTotals() {
    const allRec = [
      ...MOCK_MEMBERS.map(m => records[m.id]),
      ...visitors.map(v => v.record),
    ]
    const present   = allRec.filter(r => r.attendance === true).length
    const absent    = allRec.filter(r => r.attendance === false).length
    const unmarked  = allRec.filter(r => r.attendance === null).length
    const offering  = allRec.reduce((s, r) => s + (parseFloat(r.offering) || 0), 0)
    return {
      present, absent, unmarked,
      onTime:      allRec.filter(r => r.onTime).length,
      bible:       allRec.filter(r => r.bible).length,
      memoryVerse: allRec.filter(r => r.memoryVerse).length,
      offering,
      visitors: visitors.length,
      total: allRec.length,
    }
  }

  async function handleSubmit() {
    setLoading(true)
    const t = getTotals()
    await new Promise(r => setTimeout(r, 900))
    setSubmittedTotals(t)
    setSubmitted(true)
    setShowSubmit(false)
    setLoading(false)
  }

  const totals       = getTotals()
  const markedCount  = totals.present + totals.absent

  return (
    <ClassShell
      className="Youth A"
      churchName="Covenant Chapel · Lagos"
      rightElement={<span className="badge badge-green">OPEN</span>}
    >
      {/* Sub-header */}
      <div style={{
        background: color.white, borderBottom: `1px solid ${color.creamDark}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center', gap: '12px',
        position: 'sticky', top: 0, zIndex: 15,
      }}>
        <button
          onClick={() => router.push('/home')}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: fontSize.base, fontWeight: '600', color: color.navy, padding: 0, flexShrink: 0 }}
        >
          <ArrowLeft size={17} /> Back
        </button>
        <div style={{ width: '1px', height: '18px', background: color.creamDark }} />
        <p style={{ fontSize: fontSize.base, fontWeight: '700', color: color.navy, margin: 0, flex: 1 }}>
          Attendance
        </p>
        <span className="badge badge-mist">{MOCK_MEMBERS.length + visitors.length} members</span>
      </div>

      {/* Submitted banner */}
      {submitted && submittedTotals && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: color.successBg, padding: '14px 20px',
          borderBottom: `1px solid ${color.successBorder}`,
        }}>
          <Check size={18} color={color.success} />
          <p style={{ fontSize: fontSize.base, fontWeight: '700', color: color.success, margin: 0 }}>
            Submitted — {submittedTotals.present} present · ₦{submittedTotals.offering.toLocaleString('en-NG', { minimumFractionDigits: 2 })} offering
          </p>
        </div>
      )}

      {/* Member list */}
      <div style={{ flex: 1, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px', paddingBottom: '100px', maxWidth: '560px', width: '100%', margin: '0 auto' }}>
        {MOCK_MEMBERS.map(m => (
          <MemberCard
            key={m.id}
            member={m}
            record={records[m.id]}
            onChange={rec => setRecords(p => ({ ...p, [m.id]: rec }))}
          />
        ))}

        {visitors.map(v => (
          <MemberCard
            key={v.id}
            member={{ firstName: v.name, lastName: '' }}
            record={v.record}
            onChange={rec => setVisitors(p => p.map(x => x.id === v.id ? { ...x, record: rec } : x))}
            isVisitor
            onRemove={() => setVisitors(p => p.filter(x => x.id !== v.id))}
          />
        ))}

        {!submitted && (
          <button
            onClick={() => setShowAddVisitor(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              background: `rgba(201,168,76,0.07)`,
              border: `2px dashed ${color.gold}`,
              borderRadius: radius.lg, padding: '18px 20px',
              cursor: 'pointer', width: '100%',
            }}
          >
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `rgba(201,168,76,0.15)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Plus size={20} color={color.gold} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontSize: fontSize.base, fontWeight: '700', color: color.gold, margin: 0 }}>Add First Timer</p>
              <p style={{ fontSize: fontSize.sm, color: `${color.gold}99`, margin: '2px 0 0' }}>Record visitor attendance</p>
            </div>
          </button>
        )}
      </div>

      {/* Bottom bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: color.white, borderTop: `1px solid ${color.creamDark}`,
        padding: '14px 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 -4px 20px rgba(10,22,40,0.08)', zIndex: 10,
      }}>
        <div>
          <p style={{ fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: 0 }}>
            {totals.present} present
          </p>
          <p style={{ fontSize: fontSize.sm, color: color.mist, margin: '2px 0 0' }}>
            {markedCount}/{totals.total} marked · ₦{totals.offering.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
          </p>
        </div>
        {submitted ? (
          <span className="badge badge-green" style={{ fontSize: fontSize.sm, padding: '10px 18px' }}>
            ✓ Submitted
          </span>
        ) : (
          <button
            className="btn btn-primary btn-lg"
            onClick={() => setShowSubmit(true)}
            disabled={markedCount === 0}
            style={{ minWidth: '130px' }}
          >
            Submit
          </button>
        )}
      </div>

      {showAddVisitor && (
        <AddVisitorSheet
          onAdd={name => setVisitors(p => [...p, { id: `v-${Date.now()}`, name, record: defaultRecord() }])}
          onClose={() => setShowAddVisitor(false)}
        />
      )}
      {showSubmit && (
        <SubmitSheet
          totals={getTotals()}
          onConfirm={handleSubmit}
          onClose={() => setShowSubmit(false)}
          loading={loading}
        />
      )}
    </ClassShell>
  )
}