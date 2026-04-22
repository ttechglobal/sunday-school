'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

import { createClient } from '@/lib/supabase/client'
import { color, font, fontSize, radius } from '@/styles/tokens'

import {
  LayoutDashboard, CalendarDays, GraduationCap,
  Users, FileText, LogOut, Menu, X, Settings,
} from 'lucide-react'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Sessions',  href: '/sessions',  icon: CalendarDays    },
  { label: 'Classes',   href: '/classes',   icon: GraduationCap   },
  { label: 'Members',   href: '/members',   icon: Users           },
  { label: 'Reports',   href: '/reports',   icon: FileText        },
  { label: 'Settings',  href: '/settings',  icon: Settings        },
]

function BibleLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z" fill="rgba(245,240,232,0.85)" />
      <path d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z" fill="rgba(245,240,232,0.85)" />
      <rect x="22.5" y="9" width="3" height="30" rx="1.5" fill={color.cream} />
      <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={color.gold} />
      <rect x="25.5" y="20" width="12" height="2.5" rx="1.25" fill={color.gold} />
      <path d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z" fill={color.gold} />
    </svg>
  )
}

function NavItem({ item, active, onClick }) {
  const Icon = item.icon
  return (
    <button
      onClick={onClick}
      style={{
        display:        'flex',
        alignItems:     'center',
        gap:            '11px',
        padding:        '11px 16px',
        borderRadius:   radius.md,
        border:         'none',
        borderLeft:     `3px solid ${active ? color.gold : 'transparent'}`,
        background:     active ? 'rgba(245,240,232,0.1)' : 'transparent',
        cursor:         'pointer',
        width:          '100%',
        textAlign:      'left',
        transition:     'all 0.15s ease',
        marginBottom:   '2px',
      }}
    >
      <Icon
        size={17}
        color={active ? color.cream : 'rgba(245,240,232,0.38)'}
      />
      <span style={{
        fontSize:   fontSize.base,
        fontWeight: active ? '600' : '400',
        color:      active ? color.cream : 'rgba(245,240,232,0.42)',
      }}>
        {item.label}
      </span>
    </button>
  )
}

function Sidebar({ pathname, navigate, onClose, isMobile }) {
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin-login')
    router.refresh()
  }

  return (
    <div style={{
      width:          '224px',
      background:     color.navy,
      display:        'flex',
      flexDirection:  'column',
      height:         '100%',
      flexShrink:     0,
    }}>

      {/* Logo row */}
      <div style={{
        padding:      '24px 16px 20px',
        borderBottom: '1px solid rgba(245,240,232,0.08)',
        display:      'flex',
        alignItems:   'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <BibleLogo size={28} />
          <div>
            <p style={{
              fontFamily: font.display,
              fontSize:   fontSize.sm,
              fontWeight: '700',
              color:      color.cream,
              margin:     0,
              lineHeight: 1.2,
            }}>
              Sunday School
            </p>
            <p style={{ fontSize: fontSize.xs, color: 'rgba(245,240,232,0.4)', margin: 0 }}>
              Admin Dashboard
            </p>
          </div>
        </div>

        {/* Close button — mobile drawer only */}
        {isMobile && (
          <button
            onClick={onClose}
            style={{
              background:    'none',
              border:        'none',
              cursor:        'pointer',
              padding:       '4px',
              display:       'flex',
              alignItems:    'center',
            }}
          >
            <X size={18} color="rgba(245,240,232,0.6)" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: '14px 8px', overflowY: 'auto' }}>
        {NAV.map(item => (
          <NavItem
            key={item.href}
            item={item}
            active={
              pathname === item.href ||
              pathname.startsWith(item.href + '/')
            }
            onClick={() => navigate(item.href)}
          />
        ))}
      </div>

      {/* Bottom: admin info + logout */}
      <div style={{
        padding:      '16px',
        borderTop:    '1px solid rgba(245,240,232,0.08)',
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
      }}>
        {/* Avatar */}
        <div style={{
          width:           '36px',
          height:          '36px',
          borderRadius:    '50%',
          background:      color.navyMid,
          flexShrink:      0,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
        }}>
          <span style={{ fontSize: fontSize.xs, fontWeight: '700', color: color.cream }}>
            AD
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: fontSize.sm, fontWeight: '600', color: color.cream, margin: 0 }}>
            Admin
          </p>
          <p style={{ fontSize: fontSize.xs, color: 'rgba(245,240,232,0.4)', margin: 0 }}>
            Signed in
          </p>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          title="Sign out"
          style={{
            background:     'none',
            border:         'none',
            cursor:         'pointer',
            padding:        '8px',
            borderRadius:   '8px',
            display:        'flex',
            alignItems:     'center',
            transition:     'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(220,38,38,0.15)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <LogOut size={16} color="rgba(245,240,232,0.45)" />
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router   = useRouter()
  const [drawer, setDrawer] = useState(false)

  function navigate(href) {
    router.push(href)
    setDrawer(false)
  }

  return (
    <div style={{
      minHeight:  '100vh',
      display:    'flex',
      background: color.cream,
      fontFamily: font.body,
    }}>

      {/* ── Desktop sidebar ─────────────────────────────────── */}
      <div style={{
        position:   'sticky',
        top:        0,
        height:     '100vh',
        display:    'flex',
        flexShrink: 0,
      }}>
        <Sidebar pathname={pathname} navigate={navigate} />
      </div>

      {/* ── Mobile drawer overlay ────────────────────────────── */}
      {drawer && (
        <div style={{
          position: 'fixed',
          inset:    0,
          zIndex:   100,
          display:  'flex',
        }}>
          {/* Backdrop */}
          <div
            style={{
              position:   'absolute',
              inset:      0,
              background: 'rgba(10,22,40,0.55)',
            }}
            onClick={() => setDrawer(false)}
          />
          {/* Drawer panel */}
          <div style={{ position: 'relative', zIndex: 1, height: '100%' }}>
            <Sidebar
              pathname={pathname}
              navigate={navigate}
              onClose={() => setDrawer(false)}
              isMobile
            />
          </div>
        </div>
      )}

      {/* ── Main content area ───────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Mobile top bar */}
        <div style={{
          background:  color.navy,
          padding:     '14px 20px',
          display:     'flex',
          alignItems:  'center',
          gap:         '14px',
          position:    'sticky',
          top:         0,
          zIndex:      10,
          boxShadow:   '0 1px 0 rgba(245,240,232,0.08)',
        }}>
          <button
            onClick={() => setDrawer(true)}
            style={{
              background:     'rgba(245,240,232,0.1)',
              border:         'none',
              borderRadius:   radius.sm,
              width:          '40px',
              height:         '40px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
            }}
          >
            <Menu size={19} color={color.cream} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BibleLogo size={22} />
            <p style={{
              fontFamily: font.display,
              fontSize:   fontSize.base,
              fontWeight: '700',
              color:      color.cream,
              margin:     0,
            }}>
              Sunday School
            </p>
          </div>
        </div>

        {/* Page content */}
        <div style={{
          flex:      1,
          padding:   '28px 20px',
          maxWidth:  '1100px',
          width:     '100%',
          alignSelf: 'flex-start',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}