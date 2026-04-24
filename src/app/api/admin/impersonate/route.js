import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signClassToken } from '@/lib/auth/classToken'

export async function POST(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { classId } = await request.json()

    if (!classId) {
      return NextResponse.json({ error: 'classId is required.' }, { status: 400 })
    }

    const { data: cls, error } = await supabaseAdmin
      .from('classes')
      .select('id, name, church_id, churches(id, name)')
      .eq('id',        classId)
      .eq('church_id', admin.churchId)
      .single()

    if (error || !cls) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
    }

    const token = await signClassToken({
      classId:     cls.id,
      churchId:    cls.church_id,
      className:   cls.name,
      churchName:  cls.churches?.name || '',
      isAdminView: true,
      adminId:     admin.userId,
    })

    const jar = await cookies()
    jar.set('class_token', token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 2,  // 2 hours
      path:     '/',
    })

    return NextResponse.json({
      success:   true,
      className: cls.name,
    })
  } catch (err) {
    console.error('[admin/impersonate] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}