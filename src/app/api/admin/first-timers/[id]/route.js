import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id }     = await params
  const { action } = await request.json()

  if (action === 'enrol') {
    // Promote to regular member
    const { data, error } = await supabaseAdmin
      .from('members')
      .update({ member_type: 'member' })
      .eq('id',        id)
      .eq('church_id', admin.churchId)
      .eq('member_type', 'first_timer')
      .select('id, full_name, first_name, last_name')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ member: data })
  }

  if (action === 'remove') {
    const { error } = await supabaseAdmin
      .from('members')
      .update({ is_active: false })
      .eq('id',        id)
      .eq('church_id', admin.churchId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
}