import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(request) {
  try {
    const body = await request.json()
    const { churchName, churchAddress, adminName, email, password } = body

    // ── Validate inputs ───────────────────────────────────────
    if (!churchName?.trim()) {
      return NextResponse.json({ error: 'Church name is required.' }, { status: 400 })
    }
    if (!adminName?.trim()) {
      return NextResponse.json({ error: 'Your name is required.' }, { status: 400 })
    }
    if (!email?.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()

    // ── Step 1: Check if email already in use ─────────────────
    const { data: existingAdmin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'An account with this email already exists.' },
        { status: 409 }
      )
    }

    // ── Step 2: Create auth user via service role ─────────────
    const { data: authData, error: authError } =
      await supabaseAdmin.auth.admin.createUser({
        email:            cleanEmail,
        password,
        email_confirm:    true,   // auto-confirm so they can log in immediately
        user_metadata:    { name: adminName.trim() },
      })

    if (authError || !authData?.user) {
      console.error('Auth createUser error:', authError)

      // Handle duplicate email from Supabase Auth side
      if (authError?.message?.toLowerCase().includes('already been registered') ||
          authError?.message?.toLowerCase().includes('already exists')) {
        return NextResponse.json(
          { error: 'An account with this email already exists.' },
          { status: 409 }
        )
      }

      return NextResponse.json(
        { error: authError?.message || 'Failed to create user account.' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // ── Step 3: Create church record ──────────────────────────
    const { data: church, error: churchError } = await supabaseAdmin
      .from('churches')
      .insert({
        name:    churchName.trim(),
        address: churchAddress?.trim() || null,
      })
      .select('id, name')
      .single()

    if (churchError || !church) {
      console.error('Church insert error:', churchError)
      // Clean up auth user so they can retry
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(e =>
        console.error('Cleanup deleteUser failed:', e)
      )
      return NextResponse.json(
        { error: 'Failed to create church record. Please try again.' },
        { status: 500 }
      )
    }

    // ── Step 4: Create admin record ───────────────────────────
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .insert({
        id:        userId,
        church_id: church.id,
        name:      adminName.trim(),
        email:     cleanEmail,
        role:      'admin',
        is_active: true,
      })

    if (adminError) {
      console.error('Admin insert error:', adminError)
      // Clean up both
      await supabaseAdmin.from('churches').delete().eq('id', church.id).catch(() => {})
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {})
      return NextResponse.json(
        { error: 'Failed to save admin details. Please try again.' },
        { status: 500 }
      )
    }

    // ── Success ───────────────────────────────────────────────
    return NextResponse.json({
      success:    true,
      churchId:   church.id,
      churchName: church.name,
    })

  } catch (err) {
    console.error('Register unexpected error:', err)
    return NextResponse.json(
      { error: 'Unexpected error. Please try again.' },
      { status: 500 }
    )
  }
}