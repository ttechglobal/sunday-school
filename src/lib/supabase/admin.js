import { createClient } from '@supabase/supabase-js'

let _client = null

export function getAdminClient() {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      `Supabase admin client: missing environment variables.\n` +
      `NEXT_PUBLIC_SUPABASE_URL: ${url ? '✓' : '✗ MISSING'}\n` +
      `SUPABASE_SERVICE_ROLE_KEY: ${key ? '✓' : '✗ MISSING'}\n` +
      `In production: add these in Vercel → Settings → Environment Variables\n` +
      `In development: add these to .env.local`
    )
  }

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
    },
  })

  return _client
}

// Proxy — all existing imports work unchanged
export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      return getAdminClient()[prop]
    },
  }
)