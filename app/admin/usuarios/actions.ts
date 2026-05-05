'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const supabaseAdmin = createAdminClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin'
}

export async function assignPlanManuallyAction(
  _prevState: { error: string; success: string },
  formData: FormData
) {
  const isAdmin = await assertAdmin()
  if (!isAdmin) return { error: 'No autorizado', success: '' }

  const userId = formData.get('userId') as string
  const planId = formData.get('planId') as string

  if (!userId || !planId) return { error: 'Datos incompletos', success: '' }

  const { data: plan } = await supabaseAdmin
    .from('plans')
    .select('duration_days, price, name')
    .eq('id', planId)
    .single()

  if (!plan) return { error: 'Plan no encontrado', success: '' }

  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + plan.duration_days)

  const { error: paymentError } = await supabaseAdmin.from('payments').insert({
    user_id: userId,
    plan_id: planId,
    amount: plan.price,
    status: 'manual',
    mp_payment_id: null,
    mp_preference_id: null,
  })

  if (paymentError) return { error: 'Error al registrar el pago', success: '' }

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ plan_id: planId, plan_expires_at: expiresAt.toISOString() })
    .eq('id', userId)

  if (profileError) return { error: 'Error al actualizar el perfil', success: '' }

  revalidatePath(`/admin/usuarios/${userId}`)
  revalidatePath('/admin/usuarios')

  return { error: '', success: `Plan "${plan.name}" activado correctamente hasta el ${expiresAt.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}` }
}
