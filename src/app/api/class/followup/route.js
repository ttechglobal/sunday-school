import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId') // optional — defaults to latest

  try {
    // Get recent sessions for this class (last 8)
    const { data: batches } = await supabaseAdmin
      .from('submission_batches')
      .select('id, session_id, submitted_at, sessions(id, session_date)')
      .eq('class_id',  cls.classId)
      .eq('church_id', cls.churchId)
      .order('submitted_at', { ascending: false })
      .limit(8)

    if (!batches?.length) {
      return NextResponse.json({ sessions: [], absentees: [], contacts: [] })
    }

    // Use requested session or most recent
    const targetBatch = sessionId
      ? batches.find(b => b.session_id === sessionId) || batches[0]
      : batches[0]

    const targetSessionId = targetBatch?.session_id

    if (!targetSessionId) {
      return NextResponse.json({ sessions: [], absentees: [], contacts: [] })
    }

    // Get absent members for this session
    const { data: absentRecords } = await supabaseAdmin
      .from('attendance_records')
      .select(`
        member_id,
        members (
          id, first_name, last_name, full_name,
          gender, phone_number, address,
          classes(name, group_name)
        )
      `)
      .eq('session_id',  targetSessionId)
      .eq('class_id',    cls.classId)
      .eq('church_id',   cls.churchId)
      .eq('attendance',  'absent')
      .eq('member_type', 'member')

    // Get attendance history for consecutive absences
    const memberIds = (absentRecords || [])
      .map(r => r.member_id)
      .filter(Boolean)

    let consecutiveMap = {}
    if (memberIds.length > 0) {
      // Get last 6 sessions for these members
      const { data: recentSessions } = await supabaseAdmin
        .from('sessions')
        .select('id, session_date')
        .eq('church_id', cls.churchId)
        .order('session_date', { ascending: false })
        .limit(6)

      const recentIds = (recentSessions || []).map(s => s.id)

      if (recentIds.length > 0) {
        const { data: history } = await supabaseAdmin
          .from('attendance_records')
          .select('member_id, session_id, attendance')
          .in('member_id',  memberIds)
          .in('session_id', recentIds)
          .eq('class_id',   cls.classId)

        // Calculate consecutive absences per member
        for (const memberId of memberIds) {
          const memberHistory = (history || [])
            .filter(r => r.member_id === memberId)
            .sort((a, b) => recentIds.indexOf(a.session_id) - recentIds.indexOf(b.session_id))

          let consecutive = 0
          for (const record of memberHistory) {
            if (record.attendance === 'absent') consecutive++
            else break
          }
          consecutiveMap[memberId] = consecutive
        }
      }
    }

    // Get contacted status for this session
    const { data: contacts } = await supabaseAdmin
      .from('followup_contacts')
      .select('member_id, contacted_at')
      .eq('church_id',  cls.churchId)
      .eq('session_id', targetSessionId)

    const contactedSet = new Set((contacts || []).map(c => c.member_id))

    // Build absentee list
    const absentees = (absentRecords || [])
      .filter(r => r.members)
      .map(r => {
        const m    = r.members
        const name = m.full_name ||
          `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Unknown'

        // Format phone for WhatsApp/call
        let phone = m.phone_number || ''
        if (phone.startsWith('0')) phone = '234' + phone.slice(1)
        phone = phone.replace(/\D/g, '')

        return {
          memberId:    m.id,
          name,
          gender:      m.gender    || null,
          phone:       phone       || null,
          rawPhone:    m.phone_number || null,
          address:     m.address   || null,
          className:   m.classes?.name       || '',
          groupName:   m.classes?.group_name || '',
          consecutive: consecutiveMap[m.id]  || 1,
          contacted:   contactedSet.has(m.id),
        }
      })

    // Shape session list for the filter dropdown
    const sessions = batches.map(b => ({
      sessionId:   b.session_id,
      sessionDate: b.sessions?.session_date || '',
    }))

    return NextResponse.json({
      sessions,
      currentSessionId:   targetSessionId,
      currentSessionDate: targetBatch.sessions?.session_date || '',
      absentees,
      totalAbsent:     absentees.length,
      withContact:     absentees.filter(a => a.phone).length,
      alreadyContacted:absentees.filter(a => a.contacted).length,
    })
  } catch (err) {
    console.error('[followup GET]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}