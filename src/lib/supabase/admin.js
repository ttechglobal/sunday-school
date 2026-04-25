import { createClient } from '@supabase/supabase-js'

// Lazy singleton — never instantiate at module load time
let _adminClient = null

function getAdminClient() {
  if (_adminClient) return _adminClient

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL — add it to .env.local'
    )
  }
  if (!key) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY — add it to .env.local'
    )
  }

  _adminClient = createClient(url, key, {
    auth: {
      autoRefreshToken:   false,
      persistSession:     false,
      detectSessionInUrl: false,
    },
  })

  return _adminClient
}

// Proxy so all existing imports work unchanged:
// import { supabaseAdmin } from '@/lib/supabase/admin'
// supabaseAdmin.from('table').select(...)
export const supabaseAdmin = new Proxy(
  {},
  {
    get(_target, prop) {
      return getAdminClient()[prop]
    },
    apply(_target, _thisArg, args) {
      return getAdminClient()(...args)
    },
  }
)