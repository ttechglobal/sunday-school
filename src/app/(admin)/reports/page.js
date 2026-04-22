'use client'

import { useState, useEffect } from 'react'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function formatNaira(v) {
  return `₦${Number(v || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
}

export default function ReportsPage() {
  const [type, setType]     = useState('combined')
  const [scope, setScope]   = useState('church')
  const [period, setPeriod] = useState('single')
  const [date, setDate]     = useState('')
  const [month, setMonth]   = useState('')
  const [from, setFrom]     = useState('')
  const [to, setTo]         = useState('')
  const [classes, setClasses] = useState([])
  const [groups, setGroups]   = useState([])
  const [selectedClass, setSelectedClass] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  useEffect(() => {
    fetch('/api/admin/classes').then(r => r.json()).then(d => {
      const cls = d.classes || []
      setClasses(cls)
      const grps = [...new Set(cls.filter(c => c.group_name).map(c => c.group_name))]
      setGroups(grps)
    })
  }, [])

  async function generate() {
    setError('')
    setReport(null)

    const params = new URLSearchParams({ type, scope, period })
    if (period === 'single' && date)  params.set('date', date)
    if (period === 'monthly' && month) params.set('month', month)
    if (period === 'range' && from && to) { params.set('from', from); params.set('to', to) }
    if (scope === 'class' && selectedClass) params.set('classId', selectedClass)
    if (scope === 'group' && selectedGroup) params.set('group', selectedGroup)

    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/reports?${params}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to generate report.'); return }
      setReport(data)
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    window.print()
  }

  const types   = [{ id: 'attendance', label: 'Attendance' }, { id: 'offering', label: 'Offering' }, { id: 'combined', label: 'Combined' }]
  const scopes  = [{ id: 'church', label: 'Church-wide' }, { id: 'group', label: 'By Group' }, { id: 'class', label: 'By Class' }]
  const periods = [{ id: 'single', label: 'Single Sunday' }, { id: 'monthly', label: 'Monthly' }, { id: 'range', label: 'Custom Range' }]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontFamily: font.display, fontSize: fontSize.xl, color: color.navy, margin: '0 0 4px' }}>Reports</h1>
        <p style={{ fontSize: fontSize.sm, color: color.mist, margin: 0 }}>Generate attendance and offering reports for any period.</p>
      </div>

      {/* Controls */}
      <div style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Report type */}
        <div>
          <p style={s.groupLabel}>Report Type</p>
          <div style={s.toggleGroup}>
            {types.map(t => (
              <button key={t.id} onClick={() => setType(t.id)} style={{ ...s.toggleBtn, background: type === t.id ? color.navy : 'transparent', color: type === t.id ? color.cream : color.mist }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scope */}
        <div>
          <p style={s.groupLabel}>Scope</p>
          <div style={s.toggleGroup}>
            {scopes.map(sc => (
              <button key={sc.id} onClick={() => setScope(sc.id)} style={{ ...s.toggleBtn, background: scope === sc.id ? color.navy : 'transparent', color: scope === sc.id ? color.cream : color.mist }}>
                {sc.label}
              </button>
            ))}
          </div>
          {scope === 'class' && (
            <select className="input" value={selectedClass} onChange={e => setSelectedClass(e.target.value)} style={{ background: color.cream, marginTop: '10px', maxWidth: '300px', appearance: 'auto' }}>
              <option value="">— Select a class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          )}
          {scope === 'group' && (
            <select className="input" value={selectedGroup} onChange={e => setSelectedGroup(e.target.value)} style={{ background: color.cream, marginTop: '10px', maxWidth: '300px', appearance: 'auto' }}>
              <option value="">— Select a group —</option>
              {groups.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
        </div>

        {/* Period */}
        <div>
          <p style={s.groupLabel}>Period</p>
          <div style={s.toggleGroup}>
            {periods.map(p => (
              <button key={p.id} onClick={() => setPeriod(p.id)} style={{ ...s.toggleBtn, background: period === p.id ? color.navy : 'transparent', color: period === p.id ? color.cream : color.mist }}>
                {p.label}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '10px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {period === 'single' && (
              <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} style={{ background: color.cream, maxWidth: '200px' }} />
            )}
            {period === 'monthly' && (
              <input type="month" className="input" value={month} onChange={e => setMonth(e.target.value)} style={{ background: color.cream, maxWidth: '200px' }} />
            )}
            {period === 'range' && (
              <>
                <input type="date" className="input" placeholder="From" value={from} onChange={e => setFrom(e.target.value)} style={{ background: color.cream, maxWidth: '200px' }} />
                <input type="date" className="input" placeholder="To" value={to} onChange={e => setTo(e.target.value)} style={{ background: color.cream, maxWidth: '200px' }} />
              </>
            )}
          </div>
        </div>

        {error && <p style={{ fontSize: fontSize.sm, color: color.error, fontWeight: '600', margin: 0 }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary btn-lg" onClick={generate} disabled={loading} style={{ minWidth: '160px' }}>
            {loading ? 'Generating…' : 'Generate Report'}
          </button>
          {report && (
            <button className="btn btn-secondary btn-lg" onClick={handlePrint}>
              🖨 Print / Save PDF
            </button>
          )}
        </div>
      </div>

      {/* Report output */}
      {report && (
        <div id="report-output" style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, overflow: 'hidden' }}>
          {/* Report header */}
          <div style={{ background: color.navy, padding: '24px 28px' }}>
            <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: 'rgba(245,240,232,0.5)', margin: '0 0 4px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              {types.find(t => t.id === type)?.label} Report · {scopes.find(s => s.id === scope)?.label}
            </p>
            <h2 style={{ fontFamily: font.display, fontSize: fontSize.xl, color: color.cream, margin: '0 0 4px' }}>
              {report.title || 'Report'}
            </h2>
            <p style={{ fontSize: fontSize.sm, color: 'rgba(245,240,232,0.55)', margin: 0 }}>
              Generated {new Date().toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Summary stats */}
          {report.summary && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '1px', background: color.creamDark, borderBottom: `1px solid ${color.creamDark}` }}>
              {Object.entries(report.summary).map(([key, val]) => (
                <div key={key} style={{ background: '#fff', padding: '18px 20px', textAlign: 'center' }}>
                  <p style={{ fontFamily: font.display, fontSize: fontSize.lg, fontWeight: '700', color: color.navy, margin: '0 0 4px' }}>{val}</p>
                  <p style={{ fontSize: '11px', fontWeight: '700', color: color.mist, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{key}</p>
                </div>
              ))}
            </div>
          )}

          {/* Data rows */}
          {report.rows && report.rows.length > 0 && (
            <div>
              {/* Table header */}
              <div style={{ display: 'grid', gridTemplateColumns: report.columns?.map(() => '1fr').join(' '), gap: '8px', padding: '12px 20px', background: color.cream, borderBottom: `1px solid ${color.creamDark}` }}>
                {(report.columns || []).map(col => (
                  <p key={col} style={{ fontSize: '11px', fontWeight: '700', color: color.mist, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{col}</p>
                ))}
              </div>
              {report.rows.map((row, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: report.columns?.map(() => '1fr').join(' '),
                  gap: '8px', padding: '14px 20px',
                  borderBottom: i < report.rows.length - 1 ? `1px solid ${color.creamDark}` : 'none',
                  background: row.isTotal ? color.cream : '#fff',
                }}>
                  {row.cells.map((cell, j) => (
                    <p key={j} style={{ fontSize: fontSize.base, fontWeight: row.isTotal ? '700' : '400', color: color.navy, margin: 0 }}>
                      {cell}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          )}

          {(!report.rows || report.rows.length === 0) && (
            <div style={{ padding: '48px', textAlign: 'center', color: color.mist }}>
              <p style={{ fontSize: fontSize.base, margin: 0 }}>No data found for the selected period.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media print {
          body > *:not(#report-output) { display: none; }
          #report-output { box-shadow: none; }
        }
      `}</style>
    </div>
  )
}

const s = {
  groupLabel: { fontSize: '11px', fontWeight: '700', color: color.mist, letterSpacing: '0.07em', textTransform: 'uppercase', margin: '0 0 10px' },
  toggleGroup: { display: 'flex', gap: '4px', background: color.creamDark, padding: '4px', borderRadius: radius.md, width: 'fit-content', flexWrap: 'wrap' },
  toggleBtn: { padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body, transition: 'all 0.15s' },
}