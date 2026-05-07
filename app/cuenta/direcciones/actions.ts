'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getAuthenticatedUserId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function addAddressAction(data: {
  label: string
  street: string
  city: string
  state: string
  postal_code: string
  country: string
  is_default: boolean
}) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('addresses')
    .insert({ user_id: userId, label: data.label, address: {
      street: data.street,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
    }, is_default: data.is_default })

  if (error) return { error: 'Error al guardar la dirección' }

  revalidatePath('/cuenta/direcciones')
  return { error: '' }
}

export async function setDefaultAddressAction(id: string) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { error: 'No autorizado' }

  const supabase = await createClient()

  // Verificar ownership antes de operar
  const { data: addr } = await supabase
    .from('addresses')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (!addr) return { error: 'Dirección no encontrada' }

  // Ambas operaciones en secuencia — la RLS garantiza que solo afectan al usuario
  const { error: e1 } = await supabase
    .from('addresses')
    .update({ is_default: false })
    .eq('user_id', userId)

  if (e1) return { error: 'Error al actualizar' }

  const { error: e2 } = await supabase
    .from('addresses')
    .update({ is_default: true })
    .eq('id', id)
    .eq('user_id', userId)

  if (e2) return { error: 'Error al establecer predeterminada' }

  revalidatePath('/cuenta/direcciones')
  return { error: '' }
}

export async function removeAddressAction(id: string) {
  const userId = await getAuthenticatedUserId()
  if (!userId) return { error: 'No autorizado' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('addresses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return { error: 'Error al eliminar la dirección' }

  revalidatePath('/cuenta/direcciones')
  return { error: '' }
}
