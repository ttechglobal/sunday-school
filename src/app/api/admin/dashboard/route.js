import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

function getTodayDate() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Africa/Lagos' }).format(new Date())
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  console.log('[dashboard] admin:', { userId: admin.userId, churchId: admin.churchId })

  const today = getTodayDate()

  // Church name
  const { data: church } = await supabaseAdmin
    .from('churches')
    .select('id, name')
    .eq('id', admin.churchId)
    .single()

  console.log('[dashboard] church:', church)

  // Today's session
  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, session_date, is_open')
    .eq('church_id',    admin.churchId)
    .eq('session_date', today)
    .maybeSingle()

  // All active classes
  const { data: classes } = await supabaseAdmin
    .from('classes')
    .select('id')
    .eq('church_id', admin.churchId)
    .eq('is_active',  true)

  const totalClasses = classes?.length || 0

  // Pending submissions — ALL for this church, not just today
  const { data: pendingBatches, error: pendingError } = await supabaseAdmin
    .from('submission_batches')
    .select(`
      id,
      status,
      submitted_at,
      record_count,
      present_count,
      total_offering,
      session_id,
      class_id,
      sessions ( id, session_date ),
      classes  ( id, name, group_name )
    `)
    .eq('church_id', admin.churchId)
    .eq('status',    'pending')
    .order('submitted_at', { ascending: false })

  console.log('[dashboard] pending batches:', pendingBatches?.length, pendingError)

  // Approved submissions for today only (for live stats)
  let approvedBatches = []
  if (session?.id) {
    const { data } = await supabaseAdmin
      .from('submission_batches')
      .select('present_count, record_count, total_offering, class_id')
      .eq('church_id', admin.churchId)
      .eq('status',    'approved')
      .eq('session_id', session.id)

    approvedBatches = data || []
  }

  const totalPresent  = approvedBatches.reduce((s, b) => s + (b.present_count  || 0), 0)
  const totalRecords  = approvedBatches.reduce((s, b) => s + (b.record_count   || 0), 0)
  const totalOffering = approvedBatches.reduce((s, b) => s + (b.total_offering || 0), 0)
  const approvedCount = approvedBatches.length

  // Past Sundays (approved, last 8 unique dates)
  const { data: pastApproved } = await supabaseAdmin
    .from('submission_batches')
    .select(`
      present_count, record_count, total_offering, class_id, session_id,
      sessions ( session_date )
    `)
    .eq('church_id', admin.churchId)
    .eq('status',    'approved')
    .order('submitted_at', { ascending: false })
    .limit(50)

  const sundayMap = {}
  for (const b of pastApproved || []) {
    const date = b.sessions?.session_date || 'unknown'
    if (!sundayMap[date]) {
      sundayMap[date] = { date, present: 0, offering: 0, classes: 0 }
    }
    sundayMap[date].present  += b.present_count  || 0
    sundayMap[date].offering += b.total_offering || 0
    sundayMap[date].classes  += 1
  }
  const pastSundayList = Object.values(sundayMap)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 8)

  return NextResponse.json({
    church,
    churchName: church?.name || '',
    adminName:  admin.fullName || '',
    session,
    today,
    totalClasses,
    pending:    pendingBatches  || [],
    approved: {
      count:         approvedCount,
      totalPresent,
      totalAbsent:   totalRecords - totalPresent,
      totalOffering,
    },
    pastSundays: pastSundayList,
  })
}