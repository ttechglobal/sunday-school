'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  UserPlus, ArrowLeft, Edit2, Users,
  Check, X, Phone, Calendar,
  ChevronRight, Filter, User,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import StatusBadge from '@/components/class/ui/StatusBadge'
import EmptyState from '@/components/class/ui/EmptyState'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { FilterTabs, SearchInput } from '@/components/class/ui/FilterBar'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function getInitials(f, l) { return `${f?.[0] || ''}${l?.[0] || ''}`.toUpperCase() }
function formatDate(str) {
  if (!str) return null
  return new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(str))
}

function Avatar({ first, last, size = 40, active = true }) {
  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      flexShrink: 0,
      background: active
        ? `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`
        : color.creamDark,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: font.heading,
      fontSize: `${Math.round(size * 0.33)}px`,
      fontWeight: '700',
      color: active ? color.cream : color.inkSubtle,
    }}>
      {getInitials(first, last)}
    </div>
  )
}

function AttendanceBar({ rate }) {
  const c = rate >= 75 ? color.success : rate >= 50 ? color.warning : color.error
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ flex: 1, height: '6px', background: color.creamDark, borderRadius: '3px', overflow: 'hidden', minWidth: '60px' }}>
        <div style={{ width: `${rate}%`, height: '100%', background: c, borderRadius: '3px', transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: font.body, fontSize: fontSize['2xs'], fontWeight: '700', color: c, minWidth: '28px', textAlign: 'right' }}>
        {rate}%
      </span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: font.body }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function MemberModal({ member, classes, onClose, onSave }) {
  const isEdit = !!member
const [form, setForm] = useState({
  fullName:    member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim() || '',
  classId:     member?.class_id   || '',
  gender:      member?.gender     || '',
  phoneNumber: member?.phone_number || '',
  address:     member?.address    || '',
  joinedAt:    member?.joined_at  || '',
})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function set(f, v) { setForm(p => ({ ...p, [f]: v })); setError('') }

  async function handleSave() {
    if (!form.fullName.trim()) { setError('Full name is required.'); return }
    setLoading(true)
    try {
      const url = isEdit ? `/api/admin/members/${member.id}` : '/api/admin/members'
      const method = isEdit ? 'PATCH' : 'POST'
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
        fullName:    form.fullName,
        classId:     form.classId,
        gender:      form.gender,
        phoneNumber: form.phoneNumber,
        address:     form.address,
        joinedAt:    form.joinedAt,
      }) })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); setLoading(false); return }
      onSave(data.member, isEdit)
      onClose()
    } catch { setError('Connection error.'); setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(3px)', animation: 'fadeIn 0.2s ease' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '480px', boxShadow: shadow.modal, animation: 'scaleIn 0.2s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '800', color: color.ink, margin: 0, letterSpacing: '-0.01em' }}>
              {isEdit ? 'Edit Member' : 'Add Member'}
            </h3>
            <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: '3px 0 0', fontFamily: font.body }}>
              {isEdit ? 'Update member information' : 'Add a new member to a class'}
            </p>
          </div>
          <button onClick={onClose} style={{ background: color.creamDark, border: 'none', borderRadius: radius.md, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={18} color={color.inkMuted} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div >
            <Field label="Full Name *">
              <input
                className="input"
                placeholder="e.g. Adaeze Okonkwo"
                value={form.fullName}
                onChange={e => set('fullName', e.target.value)}
                autoFocus
                style={{ background: color.cream }}
              />
            </Field>
          </div>
          <Field label="Class">
            <select className="input" value={form.classId} onChange={e => set('classId', e.target.value)} style={{ background: color.cream }}>
              <option value="">— No class —</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.group_name ? ` (${c.group_name})` : ''}</option>)}
            </select>
          </Field>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Field label="Gender">
              <select className="input" value={form.gender} onChange={e => set('gender', e.target.value)} style={{ background: color.cream }}>
                <option value="">Not specified</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </Field>
            <Field label="Phone">
              <input className="input" placeholder="08012345678" value={form.phone} onChange={e => set('phone', e.target.value)} style={{ background: color.cream }} />
            </Field>
          </div>
          <Field label="Date Joined">
            <input type="date" className="input" value={form.joinedAt} onChange={e => set('joinedAt', e.target.value)} style={{ background: color.cream }} />
          </Field>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: color.errorBg, borderRadius: radius.md, border: `1px solid ${color.errorBorder}` }}>
              <X size={14} color={color.error} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, fontFamily: font.body }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleSave} disabled={loading} style={{ fontFamily: font.body }}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MemberDetail({ member, onBack, onEdit, onToggleActive }) {
  const rate = member.attendance_rate ?? 0
  const infoItems = [
    { label: 'Class', value: member.classes?.name || 'No class assigned', icon: <Users size={16} color={color.navy} /> },
    { label: 'Gender', value: member.gender === 'M' ? 'Male' : member.gender === 'F' ? 'Female' : 'Not set', icon: <User size={16} color={color.navy} /> },
    { label: 'Phone', value: member.phone || 'Not added', icon: <Phone size={16} color={color.navy} /> },
    { label: 'Joined', value: formatDate(member.joined_at) || 'Unknown', icon: <Calendar size={16} color={color.navy} /> },
  ]

  return (
    <div>
      <button onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '0 0 20px' }}>
        <ArrowLeft size={16} /> All Members
      </button>

      <div style={{ background: color.white, borderRadius: radius['2xl'], border: `1px solid ${color.creamBorder}`, padding: '24px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '18px', flexWrap: 'wrap' }}>
          <Avatar first={member.first_name} last={member.last_name} size={64} active={member.is_active} />
          <div style={{ flex: 1, minWidth: '200px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', flexWrap: 'wrap' }}>
              <h2 style={{ fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800', color: color.ink, margin: 0, letterSpacing: '-0.02em' }}>
                {member.first_name} {member.last_name}
              </h2>
              <StatusBadge status={member.is_active ? 'active' : 'inactive'} />
            </div>
            {member.classes?.name && (
              <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 14px', fontFamily: font.body }}>
                {member.classes.name}{member.classes.group_name && ` · ${member.classes.group_name}`}
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button className="btn btn-primary btn-sm" onClick={onEdit} style={{ gap: '6px', fontFamily: font.body }}>
                <Edit2 size={13} /> Edit
              </button>
              <button className={`btn btn-sm ${member.is_active ? 'btn-danger' : 'btn-secondary'}`} onClick={onToggleActive} style={{ fontFamily: font.body }}>
                {member.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '20px', padding: '14px 16px', background: color.cream, borderRadius: radius.lg }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: font.body }}>Attendance Rate</p>
            <span style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '800', color: rate >= 75 ? color.success : rate >= 50 ? color.warning : color.error }}>{rate}%</span>
          </div>
          <AttendanceBar rate={rate} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
        {infoItems.map(s => (
          <div key={s.label} style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '14px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: radius.sm, background: 'rgba(15,37,87,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {s.icon}
              </div>
              <p style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, fontFamily: font.body }}>{s.label}</p>
            </div>
            <p style={{ fontFamily: font.body, fontSize: fontSize.base, fontWeight: '600', color: color.ink, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MembersPage() {
  const [members, setMembers] = useState([])
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [classFilter, setClassFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [selected, setSelected] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editMember, setEditMember] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [mRes, cRes] = await Promise.all([fetch('/api/admin/members'), fetch('/api/admin/classes')])
      const [mData, cData] = await Promise.all([mRes.json(), cRes.json()])
      if (mRes.ok) setMembers(mData.members || [])
      if (cRes.ok) setClasses(cData.classes || [])
    } finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleToggleActive(id, current) {
    await fetch(`/api/admin/members/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isActive: !current }) })
    setMembers(p => p.map(m => m.id === id ? { ...m, is_active: !current } : m))
    if (selected?.id === id) setSelected(p => ({ ...p, is_active: !current }))
  }

  function handleSaved(member, isEdit) {
    if (isEdit) {
      setMembers(p => p.map(m => m.id === member.id ? { ...m, ...member } : m))
      if (selected?.id === member.id) setSelected(p => ({ ...p, ...member }))
    } else {
      setMembers(p => [member, ...p])
    }
  }

  const filtered = members.filter(m => {
    const name = `${m.first_name} ${m.last_name}`.toLowerCase()
    const q = search.toLowerCase()
    const matchSearch = !search.trim() || name.includes(q) || (m.classes?.name || '').toLowerCase().includes(q) || (m.phone || '').includes(q)
    const matchStatus = filter === 'all' ? true : filter === 'active' ? m.is_active : !m.is_active
    const matchClass = !classFilter || m.class_id === classFilter
    return matchSearch && matchStatus && matchClass
  })

  const tabs = [
    { id: 'all', label: 'All', count: members.length },
    { id: 'active', label: 'Active', count: members.filter(m => m.is_active).length },
    { id: 'inactive', label: 'Inactive', count: members.filter(m => !m.is_active).length },
  ]

  const stats = [
    { label: 'Total', value: members.length, c: color.navy },
    { label: 'Active', value: members.filter(m => m.is_active).length, c: color.success },
    { label: 'Inactive', value: members.filter(m => !m.is_active).length, c: color.error },
    { label: 'Male', value: members.filter(m => m.gender === 'M' && m.is_active).length, c: color.navyLight },
    { label: 'Female', value: members.filter(m => m.gender === 'F' && m.is_active).length, c: '#BE185D' },
  ]

  if (selected) {
    return (
      <div>
        <MemberDetail member={selected} onBack={() => setSelected(null)} onEdit={() => { setEditMember(selected); setShowModal(true) }} onToggleActive={() => handleToggleActive(selected.id, selected.is_active)} />
        {showModal && <MemberModal member={editMember} classes={classes} onClose={() => { setShowModal(false); setEditMember(null) }} onSave={handleSaved} />}
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Members"
        subtitle={`${members.filter(m => m.is_active).length} active members`}
        action={
          <button className="btn btn-primary" onClick={() => { setEditMember(null); setShowModal(true) }} style={{ gap: '7px', fontFamily: font.body }}>
            <UserPlus size={16} /> Add Member
          </button>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px', marginBottom: '24px' }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '16px', textAlign: 'center' }}>
            <p style={{ fontFamily: font.heading, fontSize: fontSize['2xl'], fontWeight: '800', color: s.c, margin: '0 0 4px', letterSpacing: '-0.02em', lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: font.body }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ flex: 1, minWidth: '220px' }}>
          <SearchInput value={search} onChange={setSearch} placeholder="Search name, class, or phone…" />
        </div>
        <button
          onClick={() => setShowFilters(p => !p)}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: showFilters ? color.navy : color.white, color: showFilters ? color.cream : color.inkMuted, border: `1.5px solid ${showFilters ? color.navy : color.creamBorder}`, borderRadius: radius.md, padding: '10px 14px', cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body, height: '48px', transition: 'all 0.15s' }}
        >
          <Filter size={15} /> Filter {classFilter && <span style={{ background: color.cream, color: color.navy, borderRadius: radius.full, padding: '1px 6px', fontSize: fontSize['2xs'], fontWeight: '700' }}>1</span>}
        </button>
      </div>

      {showFilters && (
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '16px 20px', marginBottom: '14px', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', animation: 'slideUp 0.2s ease' }}>
          <div>
            <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.inkMuted, textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 8px', fontFamily: font.body }}>Filter by Class</p>
            <select value={classFilter} onChange={e => setClassFilter(e.target.value)} style={{ height: '42px', padding: '0 12px', fontFamily: font.body, fontSize: fontSize.sm, color: color.ink, background: color.white, border: `1.5px solid ${color.creamBorder}`, borderRadius: radius.md, outline: 'none', cursor: 'pointer', minWidth: '180px' }}>
              <option value="">All classes</option>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}{c.group_name ? ` (${c.group_name})` : ''}</option>)}
            </select>
          </div>
          {classFilter && <button onClick={() => setClassFilter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: color.error, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '8px 0' }}>Clear</button>}
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <FilterTabs tabs={tabs} active={filter} onChange={setFilter} />
      </div>

      {!loading && (
        <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: '0 0 10px', fontFamily: font.body }}>
          {filtered.length === members.length ? `${filtered.length} members` : `${filtered.length} of ${members.length} members`}
        </p>
      )}

      {loading ? (
        <SkeletonList count={6} height={68} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Users size={28} />}
          title={search ? 'No members found' : 'No members yet'}
          message={search ? 'Try a different search.' : 'Add your first member to get started.'}
          action={!search && filter === 'all' ? { label: 'Add First Member', onClick: () => setShowModal(true) } : undefined}
        />
      ) : (
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
          {filtered.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '14px 20px', background: 'transparent', border: 'none', borderBottom: i < filtered.length - 1 ? `1px solid ${color.creamBorder}` : 'none', cursor: 'pointer', width: '100%', textAlign: 'left', transition: 'background 0.12s ease', opacity: m.is_active ? 1 : 0.55 }}
              onMouseEnter={e => e.currentTarget.style.background = color.cream}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar first={m.first_name} last={m.last_name} size={42} active={m.is_active} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                  <p style={{ fontFamily: font.body, fontSize: fontSize.base, fontWeight: '600', color: color.ink, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {m.first_name} {m.last_name}
                  </p>
                  {!m.is_active && <StatusBadge status="inactive" size="sm" />}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {m.classes?.name && <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, background: color.creamDark, padding: '1px 8px', borderRadius: radius.full, fontWeight: '500', whiteSpace: 'nowrap' }}>{m.classes.name}</span>}
                  {m.gender && <span style={{ fontSize: fontSize.xs, color: color.inkSubtle }}>{m.gender === 'M' ? 'Male' : 'Female'}</span>}
                </div>
              </div>
              <ChevronRight size={18} color={color.inkSubtle} style={{ flexShrink: 0 }} />
            </button>
          ))}
        </div>
      )}

      {showModal && <MemberModal member={editMember} classes={classes} onClose={() => { setShowModal(false); setEditMember(null) }} onSave={handleSaved} />}
    </div>
  )
}