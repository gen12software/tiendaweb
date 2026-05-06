import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import PlanForm from '../PlanForm'
import { updatePlanAction } from '../actions'

export default async function EditPlanPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/cuenta/ordenes')

  const { id } = await params
  const { data: plan } = await supabase
    .from('plans')
    .select('id, name, description, price, duration_days, features, is_active, is_featured')
    .eq('id', id)
    .single()

  if (!plan) notFound()

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Editar plan</h1>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <PlanForm plan={plan} action={updatePlanAction} submitLabel="Guardar cambios" />
        </div>
      </div>
    </main>
  )
}
