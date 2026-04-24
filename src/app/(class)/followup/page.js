'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Phone, MessageCircle, Check,
  ChevronDown, Users, UserCheck,
  User, AlertCircle,
} from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  }).format(new Date(str))
}

function formatShort(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'short', day: 'numeric', month: 'short',
  }).format(new Date(str))
}

// ── Consecutive badge ─────────────────────────────────────────
function ConsecutiveBadge({ count }) {
  if (count < 2) return null
  const isRed = count >= 4
  return (
    <span style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '3px',
      fontSize:     fontSize['2xs'],
      fontWeight:   '700',
      color:        isRed ? '#991B1B' : '#92400E',
      background:   isRed ? '#FEE2E2' : '#FEF3C7',
      border:       `1px solid ${isRed ? '#FCA5A5' : '#FCD34D'}`,
      padding:      '2px 8px',
      borderRadius: radius.full,
      whiteSpace:   'nowrap',
      fontFamily:   font.body,
    }}>
      {isRed ? '⚠ ' : ''}
      Absent {count} {count === 1 ? 'Sunday' : 'Sundays'} in a row
    </span>
  )
}

// ── Absentee card ─────────────────────────────────────────────
function AbsenteeCard({ member, sessionId, onContactToggle }) {
  const [contacting, setContacting] = useState(false)
  const contacted = member.contacted

  const waText = encodeURIComponent(
    `Hi ${member.name.split(' ')[0]}, we missed you in Sunday School this week! We hope all is well. 🙏`
  )

  async function handleToggle() {
    setContacting(true)
    try {
      if (contacted) {
        await fetch('/api/class/followup-contacts', {
          method:  'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ memberId: member.memberId, sessionId }),
        })
      } else {
        await fetch('/api/class/followup-contacts', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({ memberId: member.memberId, sessionId }),
        })
      }
      onContactToggle(member.memberId, !contacted)
    } catch (err) {
      console.error('Toggle contact error:', err)
    } finally {
      setContacting(false)
    }
  }

  return (
    <div style={{
      background:    color.white,
      borderRadius:  radius.xl,
      border:        `1.5px solid ${contacted ? color.successBorder : color.creamBorder}`,
      boxShadow:     shadow.card,
      padding:       '16px',
      opacity:       contacted ? 0.7 : 1,
      transition:    'all 0.2s ease',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

        {/* Avatar */}
        <div style={{
          width:          '46px',
          height:         '46px',
          borderRadius:   '50%',
          flexShrink:     0,
          background:     contacted
            ? color.successBg
            : `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          fontFamily:     font.heading,
          fontSize:       '14px',
          fontWeight:     '700',
          color:          contacted ? color.success : color.cream,
          transition:     'all 0.2s ease',
        }}>
          {contacted
            ? <Check size={20} strokeWidth={2.5} />
            : member.name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase()
          }
        </div>

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '3px' }}>
            <p style={{
              fontFamily:   font.heading,
              fontSize:     fontSize.base,
              fontWeight:   '700',
              color:        color.ink,
              margin:       0,
            }}>
              {member.name}
            </p>
            {contacted && (
              <span style={{
                fontSize:     fontSize['2xs'],
                fontWeight:   '700',
                color:        color.success,
                background:   color.successBg,
                border:       `1px solid ${color.successBorder}`,
                padding:      '2px 8px',
                borderRadius: radius.full,
                fontFamily:   font.body,
              }}>
                Contacted ✓
              </span>
            )}
          </div>

          {/* Metadata */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '6px' }}>
            {member.gender && (
              <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body }}>
                {member.gender === 'male' || member.gender === 'M' ? '♂ Male' : '♀ Female'}
              </span>
            )}
            {member.className && (
              <>
                {member.gender && <span style={{ color: color.creamBorder }}>·</span>}
                <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body }}>
                  {member.className}
                </span>
              </>
            )}
          </div>

          {member.address && (
            <p style={{
              fontSize:     fontSize.xs,
              color:        color.inkSubtle,
              margin:       '0 0 6px',
              fontFamily:   font.body,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>
              📍 {member.address}
            </p>
          )}

          <ConsecutiveBadge count={member.consecutive} />
        </div>
      </div>

      {/* Actions row */}
      <div style={{
        display:     'flex',
        alignItems:  'center',
        gap:         '8px',
        marginTop:   '14px',
        flexWrap:    'wrap',
      }}>
        {/* Contact buttons */}
        {member.phone ? (
          <>
            <a
              href={`tel:${member.rawPhone}`}
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '5px',
                padding:      '7px 14px',
                borderRadius: radius.md,
                border:       `1.5px solid ${color.navy}`,
                background:   color.cream,
                color:        color.navy,
                fontSize:     fontSize.xs,
                fontWeight:   '700',
                fontFamily:   font.body,
                textDecoration:'none',
                transition:   'all 0.15s',
              }}
            >
              <Phone size={13} /> Call
            </a>
            <a
              href={`https://wa.me/${member.phone}?text=${waText}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display:      'inline-flex',
                alignItems:   'center',
                gap:          '5px',
                padding:      '7px 14px',
                borderRadius: radius.md,
                border:       '1.5px solid #22C55E',
                background:   '#F0FDF4',
                color:        '#15803D',
                fontSize:     fontSize.xs,
                fontWeight:   '700',
                fontFamily:   font.body,
                textDecoration:'none',
                transition:   'all 0.15s',
              }}
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          </>
        ) : (
          <span style={{
            fontSize:   fontSize.xs,
            color:      color.inkSubtle,
            fontStyle:  'italic',
            fontFamily: font.body,
          }}>
            No contact info — add phone number to enable reach-out
          </span>
        )}

        {/* Contacted toggle */}
        <button
          onClick={handleToggle}
          disabled={contacting}
          style={{
            marginLeft:   'auto',
            display:      'inline-flex',
            alignItems:   'center',
            gap:          '5px',
            padding:      '7px 14px',
            borderRadius: radius.md,
            border:       `1.5px solid ${contacted ? color.successBorder : color.creamBorder}`,
            background:   contacted ? color.successBg : color.cream,
            color:        contacted ? color.success : color.inkMuted,
            fontSize:     fontSize.xs,
            fontWeight:   '700',
            fontFamily:   font.body,
            cursor:       contacting ? 'not-allowed' : 'pointer',
            transition:   'all 0.2s ease',
            flexShrink:   0,
          }}
        >
          {contacting ? (
            '…'
          ) : contacted ? (
            <><Check size={12} /> Contacted</>
          ) : (
            'Mark Contacted'
          )}
        </button>
      </div>
    </div>
  )
}

// ── Sunday selector ───────────────────────────────────────────
function SundaySelector({ sessions, currentId, onChange }) {
  const [open, setOpen] = useState(false)
  const current = sessions.find(s => s.sessionId === currentId)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '6px',
          padding:      '8px 14px',
          background:   color.white,
          border:       `1.5px solid ${color.creamBorder}`,
          borderRadius: radius.lg,
          cursor:       'pointer',
          fontFamily:   font.body,
          fontSize:     fontSize.sm,
          fontWeight:   '600',
          color:        color.navy,
          transition:   'all 0.15s',
          whiteSpace:   'nowrap',
        }}
      >
        {current?.sessionDate ? formatShort(current.sessionDate) : 'Latest'}
        <ChevronDown size={14} color={color.inkMuted} style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>

      {open && (
        <div style={{
          position:     'absolute',
          top:          'calc(100% + 4px)',
          right:        0,
          background:   color.white,
          borderRadius: radius.lg,
          border:       `1px solid ${color.creamBorder}`,
          boxShadow:    shadow.modal,
          zIndex:       50,
          overflow:     'hidden',
          minWidth:     '180px',
          animation:    'scaleIn 0.15s ease',
        }}>
          {sessions.map((s, i) => (
            <button
              key={s.sessionId}
              onClick={() => { onChange(s.sessionId); setOpen(false) }}
              style={{
                display:      'block',
                width:        '100%',
                padding:      '10px 16px',
                background:   s.sessionId === currentId ? 'rgba(15,37,87,0.06)' : 'transparent',
                border:       'none',
                borderBottom: i < sessions.length - 1 ? `1px solid ${color.creamBorder}` : 'none',
                cursor:       'pointer',
                textAlign:    'left',
                fontFamily:   font.body,
                fontSize:     fontSize.sm,
                fontWeight:   s.sessionId === currentId ? '700' : '500',
                color:        s.sessionId === currentId ? color.navy : color.ink,
                transition:   'background 0.1s',
              }}
            >
              {s.sessionDate ? formatShort(s.sessionDate) : `Session ${i + 1}`}
              {i === 0 && (
                <span style={{ marginLeft: '8px', fontSize: fontSize['2xs'], color: color.inkSubtle }}>
                  (latest)
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function FollowUpPage() {
  const [data,       setData]       = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [sessionId,  setSessionId]  = useState(null)
  const [classInfo,  setClassInfo]  = useState(null)
  const [error,      setError]      = useState('')

  const fetchData = useCallback(async (sid) => {
    setLoading(true)
    setError('')
    try {
      const url = sid
        ? `/api/class/followup?sessionId=${sid}`
        : '/api/class/followup'

      const [res, meRes] = await Promise.all([
        fetch(url),
        fetch('/api/class/me'),
      ])
      const [d, me] = await Promise.all([res.json(), meRes.json()])

      if (!res.ok) { setError(d.error || 'Failed to load.'); return }

      setData(d)
      setClassInfo(me)
      if (!sessionId && d.currentSessionId) {
        setSessionId(d.currentSessionId)
      }
    } catch (err) {
      setError('Connection error.')
      console.error('[followup]', err)
    } finally {
      setLoading(false)
    }
  }, [sessionId])

  useEffect(() => { fetchData(null) }, [])

  function handleSessionChange(sid) {
    setSessionId(sid)
    fetchData(sid)
  }

  function handleContactToggle(memberId, contacted) {
    setData(prev => {
      if (!prev) return prev
      return {
        ...prev,
        absentees: prev.absentees.map(a =>
          a.memberId === memberId ? { ...a, contacted } : a
        ),
        alreadyContacted: prev.absentees.filter(a =>
          a.memberId === memberId ? contacted : a.contacted
        ).length,
      }
    })
  }

  const absentees = data?.absentees || []

  return (
    <ClassShell
      className={classInfo?.className}
      churchName={classInfo?.churchName}
      isAdminView={classInfo?.isAdminView}
    >
      <div style={{ maxWidth: '560px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          padding:        '20px 20px 0',
          display:        'flex',
          alignItems:     'flex-start',
          justifyContent: 'space-between',
          gap:            '12px',
          marginBottom:   '16px',
        }}>
          <div>
            <h1 style={{
              fontFamily:   font.heading,
              fontSize:     fontSize.xl,
              fontWeight:   '800',
              color:        color.ink,
              margin:       '0 0 3px',
              letterSpacing:'-0.02em',
            }}>
              Follow-Up
            </h1>
            <p style={{
              fontSize:   fontSize.sm,
              color:      color.inkMuted,
              margin:     0,
              fontFamily: font.body,
            }}>
              {data?.currentSessionDate
                ? `Absent last Sunday · ${formatDate(data.currentSessionDate)}`
                : 'Absentee follow-up'}
            </p>
          </div>

          {/* Sunday selector */}
          {data?.sessions && data.sessions.length > 1 && (
            <SundaySelector
              sessions={data.sessions}
              currentId={sessionId || data.currentSessionId}
              onChange={handleSessionChange}
            />
          )}
        </div>

        {/* Summary bar */}
        {data && !loading && absentees.length > 0 && (
          <div style={{
            display:      'flex',
            gap:          '0',
            background:   color.white,
            borderTop:    `1px solid ${color.creamBorder}`,
            borderBottom: `1px solid ${color.creamBorder}`,
            marginBottom: '16px',
          }}>
            {[
              { label: 'Absent',    value: data.totalAbsent,      c: color.error   },
              { label: 'Reachable', value: data.withContact,       c: color.navy    },
              { label: 'Contacted', value: data.alreadyContacted,  c: color.success },
            ].map((s, i) => (
              <div key={s.label} style={{
                flex:           1,
                display:        'flex',
                flexDirection:  'column',
                alignItems:     'center',
                padding:        '12px 8px',
                borderRight:    i < 2 ? `1px solid ${color.creamBorder}` : 'none',
              }}>
                <span style={{
                  fontFamily:   font.heading,
                  fontSize:     fontSize.xl,
                  fontWeight:   '800',
                  color:        s.c,
                  lineHeight:   1,
                  marginBottom: '3px',
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontSize:      fontSize['2xs'],
                  fontWeight:    '600',
                  color:         color.inkSubtle,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontFamily:    font.body,
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: '10px' }}>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', background: color.errorBg, border: `1px solid ${color.errorBorder}`, borderRadius: radius.lg }}>
              <AlertCircle size={14} color={color.error} />
              <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, fontFamily: font.body }}>{error}</p>
            </div>
          )}

          {loading ? (
            <SkeletonList count={4} height={130} />
          ) : absentees.length === 0 ? (
            /* Everyone showed up */
            <div style={{
              textAlign:    'center',
              padding:      '56px 24px',
              background:   color.white,
              borderRadius: radius.xl,
              border:       `1px solid ${color.creamBorder}`,
              boxShadow:    shadow.card,
            }}>
              <div style={{ fontSize: '56px', marginBottom: '16px', lineHeight: 1 }}>
                🎉
              </div>
              <h3 style={{
                fontFamily:   font.heading,
                fontSize:     fontSize.lg,
                fontWeight:   '700',
                color:        color.ink,
                margin:       '0 0 8px',
              }}>
                Everyone showed up!
              </h3>
              <p style={{
                fontSize:   fontSize.sm,
                color:      color.inkMuted,
                margin:     0,
                fontFamily: font.body,
                lineHeight: 1.6,
              }}>
                No absences recorded for this Sunday.
                That's worth celebrating.
              </p>
            </div>
          ) : (
            <>
              {/* All contacted badge */}
              {data.alreadyContacted === absentees.length && absentees.length > 0 && (
                <div style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '10px',
                  padding:      '14px 16px',
                  background:   color.successBg,
                  border:       `1px solid ${color.successBorder}`,
                  borderRadius: radius.lg,
                }}>
                  <UserCheck size={18} color={color.success} />
                  <p style={{ fontSize: fontSize.sm, fontWeight: '700', color: '#065F46', margin: 0, fontFamily: font.body }}>
                    All absentees have been contacted for this Sunday
                  </p>
                </div>
              )}

              {absentees.map(member => (
                <AbsenteeCard
                  key={member.memberId}
                  member={member}
                  sessionId={sessionId || data.currentSessionId}
                  onContactToggle={handleContactToggle}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </ClassShell>
  )
}