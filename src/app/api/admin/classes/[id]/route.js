import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateClassCode } from '@/lib/generateCode'

export async function GET(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params

  const { data: cls, error } = await supabaseAdmin
    .from('classes')
    .select('id, name, group_name, code, is_active')
    .eq('id', id)
    .eq('church_id', admin.churchId)
    .single()

  if (error || !cls) {
    return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
  }

  return NextResponse.json({ class: cls })
}

export async function PATCH(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params
    const body   = await request.json()

    // Verify this class belongs to this church
    const { data: cls, error: findError } = await supabaseAdmin
      .from('classes')
      .select('id')
      .eq('id', id)
      .eq('church_id', admin.churchId)
      .single()

    if (findError || !cls) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 })
    }

    const updates = {}
    if (body.name      !== undefined) updates.name       = body.name.trim()
    if (body.groupName !== undefined) updates.group_name = body.groupName?.trim() || null
    if (body.isActive  !== undefined) updates.is_active  = body.isActive

    // Regenerate code if requested
    if (body.regenerateCode) {
      let newCode = ''
      for (let i = 0; i < 10; i++) {
        const candidate = generateClassCode()
        const { data: existing } = await supabaseAdmin
          .from('classes')
          .select('id')
          .eq('code', candidate)
          .maybeSingle()
        if (!existing) { newCode = candidate; break }
      }
      if (!newCode) {
        return NextResponse.json(
          { error: 'Failed to generate new code.' },
          { status: 500 }
        )
      }
      updates.code = newCode
    }

    const { data, error } = await supabaseAdmin
      .from('classes')
      .update(updates)
      .eq('id', id)
      .eq('church_id', admin.churchId)
      .select('id, name, group_name, code, is_active')
      .single()

    if (error) {
      console.error('Class update error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ class: data })

  } catch (err) {
    console.error('PATCH /api/admin/classes/[id] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('classes')
      .update({ is_active: false })
      .eq('id', id)
      .eq('church_id', admin.churchId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('DELETE /api/admin/classes/[id] error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}