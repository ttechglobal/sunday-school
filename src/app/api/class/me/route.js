import { NextResponse } from 'next/server'
import { verifyClassToken } from '@/lib/auth/classToken'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const cls = await verifyClassToken()

  if (!cls) {
    console.error('[class/me] unauthorized - no valid token')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('classes')
      .select('id, name, church_id, churches(id, name)')
      .eq('id', cls.classId)
      .single()

    if (error || !data) {
      console.error('[class/me] class not found:', error)
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
    }

    return NextResponse.json({
      classId:     data.id,
      className:   data.name,
      churchId:    data.church_id,
      churchName:  data.churches?.name || '',
      isAdminView: cls.isAdminView     || false,
      adminId:     cls.adminId         || null,
    })
  } catch (err) {
    console.error('[class/me] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}