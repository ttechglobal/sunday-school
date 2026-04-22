import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, role, church_id')
    .eq('id', admin.userId)
    .single()

  return NextResponse.json({
    profile: { ...data, email: admin.email },
  })
}