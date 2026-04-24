import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { signClassToken } from '@/lib/auth/classToken'

const COOKIE = 'class_token'

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}))
    const code = body?.code?.toString().trim().toUpperCase()

    if (!code) {
      return NextResponse.json({ error: 'Class code is required.' }, { status: 400 })
    }

    console.log('[class/auth] login attempt:', code)

    const { data: cls, error } = await supabaseAdmin
      .from('classes')
      .select('id, name, code, church_id, is_active, churches(id, name)')
      .eq('code', code)
      .maybeSingle()

    if (error) {
      console.error('[class/auth] DB error:', error.message)
      return NextResponse.json({ error: 'Database error.' }, { status: 500 })
    }

    if (!cls) {
      console.log('[class/auth] not found:', code)
      return NextResponse.json(
        { error: 'Class code not found. Check with your Sunday School admin.' },
        { status: 404 }
      )
    }

    if (cls.is_active === false) {
      return NextResponse.json(
        { error: 'This class has been deactivated. Contact your admin.' },
        { status: 403 }
      )
    }

    if (!cls.church_id) {
      console.error('[class/auth] class missing church_id:', cls.id)
      return NextResponse.json(
        { error: 'Class is not linked to a church. Contact your admin.' },
        { status: 400 }
      )
    }

    console.log('[class/auth] found:', { id: cls.id, churchId: cls.church_id, name: cls.name })

    const token = await signClassToken({
      classId:    cls.id,
      churchId:   cls.church_id,
      className:  cls.name,
      churchName: cls.churches?.name || '',
    })

    const jar = await cookies()
    jar.set(COOKIE, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge:   60 * 60 * 24 * 7,
      path:     '/',
    })

    console.log('[class/auth] cookie set OK')

    return NextResponse.json({
      success:    true,
      className:  cls.name,
      churchName: cls.churches?.name || '',
    })
  } catch (err) {
    console.error('[class/auth] unexpected error:', err)
    return NextResponse.json({ error: err.message || 'Server error.' }, { status: 500 })
  }
}

export async function DELETE() {
  try {
    const jar = await cookies()
    jar.set(COOKIE, '', { maxAge: 0, path: '/' })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[class/auth DELETE]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}