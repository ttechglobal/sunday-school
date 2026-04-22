import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabaseAdmin
    .from('followup_log')
    .select('id, session_id, member_id, reached, reached_at, sessions(session_date), members(first_name, last_name)')
    .eq('class_id',  cls.classId)
    .eq('church_id', cls.churchId)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ followups: data })
}

export async function PATCH(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { sessionId, memberId, reached } = await request.json()

    const { error } = await supabaseAdmin
      .from('followup_log')
      .upsert({
        church_id:  cls.churchId,
        class_id:   cls.classId,
        session_id: sessionId,
        member_id:  memberId,
        reached,
        reached_at: reached ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'session_id,class_id,member_id' })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}