import { createClient } from '@/lib/supabase/server'

export interface SiteConfig {
  site_name: string
  logo_url: string
  primary_color: string
  hero_title: string
  hero_description: string
  contact_email: string
  whatsapp_number: string
  whatsapp_message: string
  contact_schedule: string
}

const DEFAULTS: SiteConfig = {
  site_name: 'Mi Tienda',
  logo_url: '',
  primary_color: '#4f46e5',
  hero_title: 'Bienvenido a nuestra plataforma',
  hero_description: 'Accedé a todo el contenido con un plan.',
  contact_email: 'contacto@mitienda.com',
  whatsapp_number: '',
  whatsapp_message: 'Hola, me comunico desde el sitio web y quisiera hacer una consulta.',
  contact_schedule: 'Lunes a viernes de 9 a 18 hs.',
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_config').select('key, value')

  if (!data) return DEFAULTS

  const map = Object.fromEntries(data.map((row) => [row.key, row.value ?? '']))
  return { ...DEFAULTS, ...map } as SiteConfig
}
