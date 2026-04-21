'use client'

import { useState } from 'react'
import { ArrowLeft, Search } from 'lucide-react'

const MOCK_MEMBERS = [
  { id: 'm1',  name: 'Adaeze Obi',      class: 'Youth A',           group: 'Youth',   gender: 'F', isActive: true,  attendanceRate: 92, joined: 'Jan 2024' },
  { id: 'm2',  name: 'Chidi Eze',       class: 'Youth A',           group: 'Youth',   gender: 'M', isActive: true,  attendanceRate: 75, joined: 'Mar 2024' },
  { id: 'm3',  name: 'Ngozi Okafor',    class: 'Youth A',           group: 'Youth',   gender: 'F', isActive: false, attendanceRate: 40, joined: 'Jan 2024' },
  { id: 'm4',  name: 'Emeka Nwosu',     class: 'Youth B',           group: 'Youth',   gender: 'M', isActive: true,  attendanceRate: 88, joined: 'Jun 2024' },
  { id: 'm5',  name: 'Blessing Uche',   class: 'Youth B',           group: 'Youth',   gender: 'F', isActive: true,  attendanceRate: 96, joined: 'Feb 2024' },
  { id: 'm6',  name: 'Kelechi Onu',     class: "Men's Class A",     group: 'Men',     gender: 'M', isActive: true,  attendanceRate: 91, joined: 'Jan 2023' },
  { id: 'm7',  name: 'Pastor Emeka',    class: "Men's Class A",     group: 'Men',     gender: 'M', isActive: true,  attendanceRate: 98, joined: 'Jan 2023' },
  { id: 'm8',  name: 'Mama Ngozi',      class: "Women's Fellowship",group: 'Women',   gender: 'F', isActive: true,  attendanceRate: 94, joined: 'Jan 2023' },
  { id: 'm9',  name: 'Sister Grace',    class: "Women's Fellowship",group: 'Women',   gender: 'F', isActive: true,  attendanceRate: 82, joined: 'Mar 2023' },
  { id: 'm10', name: 'Elder Taiwo',     class: 'Senior Adults',     group: 'Seniors', gender: 'M', isActive: true,  attendanceRate: 90, joined: 'Jan 2023' },
  { id: 'm11', name: 'Tochi Ibe',       class: 'Youth B',           group: 'Youth',   gender: 'M', isActive: true,  attendanceRate: 83, joined: 'Jan 2024' },
  { id: 'm12', name: 'Amara Okonkwo',   class: 'Youth A',           group: 'Youth',   gender: 'F', isActive: false, attendanceRate: 55, joined: 'Apr 2024' },
]

// ── Attendance bar ────────────────────────────────────────────
function AttendanceBar({ rate }) {
  const color = rate >= 75 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--error)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <div style={{ flex: 1, height: '5px', background: 'var(--cream-dark)', borderRadius: '99px', overflow: 'hidden', minWidth: '60px' }}>
        <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: '99px' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: '700', color, minWidth: '28px' }}>{rate}%</span>
    </div>
  )
}

// ── Member detail ─────────────────────────────────────────────
function MemberDetail({ member, onBack, onToggleActive }) {
  // Mock weekly attendance for last 8 weeks
  const weeks = [
    { label: '6 Apr', present: true  },
    { label: '13 Apr',present: true  },
    { label: '20 Apr',present: false },
    { label: '27 Apr',present: true  },
    { label: '4 May', present: true  },
    { label: '11 May',present: false },
    { label: '8 Jun', present: true  },
    { label: '15 Jun',present: true  },
  ]

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={onBack} style={styles.breadcrumbBtn}>
          <ArrowLeft size={14} /> Members
        </button>
        <span style={{ color: 'var(--mist)' }}>›</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>{member.name}</span>
      </div>

      {/* Header card */}
      <div style={{ ...styles.card, marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <div style={styles.bigAvatar}>
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--cream)' }}>
              {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--navy)', margin: '0 0 6px' }}>
              {member.name}
            </h2>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              <span className="badge badge-mist">{member.class}</span>
              <span className="badge badge-mist">{member.group}</span>
              <span className={`badge ${member.isActive ? 'badge-green' : 'badge-red'}`}>
                {member.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <button
            className={`btn btn-sm ${member.isActive ? 'btn-danger' : 'btn-secondary'}`}
            onClick={onToggleActive}
          >
            {member.isActive ? 'Deactivate' : 'Reactivate'}
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        {[
          { label: 'Attendance Rate', value: `${member.attendanceRate}%`, color: member.attendanceRate >= 75 ? 'var(--success)' : 'var(--warning)' },
          { label: 'Gender',  value: member.gender === 'M' ? 'Male' : 'Female', color: 'var(--navy)' },
          { label: 'Joined',  value: member.joined, color: 'var(--navy)' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-card)', padding: '14px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: '700', color: s.color, margin: '0 0 4px' }}>{s.value}</p>
            <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--mist)', margin: 0, letterSpacing: '0.04em' }}>{s.label.toUpperCase()}</p>
          </div>
        ))}
      </div>

      {/* Weekly attendance grid */}
      <div style={styles.card}>
        <p style={{ fontSize: '14px', fontWeight: '700', color: 'var(--navy)', margin: '0 0 16px' }}>
          Attendance History (last 8 Sundays)
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {weeks.map((w, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: w.present ? 'var(--navy)' : 'var(--cream-dark)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {w.present
                  ? <span style={{ fontSize: '14px' }}>✓</span>
                  : <span style={{ fontSize: '14px', color: 'var(--mist)' }}>✗</span>
                }
              </div>
              <span style={{ fontSize: '9px', color: 'var(--mist)', fontWeight: '600', textAlign: 'center' }}>
                {w.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Members Page ─────────────────────────────────────────
export default function MembersPage() {
  const [members, setMembers]     = useState(MOCK_MEMBERS)
  const [selected, setSelected]   = useState(null)
  const [search, setSearch]       = useState('')
  const [filter, setFilter]       = useState('all')

  const selectedMember = members.find(m => m.id === selected)

  if (selectedMember) {
    return (
      <MemberDetail
        member={selectedMember}
        onBack={() => setSelected(null)}
        onToggleActive={() =>
          setMembers(p => p.map(m =>
            m.id === selected ? { ...m, isActive: !m.isActive } : m
          ))
        }
      />
    )
  }

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase())
      || m.class.toLowerCase().includes(search.toLowerCase())
    const matchFilter =
      filter === 'all'      ? true :
      filter === 'active'   ? m.isActive :
      filter === 'inactive' ? !m.isActive : true
    return matchSearch && matchFilter
  })

  const filters = [
    { id: 'all',      label: `All (${members.length})` },
    { id: 'active',   label: `Active (${members.filter(m => m.isActive).length})` },
    { id: 'inactive', label: `Inactive (${members.filter(m => !m.isActive).length})` },
  ]

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Members</h1>
          <p style={styles.pageSub}>{members.length} members across all classes</p>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} color="var(--mist)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
        <input
          className="input"
          placeholder="Search by name or class…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ paddingLeft: '40px', background: '#fff' }}
        />
      </div>

      {/* Filter tabs */}
      <div style={styles.tabs}>
        {filters.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            style={{
              ...styles.tab,
              background: filter === f.id ? 'var(--navy)' : 'transparent',
              color: filter === f.id ? 'var(--cream)' : 'var(--mist)',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Member list */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy)', margin: '0 0 4px' }}>No members found</p>
            <p style={{ fontSize: '13px', color: 'var(--mist)', margin: 0 }}>Try a different search or filter</p>
          </div>
        ) : (
          filtered.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setSelected(m.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 16px', width: '100%', border: 'none',
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                borderBottom: i < filtered.length - 1 ? '1px solid var(--cream-dark)' : 'none',
                transition: 'background 0.1s',
              }}
            >
              {/* Avatar */}
              <div style={styles.memberAvatar}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--cream)' }}>
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>

              {/* Name + class */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: m.isActive ? 'var(--navy)' : 'var(--mist)', margin: '0 0 2px' }}>
                  {m.name}
                </p>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <span className="badge badge-mist" style={{ fontSize: '9px' }}>{m.class}</span>
                  {!m.isActive && <span className="badge badge-red" style={{ fontSize: '9px' }}>Inactive</span>}
                </div>
              </div>

              {/* Attendance bar */}
              <div style={{ width: '120px', flexShrink: 0 }}>
                <AttendanceBar rate={m.attendanceRate} />
              </div>

              <span style={{ color: 'var(--mist)', fontSize: '16px', flexShrink: 0 }}>›</span>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page:          { display: 'flex', flexDirection: 'column', gap: '16px' },
  pageHeader:    { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
  pageTitle:     { fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--navy)', margin: '0 0 4px' },
  pageSub:       { fontSize: '13px', color: 'var(--mist)', margin: 0 },
  tabs:          { display: 'flex', gap: '4px', background: 'var(--cream-dark)', padding: '4px', borderRadius: 'var(--radius-md)', width: 'fit-content', flexWrap: 'wrap' },
  tab:           { padding: '6px 14px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '600', fontFamily: 'var(--font-body)', transition: 'all 0.15s' },
  card:          { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '20px' },
  breadcrumbBtn: { display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--mist)', padding: 0 },
  bigAvatar:     { width: '56px', height: '56px', borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  memberAvatar:  { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
}