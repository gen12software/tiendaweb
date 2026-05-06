import { createClient } from '@/lib/supabase/server'

export interface SiteConfig {
  site_name: string
  logo_url: string
  primary_color: string
  color_secondary: string
  color_accent: string
  color_background: string
  color_surface: string
  font_heading: string
  font_body: string
  favicon_url: string
  social_instagram: string
  social_facebook: string
  social_tiktok: string
  currency_symbol: string
  currency_locale: string
  free_shipping_threshold: string
  hero_title: string
  hero_description: string
  hero_image_url: string
  hero_cta_text: string
  hero_cta_url: string
  home_show_featured: string
  home_show_categories: string
  home_show_cta: string
  home_cta_title: string
  home_cta_subtitle: string
  home_cta_link: string
  contact_email: string
  whatsapp_number: string
  whatsapp_message: string
  contact_schedule: string
  slogan: string
  terms_url: string
  privacy_url: string
}

const DEFAULTS: SiteConfig = {
  site_name: 'Mi Tienda',
  logo_url: '',
  primary_color: '#4f46e5',
  color_secondary: '#6366f1',
  color_accent: '#f59e0b',
  color_background: '#ffffff',
  color_surface: '#f9fafb',
  font_heading: '',
  font_body: '',
  favicon_url: '',
  social_instagram: '',
  social_facebook: '',
  social_tiktok: '',
  currency_symbol: '$',
  currency_locale: 'es-AR',
  free_shipping_threshold: '',
  hero_title: 'Bienvenido a nuestra tienda',
  hero_description: 'Encontrá todo lo que buscás.',
  hero_image_url: '',
  hero_cta_text: 'Ver productos',
  hero_cta_url: '/productos',
  home_show_featured: 'true',
  home_show_categories: 'true',
  home_show_cta: 'true',
  home_cta_title: '',
  home_cta_subtitle: '',
  home_cta_link: '/productos',
  contact_email: 'contacto@mitienda.com',
  whatsapp_number: '',
  whatsapp_message: 'Hola, me comunico desde el sitio web y quisiera hacer una consulta.',
  contact_schedule: 'Lunes a viernes de 9 a 18 hs.',
  slogan: '',
  terms_url: '/privacidad',
  privacy_url: '/privacidad',
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_config').select('key, value')

  if (!data) return DEFAULTS

  const map = Object.fromEntries(data.map((row) => [row.key, row.value ?? '']))
  return { ...DEFAULTS, ...map } as SiteConfig
}
