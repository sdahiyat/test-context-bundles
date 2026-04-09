import { redirect } from 'next/navigation'
import PhotoLogWrapper from '@/components/photo/PhotoLogWrapper'

async function getSession() {
  try {
    const { createServerComponentClient } = await import('@supabase/auth-helpers-nextjs')
    const { cookies } = await import('next/headers')
    const supabase = createServerComponentClient({ cookies })
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch {
    return null
  }
}

export default async function PhotoLogPage() {
  const session = await getSession()

  if (!session) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <PhotoLogWrapper userId={session.user.id} />
    </div>
  )
}
