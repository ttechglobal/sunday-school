import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

// GET — fetch contacted members for a session
export async function GET(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const sessionId = searchParams.get('sessionId')
  if (!sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('followup_contacts')
    .select('member_id, contacted_at')
    .eq('church_id',  cls.churchId)
    .eq('session_id', sessionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ contacts: data || [] })
}

// POST — mark member as contacted
export async function POST(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { memberId, sessionId } = await request.json()
  if (!memberId || !sessionId) {
    return NextResponse.json({ error: 'Missing memberId or sessionId' }, { status: 400 })
  }

  const { data, error } = await supabaseAdmin
    .from('followup_contacts')
    .upsert({
      church_id:    cls.churchId,
      member_id:    memberId,
      session_id:   sessionId,
      contacted_at: new Date().toISOString(),
      contacted_by: `class:${cls.classId}`,
    }, {
      onConflict:       'member_id,session_id',
      ignoreDuplicates: false,
    })
    .select('member_id, contacted_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ contact: data })
}

// DELETE — unmark contacted
export async function DELETE(request) {
  const cls = await verifyClassToken()
  if (!cls) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { memberId, sessionId } = await request.json()

  const { error } = await supabaseAdmin
    .from('followup_contacts')
    .delete()
    .eq('church_id',  cls.churchId)
    .eq('member_id',  memberId)
    .eq('session_id', sessionId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}