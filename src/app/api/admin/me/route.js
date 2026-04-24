import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { data: church, error } = await supabaseAdmin
      .from('churches')
      .select('id, name')
      .eq('id', admin.churchId)
      .single()

    if (error) {
      console.error('[admin/me] church fetch error:', error.message)
    }

    console.log('[admin/me] church:', church, 'admin:', admin.fullName)

    return NextResponse.json({
      adminId:    admin.userId,
      adminName:  admin.fullName || admin.email || 'Admin',
      churchId:   admin.churchId,
      churchName: church?.name  || '',
    })
  } catch (err) {
    console.error('[admin/me] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}