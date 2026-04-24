'use client'

import { useEffect, useState } from 'react'
import { color, font, fontSize, radius } from '@/styles/tokens'

export default function SyncPill() {
  const [status, setStatus] = useState('synced')

  useEffect(() => {
    function update() { setStatus(navigator.onLine ? 'synced' : 'offline') }
    update()
    window.addEventListener('online',  update)
    window.addEventListener('offline', update)
    return () => {
      window.removeEventListener('online',  update)
      window.removeEventListener('offline', update)
    }
  }, [])

  const cfg = {
    synced:  { dot: color.success, label: 'Synced',  bg: color.successBg,  text: '#065F46' },
    saving:  { dot: color.warning, label: 'Saving…', bg: color.warningBg,  text: '#92400E' },
    offline: { dot: color.error,   label: 'Offline',  bg: color.errorBg,   text: '#991B1B' },
  }[status]

  return (
    <div style={{
      display:      'inline-flex',
      alignItems:   'center',
      gap:          '5px',
      padding:      '3px 9px',
      borderRadius: radius.full,
      background:   cfg.bg,
      fontSize:     fontSize['2xs'],
      fontWeight:   '600',
      color:        cfg.text,
      fontFamily:   font.body,
      letterSpacing:'0.02em',
    }}>
      <div style={{
        width:        '6px',
        height:       '6px',
        borderRadius: '50%',
        background:   cfg.dot,
        animation:    status === 'synced' ? 'pulseDot 2s ease infinite' : 'none',
      }} />
      {cfg.label}
    </div>
  )
}