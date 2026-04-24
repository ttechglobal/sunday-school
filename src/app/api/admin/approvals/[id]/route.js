import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id }                      = await params
  const { action, rejectionReason } = await request.json()

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'Invalid action.' }, { status: 400 })
  }

  // Fetch batch
  const { data: batch, error: findError } = await supabaseAdmin
    .from('submission_batches')
    .select('id, church_id, session_id, class_id, classes(name)')
    .eq('id',        id)
    .eq('church_id', admin.churchId)
    .single()

  if (findError || !batch) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 })
  }

  const now       = new Date().toISOString()
  const newStatus = action === 'approve' ? 'approved' : 'rejected'

  // Update batch
  const { error: batchError } = await supabaseAdmin
    .from('submission_batches')
    .update({
      status:           newStatus,
      reviewed_at:      now,
      reviewed_by:      admin.userId,
      rejection_reason: action === 'reject' ? (rejectionReason || null) : null,
    })
    .eq('id', id)

  if (batchError) {
    return NextResponse.json({ error: batchError.message }, { status: 500 })
  }

  // Update attendance records
  await supabaseAdmin
    .from('attendance_records')
    .update({ status: newStatus })
    .eq('session_id', batch.session_id)
    .eq('class_id',   batch.class_id)
    .eq('church_id',  admin.churchId)

  // Write audit log
  if (action === 'approve') {
    await supabaseAdmin
      .from('admin_audit_log')
      .insert({
        action:       'approved_attendance',
        class_id:     batch.class_id,
        session_id:   batch.session_id,
        performed_by: admin.userId,
        payload: {
          batch_id:   id,
          class_name: batch.classes?.name,
          approved_at: now,
        },
      })
  }

  return NextResponse.json({
    success:   true,
    status:    newStatus,
    className: batch.classes?.name,
  })
}