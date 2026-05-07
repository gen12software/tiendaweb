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
  low_stock_threshold: string
  about_title: string
  about_subtitle: string
  about_description: string
  about_image_url: string
  about_value1_icon: string
  about_value1_title: string
  about_value1_text: string
  about_value2_icon: string
  about_value2_title: string
  about_value2_text: string
  about_value3_icon: string
  about_value3_title: string
  about_value3_text: string
  header_bg_color: string
  header_text_color: string
  announcement_bg_color: string
  announcement_text_color: string
  announcement_1: string
  announcement_2: string
  announcement_3: string
  announcement_4: string
  announcement_5: string
  announcement_6: string
  announcement_7: string
  announcement_8: string
  announcement_9: string
  announcement_10: string
  payment_methods_enabled: string
  transfer_cbu: string
  transfer_alias: string
  transfer_message: string
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
  low_stock_threshold: '5',
  about_title: 'Quiénes Somos',
  about_subtitle: '',
  about_description: '',
  about_image_url: '',
  about_value1_icon: '⭐',
  about_value1_title: '',
  about_value1_text: '',
  about_value2_icon: '🤝',
  about_value2_title: '',
  about_value2_text: '',
  about_value3_icon: '🚀',
  about_value3_title: '',
  about_value3_text: '',
  header_bg_color: '#0a0a0a',
  header_text_color: '#ffffff',
  announcement_bg_color: '#111111',
  announcement_text_color: '#ffffff',
  announcement_1: '',
  announcement_2: '',
  announcement_3: '',
  announcement_4: '',
  announcement_5: '',
  announcement_6: '',
  announcement_7: '',
  announcement_8: '',
  announcement_9: '',
  announcement_10: '',
  payment_methods_enabled: 'mercadopago',
  transfer_cbu: '',
  transfer_alias: '',
  transfer_message: '',
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const supabase = await createClient()
  const { data } = await supabase.from('site_config').select('key, value')

  if (!data) return DEFAULTS

  const map = Object.fromEntries(data.map((row) => [row.key, row.value ?? '']))
  return { ...DEFAULTS, ...map } as SiteConfig
}
