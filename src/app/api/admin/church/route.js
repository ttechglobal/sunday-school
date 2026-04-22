import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('churches')
    .select('*')
    .eq('id', admin.churchId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ church: data })
}

export async function PATCH(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body    = await request.json()
  const updates = {}

  if (body.name          !== undefined) updates.name          = body.name.trim()
  if (body.address       !== undefined) updates.address       = body.address?.trim() || null
  if (body.timezone      !== undefined) updates.timezone      = body.timezone
  if (body.session_start !== undefined) updates.session_start = body.session_start
  if (body.session_end   !== undefined) updates.session_end   = body.session_end

  const { data, error } = await supabaseAdmin
    .from('churches')
    .update(updates)
    .eq('id', admin.churchId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ church: data })
}