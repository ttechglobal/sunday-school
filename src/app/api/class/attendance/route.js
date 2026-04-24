import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  console.log('[attendance POST] classId:', cls.classId, 'churchId:', cls.churchId)

  try {
    const { sessionId, records } = await request.json()

    if (!sessionId || !Array.isArray(records)) {
      return NextResponse.json({ error: 'Missing sessionId or records.' }, { status: 400 })
    }

    // Verify session
    const { data: session } = await supabaseAdmin
      .from('sessions')
      .select('id, church_id')
      .eq('id', sessionId)
      .single()

    if (!session) {
      return NextResponse.json({ error: 'Invalid session.' }, { status: 403 })
    }

    const now = new Date().toISOString()

    const memberRecords  = records.filter(r => r.memberId)
    const visitorRecords = records.filter(r => !r.memberId && r.visitorName)

    console.log('[attendance POST]', memberRecords.length, 'members,', visitorRecords.length, 'visitors')

    // ── Upsert member records ──────────────────────────────
    if (memberRecords.length > 0) {
      const rows = memberRecords.map(r => ({
        church_id:    cls.churchId,
        session_id:   sessionId,
        class_id:     cls.classId,
        member_id:    r.memberId,
        member_type:  'member',
        visitor_name: null,
        // attendance is ALWAYS 'present' or 'absent' — never 'unmarked'
        attendance:   r.attendance === 'present' ? 'present' : 'absent',
        on_time:      r.onTime      || false,
        bible:        r.bible       || false,
        memory_verse: r.memoryVerse || false,
        offering:     parseFloat(r.offering) || 0,
        submitted_at: now,
        status:       'pending',
      }))

      const { error: memberError } = await supabaseAdmin
        .from('attendance_records')
        .upsert(rows, {
          onConflict:       'session_id,class_id,member_id',
          ignoreDuplicates: false,
        })

      if (memberError) {
        console.error('[attendance POST] member upsert error:', memberError)
        return NextResponse.json({ error: memberError.message }, { status: 500 })
      }

      console.log('[attendance POST] member records saved OK')
    }

    // ── Visitor records — delete + re-insert ──────────────
    await supabaseAdmin
      .from('attendance_records')
      .delete()
      .eq('session_id',  sessionId)
      .eq('class_id',    cls.classId)
      .eq('member_type', 'visitor')

    if (visitorRecords.length > 0) {
      const vRows = visitorRecords.map(r => ({
        church_id:    cls.churchId,
        session_id:   sessionId,
        class_id:     cls.classId,
        member_id:    null,
        member_type:  'visitor',
        visitor_name: r.visitorName,
        attendance:   'present',
        on_time:      r.onTime      || false,
        bible:        r.bible       || false,
        memory_verse: r.memoryVerse || false,
        offering:     parseFloat(r.offering) || 0,
        submitted_at: now,
        status:       'pending',
      }))

      const { error: vError } = await supabaseAdmin
        .from('attendance_records')
        .insert(vRows)

      if (vError) console.error('[attendance POST] visitor insert error:', vError)
    }

    // ── Totals ─────────────────────────────────────────────
    const all           = [...memberRecords, ...visitorRecords]
    const presentCount  = all.filter(r => r.attendance === 'present').length
    const totalOffering = all.reduce((s, r) => s + (parseFloat(r.offering) || 0), 0)

    // ── Upsert submission_batch ────────────────────────────
    const { data: batchData, error: batchError } = await supabaseAdmin
      .from('submission_batches')
      .upsert({
        church_id:      cls.churchId,
        session_id:     sessionId,
        class_id:       cls.classId,
        submitted_at:   now,
        submitted_by:   `class:${cls.classId}`,
        status:         'pending',
        record_count:   all.length,
        present_count:  presentCount,
        total_offering: totalOffering,
      }, {
        onConflict:       'session_id,class_id',
        ignoreDuplicates: false,
      })
      .select('id, status, church_id')
      .single()

    if (batchError) {
      console.error('[attendance POST] batch upsert error:', batchError)
    } else {
      console.log('[attendance POST] batch saved:', batchData)
    }

    return NextResponse.json({
      success:       true,
      status:        'pending',
      submittedAt:   now,
      presentCount,
      totalOffering,
      totalRecords:  all.length,
      message:       'Attendance submitted. Awaiting admin approval.',
    })

  } catch (err) {
    console.error('[attendance POST] unexpected:', err)
    return NextResponse.json({ error: `Server error: ${err.message}` }, { status: 500 })
  }
}

export async function GET(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const { data: records, error } = await supabaseAdmin
    .from('attendance_records')
    .select('*')
    .eq('session_id', sessionId)
    .eq('class_id',   cls.classId)
    .eq('church_id',  cls.churchId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: batch } = await supabaseAdmin
    .from('submission_batches')
    .select('status, reviewed_at, rejection_reason')
    .eq('session_id', sessionId)
    .eq('class_id',   cls.classId)
    .maybeSingle()

  return NextResponse.json({
    records:         records || [],
    batchStatus:     batch?.status           || null,
    reviewedAt:      batch?.reviewed_at      || null,
    rejectionReason: batch?.rejection_reason || null,
  })
}