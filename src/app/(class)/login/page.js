'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, AlertCircle, Trash2, Check } from 'lucide-react'
import { color, font, fontSize, radius, shadow } from '@/styles/tokens'

const STORAGE_KEY = 'sunday_school_saved_codes'

function getSaved() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function persistCode(code, className, churchName) {
  try {
    const updated = [
      { code, className, churchName, savedAt: Date.now() },
      ...getSaved().filter(c => c.code !== code),
    ].slice(0, 5)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {}
}
function removeCode(code) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(getSaved().filter(c => c.code !== code))) } catch {}
}

function BibleLogo() {
  return (
    <div style={{
      width:          '72px',
      height:         '72px',
      borderRadius:   '20px',
      background:     `linear-gradient(135deg, ${color.navyDark}, ${color.navy})`,
      display:        'flex',
      alignItems:     'center',
      justifyContent: 'center',
      boxShadow:      '0 8px 24px rgba(10,26,61,0.3)',
      flexShrink:     0,
    }}>
      <svg width="40" height="40" viewBox="0 0 48 48" fill="none">
        <path d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
        <path d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
        <rect x="22.5" y="9"  width="3"   height="30" rx="1.5"  fill={color.cream} />
        <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={color.gold} />
        <rect x="25.5" y="20" width="12"  height="2.5" rx="1.25" fill={color.gold} />
        <path d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z" fill={color.gold} />
      </svg>
    </div>
  )
}

export default function ClassLoginPage() {
  const router = useRouter()

  const [code,         setCode]         = useState('')
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [shake,        setShake]        = useState(false)
  const [saveToDevice, setSaveToDevice] = useState(true)
  const [savedCodes,   setSavedCodes]   = useState([])

  useEffect(() => { setSavedCodes(getSaved()) }, [])

  const displayCode = code.length > 4 ? `${code.slice(0, 4)}-${code.slice(4)}` : code

  function handleInput(e) {
    const raw = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 8)
    setCode(raw)
    setError('')
  }

  function selectSaved(c) { setCode(c); setError('') }

  function deleteSaved(c) {
    removeCode(c)
    setSavedCodes(getSaved())
  }

  async function submit() {
    const trimmed = code.replace(/-/g, '').toUpperCase()
    if (trimmed.length < 6) { setError('Please enter a complete class code.'); return }

    setLoading(true)
    setError('')

    try {
      const res  = await fetch('/api/class/auth', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code: trimmed }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Code not found. Check with your Sunday School admin.')
        setCode('')
        setShake(true)
        setTimeout(() => setShake(false), 500)
        setLoading(false)
        return
      }

      if (saveToDevice) {
        persistCode(trimmed, data.className || '', data.churchName || '')
      }
      router.push('/home')
    } catch {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight:      '100vh',
      background:     color.cream,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      padding:        '24px 20px 56px',
      fontFamily:     font.body,
    }}>
      <div style={{
        width:         '100%',
        maxWidth:      '400px',
        display:       'flex',
        flexDirection: 'column',
        gap:           '20px',
        animation:     'fadeIn 0.3s ease',
      }}>

        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
          <BibleLogo />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontFamily:   font.heading,
              fontSize:     fontSize['2xl'],
              fontWeight:   '800',
              color:        color.navy,
              margin:       '0 0 4px',
              letterSpacing:'-0.02em',
            }}>
              Sunday School
            </h1>
            <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0 }}>
              Attendance & Offering Tracker
            </p>
          </div>
        </div>

        {/* Login card */}
        <div style={{
          background:    color.white,
          borderRadius:  radius['2xl'],
          boxShadow:     shadow.modal,
          padding:       '28px 24px',
          display:       'flex',
          flexDirection: 'column',
          gap:           '18px',
          animation:     shake ? 'shake 0.4s ease' : 'none',
        }}>
          <div>
            <h2 style={{
              fontFamily:   font.heading,
              fontSize:     fontSize.lg,
              fontWeight:   '700',
              color:        color.ink,
              margin:       '0 0 4px',
            }}>
              Enter Class Code
            </h2>
            <p style={{ fontSize: fontSize.sm, color: color.inkMuted, margin: 0, fontFamily: font.body }}>
              Get your code from your Sunday School admin
            </p>
          </div>

          {/* Code input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{
              background:   color.cream,
              borderRadius: radius.md,
              border:       `2px solid ${error ? color.error : code.length > 0 ? color.navy : color.creamBorder}`,
              boxShadow:    error
                ? '0 0 0 3px rgba(220,38,38,0.1)'
                : code.length > 0 ? '0 0 0 3px rgba(15,37,87,0.08)' : 'none',
              transition:   'all 0.2s ease',
              overflow:     'hidden',
            }}>
              <input
                value={displayCode}
                onChange={handleInput}
                onKeyDown={e => e.key === 'Enter' && submit()}
                placeholder="XXXX-XXXX"
                autoCapitalize="characters"
                autoComplete="off"
                spellCheck={false}
                autoFocus
                style={{
                  width:         '100%',
                  height:        '60px',
                  padding:       '0 20px',
                  fontSize:      '26px',
                  fontWeight:    '700',
                  color:         color.navy,
                  background:    'transparent',
                  border:        'none',
                  outline:       'none',
                  textAlign:     'center',
                  letterSpacing: '0.15em',
                  fontFamily:    font.body,
                  caretColor:    color.navy,
                }}
              />
            </div>

            {error && (
              <div style={{
                display:      'flex',
                alignItems:   'center',
                gap:          '8px',
                padding:      '10px 14px',
                background:   color.errorBg,
                borderRadius: radius.md,
                border:       `1px solid ${color.errorBorder}`,
                animation:    'fadeIn 0.2s ease',
              }}>
                <AlertCircle size={14} color={color.error} style={{ flexShrink: 0 }} />
                <p style={{ fontSize: fontSize.sm, fontWeight: '600', color: '#991B1B', margin: 0, fontFamily: font.body }}>
                  {error}
                </p>
              </div>
            )}

            <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, margin: 0, textAlign: 'center', fontFamily: font.body }}>
              Ask your Sunday School admin for your class code
            </p>
          </div>

          {/* Save toggle */}
          <button
            onClick={() => setSaveToDevice(p => !p)}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '12px',
              padding:      '12px 14px',
              background:   saveToDevice ? 'rgba(15,37,87,0.04)' : color.cream,
              border:       `1.5px solid ${saveToDevice ? color.navy : color.creamBorder}`,
              borderRadius: radius.md,
              cursor:       'pointer',
              transition:   'all 0.2s ease',
              width:        '100%',
              textAlign:    'left',
            }}
          >
            <div style={{
              width:          '22px',
              height:         '22px',
              borderRadius:   '6px',
              border:         `2px solid ${saveToDevice ? color.navy : color.creamBorder}`,
              background:     saveToDevice ? color.navy : 'transparent',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              flexShrink:     0,
              transition:     'all 0.2s ease',
            }}>
              {saveToDevice && <Check size={13} color="white" strokeWidth={3} />}
            </div>
            <div>
              <p style={{ fontSize: fontSize.sm, fontWeight: '600', color: color.ink, margin: 0, fontFamily: font.body }}>
                Remember this code
              </p>
              <p style={{ fontSize: fontSize.xs, color: color.inkMuted, margin: '1px 0 0', fontFamily: font.body }}>
                Saves on this device for quick access
              </p>
            </div>
          </button>

          {/* Submit */}
          <button
            onClick={submit}
            disabled={loading || code.length < 6}
            style={{
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              gap:            '10px',
              width:          '100%',
              height:         '52px',
              background:     loading || code.length < 6 ? color.creamDark : color.navy,
              color:          loading || code.length < 6 ? color.inkMuted : color.cream,
              border:         'none',
              borderRadius:   radius.lg,
              fontSize:       fontSize.base,
              fontWeight:     '700',
              fontFamily:     font.body,
              cursor:         loading || code.length < 6 ? 'not-allowed' : 'pointer',
              transition:     'all 0.15s ease',
              boxShadow:      loading || code.length < 6 ? 'none' : shadow.btn,
            }}
          >
            {loading ? (
              <>
                <svg style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }} width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="rgba(15,37,87,0.3)" strokeWidth="3"/>
                  <path d="M12 2 A10 10 0 0 1 22 12" stroke={color.navy} strokeWidth="3" strokeLinecap="round"/>
                </svg>
                Checking…
              </>
            ) : (
              <>Enter Class <ArrowRight size={18} /></>
            )}
          </button>
        </div>

        {/* Saved codes */}
        {savedCodes.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{
              fontSize:      fontSize.xs,
              fontWeight:    '700',
              color:         color.inkMuted,
              letterSpacing: '0.07em',
              textTransform: 'uppercase',
              margin:        0,
              paddingLeft:   '4px',
              fontFamily:    font.body,
            }}>
              Saved on this device
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {savedCodes.map(entry => (
                <div key={entry.code} style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '12px',
                  padding:      '12px 14px',
                  background:   color.white,
                  borderRadius: radius.lg,
                  boxShadow:    shadow.card,
                  border:       '1px solid rgba(15,37,87,0.05)',
                }}>
                  {/* Tap to fill */}
                  <button
                    onClick={() => selectSaved(entry.code)}
                    style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0, minWidth: 0 }}
                  >
                    <p style={{
                      fontSize:      fontSize.base,
                      fontWeight:    '700',
                      color:         color.navy,
                      margin:        '0 0 2px',
                      letterSpacing: '0.08em',
                      fontFamily:    font.body,
                    }}>
                      {entry.code.slice(0, 4)}-{entry.code.slice(4)}
                    </p>
                    <p style={{
                      fontSize:     fontSize.xs,
                      color:        color.inkMuted,
                      margin:       0,
                      overflow:     'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace:   'nowrap',
                      fontFamily:   font.body,
                    }}>
                      {entry.className}
                      {entry.churchName ? ` · ${entry.churchName}` : ''}
                    </p>
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteSaved(entry.code)}
                    style={{
                      background:     'none',
                      border:         'none',
                      cursor:         'pointer',
                      padding:        '6px',
                      borderRadius:   radius.sm,
                      color:          color.inkSubtle,
                      flexShrink:     0,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                    }}
                    title="Remove"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>

            <p style={{ fontSize: fontSize.xs, color: color.inkSubtle, textAlign: 'center', margin: 0, fontFamily: font.body }}>
              Tap a saved code to fill it in
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
      `}</style>
    </div>
  )
}