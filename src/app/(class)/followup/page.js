'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, Check } from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

const MOCK_FOLLOWUP = [
  {
    id: 'f1',
    date: 'Sunday, 15 June 2025',
    absentCount: 6,
    members: [
      { id: 'm1', name: 'Ngozi Okafor',  reached: false },
      { id: 'm2', name: 'Amara Okonkwo', reached: false },
      { id: 'm3', name: 'Chidi Eze',     reached: true  },
      { id: 'm4', name: 'Kelechi Onu',   reached: true  },
      { id: 'm5', name: 'Tochi Ibe',     reached: false },
      { id: 'm6', name: 'Blessing Uche', reached: true  },
    ],
  },
  {
    id: 'f2',
    date: 'Sunday, 8 June 2025',
    absentCount: 4,
    members: [
      { id: 'm7',  name: 'Chidi Eze',     reached: true  },
      { id: 'm8',  name: 'Kelechi Onu',   reached: true  },
      { id: 'm9',  name: 'Amara Okonkwo', reached: false },
      { id: 'm10', name: 'Ngozi Okafor',  reached: true  },
    ],
  },
  {
    id: 'f3',
    date: 'Sunday, 1 June 2025',
    absentCount: 3,
    members: [
      { id: 'm11', name: 'Tochi Ibe',     reached: true },
      { id: 'm12', name: 'Blessing Uche', reached: true },
      { id: 'm13', name: 'Chidi Eze',     reached: true },
    ],
  },
]

function SundayCard({ session }) {
  const [expanded, setExpanded]   = useState(session.id === 'f1') // open first by default
  const [members, setMembers]     = useState(session.members)

  const reached    = members.filter(m => m.reached).length
  const notReached = members.length - reached
  const allDone    = notReached === 0

  function toggle(id) {
    setMembers(p => p.map(m => m.id === id ? { ...m, reached: !m.reached } : m))
  }

  return (
    <div style={{
      background: color.white,
      borderRadius: radius.lg,
      boxShadow: shadow.card,
      overflow: 'hidden',
      borderLeft: `4px solid ${allDone ? color.success : color.navy}`,
    }}>
      {/* Header row */}
      <button
        onClick={() => setExpanded(p => !p)}
        style={{
          display: 'flex', alignItems: 'center', gap: '14px',
          padding: '18px 20px', width: '100%',
          background: 'transparent', border: 'none', cursor: 'pointer',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: font.display, fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: '0 0 6px' }}>
            {session.date}
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '4px',
              fontSize: fontSize.sm, fontWeight: '600',
              color: color.success,
            }}>
              <Check size={13} strokeWidth={3} />
              {reached} reached
            </span>
            {notReached > 0 && (
              <span style={{ fontSize: fontSize.sm, fontWeight: '600', color: color.error }}>
                · {notReached} not reached
              </span>
            )}
          </div>
        </div>

        {/* Progress pill */}
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <div style={{
            background: allDone ? color.successBg : color.cream,
            borderRadius: radius.full, padding: '5px 12px',
            border: `1px solid ${allDone ? color.successBorder : color.creamDark}`,
          }}>
            <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: allDone ? color.success : color.mist }}>
              {reached}/{members.length}
            </span>
          </div>
        </div>

        {expanded
          ? <ChevronUp size={18} color={color.mist} style={{ flexShrink: 0 }} />
          : <ChevronDown size={18} color={color.mist} style={{ flexShrink: 0 }} />
        }
      </button>

      {/* Expanded member list */}
      {expanded && (
        <div style={{ borderTop: `1px solid ${color.creamDark}` }}>
          {members.map((m, i) => (
            <button
              key={m.id}
              onClick={() => toggle(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 20px', width: '100%',
                background: m.reached ? color.successBg : 'transparent',
                border: 'none',
                borderBottom: i < members.length - 1 ? `1px solid ${color.creamDark}` : 'none',
                cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.2s ease',
              }}
            >
              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                background: m.reached ? color.successBg : color.creamDark,
                border: `2px solid ${m.reached ? color.success : color.creamDark}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.2s ease',
              }}>
                <span style={{ fontSize: fontSize.sm, fontWeight: '700', color: m.reached ? color.success : color.mist }}>
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>

              {/* Name */}
              <div style={{ flex: 1 }}>
                <p style={{
                  fontSize: fontSize.base, fontWeight: '600',
                  color: m.reached ? color.success : color.navy,
                  margin: 0, transition: 'color 0.2s ease',
                }}>
                  {m.name}
                </p>
                <p style={{ fontSize: fontSize.sm, color: color.mist, margin: '2px 0 0' }}>
                  {m.reached ? 'Reached out ✓' : 'Tap to mark as reached'}
                </p>
              </div>

              {/* Check box */}
              <div style={{
                width: '30px', height: '30px', borderRadius: '9px',
                border: `2px solid ${m.reached ? color.success : color.creamDark}`,
                background: m.reached ? color.success : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, transition: 'all 0.2s ease',
              }}>
                {m.reached && <Check size={16} color="#fff" strokeWidth={3} />}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function FollowupPage() {
  const totalAbsent  = MOCK_FOLLOWUP.reduce((s, f) => s + f.members.length, 0)
  const totalReached = MOCK_FOLLOWUP.reduce((s, f) => s + f.members.filter(m => m.reached).length, 0)

  return (
    <ClassShell className="Youth A" churchName="Covenant Chapel · Lagos">
      <div style={{
        flex: 1, padding: '20px 16px 40px',
        width: '100%', maxWidth: '560px', margin: '0 auto',
        display: 'flex', flexDirection: 'column', gap: '16px',
      }}>

        {/* Page heading */}
        <div>
          <h2 style={{ fontFamily: font.display, fontSize: fontSize.xl, color: color.navy, margin: '0 0 6px' }}>
            Follow-Up Log
          </h2>
          <p style={{ fontSize: fontSize.base, color: color.mist, margin: 0 }}>
            Track which absent members have been reached out to.
          </p>
        </div>

        {/* Overall stat */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px',
        }}>
          {[
            { label: 'Sundays',      value: MOCK_FOLLOWUP.length,          color: color.navy },
            { label: 'Reached',      value: totalReached,                   color: color.success },
            { label: 'Pending',      value: totalAbsent - totalReached,     color: color.error },
          ].map(s => (
            <div key={s.label} style={{
              background: color.white, borderRadius: radius.lg,
              boxShadow: shadow.card, padding: '14px', textAlign: 'center',
            }}>
              <p style={{ fontFamily: font.display, fontSize: fontSize.xl, fontWeight: '700', color: s.color, margin: 0, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.mist, margin: '5px 0 0', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {s.label}
              </p>
            </div>
          ))}
        </div>

        {/* Sunday cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {MOCK_FOLLOWUP.map(s => (
            <SundayCard key={s.id} session={s} />
          ))}
        </div>

      </div>
    </ClassShell>
  )
}