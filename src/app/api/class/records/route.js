import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const month   = parseInt(searchParams.get('month') || '0')
  const year    = parseInt(searchParams.get('year')  || '0')
  const batchId = searchParams.get('batchId')

  // ── Single batch detail ───────────────────────────────────
  if (batchId) {
    const { data: batch, error: batchErr } = await supabaseAdmin
      .from('submission_batches')
      .select(`
        id, status, submitted_at, present_count,
        record_count, total_offering, rejection_reason, reviewed_at,
        sessions ( session_date )
      `)
      .eq('id',         batchId)
      .eq('class_id',   cls.classId)
      .eq('church_id',  cls.churchId)
      .single()

    if (batchErr || !batch) {
      return NextResponse.json({ error: 'Record not found.' }, { status: 404 })
    }

    const { data: records } = await supabaseAdmin
      .from('attendance_records')
      .select('member_id, visitor_name, member_type, attendance, on_time, bible, memory_verse, offering, members(first_name, last_name)')
      .eq('session_id', batch.sessions?.id || batchId)
      .eq('class_id',   cls.classId)
      .eq('church_id',  cls.churchId)

    return NextResponse.json({ batch, records: records || [] })
  }

  // ── List all batches ──────────────────────────────────────
  let query = supabaseAdmin
    .from('submission_batches')
    .select(`
      id, status, submitted_at, present_count,
      record_count, total_offering, rejection_reason,
      sessions ( id, session_date )
    `)
    .eq('class_id',  cls.classId)
    .eq('church_id', cls.churchId)
    .order('submitted_at', { ascending: false })

  const { data: batches, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filter by month/year in JS (simpler than SQL date functions)
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