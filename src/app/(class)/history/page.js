'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronRight } from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { color, font, radius, shadow } from '@/styles/tokens'
import { page, card, history as hx } from '@/styles/class.styles'

const MOCK_HISTORY = [
  {
    id: 's1',
    date: 'Sunday, 15 June 2025',
    totals: { present: 22, total: 24, onTime: 18, bible: 20, memoryVerse: 15, offering: 15400, visitors: 1 },
    members: [
      { name: 'Adaeze Obi',    present: true,  onTime: true,  bible: true,  verse: true,  offering: 2000 },
      { name: 'Chidi Eze',     present: true,  onTime: false, bible: true,  verse: false, offering: 1000 },
      { name: 'Ngozi Okafor',  present: false, onTime: false, bible: false, verse: false, offering: 0 },
      { name: 'Emeka Nwosu',   present: true,  onTime: true,  bible: true,  verse: true,  offering: 3000 },
      { name: 'Blessing Uche', present: true,  onTime: true,  bible: false, verse: true,  offering: 500 },
      { name: 'Kelechi Onu',   present: true,  onTime: true,  bible: true,  verse: true,  offering: 2000 },
      { name: 'Tochi Ibe',     present: true,  onTime: false, bible: true,  verse: false, offering: 1500 },
      { name: 'Amara Okonkwo', present: false, onTime: false, bible: false, verse: false, offering: 0 },
    ],
    visitors: [{ name: 'Chioma Duru', offering: 5400 }],
  },
  {
    id: 's2',
    date: 'Sunday, 8 June 2025',
    totals: { present: 20, total: 24, onTime: 15, bible: 17, memoryVerse: 12, offering: 12800, visitors: 0 },
    members: [
      { name: 'Adaeze Obi',    present: true,  onTime: true,  bible: true,  verse: true,  offering: 2000 },
      { name: 'Chidi Eze',     present: false, onTime: false, bible: false, verse: false, offering: 0 },
      { name: 'Ngozi Okafor',  present: true,  onTime: true,  bible: true,  verse: true,  offering: 1500 },
      { name: 'Emeka Nwosu',   present: true,  onTime: false, bible: true,  verse: false, offering: 2500 },
      { name: 'Blessing Uche', present: true,  onTime: true,  bible: true,  verse: true,  offering: 1000 },
      { name: 'Kelechi Onu',   present: false, onTime: false, bible: false, verse: false, offering: 0 },
      { name: 'Tochi Ibe',     present: true,  onTime: true,  bible: true,  verse: false, offering: 1800 },
      { name: 'Amara Okonkwo', present: false, onTime: false, bible: false, verse: false, offering: 0 },
    ],
    visitors: [],
  },
]

function SessionCard({ session, onClick }) {
  const pct = Math.round((session.totals.present / session.totals.total) * 100)
  const rateColor = pct >= 75 ? color.success : pct >= 50 ? color.warning : color.error

  return (
    <button onClick={onClick} style={hx.sessionCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontFamily: font.display, fontSize: '17px', fontWeight: '700', color: color.navy, margin: '0 0 6px' }}>
            {session.date}
          </p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <span className={`badge ${pct >= 75 ? 'badge-green' : pct >= 50 ? 'badge-amber' : 'badge-red'}`}>
              {session.totals.present}/{session.totals.total} present
            </span>
            {session.totals.visitors > 0 && (
              <span className="badge badge-amber">{session.totals.visitors} visitor{session.totals.visitors > 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
        <ChevronRight size={18} color={color.mist} />
      </div>

      <div style={hx.statRow}>
        {[
          { label: 'On Time',  value: session.totals.onTime,      color: color.navy },
          { label: 'Bible',    value: session.totals.bible,        color: color.navyLite },
          { label: 'Verse',    value: session.totals.memoryVerse,  color: '#7C3AED' },
          { label: 'Offering', value: `₦${(session.totals.offering / 100).toLocaleString('en-NG')}`, color: color.goldDark },
        ].map((s, i, arr) => (
          <>
            <div key={s.label} style={hx.stat}>
              <p style={{ ...hx.statValue, color: s.color, fontSize: '18px' }}>{s.value}</p>
              <p style={hx.statLabel}>{s.label.toUpperCase()}</p>
            </div>
            {i < arr.length - 1 && <div style={hx.divider} />}
          </>
        ))}
      </div>
    </button>
  )
}

function SessionDetail({ session, onBack }) {
  const present = session.members.filter(m => m.present)
  const absent  = session.members.filter(m => !m.present)
  const { totals } = session

  return (
    <div style={page.body}>
      {/* Back */}
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: color.navy, padding: 0, marginBottom: '4px' }}
      >
        <ArrowLeft size={16} /> Back to Records
      </button>

      {/* Date + read-only badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <h2 style={{ fontFamily: font.display, fontSize: '22px', color: color.navy, margin: 0 }}>
          {session.date}
        </h2>
        <span className="badge badge-mist">Read Only</span>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        {[
          { label: 'Present',  value: totals.present,     color: color.success },
          { label: 'Absent',   value: totals.total - totals.present, color: color.error },
          { label: 'On Time',  value: totals.onTime,      color: color.navy },
          { label: 'Bible',    value: totals.bible,        color: color.navyLite },
          { label: 'Verse',    value: totals.memoryVerse,  color: '#7C3AED' },
          { label: 'Visitors', value: totals.visitors,     color: color.gold },
        ].map(s => (
          <div key={s.label} style={{ ...card.base, textAlign: 'center', padding: '14px 10px' }}>
            <p style={{ fontFamily: font.display, fontSize: '26px', fontWeight: '700', color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: '10px', fontWeight: '700', color: color.mist, margin: '5px 0 0', letterSpacing: '0.04em' }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Offering */}
      <div style={{ ...card.navy, textAlign: 'center' }}>
        <p style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.07em', color: 'rgba(245,240,232,0.5)', margin: '0 0 8px', textTransform: 'uppercase' }}>Total Offering</p>
        <p style={{ fontFamily: font.display, fontSize: '36px', fontWeight: '700', color: color.gold, margin: 0 }}>
          ₦{(totals.offering / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Present members */}
      <div>
        <p style={{ fontSize: '13px', fontWeight: '700', color: color.mist, margin: '0 0 10px', letterSpacing: '0.04em' }}>
          ✅ PRESENT ({present.length})
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {present.map((m, i) => (
            <div key={i} style={{ ...card.base, display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', padding: '12px 16px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color.success, flexShrink: 0 }} />
              <p style={{ fontSize: '15px', fontWeight: '600', color: color.navy, margin: 0, flex: 1 }}>{m.name}</p>
              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                {m.onTime && <span className="badge badge-navy" style={{ fontSize: '10px' }}>On Time</span>}
                {m.bible  && <span className="badge badge-mist" style={{ fontSize: '10px' }}>Bible</span>}
                {m.verse  && <span style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 8px', borderRadius: '99px', fontSize: '10px', fontWeight: '700', background: 'rgba(124,58,237,0.1)', color: '#7C3AED' }}>Verse</span>}
                {m.offering > 0 && <span className="badge badge-amber" style={{ fontSize: '10px' }}>₦{m.offering.toLocaleString('en-NG')}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visitors */}
      {session.visitors.length > 0 && (
        <div>
          <p style={{ fontSize: '13px', fontWeight: '700', color: color.mist, margin: '0 0 10px', letterSpacing: '0.04em' }}>
            🙏 FIRST TIMERS ({session.visitors.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {session.visitors.map((v, i) => (
              <div key={i} style={{ ...card.base, display: 'flex', alignItems: 'center', gap: '12px', borderLeft: `4px solid ${color.gold}`, padding: '12px 16px' }}>
                <p style={{ fontSize: '15px', fontWeight: '600', color: color.navy, margin: 0, flex: 1 }}>{v.name}</p>
                {v.offering > 0 && <span className="badge badge-amber" style={{ fontSize: '10px' }}>₦{v.offering.toLocaleString('en-NG')}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Absent members */}
      {absent.length > 0 && (
        <div>
          <p style={{ fontSize: '13px', fontWeight: '700', color: color.mist, margin: '0 0 10px', letterSpacing: '0.04em' }}>
            ❌ ABSENT ({absent.length})
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {absent.map((m, i) => (
              <div key={i} style={{ ...card.base, display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(245,240,232,0.5)', padding: '12px 16px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color.error, flexShrink: 0 }} />
                <p style={{ fontSize: '15px', fontWeight: '600', color: color.mist, margin: 0, flex: 1 }}>{m.name}</p>
                <span style={{ fontSize: '12px', color: color.error, fontWeight: '600' }}>Follow up</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function HistoryPage() {
  const router  = useRouter()
  const [selected, setSelected] = useState(null)

  return (
    <ClassShell className="Youth A" churchName="Covenant Chapel · Lagos">
      {selected ? (
        <SessionDetail
          session={MOCK_HISTORY.find(s => s.id === selected)}
          onBack={() => setSelected(null)}
        />
      ) : (
        <div style={page.body}>
          <div>
            <h2 style={{ fontFamily: font.display, fontSize: '26px', color: color.navy, margin: '0 0 4px' }}>
              Past Records
            </h2>
            <p style={{ fontSize: '13px', color: color.mist, margin: 0 }}>
              Read-only history of submitted sessions
            </p>
          </div>

          {MOCK_HISTORY.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '40px', margin: '0 0 12px' }}>📋</p>
              <p style={{ fontSize: '17px', fontWeight: '700', color: color.navy, margin: '0 0 6px' }}>No records yet</p>
              <p style={{ fontSize: '14px', color: color.mist, margin: 0 }}>Submitted sessions will appear here.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MOCK_HISTORY.map(s => (
                <SessionCard key={s.id} session={s} onClick={() => setSelected(s.id)} />
              ))}
            </div>
          )}
        </div>
      )}
    </ClassShell>
  )
}