'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function parsePlanFormData(formData: FormData) {
  return {
    name: (formData.get('name') as string).trim(),
    description: (formData.get('description') as string).trim() || null,
    price: parseFloat(formData.get('price') as string),
    duration_days: parseInt(formData.get('duration_days') as string, 10),
    features: (formData.get('features') as string)
      .split('\n')
      .map((f) => f.trim())
      .filter(Boolean),
    is_active: formData.get('is_active') === 'on',
    is_featured: formData.get('is_featured') === 'on',
  }
}

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  return profile?.role === 'admin' ? supabase : null
}

export async function createPlanAction(_prevState: { error: string }, formData: FormData) {
  const supabase = await assertAdmin()
  if (!supabase) return { error: 'No autorizado' }

  const data = parsePlanFormData(formData)

  if (!data.name || isNaN(data.price) || isNaN(data.duration_days)) {
    return { error: 'Completá todos los campos requeridos' }
  }

  const { error } = await supabase.from('plans').insert(data)
  if (error) return { error: 'Error al crear el plan' }

  revalidatePath('/planes')
  revalidatePath('/admin/planes')
  redirect('/admin/planes')
}

export async function updatePlanAction(_prevState: { error: string }, formData: FormData) {
  const supabase = await assertAdmin()
  if (!supabase) return { error: 'No autorizado' }

  const id = formData.get('id') as string
  const data = parsePlanFormData(formData)

  if (!data.name || isNaN(data.price) || isNaN(data.duration_days)) {
    return { error: 'Completá todos los campos requeridos' }
  }

  const { error } = await supabase.from('plans').update(data).eq('id', id)
  if (error) return { error: 'Error al actualizar el plan' }

  revalidatePath('/planes')
  revalidatePath('/admin/planes')
  redirect('/admin/planes')
}

export async function togglePlanAction(id: string, currentActive: boolean) {
  const supabase = await assertAdmin()
  if (!supabase) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('plans')
    .update({ is_active: !currentActive })
    .eq('id', id)

  if (error) return { error: 'Error al actualizar el estado' }

  revalidatePath('/planes')
  revalidatePath('/admin/planes')
  return { error: '' }
}
