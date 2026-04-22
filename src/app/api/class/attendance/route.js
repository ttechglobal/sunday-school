import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { sessionId, records } = await request.json()

    if (!sessionId || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Missing sessionId or records.' }, { status: 400 })
    }

    // Verify session belongs to this church
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .eq('church_id', cls.churchId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 403 })
    }

    const now  = new Date().toISOString()
    const rows = records.map(r => ({
      church_id:    cls.churchId,
      session_id:   sessionId,
      class_id:     cls.classId,
      member_id:    r.memberId   || null,
      member_type:  r.memberId   ? 'member' : 'visitor',
      visitor_name: r.visitorName || null,
      attendance:   r.attendance  || 'unmarked',
      on_time:      r.onTime      || false,
      bible:        r.bible       || false,
      memory_verse: r.memoryVerse || false,
      offering:     parseFloat(r.offering) || 0,
      submitted_at: now,
    }))

    const { error } = await supabaseAdmin
      .from('attendance_records')
      .upsert(rows, {
        onConflict:        'session_id,class_id,member_id',
        ignoreDuplicates:  false,
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true, submittedAt: now })

  } catch (err) {
    console.error('Attendance submit error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function GET(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')

  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId)
    .eq('class_id',   cls.classId)
    .eq('church_id',  cls.churchId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ records: data })
}