import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { jwtVerify } from 'jose'

function classSecret() {
  return new TextEncoder().encode(
    process.env.CLASS_JWT_SECRET || 'sunday-school-secret-change-in-prod'
  )
}

// Which paths need which auth
const ADMIN_PREFIXES  = ['/dashboard', '/approvals', '/admin-records', '/classes', '/members', '/reports', '/settings']
const CLASS_PREFIXES  = ['/home', '/attendance', '/history', '/followup', '/members-list']
const PUBLIC_PATHS    = ['/login', '/admin-login', '/register', '/api', '/_next', '/favicon']

export async function middleware(request) {
  const { pathname } = request.nextUrl

  // Always allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p)) || pathname === '/') {
    return NextResponse.next()
  }

  // ── Class-side routes ──────────────────────────────────────
  if (CLASS_PREFIXES.some(p => pathname.startsWith(p))) {
    const token = request.cookies.get('class_token')?.value

    if (!token) {
      console.log('[middleware] class route no token, redirect login:', pathname)
      return NextResponse.redirect(new URL('/login', request.url))
    }

    try {
      const { payload } = await jwtVerify(token, classSecret())
      if (!payload?.classId || !payload?.churchId) {
        throw new Error('missing ids')
      }
      // Valid — pass through
      return NextResponse.next()
    } catch (err) {
      console.log('[middleware] bad class token:', err.message)
      const res = NextResponse.redirect(new URL('/login', request.url))
      res.cookies.set('class_token', '', { maxAge: 0, path: '/' })
      return res
    }
  }

  // ── Admin routes ───────────────────────────────────────────
  if (ADMIN_PREFIXES.some(p => pathname.startsWith(p))) {
    let response = NextResponse.next()

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookieList) {
            cookieList.forEach(({ name, value, options }) => {
              request.cookies.set(name, value)
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      console.log('[middleware] admin route no user, redirect:', pathname)
      return NextResponse.redirect(new URL('/admin-login', request.url))
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}