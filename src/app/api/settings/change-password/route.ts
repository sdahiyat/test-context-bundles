import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { newPassword } = body

    // NOTE: Supabase's client SDK updateUser does not re-verify the current password.
    // This is a known limitation of the Supabase Auth client API for MVP purposes.
    // For production, consider using a server-side verification step or prompting
    // re-authentication before allowing password changes.

    if (!newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'New password is required' }, { status: 400 })
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) {
      console.error('Password update error:', error)
      return NextResponse.json({ error: error.message ?? 'Failed to update password' }, { status: 500 })
    }

    return NextResponse.json({ message: 'Password updated successfully' }, { status: 200 })
  } catch (err) {
    console.error('Change password route error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
