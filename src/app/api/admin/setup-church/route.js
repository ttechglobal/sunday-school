import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

// POST — create church, return its ID
export async function POST(request) {
  try {
    const { churchName, churchAddress } = await request.json()

    if (!churchName?.trim()) {
      return NextResponse.json({ error: 'Church name is required.' }, { status: 400 })
    }

    const { data, error } = await supabaseAdmin
      .from('churches')
      .insert({
        name:    churchName.trim(),
        address: churchAddress?.trim() || null,
      })
      .select('id, name')
      .single()

    if (error) {
      console.error('Church insert error:', error)
      return NextResponse.json(
        { error: 'Failed to create church record.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ churchId: data.id, churchName: data.name })

  } catch (err) {
    console.error('Setup church error:', err)
    return NextResponse.json({ error: 'Server error.' }, { status: 500 })
  }
}

// DELETE — rollback if signup fails after church was created
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url)
    const churchId = searchParams.get('churchId')

    if (!churchId) {
      return NextResponse.json({ error: 'Missing churchId' }, { status: 400 })
    }

    await supabaseAdmin.from('churches').delete().eq('id', churchId)
    return NextResponse.json({ success: true })

  } catch {
    return NextResponse.json({ error: 'Cleanup failed.' }, { status: 500 })
  }
}