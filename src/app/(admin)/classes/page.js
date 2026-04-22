'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Copy, Check, RefreshCw, ArrowLeft, Users, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { SkeletonList } from '@/components/class/ui/LoadingSkeleton'
import EmptyState from '@/components/class/ui/EmptyState'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

// ── Helpers ───────────────────────────────────────────────────
function formatCode(code) {
  if (!code) return ''
  return code.slice(0, 4) + '-' + code.slice(4)
}

// ── Copy button ───────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={copy}
      className="btn btn-secondary btn-sm"
      style={{ gap: '6px', flexShrink: 0 }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? 'Copied!' : 'Copy'}
    </button>
  )
}

// ── Create class modal ────────────────────────────────────────
function CreateClassModal({ onClose, onCreate, classes: existingClasses }) {
  const [name, setName]       = useState('')
  const [group, setGroup]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  async function handleCreate() {
    if (!name.trim()) { setError('Class name is required.'); return }
    setLoading(true)
    setError('')
    try {
      const res  = await fetch('/api/admin/classes', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ name: name.trim(), groupName: group.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to create class.'); setLoading(false); return }
      onCreate(data.class)
      onClose()
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,22,40,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '20px' }}>
      <div style={{ background: '#fff', borderRadius: radius.xl, padding: '32px', width: '100%', maxWidth: '440px', boxShadow: shadow.modal }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontFamily: font.display, fontSize: fontSize.lg, color: color.navy, margin: 0 }}>New Class</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
            <X size={20} color={color.mist} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={s.label}>Class Name *</label>
            <input
              className="input"
              placeholder="e.g. Youth A, Men's Class"
              value={name}
              onChange={e => { setName(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              autoFocus
              style={{ background: color.cream }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={s.label}>Group (optional)</label>
            <input
              className="input"
              placeholder="e.g. Youth, Men, Women, Seniors"
              value={group}
              onChange={e => setGroup(e.target.value)}
              style={{ background: color.cream }}
            />
          </div>

          <div style={{ background: color.cream, borderRadius: radius.md, padding: '14px 16px' }}>
            <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.mist, margin: '0 0 4px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Class Code
            </p>
            <p style={{ fontSize: fontSize.sm, color: color.navy, margin: 0, lineHeight: 1.5 }}>
              A unique code will be automatically generated when the class is created. Share it with your class teacher to log in.
            </p>
          </div>

          {error && (
            <div style={{ background: color.errorBg, border: `1px solid rgba(220,38,38,0.2)`, borderRadius: radius.sm, padding: '10px 14px' }}>
              <p style={{ fontSize: fontSize.sm, color: color.error, fontWeight: '600', margin: 0 }}>{error}</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary btn-full" onClick={handleCreate} disabled={loading}>
              {loading ? 'Creating…' : 'Create Class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Class detail view ─────────────────────────────────────────
function ClassDetail({ cls, onBack, onUpdate }) {
  const [members, setMembers]           = useState([])
  const [loading, setLoading]           = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [newFirst, setNewFirst]         = useState('')
  const [newLast, setNewLast]           = useState('')
  const [addError, setAddError]         = useState('')
  const [addLoading, setAddLoading]     = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [currentCode, setCurrentCode]   = useState(cls.code)

  useEffect(() => {
    fetchMembers()
  }, [cls.id])

  async function fetchMembers() {
    setLoading(true)
    try {
      const res  = await fetch(`/api/admin/members?classId=${cls.id}`)
      const data = await res.json()
      if (res.ok) setMembers(data.members || [])
    } finally {
      setLoading(false)
    }
  }

  async function addMember() {
    if (!newFirst.trim() || !newLast.trim()) { setAddError('First and last name are required.'); return }
    setAddLoading(true)
    setAddError('')
    try {
      const res  = await fetch('/api/admin/members', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ firstName: newFirst.trim(), lastName: newLast.trim(), classId: cls.id }),
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed to add member.'); setAddLoading(false); return }
      setMembers(p => [...p, data.member])
      setNewFirst('')
      setNewLast('')
      setShowAddMember(false)
    } finally {
      setAddLoading(false)
    }
  }

  async function toggleMember(id, isActive) {
    await fetch(`/api/admin/members/${id}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ isActive: !isActive }),
    })
    setMembers(p => p.map(m => m.id === id ? { ...m, is_active: !isActive } : m))
  }

  async function regenerateCode() {
    setRegenerating(true)
    try {
      const res  = await fetch(`/api/admin/classes/${cls.id}`, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ regenerateCode: true }),
      })
      const data = await res.json()
      if (res.ok) {
        setCurrentCode(data.class.code)
        onUpdate({ ...cls, code: data.class.code })
      }
    } finally {
      setRegenerating(false)
    }
  }

  const activeMembers   = members.filter(m => m.is_active)
  const inactiveMembers = members.filter(m => !m.is_active)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Breadcrumb */}
      <button
        onClick={onBack}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '600', color: color.mist, padding: 0, width: 'fit-content' }}
      >
        <ArrowLeft size={15} /> All Classes
      </button>

      {/* Header card */}
      <div style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h2 style={{ fontFamily: font.display, fontSize: fontSize.xl, color: color.navy, margin: '0 0 8px' }}>
              {cls.name}
            </h2>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {cls.group_name && <span className="badge badge-mist">{cls.group_name}</span>}
              <span className="badge badge-green">{activeMembers.length} active members</span>
            </div>
          </div>

          {/* Code box */}
          <div style={{ background: color.navy, borderRadius: radius.lg, padding: '16px 20px', minWidth: '200px' }}>
            <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: 'rgba(245,240,232,0.5)', margin: '0 0 6px', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Class Code
            </p>
            <p style={{ fontFamily: font.display, fontSize: '26px', fontWeight: '700', color: color.cream, margin: '0 0 12px', letterSpacing: '0.1em' }}>
              {formatCode(currentCode)}
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <CopyButton text={formatCode(currentCode)} />
              <button
                className="btn btn-sm"
                onClick={regenerateCode}
                disabled={regenerating}
                style={{ background: 'rgba(245,240,232,0.1)', color: color.cream, border: 'none', gap: '5px' }}
              >
                <RefreshCw size={13} />
                {regenerating ? '…' : 'New'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Members */}
      <div style={{ background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card, padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <p style={{ fontFamily: font.display, fontSize: fontSize.md, color: color.navy, margin: 0 }}>
            Members ({members.length})
          </p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAddMember(p => !p)}
            style={{ gap: '6px' }}
          >
            <Plus size={14} /> Add Member
          </button>
        </div>

        {/* Add member form */}
        {showAddMember && (
          <div style={{ background: color.cream, borderRadius: radius.md, padding: '16px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                className="input"
                placeholder="First name"
                value={newFirst}
                onChange={e => { setNewFirst(e.target.value); setAddError('') }}
                style={{ flex: 1, minWidth: '140px', background: '#fff' }}
                autoFocus
              />
              <input
                className="input"
                placeholder="Last name"
                value={newLast}
                onChange={e => { setNewLast(e.target.value); setAddError('') }}
                onKeyDown={e => e.key === 'Enter' && addMember()}
                style={{ flex: 1, minWidth: '140px', background: '#fff' }}
              />
            </div>
            {addError && <p style={{ fontSize: fontSize.sm, color: color.error, fontWeight: '600', margin: 0 }}>{addError}</p>}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => { setShowAddMember(false); setAddError('') }}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={addMember} disabled={addLoading}>
                {addLoading ? 'Adding…' : 'Add Member'}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <SkeletonList count={3} height={56} />
        ) : members.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px', color: color.mist }}>
            <p style={{ fontSize: fontSize.base, margin: '0 0 4px' }}>No members yet</p>
            <p style={{ fontSize: fontSize.sm, margin: 0 }}>Add your first member above.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[...activeMembers, ...inactiveMembers].map(m => (
              <div key={m.id} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px 14px', background: m.is_active ? color.cream : 'rgba(237,229,208,0.4)',
                borderRadius: radius.md, opacity: m.is_active ? 1 : 0.6,
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: m.is_active ? color.navy : color.creamDark,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: m.is_active ? color.cream : color.mist }}>
                    {m.first_name[0]}{m.last_name[0]}
                  </span>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: fontSize.base, fontWeight: '600', color: color.navy, margin: 0 }}>
                    {m.first_name} {m.last_name}
                  </p>
                  {!m.is_active && <p style={{ fontSize: fontSize.xs, color: color.mist, margin: 0 }}>Inactive</p>}
                </div>
                <button
                  onClick={() => toggleMember(m.id, m.is_active)}
                  className={`btn btn-sm ${m.is_active ? 'btn-danger' : 'btn-secondary'}`}
                >
                  {m.is_active ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Class card ────────────────────────────────────────────────
function ClassCard({ cls, onClick }) {
  return (
    <button onClick={onClick} style={{
      background: '#fff', borderRadius: radius.lg, boxShadow: shadow.card,
      padding: '20px', border: 'none', cursor: 'pointer', textAlign: 'left',
      display: 'flex', flexDirection: 'column', gap: '14px',
      transition: 'box-shadow 0.15s ease', width: '100%',
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{
          width: '44px', height: '44px', borderRadius: '12px',
          background: color.creamDark, display: 'flex', alignItems: 'center',
          justifyContent: 'center', flexShrink: 0,
        }}>
          <Users size={20} color={color.navy} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: '0 0 4px' }}>{cls.name}</p>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {cls.group_name && <span className="badge badge-mist">{cls.group_name}</span>}
            <span className="badge badge-green">{cls.member_count || 0} members</span>
          </div>
        </div>
      </div>

      <div style={{ background: color.cream, borderRadius: radius.sm, padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.mist, margin: '0 0 2px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Code</p>
          <p style={{ fontSize: fontSize.md, fontWeight: '700', color: color.navy, margin: 0, letterSpacing: '0.1em', fontFamily: font.display }}>{formatCode(cls.code)}</p>
        </div>
        <CopyButton text={formatCode(cls.code)} />
      </div>
    </button>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function ClassesPage() {
  const [classes, setClasses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selected, setSelected]   = useState(null)

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/classes')
      const data = await res.json()
      if (res.ok) setClasses(data.classes || [])
      else setError(data.error || 'Failed to load classes.')
    } catch {
      setError('Connection error.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  function handleCreated(newClass) {
    setClasses(p => [{ ...newClass, member_count: 0 }, ...p])
  }

  function handleUpdated(updated) {
    setClasses(p => p.map(c => c.id === updated.id ? { ...c, ...updated } : c))
    setSelected(prev => prev ? { ...prev, ...updated } : prev)
  }

  if (selected) {
    return (
      <ClassDetail
        cls={selected}
        onBack={() => setSelected(null)}
        onUpdate={handleUpdated}
      />
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={s.pageTitle}>Classes</h1>
          <p style={s.pageSub}>{classes.length} classes in your church</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)} style={{ gap: '8px' }}>
          <Plus size={16} /> New Class
        </button>
      </div>

      {error && (
        <div style={{ background: color.errorBg, borderRadius: radius.md, padding: '14px 16px' }}>
          <p style={{ fontSize: fontSize.sm, color: color.error, margin: 0 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          <SkeletonList count={3} height={160} />
        </div>
      ) : classes.length === 0 ? (
        <EmptyState
          icon="🏫"
          title="No classes yet"
          message="Create your first class to get started. Each class gets a unique code for teachers to log in."
          action={{ label: 'Create First Class', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          {classes.map(cls => (
            <ClassCard key={cls.id} cls={cls} onClick={() => setSelected(cls)} />
          ))}
        </div>
      )}

      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onCreate={handleCreated}
          classes={classes}
        />
      )}
    </div>
  )
}

const s = {
  pageTitle: { fontFamily: font.display, fontSize: fontSize.xl, color: color.navy, margin: '0 0 4px' },
  pageSub:   { fontSize: fontSize.sm, color: color.mist, margin: 0 },
  label:     { fontSize: '11px', fontWeight: '700', color: color.mist, letterSpacing: '0.07em', textTransform: 'uppercase' },
}