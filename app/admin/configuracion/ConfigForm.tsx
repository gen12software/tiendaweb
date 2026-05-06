'use client'

import { useActionState } from 'react'
import { updateSiteConfigAction } from './actions'
import type { SiteConfig } from '@/lib/site-config'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

function Field({ id, label, type = 'text', defaultValue, placeholder, hint }: {
  id: string; label: string; type?: string; defaultValue?: string; placeholder?: string; hint?: string
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1">{hint}</p>}
      {type === 'textarea' ? (
        <textarea id={id} name={id} rows={3} defaultValue={defaultValue}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
      ) : type === 'color' ? (
        <div className="flex items-center gap-3">
          <input id={id} name={id} type="color" defaultValue={defaultValue || '#4f46e5'}
            className="h-10 w-16 rounded-lg border border-gray-300 cursor-pointer p-1" />
          <input name={`${id}_text`} type="text" defaultValue={defaultValue}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-32" readOnly />
        </div>
      ) : type === 'checkbox' ? (
        <input id={id} name={id} type="checkbox" defaultChecked={defaultValue === 'true'} value="true"
          className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
      ) : (
        <input id={id} name={id} type={type} defaultValue={defaultValue} placeholder={placeholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none" />
      )}
    </div>
  )
}

export default function ConfigForm({ config }: { config: SiteConfig }) {
  const [state, action, pending] = useActionState(updateSiteConfigAction, { error: '', success: '' })

  return (
    <form action={action} className="space-y-6">
      {state.success && <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">{state.success}</div>}
      {state.error && <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{state.error}</div>}

      <Tabs defaultValue="identidad">
        <TabsList className="mb-4">
          <TabsTrigger value="identidad">Identidad</TabsTrigger>
          <TabsTrigger value="colores">Colores</TabsTrigger>
          <TabsTrigger value="home">Home</TabsTrigger>
          <TabsTrigger value="tienda">Tienda</TabsTrigger>
          <TabsTrigger value="contacto">Contacto</TabsTrigger>
          <TabsTrigger value="legal">Legal</TabsTrigger>
        </TabsList>

        <TabsContent value="identidad" className="space-y-4">
          <Field id="site_name" label="Nombre del sitio" defaultValue={config.site_name} />
          <Field id="slogan" label="Slogan" defaultValue={config.slogan} placeholder="Opcional" />
          <Field id="logo_url" label="URL del logo" type="url" defaultValue={config.logo_url} placeholder="https://..." />
          <Field id="favicon_url" label="URL del favicon" type="url" defaultValue={config.favicon_url} placeholder="https://..." />
          <Field id="font_heading" label="Fuente para títulos (Google Fonts)" defaultValue={config.font_heading} placeholder="Playfair Display" />
          <Field id="font_body" label="Fuente para cuerpo (Google Fonts)" defaultValue={config.font_body} placeholder="Inter" />
          <Field id="social_instagram" label="Instagram URL" type="url" defaultValue={config.social_instagram} />
          <Field id="social_facebook" label="Facebook URL" type="url" defaultValue={config.social_facebook} />
          <Field id="social_tiktok" label="TikTok URL" type="url" defaultValue={config.social_tiktok} />
        </TabsContent>

        <TabsContent value="colores" className="space-y-4">
          <Field id="primary_color" label="Color primario" type="color" defaultValue={config.primary_color} />
          <Field id="color_secondary" label="Color secundario" type="color" defaultValue={config.color_secondary} />
          <Field id="color_accent" label="Color acento (descuentos, badges)" type="color" defaultValue={config.color_accent} />
          <Field id="color_background" label="Color de fondo" type="color" defaultValue={config.color_background} />
          <Field id="color_surface" label="Color de superficie (cards)" type="color" defaultValue={config.color_surface} />
        </TabsContent>

        <TabsContent value="home" className="space-y-4">
          <Field id="hero_title" label="Título del hero" defaultValue={config.hero_title} />
          <Field id="hero_description" label="Descripción del hero" type="textarea" defaultValue={config.hero_description} />
          <Field id="hero_image_url" label="Imagen del hero (URL)" type="url" defaultValue={config.hero_image_url} />
          <Field id="hero_cta_text" label="Texto del botón CTA" defaultValue={config.hero_cta_text} />
          <Field id="hero_cta_url" label="URL del botón CTA" defaultValue={config.hero_cta_url} />
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700">Secciones visibles</p>
            <label className="flex items-center gap-2 text-sm">
              <Field id="home_show_featured" label="" type="checkbox" defaultValue={config.home_show_featured} />
              Productos destacados
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Field id="home_show_categories" label="" type="checkbox" defaultValue={config.home_show_categories} />
              Categorías
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Field id="home_show_cta" label="" type="checkbox" defaultValue={config.home_show_cta} />
              Sección CTA
            </label>
          </div>
          <Field id="home_cta_title" label="Título del CTA" defaultValue={config.home_cta_title} />
          <Field id="home_cta_subtitle" label="Subtítulo del CTA" defaultValue={config.home_cta_subtitle} />
          <Field id="home_cta_link" label="Link del CTA" defaultValue={config.home_cta_link} />
        </TabsContent>

        <TabsContent value="tienda" className="space-y-4">
          <Field id="currency_symbol" label="Símbolo de moneda" defaultValue={config.currency_symbol} placeholder="$" />
          <Field id="currency_locale" label="Locale de moneda" defaultValue={config.currency_locale} placeholder="es-AR" />
          <Field id="free_shipping_threshold" label="Monto mínimo para envío gratis" type="number" defaultValue={config.free_shipping_threshold} hint="Dejar vacío para no activar" />
        </TabsContent>

        <TabsContent value="contacto" className="space-y-4">
          <Field id="contact_email" label="Email de contacto" type="email" defaultValue={config.contact_email} />
          <Field id="whatsapp_number" label="Número de WhatsApp" defaultValue={config.whatsapp_number} placeholder="+5491112345678" />
          <Field id="whatsapp_message" label="Mensaje de WhatsApp" type="textarea" defaultValue={config.whatsapp_message} />
          <Field id="contact_schedule" label="Horario de atención" defaultValue={config.contact_schedule} />
        </TabsContent>

        <TabsContent value="legal" className="space-y-4">
          <Field id="terms_url" label="URL de Términos" defaultValue={config.terms_url} />
          <Field id="privacy_url" label="URL de Privacidad" defaultValue={config.privacy_url} />
        </TabsContent>
      </Tabs>

      <button type="submit" disabled={pending}
        className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors">
        {pending ? 'Guardando…' : 'Guardar configuración'}
      </button>
    </form>
  )
}
