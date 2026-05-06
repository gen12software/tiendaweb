import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanForm from '../PlanForm'
import { createPlanAction } from '../actions'

export default async function NewPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Nuevo plan</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <PlanForm action={createPlanAction} submitLabel="Crear plan" />
        </div>
      </div>
    </main>
  )
}
