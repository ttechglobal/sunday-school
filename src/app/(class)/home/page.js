'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  CalendarDays, Users, Clock,
  DollarSign, ChevronRight, UserCheck,
  CalendarCheck,
} from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import StatusBadge from '@/components/class/ui/StatusBadge'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatNaira(v) {
  if (!v) return '₦0'
  if (v >= 1000000) return `₦${(v / 1000000).toFixed(1)}M`
  if (v >= 1000)    return `₦${(v / 1000).toFixed(0)}k`
  return `₦${Number(v).toLocaleString('en-NG')}`
}

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

// ── Session banner ────────────────────────────────────────────
function SessionBanner({ isOpen }) {
  return (
    <div style={{
      borderRadius: radius.xl,
      padding:      '20px 22px',
      display:      'flex',
      alignItems:   'center',
      gap:          '16px',
      background:   isOpen
        ? `linear-gradient(135deg, ${color.success}, #047857)`
        : color.creamDark,
      border:       isOpen ? 'none' : `1px solid ${color.creamBorder}`,
      boxShadow:    isOpen ? '0 4px 16px rgba(5,150,105,0.2)' : 'none',
    }}>
      <div style={{
        width:          '44px',
        height:         '44px',
        borderRadius:   '50%',
        background:     isOpen ? 'rgba(255,255,255,0.2)' : color.creamBorder,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        flexShrink:     0,
      }}>
        <div style={{
          width:        '12px',
          height:       '12px',
          borderRadius: '50%',
          background:   isOpen ? 'white' : color.inkSubtle,
          animation:    isOpen ? 'pulseDot 2s ease infinite' : 'none',
        }} />
      </div>
      <div>
        <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: isOpen ? 'white' : color.ink, margin: 0 }}>
          {isOpen ? 'Session is Open' : 'No Active Session'}
        </p>
        <p style={{ fontSize: fontSize.sm, color: isOpen ? 'rgba(255,255,255,0.8)' : color.inkMuted, margin: '3px 0 0', fontFamily: font.body }}>
          {isOpen ? 'Attendance can be submitted now' : 'Waiting for admin to open a session'}
        </p>
      </div>
    </div>
  )
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon, label, value }) {
  return (
    <div style={{
      flex:          1,
      background:    color.white,
      borderRadius:  radius.xl,
      padding:       '18px 16px',
      boxShadow:     shadow.card,
      border:        '1px solid rgba(15,37,87,0.05)',
      display:       'flex',
      flexDirection: 'column',
      gap:           '10px',
    }}>
      <div style={{
        width:          '38px',
        height:         '38px',
        borderRadius:   radius.md,
        background:     'rgba(15,37,87,0.06)',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        color:          color.navy,
      }}>
        {icon}
      </div>
      <p style={{ fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800', color: color.navy, margin: 0, lineHeight: 1, letterSpacing: '-0.02em' }}>
        {value}
      </p>
      <p style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: font.body }}>
        {label}
      </p>
    </div>
  )
}

// ── Session row ───────────────────────────────────────────────
function SessionRow({ session, onClick }) {
  const isApproved = session.status === 'approved'
  const isPending  = session.status === 'pending'
  const isRejected = session.status === 'rejected'

  return (
    <div style={{
      background:   color.white,
      borderRadius: radius.xl,
      border:       `1px solid ${isApproved ? color.successBorder : isRejected ? color.errorBorder : color.creamBorder}`,
      boxShadow:    shadow.card,
      overflow:     'hidden',
    }}>
      {/* Main row */}
      <button
        onClick={onClick}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '14px',
          padding:      '16px 18px',
          background:   'transparent',
          border:       'none',
          cursor:       'pointer',
          width:        '100%',
          textAlign:    'left',
        }}
      >
        <div style={{
          width:          '46px',
          height:         '46px',
          borderRadius:   radius.md,
          background:     'rgba(15,37,87,0.06)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          color:          color.navy,
        }}>
          <CalendarDays size={20} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 4px' }}>
            {session.date}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: fontSize.xs, color: color.inkMuted, fontWeight: '500', fontFamily: font.body }}>
              {session.present}/{session.total} present
            </span>
            {session.offering > 0 && (
              <>
                <span style={{ fontSize: fontSize.xs, color: color.inkSubtle }}>·</span>
                <span style={{ fontSize: fontSize.xs, color: color.goldDark, fontWeight: '700', fontFamily: font.body }}>
                  {formatNaira(session.offering)}
                </span>
              </>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          <StatusBadge status={session.status} />
          <ChevronRight size={16} color={color.inkSubtle} />
        </div>
      </button>

      {/* Approved summary row */}
      {isApproved && (
        <div style={{
          padding:     '0 18px 14px',
          display:     'flex',
          gap:         '8px',
          flexWrap:    'wrap',
          alignItems:  'center',
        }}>
          {[
            { label: `${session.present} present`,                      c: color.success  },
            { label: `${(session.total || 0) - (session.present || 0)} absent`, c: color.error    },
            { label: formatNaira(session.offering),                     c: color.goldDark },
          ].map(p => (
            <span key={p.label} style={{
              fontSize:     fontSize.xs,
              fontWeight:   '700',
              color:        p.c,
              background:   `${p.c}12`,
              padding:      '3px 10px',
              borderRadius: radius.full,
              fontFamily:   font.body,
            }}>
              {p.label}
            </span>
          ))}
        </div>
      )}

      {/* Pending locked message */}
      {isPending && (
        <div style={{
          display:    'flex',
          alignItems: 'center',
          gap:        '8px',
          padding:    '0 18px 14px',
        }}>
          <Clock size={12} color={color.warning} />
          <p style={{ fontSize: fontSize.xs, color: '#92400E', margin: 0, fontFamily: font.body, fontWeight: '500' }}>
            Submitted — awaiting admin approval
          </p>
        </div>
      )}

      {/* Absentee callout for approved records */}
      {isApproved && session.absentCount > 0 && (
        <button
          onClick={() => onClick('followup')}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '8px',
            margin:       '0 18px 14px',
            padding:      '10px 14px',
            background:   '#FFFBEB',
            border:       '1px solid #FCD34D',
            borderRadius: radius.lg,
            cursor:       'pointer',
            width:        'calc(100% - 36px)',
            textAlign:    'left',
          }}
        >
          <UserCheck size={14} color={color.warning} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: fontSize.xs, fontWeight: '600', color: '#92400E', margin: 0, fontFamily: font.body, flex: 1 }}>
            {session.absentCount} member{session.absentCount > 1 ? 's' : ''} were absent
          </p>
          <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.warning, fontFamily: font.body, whiteSpace: 'nowrap' }}>
            View Absentees →
          </span>
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function ClassHomePage() {
  const router = useRouter()

  const [classInfo,      setClassInfo]      = useState(null)
  const [sessionData,    setSessionData]    = useState(null)
  const [lastSession,    setLastSession]    = useState(null)
  const [recentSessions, setRecentSessions] = useState([])
  const [absentees,      setAbsentees]      = useState([])
  const [loading,        setLoading]        = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const [meRes, sessRes] = await Promise.all([
          fetch('/api/class/me'),
          fetch('/api/class/session'),
        ])
        const [me, sess] = await Promise.all([meRes.json(), sessRes.json()])
        if (cancelled) return
        setClassInfo(me)
        setSessionData(sess)

        const histRes  = await fetch('/api/class/history')
        const histData = await histRes.json()
        if (cancelled) return

        if (histRes.ok && histData.sessions?.length > 0) {
          setLastSession(histData.sessions[0])
          setRecentSessions(histData.sessions.slice(0, 5))
          setAbsentees(histData.sessions[0]?.absentees || [])
        } else {
          setLastSession(null)
          setRecentSessions([])
          setAbsentees([])
        }
      } catch (err) {
        console.error('Home load error:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    window.addEventListener('focus', load)
    return () => { cancelled = true; window.removeEventListener('focus', load) }
  }, [])

  const className = classInfo?.className || 'My Class'

  return (
    <ClassShell className={classInfo?.className} churchName={classInfo?.churchName}>
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Hero */}
        <div style={{
          background: `linear-gradient(160deg, ${color.navyDark} 0%, ${color.navy} 60%, ${color.navyLight} 100%)`,
          padding:    '32px 24px 48px',
        }}>
          <p style={{ fontSize: fontSize.sm, fontWeight: '500', color: 'rgba(250,246,240,0.55)', margin: '0 0 6px', letterSpacing: '0.04em', fontFamily: font.body }}>
            {getGreeting()}
          </p>
          <h1 style={{ fontFamily: font.heading, fontSize: fontSize['2xl'], fontWeight: '800', color: color.cream, margin: '0 0 6px', letterSpacing: '-0.02em' }}>
            {className}
          </h1>
          <p style={{ fontSize: fontSize.sm, color: 'rgba(250,246,240,0.5)', margin: 0, fontFamily: font.body }}>
            {new Intl.DateTimeFormat('en-NG', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date())}
          </p>
        </div>

        {/* Content — lifted into hero */}
        <div style={{ padding: '0 16px 100px', marginTop: '-28px' }}>
          {loading ? (
            <div style={{ marginTop: '28px' }}>
              <SkeletonList count={3} height={90} gap={16} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              <SessionBanner isOpen={sessionData?.isOpen} />

              {/* CTA */}
              <button
                onClick={() => router.push('/attendance')}
                style={{
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'space-between',
                  padding:        '22px 24px',
                  background:     `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`,
                  borderRadius:   radius.xl,
                  border:         'none',
                  cursor:         'pointer',
                  boxShadow:      shadow['btn-lg'],
                  transition:     'transform 0.15s ease',
                  width:          '100%',
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.98)' }}
                onMouseUp={e =>   { e.currentTarget.style.transform = 'scale(1)' }}
              >
                <div style={{ textAlign: 'left' }}>
                  <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: color.cream, margin: '0 0 4px' }}>
                    Mark Today's Attendance
                  </p>
                  <p style={{ fontSize: fontSize.sm, color: 'rgba(250,246,240,0.65)', margin: 0, fontFamily: font.body }}>
                    {sessionData?.isOpen ? 'Tap to start marking members' : 'Session closed — contact admin'}
                  </p>
                </div>
                <div style={{ width: '46px', height: '46px', borderRadius: '50%', background: 'rgba(250,246,240,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ChevronRight size={24} color={color.cream} />
                </div>
              </button>

              {/* Last Sunday stats — only approved */}
              {lastSession && lastSession.status === 'approved' && (
                <div>
                  <p style={sLabel}>Last Sunday</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <StatCard icon={<Users size={18} />}     label="Present"  value={`${lastSession.present}/${lastSession.total}`} />
                    <StatCard icon={<Clock size={18} />}      label="On Time"  value={lastSession.onTime ?? '—'} />
                    <StatCard icon={<DollarSign size={18} />} label="Offering" value={formatNaira(lastSession.offering)} />
                  </div>
                </div>
              )}

              {/* Absentee follow-up nudge */}
{absentees.length > 0 && lastSession && (
  (() => {
    const uncontacted = absentees.filter(a => !a.contacted)
    if (uncontacted.length === 0) return null
    return (
      <button
        onClick={() => router.push('/followup')}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '14px',
          padding:      '16px 18px',
          background:   '#FFFBEB',
          border:       '1px solid #FCD34D',
          borderRadius: radius.xl,
          cursor:       'pointer',
          width:        '100%',
          textAlign:    'left',
          transition:   'all 0.15s',
        }}
      >
        <div style={{
          width:          '42px',
          height:         '42px',
          borderRadius:   radius.md,
          background:     '#FEF3C7',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          flexShrink:     0,
          color:          color.warning,
        }}>
          <Users size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: font.heading, fontSize: fontSize.sm, fontWeight: '700', color: '#92400E', margin: '0 0 1px' }}>
            {uncontacted.length} member{uncontacted.length > 1 ? 's' : ''} haven't been followed up
          </p>
          <p style={{ fontSize: fontSize.xs, color: '#B45309', margin: 0, fontFamily: font.body }}>
            Tap to view absentees and mark as contacted
          </p>
        </div>
        <ChevronRight size={16} color="#B45309" />
      </button>
    )
  })()
)}
              {/* Recent sessions */}
              {recentSessions.length > 0 && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <p style={{ ...sLabel, margin: 0 }}>Recent Sundays</p>
                    <button
                      onClick={() => router.push('/history')}
                      style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', fontSize: fontSize.xs, fontWeight: '700', color: color.navy, fontFamily: font.body, padding: '4px 0' }}
                    >
                      View all <ChevronRight size={13} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {recentSessions.map((s, i) => (
                      <SessionRow
                        key={s.id || i}
                        session={s}
                        onClick={(target) => {
                          if (target === 'followup') router.push('/followup')
                          else router.push('/history')
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!lastSession && (
                <div style={{ textAlign: 'center', padding: '48px 24px', background: color.white, borderRadius: radius.xl, boxShadow: shadow.card, border: '1px solid rgba(15,37,87,0.05)' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(15,37,87,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px', color: color.navy }}>
                    <CalendarCheck size={30} />
                  </div>
                  <h3 style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: color.ink, margin: '0 0 8px' }}>
                    No records yet
                  </h3>
                  <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body, lineHeight: 1.7 }}>
                    Submit your first attendance to see a summary here.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulseDot {
          0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.4); }
          50%       { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
        }
      `}</style>
    </ClassShell>
  )
}

const sLabel = {
  fontSize:      fontSize.xs,
  fontWeight:    '700',
  color:         color.inkSubtle,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin:        '0 0 12px',
  fontFamily:    font.body,
}