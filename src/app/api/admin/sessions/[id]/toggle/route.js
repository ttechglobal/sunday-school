import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id }     = await params
  const { isOpen } = await request.json()

  const { data, error } = await supabaseAdmin
    .from('sessions')
    .update({ is_open: isOpen })
    .eq('id', id)
    .eq('church_id', admin.churchId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ session: data })
}