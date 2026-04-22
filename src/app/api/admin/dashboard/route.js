import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

function getTodayDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Africa/Lagos',
  }).format(new Date())
}

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today = getTodayDate()

  const { data: session } = await supabaseAdmin
    .from('sessions')
    .select('id, session_date, is_open')
    .eq('church_id', admin.churchId)
    .eq('session_date', today)
    .maybeSingle()

  const { data: allClasses } = await supabaseAdmin
    .from('classes')
    .select('id, name, group_name')
    .eq('church_id', admin.churchId)
    .eq('is_active', true)
    .order('name')

  if (!session || !allClasses?.length) {
    return NextResponse.json({
      session:       session || null,
      classes:       [],
      totalPresent:  0,
      totalOffering: 0,
    })
  }

  const { data: attendance } = await supabaseAdmin
    .from('attendance_records')
    .select('class_id, attendance, offering')
    .eq('session_id', session.id)
    .eq('church_id', admin.churchId)

  const attByClass = {}
  for (const rec of attendance || []) {
    if (!attByClass[rec.class_id]) {
      attByClass[rec.class_id] = { present: 0, offering: 0 }
    }
    if (rec.attendance === 'present') attByClass[rec.class_id].present++
    attByClass[rec.class_id].offering += parseFloat(rec.offering) || 0
  }

  const classes = allClasses.map(cls => ({
    ...cls,
    status:   attByClass[cls.id] ? 'submitted' : 'not_submitted',
    present:  attByClass[cls.id]?.present  ?? null,
    offering: attByClass[cls.id]?.offering ?? null,
  }))

  return NextResponse.json({
    session,
    classes,
    totalPresent:  classes.reduce((s, c) => s + (c.present  || 0), 0),
    totalOffering: classes.reduce((s, c) => s + (c.offering || 0), 0),
  })
}