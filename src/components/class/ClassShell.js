'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { X, BookOpen, Users, UserPlus, User, History, LogOut, Menu } from 'lucide-react'
import BibleLogo from './BibleLogo'
import { color, font, radius } from '@/styles/tokens'
import { drawer, topbar } from '@/styles/class.styles'

const NAV_ITEMS = [
  { id: 'home',       label: 'Home',         icon: BookOpen,  href: '/home',        emoji: '🏠' },
  { id: 'attendance', label: 'Attendance',   icon: BookOpen,  href: '/attendance',  emoji: '📋' },
  { id: 'followup',   label: 'Follow-Up',    icon: Users,     href: '/followup',    emoji: '✅' },
  { id: 'history',    label: 'Records',      icon: History,   href: '/history',     emoji: '📅' },
  { id: 'members',    label: 'Members',      icon: Users,     href: '/members-list', emoji: '👥' },
]

function DrawerNav({ onClose, className, churchName }) {
  const router   = useRouter()
  const pathname = usePathname()

  function navigate(href) {
    router.push(href)
    onClose()
  }

  return (
    <div style={drawer.overlay} onClick={onClose}>
      {/* Stop click propagating to overlay */}
      <div style={drawer.panel} onClick={e => e.stopPropagation()}>

        {/* Drawer header */}
        <div style={drawer.header}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <BibleLogo size={36} light />
            <button
              onClick={onClose}
              style={{ background: 'rgba(245,240,232,0.1)', border: 'none', borderRadius: radius.md, width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            >
              <X size={18} color="rgba(245,240,232,0.7)" />
            </button>
          </div>
          <p style={{ fontFamily: font.display, fontSize: '16px', fontWeight: '700', color: color.cream, margin: '0 0 2px' }}>
            {className || 'My Class'}
          </p>
          <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.45)', margin: 0 }}>
            {churchName || 'Covenant Chapel'}
          </p>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: '8px 0' }}>
          {NAV_ITEMS.map(item => {
            const isActive = pathname === item.href
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.href)}
                style={{
                  ...drawer.item,
                  ...(isActive ? drawer.itemActive : {}),
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{item.emoji}</span>
                <span style={isActive ? drawer.itemLabelActive : drawer.itemLabel}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Bottom: sign out */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(245,240,232,0.08)' }}>
          <button
            onClick={() => { router.push('/login'); onClose() }}
            style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'rgba(220,38,38,0.1)', border: 'none',
              borderRadius: radius.md, padding: '12px 16px',
              cursor: 'pointer', width: '100%',
            }}
          >
            <LogOut size={16} color={color.error} />
            <span style={{ fontSize: '14px', fontWeight: '600', color: color.error }}>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClassShell({ children, className, churchName, rightElement }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: color.cream, fontFamily: font.body }}>

      {/* Top bar */}
      <div style={topbar.bar}>
        <div style={topbar.left}>
          {/* Hamburger */}
          <button
            style={topbar.iconBtn}
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} color="rgba(245,240,232,0.85)" />
          </button>

          <div>
            <p style={topbar.title}>{className || 'Sunday School'}</p>
            <p style={topbar.subtitle}>{churchName || 'Covenant Chapel'}</p>
          </div>
        </div>

        {/* Right slot (e.g. session badge) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {rightElement}
        </div>
      </div>

      {/* Drawer */}
      {menuOpen && (
        <DrawerNav
          onClose={() => setMenuOpen(false)}
          className={className}
          churchName={churchName}
        />
      )}

      {/* Page content */}
      {children}
    </div>
  )
}