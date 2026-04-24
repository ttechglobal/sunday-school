import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id }  = await params
    const body    = await request.json()

    // Verify member belongs to this church
    const { data: existing } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('id',        id)
      .eq('church_id', admin.churchId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
    }

    const updates = {}

    if (body.fullName !== undefined) {
      const parts = body.fullName.trim().split(' ')
      updates.full_name  = body.fullName.trim()
      updates.first_name = parts[0]                   || ''
      updates.last_name  = parts.slice(1).join(' ')   || ''
    }
    if (body.classId     !== undefined) updates.class_id     = body.classId     || null
    if (body.gender      !== undefined) updates.gender       = body.gender      || null
    if (body.phoneNumber !== undefined) updates.phone_number = body.phoneNumber || null
    if (body.address     !== undefined) updates.address      = body.address     || null
    if (body.joinedAt    !== undefined) updates.joined_at    = body.joinedAt    || null
    if (body.isActive    !== undefined) updates.is_active    = body.isActive

    const { data, error } = await supabaseAdmin
      .from('members')
      .update(updates)
      .eq('id',        id)
      .eq('church_id', admin.churchId)
      .select(`
        id, first_name, last_name, full_name,
        gender, phone_number, address,
        is_active, joined_at, class_id,
        classes ( id, name, group_name )
      `)
      .single()

    if (error) {
      console.error('[admin/members PATCH]', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data })

  } catch (err) {
    console.error('[admin/members PATCH] unexpected:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params

    // Soft delete only — never hard delete
    const { error } = await supabaseAdmin
      .from('members')
      .update({ is_active: false })
      .eq('id',        id)
      .eq('church_id', admin.churchId)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('[admin/members DELETE]', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}