'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  Home, CheckSquare, FileText, Users,
  Menu, X, LogOut, Heart,
} from 'lucide-react'
import SyncPill from '@/components/class/ui/SyncPill'
import { color, font, fontSize, radius } from '@/styles/tokens'

const NAV = [
  { id: 'home',       label: 'Home',       href: '/home',       Icon: Home        },
  { id: 'attendance', label: 'Attendance', href: '/attendance', Icon: CheckSquare },
  { id: 'records',    label: 'Records',    href: '/history',    Icon: FileText    },
  { id: 'followup',   label: 'Follow-Up',  href: '/followup',   Icon: Heart       },
]

const DRAWER_ITEMS = [
  { label: 'Home',        href: '/home',         Icon: Home        },
  { label: 'Attendance',  href: '/attendance',   Icon: CheckSquare },
  { label: 'Records',     href: '/history',      Icon: FileText    },
  { label: 'Follow-Up',   href: '/followup',     Icon: Heart       },
  { label: 'Members',     href: '/members-list', Icon: Users       },
]

function BibleLogo({ size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <path d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
      <path d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
      <rect x="22.5" y="9"  width="3"   height="30" rx="1.5"  fill={color.cream} />
      <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={color.gold} />
      <rect x="25.5" y="20" width="12"  height="2.5" rx="1.25" fill={color.gold} />
      <path d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z" fill={color.gold} />
    </svg>
  )
}

function Drawer({ onClose, className, churchName }) {
  const router   = useRouter()
  const pathname = usePathname()

  async function handleLogout() {
    await fetch('/api/class/auth', { method: 'DELETE' })
    router.push('/login')
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position:       'fixed',
        inset:          0,
        zIndex:         200,
        background:     'rgba(10,26,61,0.6)',
        backdropFilter: 'blur(3px)',
        display:        'flex',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width:         '280px',
          height:        '100%',
          background:    color.navyDark,
          display:       'flex',
          flexDirection: 'column',
          boxShadow:     '6px 0 32px rgba(0,0,0,0.25)',
          animation:     'drawerIn 0.25s ease',
        }}
      >
        {/* Header */}
        <div style={{
          padding:        '52px 20px 20px',
          borderBottom:   '1px solid rgba(250,246,240,0.1)',
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
            <BibleLogo size={28} />
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily:   font.heading,
                fontSize:     '15px',
                fontWeight:   '700',
                color:        color.cream,
                margin:       0,
                overflow:     'hidden',
                textOverflow: 'ellipsis',
                whiteSpace:   'nowrap',
                maxWidth:     '170px',
              }}>
                {className || 'My Class'}
              </p>
              {churchName && (
                <p style={{ fontSize: fontSize.xs, color: 'rgba(250,246,240,0.5)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                  {churchName}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background:     'rgba(250,246,240,0.1)',
              border:         'none',
              borderRadius:   radius.sm,
              width:          '34px',
              height:         '34px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
              flexShrink:     0,
            }}
          >
            <X size={18} color="rgba(250,246,240,0.8)" />
          </button>
        </div>

        {/* Nav items */}
        <div style={{ flex: 1, padding: '10px 0', overflowY: 'auto' }}>
          {DRAWER_ITEMS.map(item => {
            const active = pathname === item.href
            return (
              <button
                key={item.href}
                onClick={() => { router.push(item.href); onClose() }}
                style={{
                  display:      'flex',
                  alignItems:   'center',
                  gap:          '12px',
                  padding:      '13px 20px',
                  width:        '100%',
                  background:   active ? 'rgba(250,246,240,0.1)' : 'transparent',
                  borderLeft:   `3px solid ${active ? color.gold : 'transparent'}`,
                  border:       'none',
                  cursor:       'pointer',
                  textAlign:    'left',
                  transition:   'background 0.15s',
                  marginBottom: '1px',
                }}
              >
                <item.Icon
                  size={17}
                  color={active ? color.cream : 'rgba(250,246,240,0.55)'}
                  strokeWidth={active ? 2.5 : 1.8}
                />
                <span style={{
                  fontSize:   '14px',
                  fontWeight: active ? '700' : '400',
                  color:      active ? color.cream : 'rgba(250,246,240,0.65)',
                  fontFamily: font.body,
                }}>
                  {item.label}
                </span>
              </button>
            )
          })}
        </div>

        {/* Sign out */}
        <div style={{
          padding:    '16px 20px',
          borderTop:  '1px solid rgba(250,246,240,0.1)',
          paddingBottom: '36px',
        }}>
          <button
            onClick={handleLogout}
            style={{
              display:      'flex',
              alignItems:   'center',
              gap:          '10px',
              background:   'rgba(220,38,38,0.15)',
              border:       '1px solid rgba(220,38,38,0.2)',
              borderRadius: radius.md,
              padding:      '12px 16px',
              cursor:       'pointer',
              width:        '100%',
              color:        '#FCA5A5',
              fontSize:     '14px',
              fontWeight:   '600',
              fontFamily:   font.body,
            }}
          >
            <LogOut size={16} color="#FCA5A5" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ClassShell({
  children,
  className,
  churchName,
  hideBottomNav  = false,
  isAdminView    = false,
  adminReturnUrl = '/classes',
}) {
  const pathname = usePathname()
  const router   = useRouter()
  const [drawer, setDrawer] = useState(false)

  async function handleExitAdminView() {
    await fetch('/api/class/auth', { method: 'DELETE' })
    router.push(adminReturnUrl)
  }

  return (
    <div style={{
      minHeight:     '100vh',
      background:    color.cream,
      display:       'flex',
      flexDirection: 'column',
      fontFamily:    font.body,
    }}>

      {/* Top bar */}
      <header style={{
        background:     color.navyDark,
        height:         '56px',
        padding:        '0 16px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
        position:       'sticky',
        top:            0,
        zIndex:         50,
        boxShadow:      '0 2px 16px rgba(10,26,61,0.25)',
        flexShrink:     0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setDrawer(true)}
            aria-label="Menu"
            style={{
              background:     'rgba(250,246,240,0.12)',
              border:         'none',
              borderRadius:   radius.sm,
              width:          '38px',
              height:         '38px',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              cursor:         'pointer',
            }}
          >
            <Menu size={20} color={color.cream} strokeWidth={2} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BibleLogo size={22} />
            <span style={{
              fontFamily:   font.heading,
              fontSize:     '15px',
              fontWeight:   '700',
              color:        color.cream,
              letterSpacing:'-0.01em',
            }}>
              Sunday School
            </span>
          </div>
        </div>
        <SyncPill />
      </header>

      {/* Admin mode banner */}
      {isAdminView && (
        <div style={{
          display:        'flex',
          alignItems:     'center',
          justifyContent: 'space-between',
          gap:            '12px',
          padding:        '10px 16px',
          background:     '#FEF3C7',
          borderBottom:   '1px solid #FCD34D',
          flexShrink:     0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#D97706', flexShrink: 0 }} />
            <p style={{ fontSize: fontSize.xs, fontWeight: '700', color: '#92400E', margin: 0, fontFamily: font.body }}>
              Admin Mode — viewing as {className || 'class'}
            </p>
          </div>
          <button
            onClick={handleExitAdminView}
            style={{
              background:   'none',
              border:       '1px solid #FCD34D',
              borderRadius: radius.sm,
              padding:      '4px 10px',
              cursor:       'pointer',
              fontSize:     fontSize.xs,
              fontWeight:   '700',
              color:        '#92400E',
              fontFamily:   font.body,
              whiteSpace:   'nowrap',
            }}
          >
            ← Exit to Admin
          </button>
        </div>
      )}

      {/* Content */}
      <main style={{ flex: 1 }}>{children}</main>

      {/* Bottom nav */}
      {!hideBottomNav && (
        <nav style={{
          position:     'fixed',
          bottom:       0, left: 0, right: 0,
          height:       '64px',
          background:   color.white,
          borderTop:    `1px solid ${color.creamBorder}`,
          display:      'flex',
          alignItems:   'stretch',
          zIndex:       100,
          boxShadow:    '0 -2px 12px rgba(15,37,87,0.06)',
          paddingBottom:'env(safe-area-inset-bottom, 0px)',
        }}>
          {NAV.map(item => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                style={{
                  flex:           1,
                  display:        'flex',
                  flexDirection:  'column',
                  alignItems:     'center',
                  justifyContent: 'center',
                  gap:            '3px',
                  background:     'none',
                  border:         'none',
                  cursor:         'pointer',
                  color:          active ? color.navy : color.inkSubtle,
                  fontFamily:     font.body,
                  fontSize:       '10px',
                  fontWeight:     active ? '700' : '500',
                  padding:        '8px 4px',
                  transition:     'color 0.15s',
                }}
              >
                <item.Icon
                  size={22}
                  strokeWidth={active ? 2.5 : 1.8}
                  color={active ? color.navy : color.inkSubtle}
                />
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      )}

      {drawer && (
        <Drawer
          onClose={() => setDrawer(false)}
          className={className}
          churchName={churchName}
        />
      )}

      <style>{`
        @keyframes drawerIn {
          from { transform: translateX(-100%); opacity: 0; }
          to   { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}