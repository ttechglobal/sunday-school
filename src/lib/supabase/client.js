import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    // During SSR/prerender these may not be available yet
    // Return a dummy that won't crash — actual calls will fail gracefully
    if (typeof window === 'undefined') {
      // Server-side: return null-safe proxy
      return new Proxy({}, {
        get(_target, prop) {
          return () => new Proxy({}, {
            get() { return () => Promise.resolve({ data: null, error: { message: 'Not available during SSR' } }) }
          })
        }
      })
    }
    throw new Error(
      'Supabase browser client missing env vars. ' +
      'Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local'
    )
  }

  return createBrowserClient(url, anonKey)
}