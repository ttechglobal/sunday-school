import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(request, { params }) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id }                                   = await params
    const { fullName, gender, phoneNumber, address } = await request.json()

    if (!fullName?.trim()) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })

    const { data: existing } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('id',        id)
      .eq('class_id',  cls.classId)
      .eq('church_id', cls.churchId)
      .single()

    if (!existing) return NextResponse.json({ error: 'Member not found.' }, { status: 404 })

    const parts = fullName.trim().split(' ')

    const { data, error } = await supabaseAdmin
      .from('members')
      .update({
        full_name:    fullName.trim(),
        first_name:   parts[0]                || '',
        last_name:    parts.slice(1).join(' ')|| '',
        gender:       gender      ?? null,
        phone_number: phoneNumber ?? null,
        address:      address     ?? null,
      })
      .eq('id', id)
      .select('id, first_name, last_name, full_name, gender, phone_number, address, is_active, class_id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ member: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}