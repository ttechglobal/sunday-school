import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { fullName, phoneNumber, gender } = await request.json()
    if (!fullName?.trim()) return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })

    const parts = fullName.trim().split(' ')

    const { data, error } = await supabaseAdmin
      .from('members')
      .insert({
        church_id:    cls.churchId,
        class_id:     cls.classId,
        full_name:    fullName.trim(),
        first_name:   parts[0]                 || '',
        last_name:    parts.slice(1).join(' ') || '',
        gender:       gender       || null,
        phone_number: phoneNumber  || null,
        member_type:  'first_timer',
        is_active:    true,
      })
      .select('id, full_name, first_name, last_name, member_type')
      .single()

    if (error) {
      console.error('[class/first-timers POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data })
  } catch (err) {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}