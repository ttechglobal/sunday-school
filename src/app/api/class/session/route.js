import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

function getToday() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())
}

export async function GET() {
  const cls = await verifyClassToken()

  if (!cls) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = getToday()

  try {
    let { data: session } = await supabaseAdmin
      .from('sessions')
      .select('id, is_open, session_date')
      .eq('church_id',    cls.churchId)
      .eq('session_date', today)
      .maybeSingle()

    if (!session) {
      const { data: newSession, error } = await supabaseAdmin
        .from('sessions')
        .insert({
          church_id:    cls.churchId,
          session_date: today,
          is_open:      true,
        })
        .select('id, is_open, session_date')
        .single()

      if (error) {
        console.error('[session] create error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      session = newSession
    }

    return NextResponse.json({
      sessionId:   session.id,
      sessionDate: session.session_date,
      isOpen:      session.is_open ?? true,
    })
  } catch (err) {
    console.error('[session] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}