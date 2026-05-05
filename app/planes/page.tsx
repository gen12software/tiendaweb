import { createClient } from '@/lib/supabase/server'
import PlanCard from '@/components/planes/plan-card'

export const revalidate = 60

export default async function PlanesPage() {
  const supabase = await createClient()

  const [{ data: plans }, { data: { user } }] = await Promise.all([
    supabase
      .from('plans')
      .select('id, name, price, duration_days, features, is_featured')
      .eq('is_active', true)
      .order('price', { ascending: true }),
    supabase.auth.getUser(),
  ])

  let userPlanId: string | null = null
  let userPlanExpiresAt: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan_id, plan_expires_at')
      .eq('id', user.id)
      .single()

    userPlanId = profile?.plan_id ?? null
    userPlanExpiresAt = profile?.plan_expires_at ?? null
  }

  const now = new Date()
  const isPlanActive =
    userPlanId !== null &&
    (userPlanExpiresAt === null || new Date(userPlanExpiresAt) > now)

  return (
    <main className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">Elegí tu plan</h1>
          <p className="mt-3 text-lg text-gray-600">
            Accedé a todo el contenido con el plan que más te convenga.
          </p>
        </div>

        {!plans || plans.length === 0 ? (
          <p className="text-center text-gray-500">No hay planes disponibles por el momento.</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrentPlan={isPlanActive && userPlanId === plan.id}
                isActive={isPlanActive && userPlanId === plan.id}
                expiresAt={userPlanId === plan.id ? userPlanExpiresAt : null}
                hasSession={!!user}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
