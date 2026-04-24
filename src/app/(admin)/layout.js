'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard, Users, BookOpen,
  FileText, BarChart2, Settings,
  Menu, X, LogOut, ChevronRight,
  CheckSquare,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { color, font, fontSize, radius } from '@/styles/tokens'

const NAV = [
  { id: 'dashboard', label: 'Dashboard', href: '/dashboard',     Icon: LayoutDashboard },
  { id: 'approvals', label: 'Approvals', href: '/approvals',     Icon: CheckSquare     },
  { id: 'records',   label: 'Records',   href: '/admin-records', Icon: FileText        },
  { id: 'classes',   label: 'Classes',   href: '/classes',       Icon: BookOpen        },
  { id: 'members',   label: 'Members',   href: '/members',       Icon: Users           },
  { id: 'reports',   label: 'Reports',   href: '/reports',       Icon: BarChart2       },
  { id: 'settings',  label: 'Settings',  href: '/settings',      Icon: Settings        },
]

const DESKTOP_BP = 768

function BibleLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="12" fill={color.navyLight} />
      <path d="M24 10 C20 9 10 9 7 11 L7 38 C10 36 20 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
      <path d="M24 10 C28 9 38 9 41 11 L41 38 C38 36 28 37 24 38 Z" fill="rgba(250,246,240,0.9)" />
      <rect x="22.5" y="9"  width="3"   height="30" rx="1.5"  fill={color.cream} />
      <rect x="30.5" y="15" width="2.5" height="14" rx="1.25" fill={color.gold} />
      <rect x="25.5" y="20" width="12"  height="2.5" rx="1.25" fill={color.gold} />
      <path d="M37 9 L37 16 L35 14.5 L33 16 L33 9 Z" fill={color.gold} />
    </svg>
  )
}

function NavItem({ item, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display:      'flex',
        alignItems:   'center',
        gap:          '10px',
        padding:      '10px 16px',
        width:        '100%',
        background:   active ? color.white : 'transparent',
        border:       'none',
        borderRadius: radius.lg,
        cursor:       'pointer',
        textAlign:    'left',
        transition:   'all 0.15s ease',
        marginBottom: '2px',
        position:     'relative',
        boxShadow:    active ? '0 1px 4px rgba(15,37,87,0.08)' : 'none',
      }}
    >
      {active && (
        <div style={{
          position:     'absolute',
          left:         0,
          top:          '20%',
          height:       '60%',
          width:        '3px',
          background:   color.navy,
          borderRadius: '0 2px 2px 0',
        }} />
      )}
      <item.Icon
        size={18}
        color={active ? color.navy : color.inkSubtle}
        strokeWidth={active ? 2.5 : 1.8}
      />
      <span style={{
        fontFamily: font.body,
        fontSize:   fontSize.sm,
        fontWeight: active ? '700' : '500',
        color:      active ? color.navy : color.inkMuted,
        flex:       1,
      }}>
        {item.label}
      </span>
      {active && <ChevronRight size={14} color={color.navy} />}
    </button>
  )
}

function SidebarContent({ pathname, navigate, onClose, showClose }) {
  const supabase = createClient()
  const router   = useRouter()
  const [info, setInfo] = useState({ churchName: '', adminName: '' })

  useEffect(() => {
    async function fetchInfo() {
      try {
        const res  = await fetch('/api/admin/me')
        const data = await res.json()
        if (res.ok) {
          setInfo({
            churchName: data.churchName || '',
            adminName:  data.adminName  || '',
          })
        }
      } catch {}
    }
    fetchInfo()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin-login')
    router.refresh()
  }

  const initials = (info.adminName || 'A')
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <aside style={{
      width:         '240px',
      background:    color.cream,
      borderRight:   `1px solid ${color.creamBorder}`,
      display:       'flex',
      flexDirection: 'column',
      height:        '100%',
      flexShrink:    0,
    }}>
      {/* Logo + church name */}
      <div style={{
        padding:        '24px 20px 20px',
        borderBottom:   `1px solid ${color.creamBorder}`,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <BibleLogo size={36} />
          <div style={{ minWidth: 0 }}>
            <p style={{
              fontFamily:   font.heading,
              fontSize:     '13px',
              fontWeight:   '800',
              color:        color.ink,
              margin:       '0 0 1px',
              letterSpacing:'-0.01em',
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
              maxWidth:     '140px',
            }}>
              {info.churchName || 'Sunday School'}
            </p>
            <p style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, margin: 0, fontWeight: '500' }}>
              Admin Dashboard
            </p>
          </div>
        </div>
        {showClose && (
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', flexShrink: 0 }}
          >
            <X size={20} color={color.inkMuted} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '14px 12px', overflowY: 'auto' }}>
        {NAV.map(item => (
          <NavItem
            key={item.href}
            item={item}
            active={pathname === item.href || pathname.startsWith(item.href + '/')}
            onClick={() => navigate(item.href)}
          />
        ))}
      </nav>

      {/* Admin profile + logout */}
      <div style={{ padding: '16px 12px', borderTop: `1px solid ${color.creamBorder}` }}>
        <div style={{
          display:      'flex',
          alignItems:   'center',
          gap:          '10px',
          padding:      '10px 12px',
          background:   color.white,
          borderRadius: radius.lg,
          marginBottom: '8px',
          border:       `1px solid ${color.creamBorder}`,
        }}>
          <div style={{
            width:          '34px',
            height:         '34px',
            borderRadius:   '50%',
            flexShrink:     0,
            background:     `linear-gradient(135deg, ${color.navy}, ${color.navyLight})`,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
          }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: color.cream, fontFamily: font.heading }}>
              {initials}
            </span>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize:     fontSize.sm,
              fontWeight:   '700',
              color:        color.ink,
              margin:       0,
              fontFamily:   font.body,
              overflow:     'hidden',
              textOverflow: 'ellipsis',
              whiteSpace:   'nowrap',
            }}>
              {info.adminName || 'Admin'}
            </p>
            <p style={{ fontSize: fontSize['2xs'], color: color.inkSubtle, margin: 0 }}>
              Administrator
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display:      'flex',
            alignItems:   'center',
            gap:          '8px',
            background:   'none',
            border:       'none',
            cursor:       'pointer',
            width:        '100%',
            padding:      '8px 12px',
            borderRadius: radius.md,
            color:        color.inkMuted,
            fontSize:     fontSize.sm,
            fontFamily:   font.body,
            fontWeight:   '500',
            transition:   'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = color.errorBg; e.currentTarget.style.color = color.error }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = color.inkMuted }}
        >
          <LogOut size={15} /> Sign Out
        </button>
      </div>
    </aside>
  )
}

export default function AdminLayout({ children }) {
  const pathname  = usePathname()
  const router    = useRouter()
  const [isDesktop, setIsDesktop] = useState(false)
  const [drawer,    setDrawer]    = useState(false)

  useEffect(() => {
    function check() {
      const desktop = window.innerWidth >= DESKTOP_BP
      setIsDesktop(desktop)
      if (desktop) setDrawer(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  function navigate(href) {
    router.push(href)
    setDrawer(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#F8FAFC', fontFamily: font.body }}>

      {/* Desktop sidebar */}
      {isDesktop && (
        <div style={{ position: 'sticky', top: 0, height: '100vh', flexShrink: 0 }}>
          <SidebarContent pathname={pathname} navigate={navigate} showClose={false} />
        </div>
      )}

      {/* Mobile drawer */}
      {!isDesktop && drawer && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 100, display: 'flex' }}>
          <div
            style={{ position: 'absolute', inset: 0, background: 'rgba(10,26,61,0.4)', backdropFilter: 'blur(2px)' }}
            onClick={() => setDrawer(false)}
          />
          <div style={{ position: 'relative', zIndex: 1, height: '100%', animation: 'drawerIn 0.25s ease' }}>
            <SidebarContent pathname={pathname} navigate={navigate} onClose={() => setDrawer(false)} showClose />
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top bar — hamburger mobile only */}
        <header style={{
          height:       '56px',
          background:   color.white,
          borderBottom: `1px solid ${color.creamBorder}`,
          padding:      '0 20px',
          display:      'flex',
          alignItems:   'center',
          gap:          '12px',
          position:     'sticky',
          top:          0,
          zIndex:       50,
          flexShrink:   0,
        }}>
          {!isDesktop && (
            <button
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: radius.sm, display: 'flex', flexShrink: 0 }}
            >
              <Menu size={22} color={color.ink} />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BibleLogo size={26} />
            <span style={{ fontFamily: font.heading, fontSize: fontSize.base, fontWeight: '800', color: color.ink, letterSpacing: '-0.01em' }}>
              Sunday School
            </span>
          </div>
          <div style={{ flex: 1 }} />
          {!isDesktop && (
            <span style={{ fontSize: fontSize.sm, fontWeight: '600', color: color.inkMuted, fontFamily: font.body }}>
              {NAV.find(n => pathname === n.href || pathname.startsWith(n.href + '/'))?.label || ''}
            </span>
          )}
        </header>

        {/* Page content */}
        <main style={{ flex: 1, padding: '28px 24px 48px' }}>
          <div style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes drawerIn {
          from { transform: translateX(-100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin    { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}