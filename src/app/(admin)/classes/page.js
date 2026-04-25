'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus, Copy, Edit2, Trash2, Users,
  ChevronRight, X, Check, ExternalLink,
  BookOpen,
} from 'lucide-react'
import PageHeader from '@/components/class/ui/PageHeader'
import EmptyState from '@/components/class/ui/EmptyState'
import { SkeletonList } from '@/components/class/ui/SkeletonCard'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

const DEFAULT_GROUPS = ['Youth', 'Men', 'Women', 'Teens', 'Children', 'General']

// ── Toast ──────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t) }, [onDone])
  return (
    <div style={{
      position: 'fixed', top: '20px', right: '20px', zIndex: 300,
      background: color.navyDark, color: color.cream,
      padding: '10px 18px', borderRadius: radius.xl, boxShadow: shadow.modal,
      fontSize: fontSize.sm, fontWeight: '600', fontFamily: font.body,
      display: 'flex', alignItems: 'center', gap: '8px', animation: 'slideUp 0.3s ease',
    }}>
      <Check size={14} color={color.success} /> {msg}
    </div>
  )
}

// ── Class modal (create/edit) ──────────────────────────────────
function ClassModal({ cls, onClose, onSave }) {
  const isEdit = !!cls
  const [name,      setName]      = useState(cls?.name       || '')
  const [groupName, setGroupName] = useState(cls?.group_name || 'General')
  const [custom,    setCustom]    = useState(DEFAULT_GROUPS.includes(cls?.group_name || 'General') ? '' : cls?.group_name || '')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const isCustom = !DEFAULT_GROUPS.includes(groupName)

  async function handleSave() {
    if (!name.trim()) { setError('Class name is required.'); return }
    const finalGroup = groupName === '__custom__' ? custom.trim() : groupName
    if (!finalGroup) { setError('Group name is required.'); return }

    setLoading(true)
    try {
      const url    = isEdit ? `/api/admin/classes/${cls.id}` : '/api/admin/classes'
      const method = isEdit ? 'PATCH' : 'POST'
      const res    = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), groupName: finalGroup }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed.'); setLoading(false); return }
      onSave(isEdit ? data.class : data.class, isEdit)
      onClose()
    } catch { setError('Connection error.'); setLoading(false) }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '420px', boxShadow: shadow.modal, animation: 'scaleIn 0.2s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: 0 }}>
            {isEdit ? 'Edit Class' : 'New Class'}
          </h3>
          <button onClick={onClose} style={{ background: color.creamDark, border: 'none', borderRadius: radius.sm, width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <X size={16} color={color.inkMuted} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={lbl}>Class Name *</label>
            <input className="input" placeholder="e.g. Youth Class 1" value={name} onChange={e => { setName(e.target.value); setError('') }} autoFocus style={{ background: color.cream }} />
          </div>

          <div>
            <label style={lbl}>Group *</label>
            <select
              className="input"
              value={DEFAULT_GROUPS.includes(groupName) ? groupName : '__custom__'}
              onChange={e => { setGroupName(e.target.value); setError('') }}
              style={{ background: color.cream }}
            >
              {DEFAULT_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              <option value="__custom__">Custom group…</option>
            </select>
          </div>

          {(!DEFAULT_GROUPS.includes(groupName) || groupName === '__custom__') && (
            <div>
              <label style={lbl}>Custom Group Name *</label>
              <input className="input" placeholder="e.g. Married Couples" value={custom} onChange={e => { setCustom(e.target.value); setError('') }} style={{ background: color.cream }} />
            </div>
          )}

          {error && (
            <p style={{ fontSize: fontSize.sm, color: color.error, margin: 0, fontFamily: font.body }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
            <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
            <button className="btn btn-primary btn-full btn-lg" onClick={handleSave} disabled={loading} style={{ fontFamily: font.body }}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Class'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Delete confirmation modal ──────────────────────────────────
function DeleteModal({ cls, onClose, onDeleted }) {
  const [typed,   setTyped]   = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const confirmed = typed === cls.name

  async function handleDelete() {
    if (!confirmed) return
    setLoading(true)
    const res = await fetch(`/api/admin/classes/${cls.id}`, { method: 'DELETE' })
    if (res.ok) { onDeleted(cls.id); onClose() }
    else {
      const d = await res.json()
      setError(d.error || 'Failed.')
      setLoading(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,26,61,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px', backdropFilter: 'blur(2px)' }}>
      <div style={{ background: color.white, borderRadius: radius['2xl'], padding: '28px', width: '100%', maxWidth: '420px', boxShadow: shadow.modal, animation: 'scaleIn 0.2s ease' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: radius.lg, background: color.errorBg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
          <Trash2 size={20} color={color.error} />
        </div>
        <h3 style={{ fontFamily: font.heading, fontSize: fontSize.lg, fontWeight: '700', color: color.ink, margin: '0 0 8px' }}>
          Delete {cls.name}?
        </h3>
        <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: '0 0 18px', fontFamily: font.body, lineHeight: 1.6 }}>
          Deleting this class will remove all members from it. Attendance records are preserved. <strong>This cannot be undone.</strong>
        </p>

        <label style={lbl}>Type <strong>{cls.name}</strong> to confirm</label>
        <input
          className="input"
          placeholder={cls.name}
          value={typed}
          onChange={e => setTyped(e.target.value)}
          style={{ background: color.cream, marginBottom: '14px' }}
          autoFocus
        />

        {error && <p style={{ fontSize: fontSize.sm, color: color.error, margin: '0 0 12px', fontFamily: font.body }}>{error}</p>}

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-cream btn-full" onClick={onClose} style={{ fontFamily: font.body }}>Cancel</button>
          <button
            onClick={handleDelete}
            disabled={!confirmed || loading}
            style={{
              flex: 1, height: '44px', background: confirmed ? color.error : color.creamDark,
              color: confirmed ? 'white' : color.inkSubtle,
              border: 'none', borderRadius: radius.md, cursor: confirmed && !loading ? 'pointer' : 'not-allowed',
              fontSize: fontSize.sm, fontWeight: '700', fontFamily: font.body, transition: 'all 0.15s',
            }}
          >
            {loading ? 'Deleting…' : 'Delete Class'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Class card ────────────────────────────────────────────────
function ClassCard({ cls, onEdit, onDelete, onCopy, onOpen }) {
  return (
    <div style={{
      background: color.white, borderRadius: radius.xl,
      border: `1px solid ${color.creamBorder}`, boxShadow: shadow.card,
      padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap',
    }}>
      {/* Icon */}
      <div style={{
        width: '44px', height: '44px', borderRadius: radius.md, flexShrink: 0,
        background: 'rgba(15,37,87,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color.navy,
      }}>
        <BookOpen size={20} />
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: '120px' }}>
        <p style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '700', color: color.ink, margin: '0 0 3px' }}>
          {cls.name}
        </p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: fontSize.xs, color: color.inkSubtle, fontFamily: font.body }}>
            {cls.member_count || 0} members
          </span>
          <span style={{ color: color.creamBorder }}>·</span>
          {/* Code — monospace, copyable */}
          <span style={{
            fontFamily: 'monospace', fontSize: fontSize.xs, fontWeight: '700',
            color: color.navy, background: 'rgba(15,37,87,0.07)', padding: '2px 8px', borderRadius: '4px',
            letterSpacing: '0.1em',
          }}>
            {cls.code}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        {/* Copy PIN */}
        <button
          onClick={() => onCopy(cls.code)}
          title="Copy class code"
          style={iconBtn}
        >
          <Copy size={15} color={color.inkMuted} />
        </button>

        {/* Edit */}
        <button onClick={() => onEdit(cls)} title="Edit class" style={iconBtn}>
          <Edit2 size={15} color={color.inkMuted} />
        </button>

        {/* Open as class */}
        <button
          onClick={() => onOpen(cls)}
          title="Open class view"
          style={{ ...iconBtn, background: 'rgba(15,37,87,0.07)', color: color.navy }}
        >
          <ExternalLink size={15} color={color.navy} />
        </button>

        {/* Delete */}
        <button onClick={() => onDelete(cls)} title="Delete class" style={{ ...iconBtn, background: color.errorBg }}>
          <Trash2 size={15} color={color.error} />
        </button>
      </div>
    </div>
  )
}

export default function ClassesPage() {
  const router = useRouter()

  const [classes,    setClasses]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editCls,    setEditCls]    = useState(null)
  const [deleteCls,  setDeleteCls]  = useState(null)
  const [toast,      setToast]      = useState('')

  const fetchClasses = useCallback(async () => {
    setLoading(true)
    const res  = await fetch('/api/admin/classes')
    const data = await res.json()
    if (res.ok) setClasses(data.classes || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchClasses() }, [fetchClasses])

  function handleSaved(cls, isEdit) {
    if (isEdit) setClasses(p => p.map(c => c.id === cls.id ? { ...c, ...cls } : c))
    else        setClasses(p => [...p, cls])
  }

  async function handleCopy(code) {
    try {
      await navigator.clipboard.writeText(code)
      setToast('Class code copied!')
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = code
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setToast('Class code copied!')
    }
  }

  async function handleOpenAsClass(cls) {
    const res = await fetch('/api/admin/impersonate', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ classId: cls.id }),
    })
    if (res.ok) {
      window.open('/attendance?adminView=1', '_blank')
    }
  }

  // Group classes
  const grouped = {}
  for (const cls of classes) {
    const g = cls.group_name || 'General'
    if (!grouped[g]) grouped[g] = []
    grouped[g].push(cls)
  }
  const groupKeys = Object.keys(grouped).sort()

  return (
    <div>
      <PageHeader
        title="Classes"
        subtitle="Manage your Sunday School classes"
        action={
          <button
            className="btn btn-primary"
            onClick={() => setShowCreate(true)}
            style={{ gap: '7px', fontFamily: font.body }}
          >
            <Plus size={16} /> New Class
          </button>
        }
      />

      {loading ? (
        <SkeletonList count={4} height={80} />
      ) : classes.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={28} />}
          title="No classes yet"
          message="Create your first class to get started."
          action={{ label: 'Create Class', onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {groupKeys.map(group => (
            <div key={group}>
              <div style={{
                display:     'flex',
                alignItems:  'center',
                gap:         '10px',
                marginBottom:'12px',
                paddingBottom:'10px',
                borderBottom:`1px solid ${color.creamBorder}`,
              }}>
                <h2 style={{
                  fontFamily:   font.heading,
                  fontSize:     fontSize.base,
                  fontWeight:   '800',
                  color:        color.navy,
                  margin:       0,
                  letterSpacing:'-0.01em',
                }}>
                  {group}
                </h2>
                <span style={{
                  fontSize:     fontSize.xs,
                  fontWeight:   '600',
                  color:        color.inkSubtle,
                  background:   color.creamDark,
                  padding:      '2px 8px',
                  borderRadius: radius.full,
                }}>
                  {grouped[group].length} class{grouped[group].length !== 1 ? 'es' : ''}
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {grouped[group].map(cls => (
                  <ClassCard
                    key={cls.id}
                    cls={cls}
                    onEdit={c => setEditCls(c)}
                    onDelete={c => setDeleteCls(c)}
                    onCopy={handleCopy}
                    onOpen={handleOpenAsClass}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <ClassModal onClose={() => setShowCreate(false)} onSave={(c) => { handleSaved(c, false); setShowCreate(false) }} />
      )}
      {editCls && (
        <ClassModal cls={editCls} onClose={() => setEditCls(null)} onSave={(c) => { handleSaved(c, true); setEditCls(null) }} />
      )}
      {deleteCls && (
        <DeleteModal
          cls={deleteCls}
          onClose={() => setDeleteCls(null)}
          onDeleted={id => { setClasses(p => p.filter(c => c.id !== id)); setDeleteCls(null) }}
        />
      )}
      {toast && <Toast msg={toast} onDone={() => setToast('')} />}

      <style>{`
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95); } to { opacity:1; transform:scale(1); } }
        @keyframes slideUp  { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>
    </div>
  )
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

const iconBtn = {
  width:          '34px',
  height:         '34px',
  borderRadius:   radius.sm,
  border:         'none',
  background:     color.creamDark,
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'center',
  cursor:         'pointer',
  transition:     'background 0.15s',
  flexShrink:     0,
}