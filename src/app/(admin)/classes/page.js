'use client'

import { useState } from 'react'
import { ArrowLeft, Copy, RefreshCw, Plus, Users, Check } from 'lucide-react'

// ── Mock data ─────────────────────────────────────────────────
const MOCK_CLASSES = [
  {
    id: 'c1', name: 'Youth A', group: 'Youth', memberCount: 24,
    code: 'XKP739M2', lastSubmitted: 'Sun 15 Jun 2025', isActive: true,
    members: [
      { id: 'm1', name: 'Adaeze Obi',    gender: 'F', joined: 'Jan 2024', isActive: true,  attendanceRate: 92 },
      { id: 'm2', name: 'Chidi Eze',     gender: 'M', joined: 'Mar 2024', isActive: true,  attendanceRate: 75 },
      { id: 'm3', name: 'Ngozi Okafor',  gender: 'F', joined: 'Jan 2024', isActive: false, attendanceRate: 40 },
      { id: 'm4', name: 'Emeka Nwosu',   gender: 'M', joined: 'Jun 2024', isActive: true,  attendanceRate: 88 },
      { id: 'm5', name: 'Blessing Uche', gender: 'F', joined: 'Feb 2024', isActive: true,  attendanceRate: 96 },
    ],
  },
  {
    id: 'c2', name: 'Youth B', group: 'Youth', memberCount: 21,
    code: 'BTR412N8', lastSubmitted: 'Sun 15 Jun 2025', isActive: true,
    members: [
      { id: 'm6', name: 'Tochi Ibe',       gender: 'M', joined: 'Jan 2024', isActive: true,  attendanceRate: 83 },
      { id: 'm7', name: 'Amara Okonkwo',   gender: 'F', joined: 'Apr 2024', isActive: true,  attendanceRate: 70 },
      { id: 'm8', name: 'Kelechi Onu',     gender: 'M', joined: 'Jan 2024', isActive: true,  attendanceRate: 91 },
    ],
  },
  {
    id: 'c3', name: "Men's Class A", group: 'Men', memberCount: 35,
    code: 'LQZ856P1', lastSubmitted: 'Sun 8 Jun 2025', isActive: true,
    members: [
      { id: 'm9',  name: 'Pastor Emeka',   gender: 'M', joined: 'Jan 2023', isActive: true,  attendanceRate: 98 },
      { id: 'm10', name: 'Deacon Chukwu',  gender: 'M', joined: 'Jan 2023', isActive: true,  attendanceRate: 87 },
    ],
  },
  {
    id: 'c4', name: "Women's Fellowship", group: 'Women', memberCount: 42,
    code: 'WJC293K7', lastSubmitted: 'Sun 8 Jun 2025', isActive: true,
    members: [
      { id: 'm11', name: 'Mama Ngozi',    gender: 'F', joined: 'Jan 2023', isActive: true, attendanceRate: 94 },
      { id: 'm12', name: 'Sister Grace',  gender: 'F', joined: 'Mar 2023', isActive: true, attendanceRate: 82 },
    ],
  },
  {
    id: 'c5', name: 'Senior Adults', group: 'Seniors', memberCount: 18,
    code: 'RNM571Q4', lastSubmitted: 'Sun 15 Jun 2025', isActive: true,
    members: [
      { id: 'm13', name: 'Elder Taiwo',   gender: 'M', joined: 'Jan 2023', isActive: true, attendanceRate: 90 },
    ],
  },
]

// ── Code generator ────────────────────────────────────────────
function generateCode() {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits  = '23456789'
  let code = ''
  for (let i = 0; i < 3; i++) code += letters[Math.floor(Math.random() * letters.length)]
  for (let i = 0; i < 3; i++) code += digits[Math.floor(Math.random() * digits.length)]
  code += letters[Math.floor(Math.random() * letters.length)]
  code += digits[Math.floor(Math.random() * digits.length)]
  return code
}

// ── Attendance bar ────────────────────────────────────────────
function AttendanceBar({ rate }) {
  const color = rate >= 75 ? 'var(--success)' : rate >= 50 ? 'var(--warning)' : 'var(--error)'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', background: 'var(--cream-dark)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{ width: `${rate}%`, height: '100%', background: color, borderRadius: '99px' }} />
      </div>
      <span style={{ fontSize: '11px', fontWeight: '700', color, minWidth: '32px', textAlign: 'right' }}>
        {rate}%
      </span>
    </div>
  )
}

// ── Class card ────────────────────────────────────────────────
function ClassCard({ cls, onClick }) {
  return (
    <button onClick={onClick} style={styles.classCard}>
      <div style={styles.classCardTop}>
        <div style={styles.classIconBox}>
          <Users size={18} color="var(--navy)" />
        </div>
        <div style={{ flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy)', margin: '0 0 2px' }}>
            {cls.name}
          </p>
          <span className="badge badge-mist" style={{ fontSize: '9px' }}>{cls.group}</span>
        </div>
      </div>
      <div style={styles.classCardStats}>
        <div>
          <p style={styles.statNum}>{cls.memberCount}</p>
          <p style={styles.statLbl}>members</p>
        </div>
        <div>
          <p style={styles.statLbl}>Last submitted</p>
          <p style={{ ...styles.statNum, fontSize: '11px', color: 'var(--mist)' }}>{cls.lastSubmitted}</p>
        </div>
      </div>
      <div style={styles.classCode}>
        <span style={{ fontSize: '10px', fontWeight: '600', color: 'var(--mist)' }}>CODE</span>
        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--navy)', letterSpacing: '0.1em' }}>
          {cls.code.slice(0, 4)}-{cls.code.slice(4)}
        </span>
      </div>
    </button>
  )
}

// ── Create Class Modal ────────────────────────────────────────
function CreateClassModal({ onClose, onCreate }) {
  const [name, setName]     = useState('')
  const [group, setGroup]   = useState('')
  const [pin, setPin]       = useState('')
  const [code]              = useState(generateCode())

  function handleCreate() {
    if (!name.trim() || !pin || pin.length < 4) return
    onCreate({ name: name.trim(), group, code, pin })
    onClose()
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '20px', color: 'var(--navy)', margin: 0 }}>
            New Class
          </h3>
          <button onClick={onClose} style={styles.closeBtn}>
            <ArrowLeft size={16} color="var(--mist)" />
          </button>
        </div>

        <div style={styles.formField}>
          <label style={styles.fieldLabel}>Class Name</label>
          <input className="input" placeholder="e.g. Youth A" value={name} onChange={e => setName(e.target.value)} style={{ background: '#fff' }} />
        </div>

        <div style={styles.formField}>
          <label style={styles.fieldLabel}>Group (optional)</label>
          <input className="input" placeholder="e.g. Youth, Men, Women" value={group} onChange={e => setGroup(e.target.value)} style={{ background: '#fff' }} />
        </div>

        <div style={styles.formField}>
          <label style={styles.fieldLabel}>4-digit PIN</label>
          <input
            className="input" placeholder="e.g. 1234" maxLength={4}
            type="password" value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
            style={{ background: '#fff', letterSpacing: '0.2em', fontSize: '20px' }}
          />
          <p style={{ fontSize: '11px', color: 'var(--mist)', margin: '4px 0 0' }}>
            Share this PIN with the class teacher only
          </p>
        </div>

        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: '16px' }}>
          <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--mist)', margin: '0 0 4px' }}>AUTO-GENERATED CLASS CODE</p>
          <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--navy)', letterSpacing: '0.12em', margin: 0 }}>
            {code.slice(0, 4)}-{code.slice(4)}
          </p>
          <p style={{ fontSize: '11px', color: 'var(--mist)', margin: '4px 0 0' }}>Share this code with teachers to log in</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={!name.trim() || pin.length < 4}>
            Create Class
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Class Detail ──────────────────────────────────────────────
function ClassDetail({ cls, onBack }) {
  const [copied, setCopied]   = useState(false)
  const [code, setCode]       = useState(cls.code)
  const [members, setMembers] = useState(cls.members)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMemberName, setNewMemberName] = useState('')

  function copyCode() {
    navigator.clipboard.writeText(`${code.slice(0,4)}-${code.slice(4)}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function regenerateCode() {
    setCode(generateCode())
  }

  function toggleMember(id) {
    setMembers(p => p.map(m => m.id === id ? { ...m, isActive: !m.isActive } : m))
  }

  function addMember() {
    if (!newMemberName.trim()) return
    setMembers(p => [...p, {
      id: `m${Date.now()}`, name: newMemberName.trim(),
      gender: '—', joined: 'Jun 2025', isActive: true, attendanceRate: 0,
    }])
    setNewMemberName('')
    setShowAddMember(false)
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
        <button onClick={onBack} style={styles.breadcrumbBtn}>
          <ArrowLeft size={14} /> Classes
        </button>
        <span style={{ color: 'var(--mist)' }}>›</span>
        <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)' }}>{cls.name}</span>
      </div>

      {/* Class header card */}
      <div style={{ ...styles.detailCard, marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', color: 'var(--navy)', margin: '0 0 4px' }}>
              {cls.name}
            </h2>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="badge badge-mist">{cls.group}</span>
              <span className="badge badge-green">{members.filter(m => m.isActive).length} active</span>
            </div>
          </div>

          {/* Code box */}
          <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 16px', textAlign: 'center', minWidth: '160px' }}>
            <p style={{ fontSize: '10px', fontWeight: '700', color: 'var(--mist)', margin: '0 0 6px', letterSpacing: '0.06em' }}>
              CLASS CODE
            </p>
            <p style={{ fontSize: '22px', fontWeight: '700', color: 'var(--navy)', margin: '0 0 8px', letterSpacing: '0.12em' }}>
              {code.slice(0, 4)}-{code.slice(4)}
            </p>
            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
              <button className="btn btn-secondary btn-sm" onClick={copyCode} style={{ gap: '4px' }}>
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
              <button className="btn btn-secondary btn-sm" onClick={regenerateCode} style={{ gap: '4px' }}>
                <RefreshCw size={12} />
                New code
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div style={styles.detailCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontSize: '15px', fontWeight: '700', color: 'var(--navy)', margin: 0 }}>
            Members ({members.length})
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddMember(p => !p)}
            style={{ gap: '6px' }}
          >
            <Plus size={14} />
            Add Member
          </button>
        </div>

        {/* Add member inline */}
        {showAddMember && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              className="input"
              placeholder="Full name"
              value={newMemberName}
              onChange={e => setNewMemberName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addMember()}
              style={{ background: '#fff' }}
              autoFocus
            />
            <button className="btn btn-primary" onClick={addMember} disabled={!newMemberName.trim()}>
              Add
            </button>
            <button className="btn btn-secondary" onClick={() => setShowAddMember(false)}>
              Cancel
            </button>
          </div>
        )}

        {/* Member rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {members.map(m => (
            <div key={m.id} style={{
              ...styles.memberRow,
              opacity: m.isActive ? 1 : 0.5,
            }}>
              <div style={styles.memberAvatar}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--cream)' }}>
                  {m.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '14px', fontWeight: '600', color: 'var(--navy)', margin: '0 0 4px' }}>
                  {m.name}
                </p>
                <AttendanceBar rate={m.attendanceRate} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                <span style={{ fontSize: '10px', color: 'var(--mist)' }}>
                  {m.isActive ? 'Active' : 'Inactive'}
                </span>
                {/* Toggle active */}
                <button
                  onClick={() => toggleMember(m.id)}
                  style={{
                    width: '36px', height: '20px', borderRadius: '99px',
                    background: m.isActive ? 'var(--success)' : 'var(--cream-dark)',
                    border: 'none', cursor: 'pointer', position: 'relative',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{
                    width: '14px', height: '14px', borderRadius: '50%',
                    background: '#fff', position: 'absolute', top: '3px',
                    left: m.isActive ? '19px' : '3px',
                    transition: 'left 0.2s',
                  }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main Classes Page ─────────────────────────────────────────
export default function ClassesPage() {
  const [selected, setSelected]   = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [classes, setClasses]     = useState(MOCK_CLASSES)

  if (selected) {
    return (
      <ClassDetail
        cls={classes.find(c => c.id === selected)}
        onBack={() => setSelected(null)}
      />
    )
  }

  function handleCreate(data) {
    setClasses(p => [...p, {
      id: `c${Date.now()}`, ...data,
      memberCount: 0, lastSubmitted: 'Never', isActive: true, members: [],
    }])
  }

  return (
    <div style={styles.page}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Classes</h1>
          <p style={styles.pageSub}>{classes.length} classes across your church</p>
        </div>
        <button
          className="btn btn-primary"
          style={{ gap: '8px' }}
          onClick={() => setShowCreate(true)}
        >
          <Plus size={16} />
          New Class
        </button>
      </div>

      <div style={styles.classGrid}>
        {classes.map(c => (
          <ClassCard key={c.id} cls={c} onClick={() => setSelected(c.id)} />
        ))}
      </div>

      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreate}
        />
      )}
    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page:         { display: 'flex', flexDirection: 'column', gap: '20px' },
  pageHeader:   { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' },
  pageTitle:    { fontFamily: 'var(--font-display)', fontSize: '28px', color: 'var(--navy)', margin: '0 0 4px' },
  pageSub:      { fontSize: '13px', color: 'var(--mist)', margin: 0 },
  classGrid:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' },
  classCard:    { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '16px', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px', textAlign: 'left', transition: 'box-shadow 0.15s' },
  classCardTop: { display: 'flex', alignItems: 'center', gap: '12px' },
  classIconBox: { width: '40px', height: '40px', borderRadius: '10px', background: 'var(--cream-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  classCardStats: { display: 'flex', justifyContent: 'space-between', gap: '8px' },
  statNum:      { fontSize: '18px', fontWeight: '700', color: 'var(--navy)', margin: '0 0 2px', fontFamily: 'var(--font-display)' },
  statLbl:      { fontSize: '10px', color: 'var(--mist)', margin: 0, fontWeight: '600', letterSpacing: '0.04em' },
  classCode:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--cream)', borderRadius: '8px', padding: '8px 12px' },
  overlay:      { position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' },
  modal:        { background: '#fff', borderRadius: 'var(--radius-xl)', padding: '28px', width: '100%', maxWidth: '440px', maxHeight: '90vh', overflowY: 'auto' },
  closeBtn:     { background: 'none', border: 'none', cursor: 'pointer', padding: '6px' },
  formField:    { display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' },
  fieldLabel:   { fontSize: '12px', fontWeight: '600', color: 'var(--mist)', letterSpacing: '0.05em', textTransform: 'uppercase' },
  detailCard:   { background: '#fff', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-card)', padding: '20px' },
  breadcrumbBtn:{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'var(--mist)', padding: 0 },
  memberRow:    { display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '10px 12px' },
  memberAvatar: { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--navy)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
}