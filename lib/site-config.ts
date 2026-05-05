import { createClient } from '@/lib/supabase/server'

export interface SiteConfig {
  site_name: string
  logo_url: string
  primary_color: string
  hero_title: string
  hero_description: string
}

const DEFAULTS: SiteConfig = {
  site_name: 'Mi Tienda',
  logo_url: '',
  primary_color: '#4f46e5',
  hero_title: 'Bienvenido a nuestra plataforma',
  hero_description: 'Accedé a todo el contenido con un plan.',
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_config').select('key, value')

  if (!data) return DEFAULTS

  const map = Object.fromEntries(data.map((row) => [row.key, row.value ?? '']))
  return { ...DEFAULTS, ...map } as SiteConfig
}
