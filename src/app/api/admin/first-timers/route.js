import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || ''

  const { data, error } = await supabaseAdmin
    .from('members')
    .select(`
      id, full_name, first_name, last_name, gender,
      phone_number, is_active, created_at, class_id,
      classes ( id, name, group_name )
    `)
    .eq('church_id',   admin.churchId)
    .eq('member_type', 'first_timer')
    .eq('is_active',   true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let members = data || []
  if (search.trim()) {
    const q = search.toLowerCase()
    members = members.filter(m => {
      const name = (m.full_name || `${m.first_name} ${m.last_name}`).toLowerCase()
      return name.includes(q) || (m.phone_number || '').includes(q)
    })
  }

  // Get attendance counts for each first timer
  const ids = members.map(m => m.id)
  let countMap = {}

  if (ids.length > 0) {
    const { data: attendanceCounts } = await supabaseAdmin
      .from('attendance_records')
      .select('member_id')
      .in('member_id', ids)
      .eq('attendance', 'present')

    for (const r of attendanceCounts || []) {
      countMap[r.member_id] = (countMap[r.member_id] || 0) + 1
    }
  }

  const result = members.map(m => ({
    ...m,
    attendance_count: countMap[m.id] || 0,
    name: m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim(),
  }))

  return NextResponse.json({ firstTimers: result })
}