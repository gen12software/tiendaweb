import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProfileForm from './ProfileForm'

export default async function PerfilPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan_expires_at, plans(name)')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planName = (profile?.plans as any)?.name ?? null
  const expiresAt = profile?.plan_expires_at ?? null
  const isActivePlan = expiresAt !== null && new Date(expiresAt) > new Date()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Mi perfil</h1>
        <ProfileForm
          fullName={profile?.full_name ?? ''}
          email={user.email ?? ''}
          planName={isActivePlan ? planName : null}
          expiresAt={isActivePlan ? expiresAt : null}
        />
      </div>
    </main>
  )
}
