import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error(
      `Supabase server client: missing environment variables.\n` +
      `NEXT_PUBLIC_SUPABASE_URL: ${url ? '✓' : '✗ MISSING'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${anonKey ? '✓' : '✗ MISSING'}\n` +
      `In production: add these in Vercel → Settings → Environment Variables\n` +
      `In development: add these to .env.local`
    )
  }

  const cookieStore = await cookies()

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Server component context — safe to ignore
        }
      },
    },
  })
}