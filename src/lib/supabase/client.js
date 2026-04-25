import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // During static prerendering (server-side), these may not be injected yet.
  // Return a safe no-op so the build doesn't crash.
  if (!url || !anonKey) {
    if (typeof window === 'undefined') {
      // SSR / prerender — return safe stub
      return {
        auth: {
          getUser:               () => Promise.resolve({ data: { user: null }, error: null }),
          signInWithPassword:    () => Promise.resolve({ data: null, error: { message: 'Not available during SSR' } }),
          signUp:                () => Promise.resolve({ data: null, error: { message: 'Not available during SSR' } }),
          signOut:               () => Promise.resolve({ error: null }),
          resetPasswordForEmail: () => Promise.resolve({ error: null }),
          onAuthStateChange:     () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        },
        from: () => ({
          select:   () => Promise.resolve({ data: [], error: null }),
          insert:   () => Promise.resolve({ data: null, error: null }),
          update:   () => Promise.resolve({ data: null, error: null }),
          delete:   () => Promise.resolve({ data: null, error: null }),
          upsert:   () => Promise.resolve({ data: null, error: null }),
          single:   () => Promise.resolve({ data: null, error: null }),
          maybeSingle: () => Promise.resolve({ data: null, error: null }),
        }),
      }
    }

    // Client-side with missing vars — real error
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Add them to Vercel Environment Variables (Production) or .env.local (development).'
    )
  }

  return createBrowserClient(url, anonKey)
}