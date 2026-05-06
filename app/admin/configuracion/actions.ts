'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

const ALL_KEYS = [
  'site_name', 'logo_url', 'primary_color', 'color_secondary', 'color_accent',
  'color_background', 'color_surface', 'font_heading', 'font_body', 'favicon_url',
  'hero_title', 'hero_description', 'hero_image_url', 'hero_cta_text', 'hero_cta_url',
  'social_instagram', 'social_facebook', 'social_tiktok',
  'currency_symbol', 'currency_locale', 'free_shipping_threshold',
  'home_show_featured', 'home_show_categories', 'home_show_cta',
  'home_cta_title', 'home_cta_subtitle', 'home_cta_link',
  'contact_email', 'whatsapp_number', 'whatsapp_message', 'contact_schedule',
  'slogan', 'terms_url', 'privacy_url',
  'about_title', 'about_subtitle', 'about_description', 'about_image_url',
  'about_value1_icon', 'about_value1_title', 'about_value1_text',
  'about_value2_icon', 'about_value2_title', 'about_value2_text',
  'about_value3_icon', 'about_value3_title', 'about_value3_text',
  'header_bg_color', 'header_text_color', 'announcement_bg_color', 'announcement_text_color',
  'announcement_1', 'announcement_2', 'announcement_3', 'announcement_4', 'announcement_5',
  'announcement_6', 'announcement_7', 'announcement_8', 'announcement_9', 'announcement_10',
]

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

  const upserts = ALL_KEYS
    .filter((key) => formData.has(key))
    .map((key) => ({ key, value: (formData.get(key) as string ?? '').trim() }))

  const { error } = await supabase
    .from('site_config')
    .upsert(upserts, { onConflict: 'key' })

  if (error) return { error: 'Error al guardar la configuración', success: '' }

  revalidatePath('/', 'layout')
  return { error: '', success: 'Configuración guardada correctamente' }
}
