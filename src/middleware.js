import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh session — required for Server Components to stay in sync
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  // ── Admin route protection ────────────────────────────────
  const adminRoutes = [
    '/dashboard', '/sessions', '/classes',
    '/members', '/reports', '/settings',
  ]
  const isAdminRoute = adminRoutes.some(r =>
    pathname === r || pathname.startsWith(r + '/')
  )

  if (isAdminRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin-login'
    return NextResponse.redirect(url)
  }

  // ── Class route protection ────────────────────────────────
  const classRoutes = [
    '/home', '/attendance', '/offering', '/history',
    '/followup', '/members-list', '/visitors', '/teacher',
  ]
  const isClassRoute = classRoutes.some(r =>
    pathname === r || pathname.startsWith(r + '/')
  )

  if (isClassRoute) {
    const classToken = request.cookies.get('class_token')?.value
    if (!classToken) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }

    // Verify class JWT
    try {
      const { jwtVerify } = await import('jose')
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'fallback-secret'
      )
      await jwtVerify(classToken, secret)
    } catch {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      const response = NextResponse.redirect(url)
      response.cookies.delete('class_token')
      return response
    }
  }

  // ── Redirect logged-in admins away from auth pages ────────
  const authPages = ['/admin-login', '/register']
  if (user && authPages.includes(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}