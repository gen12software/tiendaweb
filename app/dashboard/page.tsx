import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanStatusCard from '@/components/dashboard/plan-status-card'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan_expires_at, plans(name)')
    .eq('id', user.id)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const planName = (profile?.plans as any)?.name ?? null
  const expiresAt = profile?.plan_expires_at ?? null
  const fullName = profile?.full_name || user.email

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Hola, {fullName} 👋
          </h1>
          <p className="mt-1 text-gray-500 text-sm">Este es tu panel de control.</p>
        </div>

        <PlanStatusCard planName={planName} expiresAt={expiresAt} />
      </div>
    </main>
  )
}
