import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signClassToken } from '@/lib/auth/classToken'

export async function POST(request) {
  try {
    const { code } = await request.json()

    if (!code || code.length < 6) {
      return NextResponse.json({ error: 'Invalid code.' }, { status: 400 })
    }

    const cleanCode = code.toUpperCase().replace(/-/g, '').trim()

    const { data: cls, error } = await supabaseAdmin
      .from('classes')
      .select('id, name, church_id, group_name, is_active, churches(name, timezone)')
      .eq('code', cleanCode)
      .eq('is_active', true)
      .single()

    if (error || !cls) {
      return NextResponse.json(
        { error: 'Code not found. Ask your Sunday School admin.' },
        { status: 404 }
      )
    }

    const token = await signClassToken({
      classId:    cls.id,
      className:  cls.name,
      churchId:   cls.church_id,
      churchName: cls.churches?.name || '',
      groupName:  cls.group_name || '',
      timezone:   cls.churches?.timezone || 'Africa/Lagos',
    })

    const response = NextResponse.json({
      success:    true,
      className:  cls.name,
      churchName: cls.churches?.name || '',
    })

    response.cookies.set('class_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })

    return response

  } catch (err) {
    console.error('Class auth error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.set('class_token', '', {
    httpOnly: true, maxAge: 0, path: '/',
  })
  return response
}