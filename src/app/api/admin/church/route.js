import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: church, error } = await supabaseAdmin
    .from('churches')
    .select('id, name, address, timezone')
    .eq('id', admin.churchId)
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ church })
}

export async function PATCH(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { name, address, timezone } = await request.json()
  const updates = {}
  if (name     !== undefined) updates.name     = name?.trim()     || null
  if (address  !== undefined) updates.address  = address?.trim()  || null
  if (timezone !== undefined) updates.timezone = timezone || 'Africa/Lagos'

  const { data, error } = await supabaseAdmin
    .from('churches')
    .update(updates)
    .eq('id', admin.churchId)
    .select('id, name, address, timezone')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ church: data })
}