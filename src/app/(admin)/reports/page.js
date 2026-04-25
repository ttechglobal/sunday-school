'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Users, DollarSign, Clock,
  BookOpen, Mic, Eye, EyeOff,
  TrendingUp, TrendingDown, Minus,
  Lightbulb, BarChart2,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatNaira(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

function formatNairaShort(v) {
  if (!v) return '₦0'
  if (v >= 1000000) return `₦${(v / 1000000).toFixed(1)}M`
  if (v >= 1000)    return `₦${(v / 1000).toFixed(0)}k`
  return formatNaira(v)
}

function Trend({ current, prev, suffix = '', isGood = (d) => d >= 0 }) {
  if (!prev) return null
  const diff = current - prev
  if (diff === 0) return (
    <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '3px' }}>
      <Minus size={11} /> Same as before
    </span>
  )
  const good = isGood(diff)
  const Icon = diff > 0 ? TrendingUp : TrendingDown
  return (
    <span style={{ fontSize: fontSize.xs, color: good ? color.success : color.error, fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '3px', fontWeight: '600' }}>
      <Icon size={11} />
      {diff > 0 ? '+' : ''}{diff}{suffix} vs last period
    </span>
  )
}

function StatCard({ icon, label, value, sub, trend, hidden, onToggleHidden, hideToggle }) {
  return (
    <div style={{
      background: color.white, borderRadius: radius.xl,
      border: `1px solid ${color.creamBorder}`, padding: '20px',
      flex: 1, minWidth: '150px', position: 'relative',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: radius.md, background: 'rgba(15,37,87,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.navy }}>
          {icon}
        </div>
        {hideToggle && (
          <button
            onClick={onToggleHidden}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: color.inkSubtle }}
          >
            {hidden ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>

      <p style={{
        fontFamily:   font.heading,
        fontSize:     fontSize['2xl'],
        fontWeight:   '800',
        color:        color.navy,
        margin:       '0 0 4px',
        letterSpacing:'-0.02em',
        lineHeight:   1,
        filter:       hidden ? 'blur(8px)' : 'none',
        userSelect:   hidden ? 'none' : 'auto',
        transition:   'filter 0.2s',
        whiteSpace:   'nowrap',
      }}>
        {hidden ? '•••' : value}
      </p>

      <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: '0 0 6px', fontFamily: font.body }}>{label}</p>
      {sub && <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: '0 0 4px', fontFamily: font.body }}>{sub}</p>}
      {trend}
    </div>
  )
}

function GroupBar({ group }) {
  const barColor = group.rate >= 75 ? color.success : group.rate >= 50 ? color.warning : color.error

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '10px 0' }}>
      <p style={{ fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', color: color.ink, margin: 0, minWidth: '120px' }}>
        {group.group}
      </p>
      <div style={{ flex: 1, height: '8px', background: color.creamDark, borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${group.rate}%`, background: barColor,
          borderRadius: '4px', transition: 'width 0.5s ease',
        }} />
      </div>
      <p style={{
        fontFamily:   font.heading,
        fontSize:     fontSize.sm,
        fontWeight:   '700',
        color:        barColor,
        margin:       0,
        minWidth:     '40px',
        textAlign:    'right',
      }}>
        {group.rate}%
      </p>
    </div>
  )
}

const SCOPES = [
  { id: 'sunday', label: 'This Sunday' },
  { id: 'month',  label: 'This Month'  },
  { id: 'year',   label: 'This Year'   },
]

export default function ReportsPage() {
  const [scope,         setScope]         = useState('month')
  const [data,          setData]          = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [hideOffering,  setHideOffering]  = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hideOffering') === 'true'
    }
    return false
  })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/analytics?scope=${scope}`)
      const json = await res.json()
      if (res.ok) setData(json)
    } finally {
      setLoading(false)
    }
  }, [scope])

  useEffect(() => { fetchData() }, [fetchData])

  function toggleOffering() {
    const next = !hideOffering
    setHideOffering(next)
    localStorage.setItem('hideOffering', String(next))
  }

  const s  = data?.stats     || {}
  const ps = data?.prevStats || {}

  return (
    <div>
      <PageHeader title="Analytics & Reports" subtitle="Attendance insights across your Sunday School" />

      {/* Scope tabs */}
      <div style={{
        display:      'flex',
        gap:          '2px',
        background:   color.creamDark,
        padding:      '3px',
        borderRadius: radius.lg,
        marginBottom: '24px',
        width:        'fit-content',
      }}>
        {SCOPES.map(sc => (
          <button
            key={sc.id}
            onClick={() => setScope(sc.id)}
            style={{
              padding:      '8px 18px',
              borderRadius: radius.md,
              border:       'none',
              cursor:       'pointer',
              fontFamily:   font.body,
              fontSize:     fontSize.sm,
              fontWeight:   scope === sc.id ? '700' : '500',
              background:   scope === sc.id ? color.white : 'transparent',
              color:        scope === sc.id ? color.navy : color.inkMuted,
              boxShadow:    scope === sc.id ? '0 1px 4px rgba(15,37,87,0.1)' : 'none',
              transition:   'all 0.15s',
              whiteSpace:   'nowrap',
            }}
          >
            {sc.label}
          </button>
        ))}
      </div>

      {loading ? (
        <SkeletonList count={4} height={130} gap={12} />
      ) : !data ? (
        <p style={{ color: color.inkMuted, fontFamily: font.body }}>Failed to load analytics.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
            <StatCard
              icon={<Users size={18} />}
              label="Attended"
              value={s.totalPresent?.toLocaleString() || '0'}
              sub={`${s.totalPresent} of ${s.totalRecords} — ${s.attendanceRate}% attendance`}
              trend={<Trend current={s.totalPresent} prev={ps.totalPresent} />}
            />
            <StatCard
              icon={<Clock size={18} />}
              label="On Time"
              value={s.totalOnTime?.toLocaleString() || '0'}
              sub={`${s.onTimeRate}% of those present`}
              trend={<Trend current={s.totalOnTime} prev={ps.totalOnTime} />}
            />
            <StatCard
              icon={<BookOpen size={18} />}
              label="With Bible"
              value={s.totalBible?.toLocaleString() || '0'}
              sub={`${s.bibleRate}% of those present`}
              trend={<Trend current={s.totalBible} prev={ps.totalBible} />}
            />
            <StatCard
              icon={<Mic size={18} />}
              label="Memory Verse"
              value={s.totalVerse?.toLocaleString() || '0'}
              sub={`${s.verseRate}% of those present`}
              trend={<Trend current={s.totalVerse} prev={ps.totalVerse} />}
            />
            <StatCard
              icon={<span style={{ fontFamily: font.heading, fontWeight: '800', fontSize: '16px', color: color.navy }}>₦</span>}
              label="Total Offering"
              value={hideOffering ? '₦ ••,•••' : formatNairaShort(s.totalOffering)}
              sub={hideOffering ? '' : `${formatNaira(s.totalOffering)} collected`}
              trend={hideOffering ? null : <Trend current={s.totalOffering} prev={ps.totalOffering} suffix="" />}
              hidden={hideOffering}
              hideToggle
              onToggleHidden={toggleOffering}
            />
          </div>

          {/* Group breakdown */}
          {data.groups?.length > 0 && (
            <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '20px' }}>
              <h2 style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '800', color: color.ink, margin: '0 0 16px', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BarChart2 size={18} color={color.navy} /> Group Attendance
              </h2>
              {data.groups.map(g => <GroupBar key={g.group} group={g} />)}
            </div>
          )}

          {/* Insights */}
          {data.insights?.length > 0 && (
            <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '20px' }}>
              <h2 style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '800', color: color.ink, margin: '0 0 16px', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Lightbulb size={18} color={color.gold} /> Insights
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {data.insights.map((insight, i) => (
                  <div key={i} style={{
                    display:     'flex',
                    alignItems:  'flex-start',
                    gap:         '12px',
                    padding:     '12px 14px',
                    background:  color.cream,
                    borderRadius: radius.lg,
                    border:      `1px solid ${color.creamBorder}`,
                  }}>
                    <div style={{
                      width:          '28px', height: '28px', borderRadius: radius.sm, flexShrink: 0,
                      background:     'rgba(201,168,76,0.12)',
                      display:        'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Lightbulb size={14} color={color.gold} />
                    </div>
                    <p style={{ fontSize: fontSize.sm, color: color.ink, margin: 0, fontFamily: font.body, lineHeight: 1.6 }}>
                      {insight}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty insights */}
          {data.insights?.length === 0 && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 18px', background: color.cream,
              border: `1px solid ${color.creamBorder}`, borderRadius: radius.xl,
            }}>
              <Lightbulb size={18} color={color.inkSubtle} />
              <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
                More data needed to generate insights — try again after a few more Sundays of attendance.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}