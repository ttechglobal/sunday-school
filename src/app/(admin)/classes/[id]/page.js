'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft, Plus, Edit2, Trash2, Copy,
  ExternalLink, Check, X, Users,
  RefreshCw, MoveRight,
} from 'lucide-react'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import StatusBadge from '@/components/class/ui/StatusBadge'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 300, background: color.navyDark, color: color.cream, padding: '10px 18px', borderRadius: radius.xl, boxShadow: shadow.modal, fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body, display: 'flex', alignItems: 'center', gap: '8px' }}>
      <Check size={14} color={color.success} /> {msg}
    </div>
  )
}

function MoveModal({ member, classes, currentClassId, onClose, onMoved }) {
  const [targetId, setTargetId] = useState('')
  const [loading,  setLoading]  = useState(false)
  const others = classes.filter(c => c.id !== currentClassId)

  async function handleMove() {
    if (!targetId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: targetId }),
      })
      if (res.ok) {
        const target = classes.find(c => c.id === targetId)
        onMoved(member.id, target?.name || 'new class')
        onClose()
      }
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '400px', boxShadow: shadow.modal }}>
        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 6px' }}>Move Member</h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 18px', fontFamily: font.body }}>
          Moving <strong>{member.full_name || `${member.first_name} ${member.last_name}`}</strong> to a different class. Their attendance history is preserved.
        </p>
        <label style={lbl}>Select Class</label>
        <select className="input" value={targetId} onChange={e => setTargetId(e.target.value)} style={{ background: color.cream, marginBottom: '16px' }}>
          <option value="">— Choose a class —</option>
          {others.map(c => <option key={c.id} value={c.id}>{c.name} ({c.group_name})</option>)}
        </select>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
          <button className="btn btn-primary btn-full" onClick={handleMove} disabled={!targetId || loading} style={{ fontFamily: font.body }}>
            {loading ? 'Moving…' : 'Confirm Move'}
          </button>
        </div>
      </div>
    </div>
  )
}

function RemoveModal({ member, onClose, onRemoved }) {
  const [loading, setLoading] = useState(false)
  const name = member.full_name || `${member.first_name || ''} ${member.last_name || ''}`.trim()

  async function handleRemove() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/members/${member.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: false }),
      })
      if (res.ok) { onRemoved(member.id); onClose() }
    } finally { setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '400px', boxShadow: shadow.modal }}>
        <div style={{ width: '44px', height: '44px', borderRadius: radius.lg, background: color.errorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Trash2 size={20} color={color.error} />
        </div>
        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 8px' }}>Remove {name}?</h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 20px', fontFamily: font.body, lineHeight: 1.6 }}>
          This will remove <strong>{name}</strong> from the church directory. Their past attendance records will be preserved.
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
          <button
            onClick={handleRemove}
            disabled={loading}
            style={{ flex: 1, height: '44px', background: color.error, color: 'white', border: 'none', borderRadius: radius.md, cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '700', fontFamily: font.body }}
          >
            {loading ? 'Removing…' : 'Remove from Church'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AddMemberModal({ classId, onClose, onAdded }) {
  const [form, setForm] = useState({ fullName: '', gender: '', phoneNumber: '', address: '' })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleAdd() {
    if (!form.fullName.trim()) { setError('Full name is required.'); return }
    setLoading(true)
    try {
      const res  = await fetch('/api/admin/members', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, classId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed.'); setLoading(false); return }
      onAdded(data.member)
      onClose()
    } catch { setError('Connection error.'); setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '440px', boxShadow: shadow.modal, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: 0 }}>Add Member</h3>
          <button onClick={onClose} style={{ background: color.creamDark, border: 'none', borderRadius: radius.sm, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color={color.inkMuted} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Full Name *</label>
            <input className="input" placeholder="e.g. Adaeze Okonkwo" value={form.fullName} onChange={e => { setForm(p => ({ ...p, fullName: e.target.value })); setError('') }} autoFocus style={{ background: color.cream }} />
          </div>

          <div>
            <label style={lbl}>Gender <span style={{ fontWeight: '400', color: color.inkSubtle }}>Optional</span></label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['', 'male', 'female'].map(g => (
                <button key={g} onClick={() => setForm(p => ({ ...p, gender: g }))}
                  style={{ flex: 1, height: '42px', borderRadius: radius.md, border: `1.5px solid ${form.gender === g ? color.navy : color.creamBorder}`, background: form.gender === g ? 'rgba(15,37,87,0.06)' : color.cream, color: form.gender === g ? color.navy : color.inkMuted, fontSize: fontSize.sm, fontWeight: form.gender === g ? '700' : '500', fontFamily: font.body, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {g === '' ? 'Not set' : g === 'male' ? '♂ Male' : '♀ Female'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label style={lbl}>Phone <span style={{ fontWeight: '400', color: color.inkSubtle }}>Optional</span></label>
            <input className="input" type="tel" placeholder="08012345678" value={form.phoneNumber} onChange={e => setForm(p => ({ ...p, phoneNumber: e.target.value }))} style={{ background: color.cream }} />
          </div>

          {error && <p style={{ fontSize: fontSize.sm, color: color.error, margin: 0, fontFamily: font.body }}>{error}</p>}

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleAdd} disabled={loading || !form.fullName.trim()} style={{ fontFamily: font.body }}>
              {loading ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ClassDetailPage() {
  const { id } = useParams()
  const router = useRouter()

  const [cls,      setCls]      = useState(null)
  const [members,  setMembers]  = useState([])
  const [classes,  setClasses]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [toast,    setToast]    = useState('')
  const [showAdd,  setShowAdd]  = useState(false)
  const [moving,   setMoving]   = useState(null)
  const [removing, setRemoving] = useState(null)
  const [codeVisible, setCodeVisible] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [clsRes, membersRes, classesRes] = await Promise.all([
        fetch(`/api/admin/classes/${id}`),
        fetch(`/api/admin/members?classId=${id}&active=true`),
        fetch('/api/admin/classes'),
      ])
      const [clsData, membersData, classesData] = await Promise.all([
        clsRes.json(), membersRes.json(), classesRes.json(),
      ])
      if (clsRes.ok)     setCls(clsData.class)
      if (membersRes.ok) setMembers(membersData.members || [])
      if (classesRes.ok) setClasses(classesData.classes || [])
    } finally { setLoading(false) }
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleCopyCode() {
    if (!cls?.code) return
    try { await navigator.clipboard.writeText(cls.code) }
    catch {
      const el = document.createElement('textarea')
      el.value = cls.code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setToast('Class code copied!')
  }

  async function handleOpenAsClass() {
    try {
      const res = await fetch('/api/admin/impersonate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: id }),
      })
      if (res.ok) window.open('/attendance?adminView=1', '_blank')
    } catch { setToast('Failed to open class view') }
  }

  function handleMoved(memberId, targetName) {
    setMembers(p => p.filter(m => m.id !== memberId))
    setToast(`Member moved to ${targetName}`)
  }

  function handleRemoved(memberId) {
    setMembers(p => p.filter(m => m.id !== memberId))
    setToast('Member removed from church')
  }

  function getMemberName(m) {
    return m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unknown'
  }

  if (loading) {
    return (
      <div>
        <div className="skeleton" style={{ height: '32px', width: '200px', marginBottom: '24px', borderRadius: radius.md }} />
        <SkeletonList count={5} height={64} />
      </div>
    )
  }

  if (!cls) {
    return (
      <div>
        <button onClick={() => router.push('/classes')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '0 0 20px' }}>
          <ArrowLeft size={16} /> Back to Classes
        </button>
        <p style={{ color: color.inkMuted, fontFamily: font.body }}>Class not found.</p>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Back */}
      <button
        onClick={() => router.push('/classes')}
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: color.navy, fontFamily: font.body, fontSize: fontSize.sm, fontWeight: '600', padding: '0 0 20px' }}
      >
        <ArrowLeft size={16} /> All Classes
      </button>

      {/* Header card */}
      <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, padding: '24px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: font.heading, fontSize: fontSize.xl, fontWeight: '800', color: color.ink, margin: 0, letterSpacing: '-0.02em' }}>
                {cls.name}
              </h1>
              {cls.group_name && (
                <span style={{ fontSize: fontSize.xs, fontWeight: '600', color: color.inkSubtle, background: color.creamDark, padding: '3px 10px', borderRadius: radius.full }}>
                  {cls.group_name}
                </span>
              )}
            </div>
            <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
              {members.length} active member{members.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flexShrink: 0 }}>
            <button
              onClick={handleOpenAsClass}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '38px', padding: '0 14px', background: color.cream, border: `1.5px solid ${color.navy}`, borderRadius: radius.md, cursor: 'pointer', fontSize: fontSize.sm, fontWeight: '700', color: color.navy, fontFamily: font.body }}
            >
              <ExternalLink size={14} /> Open as Class
            </button>
            <button onClick={() => setShowAdd(true)} className="btn btn-primary" style={{ gap: '6px', fontFamily: font.body, height: '38px' }}>
              <Plus size={15} /> Add Member
            </button>
          </div>
        </div>

        {/* Class code */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', background: color.cream, borderRadius: radius.lg, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontSize: fontSize['2xs'], fontWeight: '700', color: color.inkSubtle, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px', fontFamily: font.body }}>Class Code</p>
            <code style={{ fontFamily: 'monospace', fontSize: fontSize.lg, fontWeight: '800', color: color.navy, letterSpacing: '0.15em' }}>
              {codeVisible ? cls.code : '••••••••'}
            </code>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => setCodeVisible(p => !p)} style={{ height: '36px', padding: '0 12px', background: color.white, border: `1px solid ${color.creamBorder}`, borderRadius: radius.md, cursor: 'pointer', fontSize: fontSize.xs, fontWeight: '600', color: color.inkMuted, fontFamily: font.body }}>
              {codeVisible ? 'Hide' : 'Show'}
            </button>
            <button onClick={handleCopyCode} style={{ display: 'flex', alignItems: 'center', gap: '5px', height: '36px', padding: '0 12px', background: color.navy, border: 'none', borderRadius: radius.md, cursor: 'pointer', fontSize: fontSize.xs, fontWeight: '700', color: color.cream, fontFamily: font.body }}>
              <Copy size={13} /> Copy
            </button>
          </div>
        </div>
      </div>

      {/* Members list */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h2 style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '800', color: color.ink, margin: 0, letterSpacing: '-0.01em' }}>
          Members
        </h2>
        <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', fontSize: fontSize.xs, fontWeight: '600', color: color.inkMuted, fontFamily: font.body }}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {members.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}` }}>
          <Users size={28} color={color.navy} style={{ marginBottom: '14px', opacity: 0.4 }} />
          <p style={{ fontFamily: font.heading, fontSize: fontSize.md, fontWeight: '700', color: color.ink, margin: '0 0 8px' }}>No members yet</p>
          <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 20px', fontFamily: font.body }}>Add members to this class so they can be marked in attendance.</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ gap: '6px', fontFamily: font.body }}>
            <Plus size={15} /> Add First Member
          </button>
        </div>
      ) : (
        <div style={{ background: color.white, borderRadius: radius.xl, border: `1px solid ${color.creamBorder}`, overflow: 'hidden' }}>
          {members.map((m, i) => {
            const name     = getMemberName(m)
            const initials = name.split(' ').map(n => n[0]).filter(Boolean).join('').slice(0, 2).toUpperCase() || '?'

            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '13px 16px', borderBottom: i < members.length - 1 ? `1px solid ${color.creamBorder}` : 'none' }}>
                {/* Avatar */}
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0, background: `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: font.heading, fontSize: '13px', fontWeight: '700', color: color.cream }}>
                  {initials}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: font.body, fontSize: fontSize.base, fontWeight: '600', color: color.ink, margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</p>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    {m.gender && <span style={{ fontSize: fontSize.xs, color: color.inkSubtle }}>{m.gender === 'male' || m.gender === 'M' ? 'Male' : 'Female'}</span>}
                    {m.phone_number && <span style={{ fontSize: fontSize.xs, color: color.inkSubtle }}>{m.phone_number}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                  <button
                    onClick={() => setMoving(m)}
                    title="Move to another class"
                    style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '32px', padding: '0 10px', background: color.cream, border: `1px solid ${color.creamBorder}`, borderRadius: radius.sm, cursor: 'pointer', fontSize: fontSize.xs, fontWeight: '600', color: color.inkMuted, fontFamily: font.body }}
                  >
                    <MoveRight size={13} /> Move
                  </button>
                  <button
                    onClick={() => setRemoving(m)}
                    title="Remove from church"
                    style={{ width: '32px', height: '32px', background: color.errorBg, border: 'none', borderRadius: radius.sm, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                  >
                    <Trash2 size={14} color={color.error} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {showAdd  && <AddMemberModal classId={id} onClose={() => setShowAdd(false)} onAdded={m => { setMembers(p => [...p, m]); setToast('Member added') }} />}
      {moving   && <MoveModal member={moving} classes={classes} currentClassId={id} onClose={() => setMoving(null)} onMoved={handleMoved} />}
      {removing && <RemoveModal member={removing} onClose={() => setRemoving(null)} onRemoved={handleRemoved} />}
      {toast    && <Toast msg={toast} onDone={() => setToast('')} />}

      <style>{`@keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }`}</style>
    </div>
  )
}

const lbl = {
  display: 'block', fontSize: fontSize.xs, fontWeight: '700',
  color: color.inkMuted, letterSpacing: '0.06em', textTransform: 'uppercase',
  marginBottom: '6px', fontFamily: font.body,
}