import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * Call this at the top of every admin API route.
 * Returns { user, churchId } or null if not authenticated.
 */
export async function getAdminUser() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) return null

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('church_id, role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile?.church_id) return null

    return {
      userId:   user.id,
      email:    user.email,
      churchId: profile.church_id,
      role:     profile.role,
    }
  } catch (err) {
    console.error('getAdminUser error:', err)
    return null
  }
}