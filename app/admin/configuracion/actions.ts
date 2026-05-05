'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function updateSiteConfigAction(
  _prevState: { error: string; success: string },
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autorizado', success: '' }

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return { error: 'No autorizado', success: '' }

  const keys = ['site_name', 'logo_url', 'primary_color', 'hero_title', 'hero_description']
  const upserts = keys.map((key) => ({
    key,
    value: (formData.get(key) as string ?? '').trim(),
  }))

  const { error } = await supabase
    .from('site_config')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return { error: 'Error al guardar la configuración', success: '' }

  revalidatePath('/', 'layout')
  return { error: '', success: 'Configuración guardada correctamente' }
}
