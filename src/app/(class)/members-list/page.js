'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, X, Users } from 'lucide-react'
import ClassShell from '@/components/class/ClassShell'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import EmptyState from '@/components/class/ui/EmptyState'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function Field({ label, optional, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <label style={{
          fontSize:      fontSize.xs,
          fontWeight:    '700',
          color:         color.inkMuted,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily:    font.body,
        }}>
          {label}
        </label>
        {optional && (
          <span style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, fontFamily: font.body }}>
            Optional
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function MemberModal({ member, onClose, onSave }) {
  const isEdit = !!member

  const [form, setForm] = useState({
    fullName:    member?.full_name || `${member?.first_name || ''} ${member?.last_name || ''}`.trim() || '',
    gender:      member?.gender        || '',
    phoneNumber: member?.phone_number  || '',
    address:     member?.address       || '',
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  function set(field, value) {
    setForm(p => ({ ...p, [field]: value }))
    setError('')
  }

  async function handleSave() {
    if (!form.fullName.trim()) { setError('Full name is required.'); return }
    setLoading(true)
    try {
      const url    = isEdit ? `/api/class/members/${member.id}` : '/api/class/members'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save.'); setLoading(false); return }
      onSave(data.member, isEdit)
      onClose()
    } catch {
      setError('Connection error.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      position:       'fixed',
      inset:          0,
      background:     'rgba(10,26,61,0.5)',
      display:        'flex',
      alignItems:     'flex-end',
      zIndex:         100,
      backdropFilter: 'blur(2px)',
      animation:      'fadeIn 0.2s ease',
    }}>
      <div style={{
        background:    color.white,
        borderRadius:  `${radius['2xl']} ${radius['2xl']} 0 0`,
        padding:       '8px 24px 48px',
        width:         '100%',
        maxWidth:      '560px',
        margin:        '0 auto',
        animation:     'slideUp 0.3s ease',
        maxHeight:     '90vh',
        overflowY:     'auto',
      }}>
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: color.creamBorder, margin: '12px auto 22px' }} />

        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 6px' }}>
          {isEdit ? 'Edit Member' : 'Add Member'}
        </h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 20px', fontFamily: font.body }}>
          {isEdit ? 'Update member details.' : 'Add a new member to your class.'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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

          <Field label="Gender" optional>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['', 'male', 'female'].map(g => (
                <button
                  key={g}
                  onClick={() => set('gender', g)}
                  style={{
                    flex:         1,
                    height:       '42px',
                    borderRadius: radius.md,
                    border:       `1.5px solid ${form.gender === g ? color.navy : color.creamBorder}`,
                    background:   form.gender === g ? 'rgba(15,37,87,0.06)' : color.cream,
                    color:        form.gender === g ? color.navy : color.inkMuted,
                    fontSize:     fontSize.sm,
                    fontWeight:   form.gender === g ? '700' : '500',
                    fontFamily:   font.body,
                    cursor:       'pointer',
                    transition:   'all 0.15s',
                  }}
                >
                  {g === '' ? 'Not set' : g === 'male' ? '♂ Male' : '♀ Female'}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Phone Number" optional>
            <input
              className="input"
              type="tel"
              placeholder="e.g. 08012345678"
              value={form.phoneNumber}
              onChange={e => set('phoneNumber', e.target.value)}
              style={{ background: color.cream }}
            />
          </Field>

          <Field label="Address" optional>
            <input
              className="input"
              placeholder="e.g. 12 Church Street, Surulere"
              value={form.address}
              onChange={e => set('address', e.target.value)}
              style={{ background: color.cream }}
            />
          </Field>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', background: color.errorBg, borderRadius: radius.md, border: `1px solid ${color.errorBorder}` }}>
              <X size={14} color={color.error} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: fontSize.sm, color: '#991B1B', margin: 0, fontFamily: font.body }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
            <button
              className="btn btn-primary btn-full btn-lg"
              onClick={handleSave}
              disabled={loading || !form.fullName.trim()}
              style={{ fontFamily: font.body }}
            >
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClassMembersPage() {
  const [members,    setMembers]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [editMember, setEditMember] = useState(null)
  const [classInfo,  setClassInfo]  = useState(null)

  useEffect(() => {
    async function load() {
      try {
        const [mRes, meRes] = await Promise.all([
          fetch('/api/class/members'),
          fetch('/api/class/me'),
        ])
        const [mData, meData] = await Promise.all([mRes.json(), meRes.json()])
        if (mRes.ok)  setMembers(mData.members || [])
        if (meRes.ok) setClassInfo(meData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  function handleSaved(member, isEdit) {
    if (isEdit) setMembers(p => p.map(m => m.id === member.id ? { ...m, ...member } : m))
    else        setMembers(p => [...p, member])
  }

  function getName(m) {
    return m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unknown'
  }

  const active = members.filter(m => m.is_active !== false)

  return (
    <ClassShell className={classInfo?.className} churchName={classInfo?.churchName} isAdminView={classInfo?.isAdminView}>
      <div style={{ maxWidth: '560px', margin: '0 auto', padding: '20px 16px 100px' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800', color: color.ink, margin: '0 0 2px', letterSpacing: '-0.02em' }}>
              Members
            </h1>
            <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
              {active.length} active member{active.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={() => { setEditMember(null); setShowModal(true) }}
            className="btn btn-primary"
            style={{ gap: '6px', fontFamily: font.body }}
          >
            <Plus size={16} /> Add Member
          </button>
        </div>

        {loading ? (
          <SkeletonList count={5} height={68} />
        ) : active.length === 0 ? (
          <EmptyState
            icon={<Users size={28} />}
            title="No members yet"
            message="Add members to your class so you can take attendance."
            action={{ label: 'Add First Member', onClick: () => setShowModal(true) }}
          />
        ) : (
          <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden', boxShadow: shadow.card }}>
            {active.map((m, i) => {
              const name     = getName(m)
              const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'

              return (
                <div key={m.id} style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '12px',
                  padding:      '13px 16px',
                  borderBottom: i < active.length - 1 ? `1px solid ${color.creamBorder}` : 'none',
                }}>
                  <div style={{
                    width:          '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
                    background:     `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`,
                    display:        'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily:     font.heading, fontSize: '14px', fontWeight: '700', color: color.cream,
                  }}>
                    {initials}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: font.body, fontSize: fontSize.base, fontWeight: '600', color: color.ink, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {name}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {m.gender && (
                        <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body }}>
                          {m.gender === 'male' || m.gender === 'M' ? 'Male' : 'Female'}
                        </span>
                      )}
                      {m.phone_number && (
                        <>
                          {m.gender && <span style={{ color: color.creamBorder }}>·</span>}
                          <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body }}>
                            {m.phone_number}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => { setEditMember(m); setShowModal(true) }}
                    style={{ background: color.creamDark, border: 'none', borderRadius: radius.sm, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, color: color.inkMuted }}
                    title="Edit"
                  >
                    <Edit2 size={15} />
                  </button>
                </div>
              )
            })}
          </div>
        )}

        {active.length > 0 && (
          <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, textAlign: 'center', margin: '16px 0 0', fontFamily: font.body }}>
            To remove a member, contact your Sunday School admin
          </p>
        )}
      </div>

      {showModal && (
        <MemberModal
          member={editMember}
          onClose={() => { setShowModal(false); setEditMember(null) }}
          onSave={handleSaved}
        />
      )}
    </ClassShell>
  )
}