'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  return profile?.role === 'admin' ? supabase : null
}

function parseContentFormData(formData: FormData) {
  return {
    title: (formData.get('title') as string).trim(),
    description: (formData.get('description') as string).trim() || null,
    video_url: (formData.get('video_url') as string).trim() || null,
    category: (formData.get('category') as string).trim() || null,
    duration_minutes: parseInt(formData.get('duration_minutes') as string, 10) || null,
    sort_order: parseInt(formData.get('sort_order') as string, 10) || 0,
    is_active: formData.get('is_active') === 'on',
  }
}

export async function createContentAction(_prevState: { error: string }, formData: FormData) {
  const supabase = await assertAdmin()
  if (!supabase) return { error: 'No autorizado' }

  const data = parseContentFormData(formData)
  if (!data.title) return { error: 'El título es requerido' }

  const { error } = await supabase.from('content').insert(data)
  if (error) return { error: 'Error al crear el contenido' }

  revalidatePath('/admin/contenido')
  revalidatePath('/admin/contenido')
  redirect('/admin/contenido')
}

export async function updateContentAction(_prevState: { error: string }, formData: FormData) {
  const supabase = await assertAdmin()
  if (!supabase) return { error: 'No autorizado' }

  const id = formData.get('id') as string
  const data = parseContentFormData(formData)
  if (!data.title) return { error: 'El título es requerido' }

  const { error } = await supabase.from('content').update(data).eq('id', id)
  if (error) return { error: 'Error al actualizar el contenido' }

  revalidatePath('/admin/contenido')
  revalidatePath('/admin/contenido')
  redirect('/admin/contenido')
}

export async function toggleContentAction(id: string, currentActive: boolean) {
  const supabase = await assertAdmin()
  if (!supabase) return { error: 'No autorizado' }

  const { error } = await supabase
    .from('content').update({ is_active: !currentActive }).eq('id', id)

  if (error) return { error: 'Error al actualizar el estado' }

  revalidatePath('/admin/contenido')
  revalidatePath('/admin/contenido')
  return { error: '' }
}
