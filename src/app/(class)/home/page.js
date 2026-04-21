'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BookOpen, ChevronRight, Clock, Check } from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

// ── Mock data ─────────────────────────────────────────────────
const MOCK = {
  className:   'Youth A',
  church:      'Covenant Chapel · Lagos',
  isOpen:      true,
  closesAt:    '11:59 PM',
  date:        'Sunday, 15 June 2025',
  attendanceDone: true,
  summary: {
    present:     18,
    total:       24,
    onTime:      12,
    bible:       15,
    memoryVerse: 10,
    offering:    14500,
  },
  absentMembers: [
    { id: 'a1', name: 'Ngozi Okafor' },
    { id: 'a2', name: 'Amara Okonkwo' },
    { id: 'a3', name: 'Chidi Eze' },
    { id: 'a4', name: 'Kelechi Onu' },
    { id: 'a5', name: 'Tochi Ibe' },
    { id: 'a6', name: 'Blessing Uche' },
  ],
}

// ── Session badge (in topbar) ─────────────────────────────────
function SessionBadge({ isOpen }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '6px',
      background: isOpen ? 'rgba(22,163,74,0.18)' : 'rgba(217,119,6,0.18)',
      borderRadius: radius.full, padding: '5px 12px',
    }}>
      <div style={{
        width: '7px', height: '7px', borderRadius: '50%',
        background: isOpen ? color.success : color.warning,
        boxShadow: isOpen ? '0 0 0 2px rgba(22,163,74,0.3)' : 'none',
      }} />
      <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: isOpen ? '#86EFAC' : '#FDE68A' }}>
        {isOpen ? 'Open' : 'Closed'}
      </span>
    </div>
  )
}

// ── Summary card ──────────────────────────────────────────────
function SummaryCard({ date, summary }) {
  const { present, total, onTime, bible, memoryVerse, offering } = summary
  const pct = Math.round((present / total) * 100)
  const rateColor = pct >= 75 ? color.success : pct >= 50 ? color.warning : color.error

  const rows = [
    { icon: '👥', label: 'Present',      value: `${present} / ${total}`, color: rateColor },
    { icon: '⏰', label: 'On Time',      value: onTime,                  color: color.navy },
    { icon: '📖', label: 'Bible',        value: bible,                   color: color.navyLite },
    { icon: '✝️', label: 'Memory Verse', value: memoryVerse,             color: '#7C3AED' },
    { icon: '💰', label: 'Total Offering',value: `₦${offering.toLocaleString('en-NG')}`, color: color.goldDark },
  ]

  return (
    <div style={{
      background: color.white,
      borderRadius: radius.lg,
      boxShadow: shadow.card,
      overflow: 'hidden',
    }}>
      {/* Card header */}
      <div style={{
        background: color.navy,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: 'rgba(245,240,232,0.5)', letterSpacing: '0.07em', margin: '0 0 2px', textTransform: 'uppercase' }}>
            Sunday Summary
          </p>
          <p style={{ fontFamily: font.display, fontSize: fontSize.md, fontWeight: '700', color: color.cream, margin: 0 }}>
            {date}
          </p>
        </div>
        <div style={{
          background: `${rateColor}22`,
          borderRadius: radius.full,
          padding: '6px 14px',
          border: `1px solid ${rateColor}44`,
        }}>
          <span style={{ fontSize: fontSize.sm, fontWeight: '700', color: rateColor }}>
            {pct}%
          </span>
        </div>
      </div>

      {/* Stats rows */}
      <div style={{ padding: '4px 0' }}>
        {rows.map((row, i) => (
          <div key={row.label} style={{
            display: 'flex',
            alignItems: 'center',
            padding: '13px 20px',
            borderBottom: i < rows.length - 1 ? `1px solid ${color.creamDark}` : 'none',
            gap: '12px',
          }}>
            <span style={{ fontSize: '18px', lineHeight: 1, width: '24px', textAlign: 'center' }}>
              {row.icon}
            </span>
            <span style={{ flex: 1, fontSize: fontSize.base, color: color.mist }}>
              {row.label}
            </span>
            <span style={{ fontSize: fontSize.md, fontWeight: '700', color: row.color }}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Absent members + follow-up ────────────────────────────────
function AbsentFollowUp({ members }) {
  const [reached, setReached] = useState({})

  function toggle(id) {
    setReached(p => ({ ...p, [id]: !p[id] }))
  }

  const reachedCount = Object.values(reached).filter(Boolean).length

  return (
    <div style={{
      background: color.white,
      borderRadius: radius.lg,
      boxShadow: shadow.card,
      overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${color.creamDark}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div>
          <p style={{ fontFamily: font.display, fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: '0 0 2px' }}>
            Absent This Sunday
          </p>
          <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>
            {members.length} members · {reachedCount} reached
          </p>
        </div>
        {reachedCount > 0 && (
          <div style={{
            background: color.successBg,
            borderRadius: radius.full,
            padding: '4px 12px',
            border: `1px solid ${color.successBorder}`,
          }}>
            <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.success }}>
              {reachedCount}/{members.length} ✓
            </span>
          </div>
        )}
      </div>

      {/* Members list */}
      <div>
        {members.map((m, i) => {
          const isReached = !!reached[m.id]
          return (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '14px 20px',
                width: '100%',
                background: isReached ? color.successBg : 'transparent',
                border: 'none',
                borderBottom: i < members.length - 1 ? `1px solid ${color.creamDark}` : 'none',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: isReached ? color.successBg : color.creamDark,
                border: `2px solid ${isReached ? color.success : color.creamDark}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s ease',
              }}>
                <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: isReached ? color.success : color.mist }}>
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>

              {/* Name */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: fontSize.base,
                  fontWeight: '600',
                  color: isReached ? color.success : color.navy,
                  margin: 0,
                  textDecoration: isReached ? 'none' : 'none',
                  transition: 'color 0.2s ease',
                }}>
                  {m.name}
                </p>
                <p style={{ fontSize: fontSize.sm, color: color.mist, margin: '2px 0 0' }}>
                  {isReached ? 'Reached out ✓' : 'Tap to mark as reached'}
                </p>
              </div>

              {/* Checkbox */}
              <div style={{
                width: '28px', height: '28px', borderRadius: '8px',
                border: `2px solid ${isReached ? color.success : color.creamDark}`,
                background: isReached ? color.success : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s ease',
              }}>
                {isReached && <Check size={15} color="#fff" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────
export default function ClassHomePage() {
  const router = useRouter()
  const { className, church, isOpen, closesAt, date, attendanceDone, summary, absentMembers } = MOCK

  return (
    <ClassShell
      className={className}
      churchName={church}
      rightElement={<SessionBadge isOpen={isOpen} />}
    >
      <div style={{
        flex: 1,
        padding: '20px 16px 40px',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}>

        {/* Session status banner */}
        {isOpen ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: color.successBg,
            border: `1px solid ${color.successBorder}`,
            borderRadius: radius.md, padding: '14px 18px',
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color.success, flexShrink: 0, boxShadow: `0 0 0 3px rgba(22,163,74,0.2)` }} />
            <div>
              <p style={{ fontSize: fontSize.base, fontWeight: '700', color: '#15803D', margin: 0 }}>Session is Open</p>
              <p style={{ fontSize: fontSize.sm, color: '#166534', margin: '2px 0 0' }}>Closes at {closesAt}</p>
            </div>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: color.warningBg, border: `1px solid #FDE68A`,
            borderRadius: radius.md, padding: '14px 18px',
          }}>
            <Clock size={18} color={color.warning} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: fontSize.base, fontWeight: '700', color: '#92400E', margin: 0 }}>Session Closed</p>
              <p style={{ fontSize: fontSize.sm, color: '#92400E', margin: '2px 0 0' }}>Opens next Sunday at 6:00 AM</p>
            </div>
          </div>
        )}

        {/* Take Attendance button */}
        <button
          onClick={() => router.push('/attendance')}
          disabled={!isOpen}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: isOpen ? color.navy : color.creamDark,
            borderRadius: radius.lg, padding: '20px',
            border: 'none', cursor: isOpen ? 'pointer' : 'not-allowed',
            opacity: isOpen ? 1 : 0.6,
            width: '100%', textAlign: 'left',
            boxShadow: isOpen ? shadow.hover : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          <div style={{
            width: '52px', height: '52px', borderRadius: '14px',
            background: 'rgba(245,240,232,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <BookOpen size={26} color={color.cream} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontFamily: font.display, fontSize: fontSize.md, fontWeight: '700', color: color.cream, margin: '0 0 3px' }}>
              {attendanceDone ? 'Edit Attendance' : 'Take Attendance'}
            </p>
            <p style={{ fontSize: fontSize.sm, color: 'rgba(245,240,232,0.55)', margin: 0 }}>
              {attendanceDone ? 'Already submitted today' : 'Mark present, offering & more'}
            </p>
          </div>
          {attendanceDone && (
            <div style={{ background: color.success, borderRadius: radius.full, padding: '4px 12px' }}>
              <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: '#fff' }}>✓ Done</span>
            </div>
          )}
        </button>

        {/* Sunday Summary Card */}
        {attendanceDone && <SummaryCard date={date} summary={summary} />}

        {/* Absent + Follow-up */}
        {attendanceDone && absentMembers.length > 0 && (
          <AbsentFollowUp members={absentMembers} />
        )}

        {/* Empty state when session not yet done */}
        {!attendanceDone && isOpen && (
          <div style={{
            background: color.white, borderRadius: radius.lg,
            boxShadow: shadow.card, padding: '32px 20px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: '36px', margin: '0 0 12px' }}>📋</p>
            <p style={{ fontFamily: font.display, fontSize: fontSize.lg, color: color.navy, margin: '0 0 6px' }}>
              Ready for today
            </p>
            <p style={{ fontSize: fontSize.base, color: color.mist, margin: 0, lineHeight: 1.6 }}>
              Take attendance to see today's summary and follow-up list.
            </p>
          </div>
        )}

      </div>
    </ClassShell>
  )
}