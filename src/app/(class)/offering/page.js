'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, Edit2 } from 'lucide-react'

// ── Helpers ───────────────────────────────────────────────────
function formatDisplay(kobo) {
  if (kobo === 0) return { naira: '0', kobo: '0' }
  const naira = (kobo / 100).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return { naira, kobo: kobo.toLocaleString('en-NG') }
}

// ── Numpad ────────────────────────────────────────────────────
function Numpad({ onKey }) {
  const keys = ['1','2','3','4','5','6','7','8','9','000','0','back']

  return (
    <div style={styles.numpad}>
      {keys.map(k => (
        <button
          key={k}
          style={{
            ...styles.numKey,
            background: k === 'back' ? 'var(--cream-dark)' : 'var(--cream)',
          }}
          onClick={() => onKey(k)}
        >
          {k === 'back' ? (
            <svg width="20" height="15" viewBox="0 0 20 15" fill="none">
              <path
                d="M8 1L1 7.5l7 6.5M1 7.5h18"
                stroke="var(--navy)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <span style={styles.numKeyText}>{k}</span>
          )}
        </button>
      ))}
    </div>
  )
}

// ── Already Submitted View ────────────────────────────────────
function SubmittedView({ amountKobo, onEdit }) {
  const { naira } = formatDisplay(amountKobo)

  return (
    <div style={styles.submittedBox}>
      <div style={styles.submittedCheck}>
        <Check size={28} color="#15803D" strokeWidth={2.5} />
      </div>
      <p style={styles.submittedLabel}>Offering Submitted</p>
      <p style={styles.submittedAmount}>₦{naira}</p>
      <p style={styles.submittedSub}>Successfully recorded for today's session</p>
      <button
        className="btn btn-secondary"
        style={{ marginTop: '16px', gap: '8px' }}
        onClick={onEdit}
      >
        <Edit2 size={14} />
        Edit Amount
      </button>
    </div>
  )
}

// ── Edit Confirm Sheet ────────────────────────────────────────
function EditConfirmSheet({ onConfirm, onClose }) {
  return (
    <div style={styles.sheetOverlay}>
      <div style={styles.sheet}>
        <div style={styles.sheetHandle} />
        <h3 style={{ fontSize: '17px', color: 'var(--navy)', marginBottom: '8px' }}>
          Edit Offering?
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--mist)', marginBottom: '20px' }}>
          This will overwrite the previously submitted amount.
          Are you sure you want to continue?
        </p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary btn-full" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary btn-full" onClick={onConfirm}>
            Yes, Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Offering Page ────────────────────────────────────────
export default function OfferingPage() {
  const router = useRouter()

  // amountKobo: stored as integer kobo (₦1 = 100 kobo)
  const [amountKobo, setAmountKobo]     = useState(0)
  const [notes, setNotes]               = useState('')
  const [submitted, setSubmitted]       = useState(false)
  const [submittedKobo, setSubmittedKobo] = useState(0)
  const [loading, setLoading]           = useState(false)
  const [showEditConfirm, setShowEditConfirm] = useState(false)
  const [showNotes, setShowNotes]       = useState(false)

  // ── Numpad logic ──
  // We build the amount as a string of digits (always in kobo)
  // e.g. user types 5, 0, 0, 0 → "5000" kobo → ₦50.00
  const [digits, setDigits] = useState('')

  function handleKey(key) {
    if (key === 'back') {
      setDigits(prev => {
        const next = prev.slice(0, -1)
        setAmountKobo(next === '' ? 0 : parseInt(next, 10))
        return next
      })
      return
    }

    if (key === '000') {
      setDigits(prev => {
        if (prev === '') return prev   // don't allow leading zeros
        const next = prev + '000'
        if (next.length > 10) return prev  // cap at 10 digits
        setAmountKobo(parseInt(next, 10))
        return next
      })
      return
    }

    setDigits(prev => {
      if (prev === '' && key === '0') return prev  // no leading zero
      const next = prev + key
      if (next.length > 10) return prev  // cap
      setAmountKobo(parseInt(next, 10))
      return next
    })
  }

  // ── Submit ──
  async function handleSubmit() {
    if (amountKobo === 0) return
    setLoading(true)
    // TODO: replace with real API call
    await new Promise(r => setTimeout(r, 900))
    setSubmittedKobo(amountKobo)
    setSubmitted(true)
    setLoading(false)
  }

  // ── Edit ──
  function handleEdit() {
    setShowEditConfirm(false)
    setSubmitted(false)
    setAmountKobo(submittedKobo)
    setDigits(String(submittedKobo))
  }

  const { naira, kobo: koboDisplay } = formatDisplay(amountKobo)
  const hasAmount = amountKobo > 0

  return (
    <div style={styles.page}>

      {/* ── Header ── */}
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={() => router.push('/home')}>
          <ArrowLeft size={18} color="var(--cream)" />
        </button>
        <div style={{ flex: 1 }}>
          <p style={styles.headerLabel}>OFFERING</p>
          <p style={styles.headerDate}>Sunday, 15 June 2025</p>
        </div>
        <span className="badge badge-green">OPEN</span>
      </div>

      <div style={styles.body}>

        {submitted ? (
          // ── Already submitted ──
          <SubmittedView
            amountKobo={submittedKobo}
            onEdit={() => setShowEditConfirm(true)}
          />
        ) : (
          <>
            {/* ── Amount display ── */}
            <div style={styles.amountCard}>
              <p style={styles.amountLabel}>OFFERING AMOUNT</p>

              <div style={styles.amountDisplay}>
                <span style={styles.currencySymbol}>₦</span>
                <span style={styles.amountNumber}>
                  {hasAmount ? naira.split('.')[0] : '0'}
                </span>
                <span style={styles.amountDecimal}>
                  .{hasAmount ? naira.split('.')[1] : '00'}
                </span>
              </div>

              {hasAmount && (
                <p style={styles.koboNote}>
                  {koboDisplay} kobo
                </p>
              )}

              {!hasAmount && (
                <p style={styles.koboNote}>
                  Tap the keypad below to enter amount
                </p>
              )}
            </div>

            {/* ── Numpad ── */}
            <Numpad onKey={handleKey} />

            {/* ── Notes toggle ── */}
            <button
              style={styles.notesToggle}
              onClick={() => setShowNotes(p => !p)}
            >
              <span style={{ fontSize: '13px', color: 'var(--mist)' }}>
                {showNotes ? 'Hide notes' : '+ Add a note (optional)'}
              </span>
            </button>

            {showNotes && (
              <textarea
                style={styles.notesInput}
                placeholder="e.g. includes special harvest offering"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
              />
            )}

            {/* ── Submit button ── */}
            <button
              className="btn btn-gold btn-full btn-lg"
              onClick={handleSubmit}
              disabled={!hasAmount || loading}
              style={{ marginTop: 'auto' }}
            >
              {loading ? 'Submitting…' : `Submit ₦${hasAmount ? naira.split('.')[0] : '0'}`}
            </button>
          </>
        )}
      </div>

      {/* ── Edit confirm sheet ── */}
      {showEditConfirm && (
        <EditConfirmSheet
          onConfirm={handleEdit}
          onClose={() => setShowEditConfirm(false)}
        />
      )}

    </div>
  )
}

// ── Styles ────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--cream)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'var(--navy)',
    padding: '40px 16px 14px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  backBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    background: 'rgba(245,240,232,0.1)',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  },
  headerLabel: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: 'rgba(245,240,232,0.5)',
    marginBottom: '1px',
  },
  headerDate: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--cream)',
  },
  body: {
    flex: 1,
    padding: '20px 16px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    maxWidth: '400px',
    width: '100%',
    margin: '0 auto',
  },
  amountCard: {
    background: '#fff',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--shadow-card)',
    padding: '20px',
    textAlign: 'center',
  },
  amountLabel: {
    fontSize: '10px',
    fontWeight: '700',
    letterSpacing: '0.08em',
    color: 'var(--mist)',
    marginBottom: '12px',
  },
  amountDisplay: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: '4px',
  },
  currencySymbol: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--gold)',
  },
  amountNumber: {
    fontFamily: 'var(--font-display)',
    fontSize: '52px',
    fontWeight: '700',
    color: 'var(--navy)',
    lineHeight: 1,
    letterSpacing: '-2px',
  },
  amountDecimal: {
    fontFamily: 'var(--font-display)',
    fontSize: '24px',
    fontWeight: '700',
    color: 'var(--mist)',
  },
  koboNote: {
    fontSize: '11px',
    color: 'var(--mist)',
    marginTop: '8px',
  },
  numpad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '8px',
  },
  numKey: {
    height: '58px',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'opacity 0.1s',
  },
  numKeyText: {
    fontSize: '22px',
    fontWeight: '600',
    color: 'var(--navy)',
    fontFamily: 'var(--font-body)',
  },
  notesToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    textAlign: 'left',
  },
  notesInput: {
    width: '100%',
    padding: '12px 14px',
    fontFamily: 'var(--font-body)',
    fontSize: '14px',
    color: 'var(--ink)',
    background: '#fff',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    outline: 'none',
    resize: 'none',
    lineHeight: 1.6,
  },
  submittedBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
  },
  submittedCheck: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: '#DCFCE7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '16px',
  },
  submittedLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: 'var(--mist)',
    letterSpacing: '0.06em',
    marginBottom: '8px',
  },
  submittedAmount: {
    fontFamily: 'var(--font-display)',
    fontSize: '40px',
    fontWeight: '700',
    color: 'var(--navy)',
    lineHeight: 1,
  },
  submittedSub: {
    fontSize: '13px',
    color: 'var(--mist)',
    marginTop: '8px',
  },
  sheetOverlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(10,22,40,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: 50,
  },
  sheet: {
    background: '#fff',
    borderRadius: '24px 24px 0 0',
    padding: '16px 20px 40px',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
  },
  sheetHandle: {
    width: '36px',
    height: '4px',
    borderRadius: '2px',
    background: 'var(--cream-dark)',
    margin: '0 auto 16px',
  },
}