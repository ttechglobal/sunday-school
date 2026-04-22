import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

function getTodayDate(timezone) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: timezone }).format(new Date())
}

function isSunday(timezone) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: timezone, weekday: 'long',
  }).format(new Date()) === 'Sunday'
}

function getCurrentTime(timezone) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: timezone, hour: '2-digit', minute: '2-digit', hour12: false,
  }).format(new Date()).replace(', ', '')
}

export async function GET() {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const timezone = cls.timezone || 'Africa/Lagos'
  const today    = getTodayDate(timezone)
  const sunday   = isSunday(timezone)

  if (!sunday) {
    return NextResponse.json({
      isOpen: false, reason: 'not_sunday',
      sessionId: null, sessionDate: today,
    })
  }

  // Get or create today's session
  let { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, is_open')
    .eq('church_id', cls.churchId)
    .eq('session_date', today)
    .maybeSingle()

  if (!session) {
    const { data: newSession } = await supabaseAdmin
      .from('sessions')
      .insert({
        church_id:    cls.churchId,
        session_date: today,
        session_type: 'normal',
      })
      .select()
      .single()
    session = newSession
  }

  if (session.is_open === false) {
    return NextResponse.json({
      isOpen: false, reason: 'force_closed',
      sessionId: session.id, sessionDate: today,
    })
  }

  if (session.is_open === true) {
    return NextResponse.json({
      isOpen: true, reason: 'force_open',
      sessionId: session.id, sessionDate: today,
    })
  }

  // Check time window
  const { data: church } = await supabaseAdmin
    .from('churches')
    .select('session_start, session_end')
    .eq('id', cls.churchId)
    .single()

  const now    = getCurrentTime(timezone)
  const isOpen = now >= (church?.session_start || '06:00') &&
                 now <= (church?.session_end   || '23:59')

  return NextResponse.json({
    isOpen,
    reason:      isOpen ? 'time_window' : 'outside_hours',
    sessionId:   session.id,
    sessionDate: today,
  })
}