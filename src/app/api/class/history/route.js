import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: batches, error } = await supabaseAdmin
    .from('submission_batches')
    .select(`
      id,
      status,
      submitted_at,
      present_count,
      record_count,
      total_offering,
      rejection_reason,
      sessions ( id, session_date )
    `)
    .eq('class_id',  cls.classId)
    .eq('church_id', cls.churchId)
    .order('submitted_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('History error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!batches?.length) {
    return NextResponse.json({ sessions: [] })
  }

  // Absentees for the most recent batch
  const latest    = batches[0]
  let absentees   = []
  let absentCount = 0

  if (latest?.sessions?.id) {
    const { data: absentRecords } = await supabaseAdmin
      .from('attendance_records')
      .select('member_id, members(first_name, last_name)')
      .eq('session_id',  latest.sessions.id)
      .eq('class_id',    cls.classId)
      .eq('attendance',  'absent')
      .eq('member_type', 'member')
      .limit(30)

    absentees   = (absentRecords || []).map(r => ({
      id:   r.member_id,
      name: r.members
        ? `${r.members.first_name} ${r.members.last_name}`
        : 'Unknown',
    }))
    absentCount = absentees.length
  }

  const sessions = batches.map(b => ({
    id:          b.id,
    date:        b.sessions?.session_date
      ? new Intl.DateTimeFormat('en-NG', {
          weekday: 'short', month: 'short', day: 'numeric',
        }).format(new Date(b.sessions.session_date))
      : 'Unknown date',
    present:     b.present_count  || 0,
    total:       b.record_count   || 0,
    offering:    b.total_offering || 0,
    status:      b.status         || 'pending',
    onTime:      0,
    absentCount: b.id === latest?.id ? absentCount : 0,
    absentees:   b.id === latest?.id ? absentees   : [],
  }))

  return NextResponse.json({ sessions, latestAbsentees: absentees })
}