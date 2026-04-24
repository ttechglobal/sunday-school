import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status') || 'pending'

  const { data, error } = await supabaseAdmin
    .from('submission_batches')
    .select(`
      id,
      status,
      submitted_at,
      record_count,
      present_count,
      total_offering,
      rejection_reason,
      reviewed_at,
      sessions ( id, session_date ),
      classes  ( id, name, group_name )
    `)
    .eq('church_id', admin.churchId)
    .eq('status',    status)
    .order('submitted_at', { ascending: false })

  if (error) {
    console.error('Approvals GET error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ submissions: data || [] })
}