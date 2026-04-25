'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, X, Check,
  Clock, BookOpen, Mic, Users, Send, Edit2, AlertCircle,
} from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

// ── Helpers ───────────────────────────────────────────────────
function getMemberName(member) {
  if (!member) return 'Unknown'
  if (typeof member.full_name === 'string' && member.full_name.trim()) {
    return member.full_name.trim()
  }
  if (typeof member.name === 'string' && member.name.trim()) {
    return member.name.trim()
  }
  const first = typeof member.first_name === 'string' ? member.first_name.trim() : ''
  const last  = typeof member.last_name  === 'string' ? member.last_name.trim()  : ''
  const combined = [first, last].filter(Boolean).join(' ')
  return combined || 'Unknown'
}

function getInitials(member) {
  const name = getMemberName(member)
  return name
    .split(' ')
    .map(n => n[0])
    .filter(Boolean)
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'
}

function defaultRecord() {
  return {
    present:     false,
    onTime:      false,
    bible:       false,
    memoryVerse: false,
    offering:    '',
  }
}

function formatNaira(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

// ── Chip ──────────────────────────────────────────────────────
function Chip({ icon, label, checked, onChange, accentColor }) {
  return (
    <button
      onClick={onChange}
      style={{
        display:      'inline-flex',
        alignItems:   'center',
        gap:          '5px',
        padding:      '6px 12px',
        borderRadius: radius.full,
        border:       `1.5px solid ${checked ? accentColor : color.creamBorder}`,
        background:   checked ? `${accentColor}12` : color.cream,
        color:        checked ? accentColor : color.inkSubtle,
        fontFamily:   font.body,
        fontSize:     fontSize.xs,
        fontWeight:   '600',
        cursor:       'pointer',
        transition:   'all 0.15s ease',
        whiteSpace:   'nowrap',
        userSelect:   'none',
      }}
    >
      {icon}{label}
    </button>
  )
}

// ── Member card ───────────────────────────────────────────────
function MemberCard({ member, record, onChange, isVisitor, onRemove }) {
  // All variables scoped properly inside the function
  const present  = record ? record.present : false
  const name     = getMemberName(member)
  const initials = getInitials(member)

  function togglePresent() {
    if (present) {
      onChange({ present: false, onTime: false, bible: false, memoryVerse: false, offering: '' })
    } else {
      onChange({ ...(record || defaultRecord()), present: true })
    }
  }

  const cardBorderColor  = present ? color.navy : color.creamBorder
  const cardBoxShadow    = present ? `0 2px 16px rgba(15,37,87,0.10)` : shadow.card
  const avatarBackground = present
    ? `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`
    : color.creamDark
  const avatarColor      = present ? color.cream : color.inkMuted
  const thumbLeft        = present ? 'calc(100% - 26px)' : '3px'
  const trackBackground  = present ? color.navy : color.creamDark

  return (
    <div style={{
      background:    color.white,
      borderRadius:  radius.xl,
      border:        `2px solid ${cardBorderColor}`,
      boxShadow:     cardBoxShadow,
      overflow:      'hidden',
      transition:    'border-color 0.2s ease, box-shadow 0.2s ease',
    }}>
      {/* Top row */}
      <div style={{
        display:    'flex',
        alignItems: 'center',
        gap:        '12px',
        padding:    '14px 16px',
        background: present ? 'rgba(15,37,87,0.03)' : 'transparent',
        transition: 'background 0.2s ease',
      }}>
        {/* Avatar */}
        <div style={{
          width:          '46px',
          height:         '46px',
          borderRadius:   '50%',
          flexShrink:     0,
          background:     avatarBackground,
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'center',
          transition:     'background 0.2s ease',
          fontFamily:     font.heading,
          fontSize:       '14px',
          fontWeight:     '700',
          color:          avatarColor,
        }}>
          {initials}
        </div>

        {/* Name */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily:   font.heading,
            fontSize:     fontSize.base,
            fontWeight:   '700',
            color:        color.ink,
            margin:       0,
            lineHeight:   1.3,
            overflow:     'hidden',
            textOverflow: 'ellipsis',
            whiteSpace:   'nowrap',
          }}>
            {name}
          </p>

          {isVisitor && (
            <span style={{
              display:      'inline-block',
              marginTop:    '3px',
              fontSize:     fontSize['2xs'],
              fontWeight:   '700',
              color:        color.goldDark,
              background:   color.goldLight,
              padding:      '2px 8px',
              borderRadius: radius.full,
            }}>
              First Timer
            </span>
          )}

          {present && (
            <p style={{
              fontSize:   fontSize.xs,
              color:      color.navy,
              margin:     '2px 0 0',
              fontWeight: '600',
              fontFamily: font.body,
            }}>
              ✓ Present
            </p>
          )}
        </div>

        {/* Present toggle */}
        <button
          onClick={togglePresent}
          style={{
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            width:          '52px',
            height:         '32px',
            borderRadius:   radius.full,
            border:         'none',
            background:     trackBackground,
            cursor:         'pointer',
            flexShrink:     0,
            transition:     'background 0.25s ease',
            position:       'relative',
          }}
          aria-label={present ? 'Mark absent' : 'Mark present'}
        >
          <div style={{
            position:       'absolute',
            top:            '3px',
            left:           thumbLeft,
            width:          '26px',
            height:         '26px',
            borderRadius:   '50%',
            background:     'white',
            boxShadow:      '0 1px 4px rgba(0,0,0,0.2)',
            transition:     'left 0.25s cubic-bezier(0.34,1.56,0.64,1)',
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            {present && <Check size={14} color={color.navy} strokeWidth={3} />}
          </div>
        </button>

        {/* Remove visitor */}
        {isVisitor && (
          <button
            onClick={onRemove}
            style={{
              background:  'none',
              border:      'none',
              cursor:      'pointer',
              padding:     '4px',
              color:       color.inkSubtle,
              marginLeft:  '-4px',
              flexShrink:  0,
              display:     'flex',
              alignItems:  'center',
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Expandable sub-fields — only when present */}
      <div style={{
        maxHeight:  present ? '200px' : '0px',
        overflow:   'hidden',
        transition: 'max-height 0.3s ease',
      }}>
        <div style={{
          padding:    '12px 16px 14px',
          borderTop:  `1px solid ${color.creamBorder}`,
          background: color.cream,
          display:    'flex',
          flexWrap:   'wrap',
          gap:        '8px',
          alignItems: 'center',
        }}>
          <Chip
            icon={<Clock size={12} />}
            label="On Time"
            checked={record ? record.onTime : false}
            onChange={() => onChange({ ...(record || defaultRecord()), onTime: !(record ? record.onTime : false) })}
            accentColor={color.navy}
          />
          <Chip
            icon={<BookOpen size={12} />}
            label="Bible"
            checked={record ? record.bible : false}
            onChange={() => onChange({ ...(record || defaultRecord()), bible: !(record ? record.bible : false) })}
            accentColor={color.navyLight}
          />
          <Chip
            icon={<Mic size={12} />}
            label="Verse"
            checked={record ? record.memoryVerse : false}
            onChange={() => onChange({ ...(record || defaultRecord()), memoryVerse: !(record ? record.memoryVerse : false) })}
            accentColor="#7C3AED"
          />

          {/* Offering */}
          <div style={{ position: 'relative', flex: 1, minWidth: '120px' }}>
            <span style={{
              position:      'absolute',
              left:          '11px',
              top:           '50%',
              transform:     'translateY(-50%)',
              fontSize:      '14px',
              fontWeight:    '700',
              color:         color.gold,
              pointerEvents: 'none',
              zIndex:        1,
            }}>
              ₦
            </span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={record ? record.offering : ''}
              onChange={e => onChange({ ...(record || defaultRecord()), offering: e.target.value })}
              style={{
                width:        '100%',
                height:       '38px',
                paddingLeft:  '26px',
                paddingRight: '10px',
                fontFamily:   font.body,
                fontSize:     '14px',
                fontWeight:   '600',
                color:        color.ink,
                background:   color.white,
                border:       `1.5px solid ${color.creamBorder}`,
                borderRadius: radius.md,
                outline:      'none',
                boxSizing:    'border-box',
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Add First Timer modal ─────────────────────────────────────
function AddFirstTimerModal({ onAdd, onClose }) {
  const [form,    setForm]    = useState({ fullName: '', phoneNumber: '', gender: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const ref = useRef(null)

  useEffect(() => { setTimeout(() => ref.current?.focus(), 50) }, [])

  async function handleAdd() {
    if (!form.fullName.trim()) { setError('Name is required.'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/class/first-timers', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed.'); setLoading(false); return }
      onAdd({
        id:           data.member.id,
        full_name:    data.member.full_name || form.fullName.trim(),
        first_name:   '',
        last_name:    '',
        isFirstTimer: true,
      })
      onClose()
    } catch { setError('Connection error.'); setLoading(false) }
  }

  const lbl = {
    display:       'block',
    fontSize:      fontSize.xs,
    fontWeight:    '700',
    color:         color.inkMuted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom:  '6px',
    fontFamily:    font.body,
  }

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(10,26,61,0.55)',
      display:        'flex',
      alignItems:     'flex-end',
      zIndex:         100,
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background:    color.white,
        borderRadius:  `${radius['2xl']} ${radius['2xl']} 0 0`,
        padding:       '8px 24px 48px',
        width:         '100%',
        maxWidth:      '560px',
        margin:        '0 auto',
        animation:     'slideUp 0.3s ease',
        maxHeight:     '85vh',
        overflowY:     'auto',
      }}>
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: color.creamBorder, margin: '12px auto 22px' }} />
        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 6px' }}>
          Add First Timer
        </h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 18px', fontFamily: font.body }}>
          This visitor will be saved and marked as present today.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={lbl}>Full Name *</label>
            <input
              ref={ref}
              className="input"
              placeholder="e.g. Chioma Duru"
              value={form.fullName}
              onChange={e => { setForm(p => ({ ...p, fullName: e.target.value })); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              style={{ background: color.cream }}
            />
          </div>

          <div>
            <label style={lbl}>
              Phone Number{' '}
              <span style={{ fontWeight: '400', color: color.inkSubtle, textTransform: 'none', letterSpacing: 0 }}>Optional</span>
            </label>
            <input
              className="input"
              type="tel"
              placeholder="08012345678"
              value={form.phoneNumber}
              onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))}
              style={{ background: color.cream }}
            />
          </div>

          <div>
            <label style={lbl}>
              Gender{' '}
              <span style={{ fontWeight: '400', color: color.inkSubtle, textTransform: 'none', letterSpacing: 0 }}>Optional</span>
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['', 'male', 'female'].map(g => (
                <button
                  key={g}
                  onClick={() => setForm(p => ({ ...p, gender: g }))}
                  style={{
                    flex:         1,
                    height:       '40px',
                    borderRadius: radius.md,
                    border:       `1.5px solid ${form.gender === g ? color.navy : color.creamBorder}`,
                    background:   form.gender === g ? 'rgba(15,37,87,0.06)' : color.cream,
                    color:        form.gender === g ? color.navy : color.inkMuted,
                    fontSize:     fontSize.sm,
                    fontWeight:   form.gender === g ? '700' : '500',
                    fontFamily:   font.body,
                    cursor:       'pointer',
                  }}
                >
                  {g === '' ? 'Not set' : g === 'male' ? 'Male' : 'Female'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <p style={{ fontSize: fontSize.sm, color: color.error, margin: '0 0 12px', fontFamily: font.body }}>
            {error}
          </p>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={handleAdd}
            disabled={loading || !form.fullName.trim()}
            style={{ fontFamily: font.body }}
          >
            {loading ? 'Saving…' : 'Add & Mark Present'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Submit confirmation modal ─────────────────────────────────
function SubmitModal({ totals, members, records, visitors, onConfirm, onClose, loading, isResubmit }) {
  const presentMembers = members.filter(m => records[m.id]?.present)
  const absentMembers  = members.filter(m => !records[m.id]?.present)

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(10,26,61,0.55)',
      display:        'flex',
      alignItems:     'flex-end',
      zIndex:         100,
      backdropFilter: 'blur(2px)',
    }}>
      <div style={{
        background:    color.white,
        borderRadius:  `${radius['2xl']} ${radius['2xl']} 0 0`,
        padding:       '8px 24px 48px',
        width:         '100%',
        maxWidth:      '560px',
        margin:        '0 auto',
        maxHeight:     '88vh',
        overflowY:     'auto',
        animation:     'slideUp 0.3s ease',
      }}>
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: color.creamBorder, margin: '12px auto 22px' }} />

        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 4px' }}>
          {isResubmit ? 'Resubmit Attendance?' : 'Submit Attendance?'}
        </h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 18px', fontFamily: font.body }}>
          {isResubmit
            ? 'This replaces the previous submission and resets admin approval.'
            : 'A record will be written for every member — present and absent.'
          }
        </p>

        {/* Summary rows */}
        <div style={{ background: color.cream, borderRadius: radius.xl, overflow: 'hidden', marginBottom: '20px' }}>
          {[
            { label: 'Present',       value: totals.present,    c: color.success   },
            { label: 'Absent',        value: totals.absent,     c: color.error     },
            { label: 'First Timers',  value: totals.visitors,   c: color.goldDark  },
            { label: 'On Time',       value: totals.onTime,     c: color.navy      },
            { label: 'With Bible',    value: totals.bible,      c: color.navyLight },
            { label: 'Memory Verse',  value: totals.memoryVerse,c: '#7C3AED'       },
            { label: 'Total Offering',value: formatNaira(totals.offering), c: color.goldDark },
          ].map((row, i, arr) => (
            <div key={row.label} style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'space-between',
              padding:        '12px 18px',
              borderBottom:   i < arr.length - 1 ? `1px solid ${color.creamBorder}` : 'none',
            }}>
              <span style={{ fontSize: fontSize.base, color: color.inkMuted, fontFamily: font.body }}>{row.label}</span>
              <span style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: row.c }}>{row.value}</span>
            </div>
          ))}
        </div>

        {/* Absent names */}
        {absentMembers.length > 0 && (
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.error, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px', fontFamily: font.body }}>
              Will be recorded as absent ({absentMembers.length})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {absentMembers.map(m => (
                <span key={m.id} style={{ fontSize: fontSize.xs, color: color.inkMuted, background: color.creamDark, padding: '3px 10px', borderRadius: radius.full, fontFamily: font.body }}>
                  {getMemberName(m)}
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cream btn-full" onClick={onClose} disabled={loading} style={{ fontFamily: font.body }}>
            Go Back
          </button>
          <button
            className="btn btn-primary btn-full btn-lg"
            onClick={onConfirm}
            disabled={loading}
            style={{ fontFamily: font.body, gap: '8px' }}
          >
            {loading
              ? 'Submitting…'
              : <><Send size={16} /> {isResubmit ? 'Resubmit' : 'Submit All Records'}</>
            }
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Live totals bar ───────────────────────────────────────────
function TotalsBar({ totals }) {
  const items = [
    { label: 'Present',  value: totals.present                                                           },
    { label: 'On Time',  value: totals.onTime                                                            },
    { label: 'Bible',    value: totals.bible                                                             },
    { label: 'Offering', value: totals.offering > 0 ? `₦${Number(totals.offering).toLocaleString('en-NG')}` : '₦0' },
  ]

  return (
    <div style={{ display: 'flex', background: color.white, borderBottom: `1px solid ${color.creamBorder}`, borderTop: `1px solid ${color.creamBorder}` }}>
      {items.map((item, i) => (
        <div key={item.label} style={{
          flex:           1,
          display:        'flex',
          flexDirection:  'column',
          alignItems:     'center',
          padding:        '10px 6px',
          borderRight:    i < items.length - 1 ? `1px solid ${color.creamBorder}` : 'none',
        }}>
          <span style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '800', color: color.navy, lineHeight: 1, marginBottom: '2px' }}>
            {item.value}
          </span>
          <span style={{ fontSize: fontSize['2xs'], fontWeight: '600', color: color.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function AttendancePage() {
  const router = useRouter()

  const [members,        setMembers]        = useState([])
  const [sessionId,      setSessionId]      = useState(null)
  const [classInfo,      setClassInfo]      = useState({})
  const [loading,        setLoading]        = useState(true)
  const [sessionOpen,    setSessionOpen]    = useState(true)
  const [records,        setRecords]        = useState({})
  const [visitors,       setVisitors]       = useState([])
  const [showAddVisitor, setShowAddVisitor] = useState(false)
  const [showSubmit,     setShowSubmit]     = useState(false)
  const [hasSubmitted,   setHasSubmitted]   = useState(false)
  const [batchStatus,    setBatchStatus]    = useState(null)
  const [loadingSubmit,  setLoadingSubmit]  = useState(false)
  const [error,          setError]          = useState('')
  const [showToast,      setShowToast]      = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [sessRes, meRes, membersRes] = await Promise.all([
          fetch('/api/class/session'),
          fetch('/api/class/me'),
          fetch('/api/class/members'),
        ])
        const [sessData, meData, membersData] = await Promise.all([
          sessRes.json(), meRes.json(), membersRes.json(),
        ])

        if (!sessRes.ok) { setError('Failed to load session.'); setLoading(false); return }

        setSessionOpen(sessData.isOpen ?? true)
        setSessionId(sessData.sessionId)
        setClassInfo(meData)

        // Normalize members — always guarantee full_name is a string
        const mems = (membersData.members || []).map(m => ({
          ...m,
          full_name: getMemberName(m),
        }))
        setMembers(mems)

        // Initialize all members as NOT present
        const map = {}
        mems.forEach(m => { map[m.id] = defaultRecord() })
        setRecords(map)

        // Load existing submission if any
        if (sessData.sessionId && mems.length > 0) {
          const attRes  = await fetch(`/api/class/attendance?sessionId=${sessData.sessionId}`)
          const attData = await attRes.json()

          if (attRes.ok && attData.records?.length > 0) {
            const existingMap = {}
            mems.forEach(m => { existingMap[m.id] = defaultRecord() })
            const newVisitors = []

            for (const r of attData.records) {
              if (r.member_id && existingMap[r.member_id] !== undefined) {
                existingMap[r.member_id] = {
                  present:     r.attendance === 'present',
                  onTime:      Boolean(r.on_time),
                  bible:       Boolean(r.bible),
                  memoryVerse: Boolean(r.memory_verse),
                  offering:    r.offering?.toString() || '',
                }
              } else if (!r.member_id && r.visitor_name) {
                newVisitors.push({
                  id:   `v-${r.id || Date.now()}`,
                  full_name: r.visitor_name,
                  name: r.visitor_name,
                  isFirstTimer: true,
                  record: {
                    present:     r.attendance === 'present',
                    onTime:      Boolean(r.on_time),
                    bible:       Boolean(r.bible),
                    memoryVerse: Boolean(r.memory_verse),
                    offering:    r.offering?.toString() || '',
                  },
                })
              }
            }

            setRecords(existingMap)
            setVisitors(newVisitors)
            setHasSubmitted(true)
            setBatchStatus(attData.batchStatus || 'pending')
          }
        }
      } catch (err) {
        console.error('Attendance load error:', err)
        setError('Failed to load. Please refresh.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function getTotals() {
    const memberRecs  = members.map(m => records[m.id] || defaultRecord())
    const visitorRecs = visitors.map(v => v.record || defaultRecord())
    const all         = [...memberRecs, ...visitorRecs]

    return {
      present:     all.filter(r => r.present).length,
      absent:      all.filter(r => !r.present).length,
      onTime:      all.filter(r => r.onTime).length,
      bible:       all.filter(r => r.bible).length,
      memoryVerse: all.filter(r => r.memoryVerse).length,
      offering:    all.reduce((s, r) => s + (parseFloat(r.offering) || 0), 0),
      visitors:    visitors.filter(v => v.record && v.record.present).length,
      total:       all.length,
    }
  }

  async function handleSubmit() {
    if (!sessionId) { setError('No active session.'); return }
    setLoadingSubmit(true)
    setError('')

    try {
      const memberRecords = members.map(m => {
        const rec = records[m.id] || defaultRecord()
        return {
          memberId:    m.id,
          attendance:  rec.present ? 'present' : 'absent',
          onTime:      rec.present ? Boolean(rec.onTime)      : false,
          bible:       rec.present ? Boolean(rec.bible)       : false,
          memoryVerse: rec.present ? Boolean(rec.memoryVerse) : false,
          offering:    rec.present ? (rec.offering || '0')    : '0',
        }
      })

      const visitorRecords = visitors
        .filter(v => v.record && v.record.present)
        .map(v => ({
          visitorName: getMemberName(v),
          attendance:  'present',
          onTime:      Boolean(v.record.onTime),
          bible:       Boolean(v.record.bible),
          memoryVerse: Boolean(v.record.memoryVerse),
          offering:    v.record.offering || '0',
        }))

      console.log('[attendance] submitting', memberRecords.length, 'members +', visitorRecords.length, 'visitors')

      const res  = await fetch('/api/class/attendance', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ sessionId, records: [...memberRecords, ...visitorRecords] }),
      })
      const data = await res.json()

      if (!res.ok) { setError(data.error || 'Submission failed.'); setShowSubmit(false); return }

      setBatchStatus('pending')
      setHasSubmitted(true)
      setShowSubmit(false)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 4000)

    } catch (err) {
      console.error('Submit error:', err)
      setError(`Connection error: ${err.message}`)
      setShowSubmit(false)
    } finally {
      setLoadingSubmit(false)
    }
  }

  const totals       = getTotals()
  const presentCount = totals.present

  const statusBanner = hasSubmitted ? ({
    approved: { bg: color.successBg, border: color.successBorder, text: color.success, msg: '✓ Approved — you can still edit and resubmit' },
    rejected: { bg: color.errorBg,   border: color.errorBorder,   text: color.error,   msg: '✗ Rejected — please correct and resubmit'   },
    pending:  { bg: '#FFFBEB',       border: '#FCD34D',            text: '#B45309',     msg: '⏳ Submitted — awaiting admin approval'       },
  })[batchStatus || 'pending'] : null

  if (loading) {
    return (
      <ClassShell className={classInfo.className} churchName={classInfo.churchName} hideBottomNav>
        <div style={{ padding: '16px', maxWidth: '560px', margin: '0 auto' }}>
          <SkeletonList count={5} height={90} gap={10} />
        </div>
      </ClassShell>
    )
  }

  return (
    <ClassShell
      className={classInfo.className || 'Class'}
      churchName={classInfo.churchName || ''}
      hideBottomNav
      isAdminView={classInfo.isAdminView}
    >
      {/* Sub-header */}
      <div style={{
        background:    color.white,
        borderBottom:  `1px solid ${color.creamBorder}`,
        padding:       '0 16px',
        height:        '52px',
        display:       'flex',
        alignItems:    'center',
        gap:           '12px',
        position:      'sticky',
        top:           '56px',
        zIndex:        40,
      }}>
        <button
          onClick={() => router.push('/home')}
          style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '8px 0', flexShrink: 0 }}
        >
          <ArrowLeft size={16} /> Back
        </button>
        <div style={{ width: '1px', height: '20px', background: color.creamBorder }} />
        <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: 0, flex: 1 }}>
          Attendance
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: fontSize.xs, color: color.inkMuted, fontFamily: font.body }}>
            {members.length} members
          </span>
          <span className={`badge ${sessionOpen ? 'badge-green' : 'badge-amber'}`}>
            {sessionOpen ? 'Open' : 'Closed'}
          </span>
        </div>
      </div>

      {/* Totals */}
      <TotalsBar totals={totals} />

      {/* Error */}
      {error && (
        <div style={{ background: color.errorBg, borderBottom: `1px solid ${color.errorBorder}`, padding: '12px 20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
          <AlertCircle size={15} color={color.error} style={{ flexShrink: 0 }} />
          <p style={{ fontSize: fontSize.sm, color: '#991B1B', fontWeight: '600', margin: 0, fontFamily: font.body }}>{error}</p>
        </div>
      )}

      {/* Status banner */}
      {statusBanner && (
        <div style={{ background: statusBanner.bg, borderBottom: `1px solid ${statusBanner.border}`, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <p style={{ fontSize: fontSize.sm, fontWeight: '600', color: statusBanner.text, margin: 0, fontFamily: font.body }}>
            {statusBanner.msg}
          </p>
        </div>
      )}

      {/* Section hint */}
      <div style={{ padding: '12px 20px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: '560px', margin: '0 auto', width: '100%' }}>
        <p style={{ fontSize: fontSize.xs, fontWeight: '600', color: color.inkSubtle, margin: 0, fontFamily: font.body }}>
          {presentCount} of {members.length + visitors.length} marked present
        </p>
        <button
          onClick={() => setShowAddVisitor(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.xs, fontWeight: '700', padding: '4px 0' }}
        >
          <Plus size={14} /> First Timer
        </button>
      </div>

      {/* Member list */}
      <div style={{ padding: '0 16px 200px', display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '560px', margin: '0 auto', width: '100%' }}>

        {members.length === 0 && visitors.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}` }}>
            <Users size={32} color={color.navy} style={{ marginBottom: '14px', opacity: 0.5 }} />
            <h3 style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: color.ink, margin: '0 0 8px' }}>
              No members in this class
            </h3>
            <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
              Ask your admin to add members to this class.
            </p>
          </div>
        ) : (
          <>
            {members.map(m => (
              <MemberCard
                key={m.id}
                member={m}
                record={records[m.id] || defaultRecord()}
                onChange={rec => setRecords(p => ({ ...p, [m.id]: rec }))}
              />
            ))}
            {visitors.map(v => (
              <MemberCard
                key={v.id}
                member={v}
                record={v.record || defaultRecord()}
                onChange={rec => setVisitors(p => p.map(x => x.id === v.id ? { ...x, record: rec } : x))}
                isVisitor
                onRemove={() => setVisitors(p => p.filter(x => x.id !== v.id))}
              />
            ))}
          </>
        )}
      </div>

      {/* Sticky footer */}
      <div style={{
        position:      'fixed',
        bottom:        0, left: 0, right: 0,
        background:    color.white,
        borderTop:     `1.5px solid ${color.creamBorder}`,
        padding:       '12px 20px',
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        display:       'flex',
        alignItems:    'center',
        gap:           '14px',
        zIndex:        30,
        boxShadow:     '0 -6px 24px rgba(15,37,87,0.08)',
      }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: 0, lineHeight: 1 }}>
            {presentCount} present
          </p>
          <p style={{ fontFamily: font.body, fontSize: fontSize.xs, color: color.inkMuted, margin: '4px 0 0' }}>
            {members.length - presentCount + visitors.filter(v => !(v.record && v.record.present)).length} will be absent
            {totals.offering > 0 && ` · ${formatNaira(totals.offering)}`}
          </p>
        </div>

        <button
          className="btn btn-primary btn-lg"
          onClick={() => setShowSubmit(true)}
          disabled={!sessionOpen}
          style={{ fontFamily: font.body, fontWeight: '700', minWidth: '160px', height: '50px', borderRadius: radius.lg, gap: '8px' }}
        >
          {hasSubmitted
            ? <><Edit2 size={16} /> Update & Resubmit</>
            : <><Send size={16} /> Submit Attendance</>
          }
        </button>
      </div>

      {/* Modals */}
      {showAddVisitor && (
        <AddFirstTimerModal
          onAdd={v => setVisitors(p => [...p, { ...v, id: v.id || `v-${Date.now()}`, record: { ...defaultRecord(), present: true } }])}
          onClose={() => setShowAddVisitor(false)}
        />
      )}

      {showSubmit && (
        <SubmitModal
          totals={getTotals()}
          members={members}
          records={records}
          visitors={visitors}
          onConfirm={handleSubmit}
          onClose={() => setShowSubmit(false)}
          loading={loadingSubmit}
          isResubmit={hasSubmitted}
        />
      )}

      {/* Toast */}
      {showToast && (
        <div style={{
          position:      'fixed',
          top:           '72px',
          left:          '50%',
          transform:     'translateX(-50%)',
          zIndex:        200,
          background:    color.navyDark,
          color:         color.cream,
          padding:       '12px 22px',
          borderRadius:  radius.xl,
          boxShadow:     shadow.modal,
          display:       'flex',
          alignItems:    'center',
          gap:           '10px',
          fontSize:      fontSize.sm,
          fontWeight:    '600',
          fontFamily:    font.body,
          whiteSpace:    'nowrap',
          animation:     'slideUp 0.3s ease',
          pointerEvents: 'none',
        }}>
          <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: color.success, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Check size={13} color="white" strokeWidth={3} />
          </div>
          {hasSubmitted ? 'Updated — pending admin approval' : 'Submitted — pending admin approval'}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin    { to { transform:rotate(360deg); } }
      `}</style>
    </ClassShell>
  )
}