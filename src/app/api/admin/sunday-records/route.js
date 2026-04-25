import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month  = parseInt(searchParams.get('month') || new Date().getMonth() + 1)
  const year   = parseInt(searchParams.get('year')  || new Date().getFullYear())
  const dateId = searchParams.get('date') // YYYY-MM-DD for detail

  if (dateId) {
    // Detail for one Sunday
    const { data: batches } = await supabaseAdmin
      .from('submission_batches')
      .select(`
        id, status, submitted_at, present_count, record_count, total_offering,
        class_id, session_id,
        classes ( id, name, group_name ),
        sessions ( id, session_date )
      `)
      .eq('church_id', admin.churchId)
      .eq('status',    'approved')

    const dayBatches = (batches || []).filter(b => b.sessions?.session_date === dateId)

    // For each batch, get member records
    const classDetails = await Promise.all(dayBatches.map(async (b) => {
      const { data: records } = await supabaseAdmin
        .from('attendance_records')
        .select(`
          member_id, visitor_name, member_type,
          attendance, on_time, bible, memory_verse, offering,
          members ( id, first_name, last_name, full_name )
        `)
        .eq('session_id', b.session_id)
        .eq('class_id',   b.class_id)
        .eq('church_id',  admin.churchId)

      return {
        classId:      b.class_id,
        className:    b.classes?.name       || '—',
        groupName:    b.classes?.group_name || '—',
        presentCount: b.present_count,
        recordCount:  b.record_count,
        offering:     b.total_offering,
        submittedAt:  b.submitted_at,
        records:      records || [],
      }
    }))

    const totalPresent  = dayBatches.reduce((s, b) => s + b.present_count, 0)
    const totalRecords  = dayBatches.reduce((s, b) => s + b.record_count,  0)
    const totalOffering = dayBatches.reduce((s, b) => s + b.total_offering,0)

    return NextResponse.json({ date: dateId, totalPresent, totalAbsent: totalRecords - totalPresent, totalOffering, classes: classDetails })
  }

  // Month view — group by date
  const { data: batches } = await supabaseAdmin
    .from('submission_batches')
    .select(`
      id, status, present_count, record_count, total_offering,
      sessions ( session_date )
    `)
    .eq('church_id', admin.churchId)
    .eq('status',    'approved')
    .order('sessions(session_date)', { ascending: false })

  const filtered = (batches || []).filter(b => {
    if (!b.sessions?.session_date) return false
    const d = new Date(b.sessions.session_date)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })

  // Group by date
  const byDate = {}
  for (const b of filtered) {
    const d = b.sessions.session_date
    if (!byDate[d]) byDate[d] = { date: d, present: 0, absent: 0, offering: 0, classes: 0, total: 0 }
    byDate[d].present  += b.present_count || 0
    byDate[d].total    += b.record_count  || 0
    byDate[d].offering += b.total_offering|| 0
    byDate[d].classes  += 1
    byDate[d].absent    = byDate[d].total - byDate[d].present
  }

  const sundays = Object.values(byDate).sort((a, b) => new Date(b.date) - new Date(a.date))

  return NextResponse.json({ month, year, sundays })
}