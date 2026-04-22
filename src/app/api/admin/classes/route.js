import { NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/auth/getAdminUser'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateClassCode } from '@/lib/generateCode'

export async function GET() {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    // Get classes
    const { data: classes, error: classError } = await supabaseAdmin
      .from('classes')
      .select('id, name, group_name, code, is_active, created_at')
      .eq('church_id', admin.churchId)
      .eq('is_active', true)
      .order('name')

    if (classError) {
      console.error('Classes fetch error:', classError)
      return NextResponse.json({ error: classError.message }, { status: 500 })
    }

    if (!classes?.length) {
      return NextResponse.json({ classes: [] })
    }

    // Get member counts separately
    const { data: memberCounts, error: countError } = await supabaseAdmin
      .from('members')
      .select('class_id')
      .eq('church_id', admin.churchId)
      .eq('is_active', true)
      .in('class_id', classes.map(c => c.id))

    if (countError) {
      console.error('Member count error:', countError)
    }

    // Count members per class
    const countMap = {}
    for (const m of memberCounts || []) {
      countMap[m.class_id] = (countMap[m.class_id] || 0) + 1
    }

    const result = classes.map(c => ({
      ...c,
      member_count: countMap[c.id] || 0,
    }))

    return NextResponse.json({ classes: result })

  } catch (err) {
    console.error('GET /api/admin/classes error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

export async function POST(request) {
  const admin = await getAdminUser()
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, groupName } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Class name is required.' }, { status: 400 })
    }

    // Generate unique code — retry on collision
    let code = ''
    for (let i = 0; i < 10; i++) {
      const candidate = generateClassCode()
      const { data: existing } = await supabaseAdmin
        .from('classes')
        .select('id')
        .eq('code', candidate)
        .maybeSingle()
      if (!existing) { code = candidate; break }
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Failed to generate unique class code. Please try again.' },
        { status: 500 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('classes')
      .insert({
        church_id:  admin.churchId,
        name:       name.trim(),
        group_name: groupName?.trim() || null,
        code,
      })
      .select('id, name, group_name, code, is_active, created_at')
      .single()

    if (error) {
      console.error('Class insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ class: { ...data, member_count: 0 } })

  } catch (err) {
    console.error('POST /api/admin/classes error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}