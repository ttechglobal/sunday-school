import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function PATCH(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body   = await request.json()

    // Verify member belongs to this church
    const { data: existing, error: findError } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('id', id)
      .eq('church_id', admin.churchId)
      .single()

    if (findError || !existing) {
      return NextResponse.json({ error: 'Member not found.' }, { status: 404 })
    }

    const updates = {}
    if (body.firstName !== undefined) updates.first_name = body.firstName.trim()
    if (body.lastName  !== undefined) updates.last_name  = body.lastName.trim()
    if (body.classId   !== undefined) updates.class_id   = body.classId || null
    if (body.gender    !== undefined) updates.gender      = body.gender  || null
    if (body.phone     !== undefined) updates.phone       = body.phone?.trim() || null
    if (body.isActive  !== undefined) updates.is_active   = body.isActive

    const { data, error } = await supabaseAdmin
      .from('members')
      .update(updates)
      .eq('id', id)
      .eq('church_id', admin.churchId)
      .select()
      .single()

    if (error) {
      console.error('Member update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ member: data })

  } catch (err) {
    console.error('PATCH /api/admin/members/[id] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params

    // Soft delete — never hard delete members
    const { error } = await supabaseAdmin
      .from('members')
      .update({ is_active: false })
      .eq('id', id)
      .eq('church_id', admin.churchId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('DELETE /api/admin/members/[id] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}