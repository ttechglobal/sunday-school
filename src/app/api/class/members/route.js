import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('members')
    .select('id, first_name, last_name, full_name, gender, phone_number, address, is_active, class_id')
    .eq('class_id',  cls.classId)
    .eq('church_id', cls.churchId)
    .eq('is_active', true)
    .order('full_name', { nullsFirst: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
  members: (data || []).map(m => ({
    ...m,
    full_name: m.full_name ||
      `${m.first_name || ''} ${m.last_name || ''}`.trim() ||
      'Unknown',
  }))
})
}

export async function POST(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { fullName, gender, phoneNumber, address } = await request.json()
    if (!fullName?.trim()) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })

    const parts = fullName.trim().split(' ')

    const { data, error } = await supabaseAdmin
      .from('members')
      .insert({
        church_id:    cls.churchId,
        class_id:     cls.classId,
        full_name:    fullName.trim(),
        first_name:   parts[0]                || '',
        last_name:    parts.slice(1).join(' ')|| '',
        gender:       gender       || null,
        phone_number: phoneNumber  || null,
        address:      address      || null,
        is_active:    true,
      })
      .select('id, first_name, last_name, full_name, gender, phone_number, address, is_active, class_id')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ member: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}