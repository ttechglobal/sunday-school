import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month   = parseInt(searchParams.get('month')   || '0')
  const year    = parseInt(searchParams.get('year')    || '0')
  const status  = searchParams.get('status') || 'all'
  const classId = searchParams.get('classId') || ''
  const batchId = searchParams.get('batchId') || ''

  // ── Single batch detail (for approval modal) ──────────────
  if (batchId) {
    console.log('[admin/records] fetching batch:', batchId)

    const { data: batch, error: bErr } = await supabaseAdmin
      .from('submission_batches')
      .select(`
        id, status, submitted_at, present_count, record_count,
        total_offering, rejection_reason, reviewed_at,
        session_id, class_id,
        sessions ( id, session_date ),
        classes  ( id, name, group_name )
      `)
      .eq('id',        batchId)
      .eq('church_id', admin.churchId)
      .single()

    if (bErr || !batch) {
      console.error('[admin/records] batch not found:', bErr)
      return NextResponse.json({ error: 'Not found.' }, { status: 404 })
    }

    console.log('[admin/records] batch found:', {
      sessionId: batch.session_id,
      classId:   batch.class_id,
      churchId:  admin.churchId,
    })

    // Fetch attendance records using session_id + class_id from the batch
    const { data: records, error: rErr } = await supabaseAdmin
      .from('attendance_records')
      .select(`
        id, member_id, visitor_name, member_type,
        attendance, on_time, bible, memory_verse, offering, status,
        members ( id, first_name, last_name, full_name, gender, phone_number )
      `)
      .eq('session_id', batch.session_id)
      .eq('class_id',   batch.class_id)
      .eq('church_id',  admin.churchId)
      .order('attendance', { ascending: false }) // present first

    if (rErr) {
      console.error('[admin/records] records fetch error:', rErr)
      return NextResponse.json({ error: rErr.message }, { status: 500 })
    }

    console.log('[admin/records] found', records?.length || 0, 'attendance records')

    return NextResponse.json({ batch, records: records || [] })
  }

  // ── List all batches ──────────────────────────────────────
  let query = supabaseAdmin
    .from('submission_batches')
    .select(`
      id, status, submitted_at, present_count,
      record_count, total_offering, rejection_reason,
      session_id, class_id,
      sessions ( id, session_date ),
      classes  ( id, name, group_name )
    `)
    .eq('church_id', admin.churchId)
    .order('submitted_at', { ascending: false })

  if (status !== 'all') query = query.eq('status', status)
  if (classId)          query = query.eq('class_id', classId)

  const { data: batches, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let filtered = batches || []
  if (month > 0 || year > 0) {
    filtered = filtered.filter(b => {
      const d = new Date(b.sessions?.session_date || b.submitted_at)
      if (month > 0 && d.getMonth() + 1 !== month) return false
      if (year  > 0 && d.getFullYear()  !== year)  return false
      return true
    })
  }

  return NextResponse.json({ batches: filtered })
}