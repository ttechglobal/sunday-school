import { createClient } from '@supabase/supabase-js'

let _client = null

export function getSupabaseAdmin() {
  if (_client) return _client

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      `Supabase admin client missing env vars.\n` +
      `NEXT_PUBLIC_SUPABASE_URL: ${url ? 'OK' : 'MISSING'}\n` +
      `SUPABASE_SERVICE_ROLE_KEY: ${key ? 'OK' : 'MISSING'}`
    )
  }

  _client = createClient(url, key, {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
      detectSessionInUrl:false,
    },
  })

  return _client
}

// Keep backward compat — existing code imports supabaseAdmin
export const supabaseAdmin = new Proxy({}, {
  get(_target, prop) {
    return getSupabaseAdmin()[prop]
  },
})