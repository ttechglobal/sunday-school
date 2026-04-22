import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get('classId')

    let query = supabaseAdmin
      .from('members')
      .select(`
        id,
        first_name,
        last_name,
        gender,
        phone,
        is_active,
        joined_at,
        class_id,
        classes ( id, name )
      `)
      .eq('church_id', admin.churchId)
      .order('first_name')

    if (classId) {
      query = query.eq('class_id', classId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Members fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ members: data || [] })

  } catch (err) {
    console.error('GET /api/admin/members error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function POST(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { firstName, lastName, classId, gender, phone } = body

    if (!firstName?.trim()) {
      return NextResponse.json({ error: 'First name is required.' }, { status: 400 })
    }
    if (!lastName?.trim()) {
      return NextResponse.json({ error: 'Last name is required.' }, { status: 400 })
    }

    // If classId given, verify it belongs to this church
    if (classId) {
      const { data: cls, error: clsError } = await supabaseAdmin
        .from('classes')
        .select('id')
        .eq('id', classId)
        .eq('church_id', admin.churchId)
        .single()

      if (clsError || !cls) {
        return NextResponse.json({ error: 'Invalid class.' }, { status: 400 })
      }
    }

    const { data, error } = await supabaseAdmin
      .from('members')
      .insert({
        church_id:  admin.churchId,
        class_id:   classId || null,
        first_name: firstName.trim(),
        last_name:  lastName.trim(),
        gender:     gender        || null,
        phone:      phone?.trim() || null,
        is_active:  true,
      })
      .select(`
        id, first_name, last_name, gender, phone,
        is_active, joined_at, class_id,
        classes ( id, name )
      `)
      .single()

    if (error) {
      console.error('Member insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data })

  } catch (err) {
    console.error('POST /api/admin/members error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}