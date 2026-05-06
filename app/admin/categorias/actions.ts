'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleCategoryAction(id: string, isActive: boolean) {
  const supabase = await createClient()
  await supabase.from('categories').update({ is_active: isActive }).eq('id', id)
  revalidatePath('/admin/categorias')
}

export async function saveCategoryAction(
  _prevState: { error: string; success: string },
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado', success: '' }

  const id = formData.get('id') as string | null
  const name = (formData.get('name') as string).trim()
  const image_url = (formData.get('image_url') as string).trim() || null
  const sort_order = parseInt(formData.get('sort_order') as string || '0', 10)

  if (!name) return { error: 'Nombre requerido', success: '' }

  // El slug se genera del nombre solo en creación
  const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

  if (id) {
    const { error } = await supabase.from('categories').update({ name, image_url, sort_order }).eq('id', id)
    if (error) return { error: error.message, success: '' }
  } else {
    const { error } = await supabase.from('categories').insert({ name, slug, image_url, sort_order })
    if (error) return { error: error.message, success: '' }
  }

  revalidatePath('/admin/categorias')
  revalidatePath('/productos')
  return { error: '', success: 'Categoría guardada' }
}
