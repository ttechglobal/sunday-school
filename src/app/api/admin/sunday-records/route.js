import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

function formatDate(str) {
  if (!str) return '—'
  return new Intl.DateTimeFormat('en-NG', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(str))
}

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month  = parseInt(searchParams.get('month') || new Date().getMonth() + 1)
  const year   = parseInt(searchParams.get('year')  || new Date().getFullYear())
  const dateId = searchParams.get('date')

  // ── Single Sunday detail ───────────────────────────────────
  if (dateId) {
    // 1. Get the session for this date
    const { data: session, error: sessErr } = await supabaseAdmin
      .from('sessions')
      .select('id, session_date')
      .eq('church_id',    admin.churchId)
      .eq('session_date', dateId)
      .maybeSingle()

    if (sessErr) {
      console.error('[sunday-records] session error:', sessErr)
      return NextResponse.json({ error: sessErr.message }, { status: 500 })
    }

    if (!session) {
      console.log('[sunday-records] no session found for date:', dateId)
      return NextResponse.json({
        date: dateId, totalPresent: 0, totalAbsent: 0,
        totalOffering: 0, classes: [], notSubmitted: [],
      })
    }

    console.log('[sunday-records] session:', session.id)

    // 2. Get approved batches for this session
    const { data: batches, error: batchErr } = await supabaseAdmin
      .from('submission_batches')
      .select(`
        id, status, submitted_at, present_count, record_count,
        total_offering, class_id, session_id,
        classes ( id, name, group_name )
      `)
      .eq('church_id', admin.churchId)
      .eq('session_id', session.id)
      .eq('status', 'approved')

    if (batchErr) {
      console.error('[sunday-records] batches error:', batchErr)
      return NextResponse.json({ error: batchErr.message }, { status: 500 })
    }

    console.log('[sunday-records] batches found:', batches?.length || 0)

    // 3. Get all attendance records for this session — join members
    const { data: attendanceRecs, error: attErr } = await supabaseAdmin
      .from('attendance_records')
      .select(`
        id, member_id, visitor_name, member_type,
        attendance, on_time, bible, memory_verse, offering,
        class_id,
        members ( id, first_name, last_name, full_name )
      `)
      .eq('session_id', session.id)
      .eq('church_id',  admin.churchId)

    if (attErr) {
      console.error('[sunday-records] attendance error:', attErr)
      return NextResponse.json({ error: attErr.message }, { status: 500 })
    }

    console.log('[sunday-records] attendance records:', attendanceRecs?.length || 0)

    // 4. Aggregate per class
    const classDetails = (batches || []).map(b => {
      const classRecords = (attendanceRecs || []).filter(r => r.class_id === b.class_id)
      const presentRecs  = classRecords.filter(r => r.attendance === 'present')
      const absentRecs   = classRecords.filter(r => r.attendance === 'absent')

      const onTimeCount   = presentRecs.filter(r => r.on_time).length
      const bibleCount    = presentRecs.filter(r => r.bible).length
      const verseCount    = presentRecs.filter(r => r.memory_verse).length
      const offeringTotal = classRecords.reduce((s, r) => s + (parseFloat(r.offering) || 0), 0)

      console.log(`[sunday-records] class ${b.classes?.name}: present=${presentRecs.length} absent=${absentRecs.length} onTime=${onTimeCount} bible=${bibleCount} verse=${verseCount} offering=${offeringTotal}`)

      return {
        classId:      b.class_id,
        className:    b.classes?.name       || '—',
        groupName:    b.classes?.group_name || 'General',
        presentCount: presentRecs.length,
        absentCount:  absentRecs.length,
        recordCount:  classRecords.length,
        onTimeCount,
        bibleCount,
        verseCount,
        offering:     offeringTotal,
        submittedAt:  b.submitted_at,
        records:      classRecords.map(r => {
          const name = r.member_type === 'visitor'
            ? (r.visitor_name || 'First Timer')
            : (r.members?.full_name ||
               `${r.members?.first_name || ''} ${r.members?.last_name || ''}`.trim() ||
               '—')
          return {
            name,
            memberId:    r.member_id,
            memberType:  r.member_type,
            attendance:  r.attendance,
            onTime:      Boolean(r.on_time),
            bible:       Boolean(r.bible),
            memoryVerse: Boolean(r.memory_verse),
            offering:    parseFloat(r.offering) || 0,
          }
        }),
      }
    })

    // 5. Get classes that did NOT submit
    const { data: allClasses } = await supabaseAdmin
      .from('classes')
      .select('id, name, group_name')
      .eq('church_id', admin.churchId)
      .eq('is_active', true)

    const submittedIds = new Set((batches || []).map(b => b.class_id))
    const notSubmitted = (allClasses || [])
      .filter(c => !submittedIds.has(c.id))
      .map(c => ({ classId: c.id, className: c.name, groupName: c.group_name || 'General' }))

    // 6. Group breakdown
    const groupMap = {}
    for (const cls of classDetails) {
      const g = cls.groupName || 'General'
      if (!groupMap[g]) groupMap[g] = { group: g, classes: 0, present: 0, absent: 0, offering: 0, total: 0 }
      groupMap[g].classes  += 1
      groupMap[g].present  += cls.presentCount
      groupMap[g].absent   += cls.absentCount
      groupMap[g].offering += cls.offering
      groupMap[g].total    += cls.recordCount
    }
    const groups = Object.values(groupMap).map(g => ({
      ...g,
      rate: g.total > 0 ? Math.round((g.present / g.total) * 100) : 0,
    }))

    const totalPresent  = classDetails.reduce((s, c) => s + c.presentCount, 0)
    const totalAbsent   = classDetails.reduce((s, c) => s + c.absentCount,  0)
    const totalOffering = classDetails.reduce((s, c) => s + c.offering,     0)

    return NextResponse.json({
      date:    dateId,
      session: session.id,
      totalPresent,
      totalAbsent,
      totalOffering,
      classCount: classDetails.length,
      classes:    classDetails,
      notSubmitted,
      groups,
    })
  }

  // ── Month view ─────────────────────────────────────────────
  const { data: batches, error: batchErr } = await supabaseAdmin
    .from('submission_batches')
    .select(`
      id, present_count, record_count, total_offering,
      class_id, session_id,
      sessions ( id, session_date )
    `)
    .eq('church_id', admin.churchId)
    .eq('status',    'approved')

  if (batchErr) return NextResponse.json({ error: batchErr.message }, { status: 500 })

  const filtered = (batches || []).filter(b => {
    if (!b.sessions?.session_date) return false
    const d = new Date(b.sessions.session_date)
    return d.getMonth() + 1 === month && d.getFullYear() === year
  })

  const byDate = {}
  for (const b of filtered) {
    const d = b.sessions.session_date
    if (!byDate[d]) byDate[d] = { date: d, present: 0, total: 0, offering: 0, classes: 0 }
    byDate[d].present  += b.present_count  || 0
    byDate[d].total    += b.record_count   || 0
    byDate[d].offering += b.total_offering || 0
    byDate[d].classes  += 1
  }

  const sundays = Object.values(byDate)
    .map(s => ({ ...s, absent: s.total - s.present }))
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return NextResponse.json({ month, year, sundays })
}