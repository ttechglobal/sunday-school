import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const classId = searchParams.get('classId') || ''
  const search  = searchParams.get('search')  || ''
  const active  = searchParams.get('active')        // 'true' | 'false' | undefined

  let query = supabaseAdmin
    .from('members')
    .select(`
      id, first_name, last_name, full_name,
      gender, phone_number, address,
      is_active, joined_at, class_id,
      classes ( id, name, group_name )
    `)
    .eq('church_id', admin.churchId)
    .order('full_name', { nullsFirst: false })

  if (classId)          query = query.eq('class_id', classId)
  if (active === 'true')  query = query.eq('is_active', true)
  if (active === 'false') query = query.eq('is_active', false)

  const { data, error } = await query

  if (error) {
    console.error('[admin/members GET]', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Client-side search filter
  let members = data || []
  if (search.trim()) {
    const q = search.toLowerCase()
    members = members.filter(m => {
      const name = (m.full_name || `${m.first_name} ${m.last_name}`).toLowerCase()
      return name.includes(q) ||
        (m.phone_number || '').includes(q) ||
        (m.classes?.name || '').toLowerCase().includes(q)
    })
  }

  return NextResponse.json({ members })
}

export async function POST(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const {
      fullName, classId, gender,
      phoneNumber, address, joinedAt,
    } = body

    if (!fullName?.trim()) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 })
    }

    // Verify class belongs to this church (if provided)
    if (classId) {
      const { data: cls } = await supabaseAdmin
        .from('classes')
        .select('id')
        .eq('id',        classId)
        .eq('church_id', admin.churchId)
        .single()

      if (!cls) {
        return NextResponse.json({ error: 'Invalid class.' }, { status: 400 })
      }
    }

    const parts = fullName.trim().split(' ')

    const { data, error } = await supabaseAdmin
      .from('members')
      .insert({
        church_id:    admin.churchId,
        class_id:     classId    || null,
        full_name:    fullName.trim(),
        first_name:   parts[0]                   || '',
        last_name:    parts.slice(1).join(' ')   || '',
        gender:       gender                     || null,
        phone_number: phoneNumber?.trim()        || null,
        address:      address?.trim()            || null,
        joined_at:    joinedAt                   || null,
        is_active:    true,
      })
      .select(`
        id, first_name, last_name, full_name,
        gender, phone_number, address,
        is_active, joined_at, class_id,
        classes ( id, name, group_name )
      `)
      .single()

    if (error) {
      console.error('[admin/members POST]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data })

  } catch (err) {
    console.error('[admin/members POST] unexpected:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}