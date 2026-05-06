'use client'

import { useActionState, useState } from 'react'
import { updateSiteConfigAction } from './actions'
import type { SiteConfig } from '@/lib/site-config'
import {
  Store, Palette, Home, ShoppingBag, Phone, Shield, Upload, X, Users, Megaphone,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

// ── Site image uploader (logo / favicon) ────────────────────────────────────

function SiteImageUploader({
  id, label, defaultValue, previewClass,
}: {
  id: string; label: string; defaultValue?: string; previewClass?: string
}) {
  const [url, setUrl] = useState(defaultValue ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { setError('Máximo 2 MB'); return }
    setUploading(true); setError('')
    try {
      const supabase = createClient()
      const ext = file.name.split('.').pop()
      const path = `site/${id}-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('product-images')
        .upload(path, file, { upsert: true })
      if (upErr) throw upErr
      const { data: { publicUrl } } = supabase.storage.from('product-images').getPublicUrl(path)
      setUrl(publicUrl)
    } catch (err: any) {
      setError('Error al subir: ' + err.message)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[#333]">{label}</label>
      <input type="hidden" name={id} value={url} />

      {/* Preview */}
      <div className={`overflow-hidden rounded-lg border border-[#e5e5e5] bg-[#f9f9f9] flex items-center justify-center ${previewClass ?? 'h-12 w-12'}`}>
        {url
          ? <img src={url} alt={label} className="h-full w-full object-contain p-1" />
          : <Upload className="w-4 h-4 text-[#ccc]" />
        }
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <label className={`inline-flex items-center gap-2 cursor-pointer rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm text-[#555] hover:border-[#aaa] hover:text-[#111] transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-3.5 h-3.5" />
          {uploading ? 'Subiendo…' : url ? 'Cambiar archivo' : 'Seleccionar archivo'}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
        </label>
        {url && (
          <button type="button" onClick={() => setUrl('')} className="flex items-center gap-1.5 text-xs text-[#bbb] hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" /> Quitar
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Font selector ────────────────────────────────────────────────────────────

const FONTS_HEADING = [
  'Playfair Display', 'Merriweather', 'Lora', 'Cormorant Garamond',
  'DM Serif Display', 'Libre Baskerville', 'Raleway', 'Oswald',
  'Montserrat', 'Poppins', 'Nunito', 'Bebas Neue',
]

const FONTS_BODY = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Nunito', 'Poppins',
  'Source Sans 3', 'DM Sans', 'Mulish', 'Outfit', 'Plus Jakarta Sans',
]

function FontSelect({ id, label, defaultValue }: { id: string; label: string; defaultValue?: string }) {
  const [value, setValue] = useState(defaultValue ?? '')
  const options = id === 'font_heading' ? FONTS_HEADING : FONTS_BODY
  const base =
    'w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#111] ' +
    'focus:border-[#111] focus:outline-none focus:ring-1 focus:ring-[#111] transition-colors'
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-[#333]">{label}</label>
      <select id={id} name={id} value={value} onChange={e => setValue(e.target.value)} className={base}>
        <option value="">— Sin fuente personalizada —</option>
        {options.map(f => (
          <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
        ))}
      </select>
      {value && (
        <p className="text-xs text-[#aaa] mt-1" style={{ fontFamily: `'${value}', sans-serif` }}>
          La tipografía se aplica al guardar y recargar la página.
        </p>
      )}
    </div>
  )
}

// ── Field primitives ────────────────────────────────────────────────────────

function Field({
  id, label, type = 'text', defaultValue, placeholder, hint,
}: {
  id: string; label: string; type?: string
  defaultValue?: string; placeholder?: string; hint?: string
}) {
  const base =
    'w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#111] ' +
    'placeholder:text-[#bbb] focus:border-[#111] focus:outline-none focus:ring-1 focus:ring-[#111] transition-colors'

  return (
    <div className="space-y-1">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#333]">{label}</label>
      )}
      {hint && <p className="text-xs text-[#aaa]">{hint}</p>}

      {type === 'textarea' ? (
        <textarea id={id} name={id} rows={3} defaultValue={defaultValue}
          placeholder={placeholder} className={base + ' resize-none'} />
      ) : type === 'color' ? (
        <ColorField id={id} defaultValue={defaultValue} />
      ) : type === 'checkbox' ? (
        <input id={id} name={id} type="checkbox"
          defaultChecked={defaultValue === 'true'} value="true"
          className="h-4 w-4 rounded border-[#e5e5e5] text-[#111] focus:ring-[#111]" />
      ) : (
        <input id={id} name={id} type={type} defaultValue={defaultValue}
          placeholder={placeholder} className={base} />
      )}
    </div>
  )
}

function ColorField({ id, defaultValue }: { id: string; defaultValue?: string }) {
  const [hex, setHex] = useState(defaultValue || '#4f46e5')
  return (
    <div className="flex items-center gap-3">
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-[#e5e5e5] cursor-pointer">
        <input
          id={id} name={id} type="color" value={hex}
          onChange={e => setHex(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
        <span className="block h-full w-full" style={{ background: hex }} />
      </div>
      <input
        type="text" value={hex} onChange={e => setHex(e.target.value)}
        className="w-32 rounded-lg border border-[#e5e5e5] px-3 py-2 text-sm font-mono text-[#333] focus:border-[#111] focus:outline-none"
      />
      <span className="text-xs text-[#aaa]">{id.replace(/_/g, ' ')}</span>
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-base font-semibold text-[#111] border-b border-[#f0f0f0] pb-3 mb-5">
      {children}
    </h2>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

function Span({ children }: { children: React.ReactNode }) {
  return <div className="sm:col-span-2">{children}</div>
}

// ── Sections ────────────────────────────────────────────────────────────────

function SecIdentidad({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Identidad</SectionTitle>
      <Grid>
        <Field id="site_name" label="Nombre del sitio" defaultValue={config.site_name} placeholder="Mi Tienda" />
        <Field id="slogan" label="Slogan" defaultValue={config.slogan} placeholder="Opcional" />
        <Span>
          <SiteImageUploader id="logo_url" label="Logo" defaultValue={config.logo_url} previewClass="h-14 w-40" />
        </Span>
        <Span>
          <SiteImageUploader id="favicon_url" label="Favicon" defaultValue={config.favicon_url} previewClass="h-10 w-10" />
        </Span>
        <FontSelect id="font_heading" label="Fuente títulos" defaultValue={config.font_heading} />
        <FontSelect id="font_body" label="Fuente cuerpo" defaultValue={config.font_body} />
        <Field id="social_instagram" label="Instagram" type="url" defaultValue={config.social_instagram} placeholder="https://instagram.com/..." />
        <Field id="social_facebook" label="Facebook" type="url" defaultValue={config.social_facebook} placeholder="https://facebook.com/..." />
        <Field id="social_tiktok" label="TikTok" type="url" defaultValue={config.social_tiktok} placeholder="https://tiktok.com/@..." />
      </Grid>
    </div>
  )
}

function SecColores({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Colores</SectionTitle>
      <div className="space-y-4">
        <ColorField id="primary_color" defaultValue={config.primary_color} />
        <ColorField id="color_secondary" defaultValue={config.color_secondary} />
        <ColorField id="color_accent" defaultValue={config.color_accent} />
        <ColorField id="color_background" defaultValue={config.color_background} />
        <ColorField id="color_surface" defaultValue={config.color_surface} />
      </div>
      <div className="text-xs text-[#aaa] space-y-0.5 mt-1">
        <p><span className="font-medium text-[#666]">primary_color</span> — botones, links principales</p>
        <p><span className="font-medium text-[#666]">color_secondary</span> — elementos secundarios</p>
        <p><span className="font-medium text-[#666]">color_accent</span> — descuentos, badges</p>
        <p><span className="font-medium text-[#666]">color_background</span> — fondo general</p>
        <p><span className="font-medium text-[#666]">color_surface</span> — fondo de cards</p>
      </div>
    </div>
  )
}

function SecHome({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Home</SectionTitle>

      <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-700">
        Estos campos se usan como portada <strong>solo si no hay slides cargados</strong> en Hero / Carrusel.
        Si el carrusel tiene imágenes, esta sección es ignorada.
      </div>

      <Grid>
        <Span><Field id="hero_title" label="Título" defaultValue={config.hero_title} /></Span>
        <Span><Field id="hero_description" label="Descripción" type="textarea" defaultValue={config.hero_description} /></Span>
        <Span>
          <SiteImageUploader id="hero_image_url" label="Imagen de fondo" defaultValue={config.hero_image_url} previewClass="h-28 w-full" />
        </Span>
        <Field id="hero_cta_text" label="Texto del botón" defaultValue={config.hero_cta_text} />
        <div className="space-y-1">
          <label htmlFor="hero_cta_url" className="block text-sm font-medium text-[#333]">Destino del botón</label>
          <select id="hero_cta_url" name="hero_cta_url" defaultValue={config.hero_cta_url ?? '/productos'}
            className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#111] focus:border-[#111] focus:outline-none focus:ring-1 focus:ring-[#111] transition-colors">
            <option value="/productos">Tienda — /productos</option>
            <option value="/quienes-somos">Quiénes somos — /quienes-somos</option>
            <option value="/contacto">Contacto — /contacto</option>
          </select>
        </div>
      </Grid>

      <div className="rounded-xl border border-[#f0f0f0] p-4 space-y-3">
        <p className="text-sm font-medium text-[#333]">Secciones visibles</p>
        {[
          { id: 'home_show_featured', label: 'Productos destacados', val: config.home_show_featured },
          { id: 'home_show_categories', label: 'Categorías', val: config.home_show_categories },
          { id: 'home_show_cta', label: 'Sección CTA', val: config.home_show_cta },
        ].map(({ id, label, val }) => (
          <label key={id} className="flex items-center gap-3 cursor-pointer select-none">
            <input id={id} name={id} type="checkbox" defaultChecked={val === 'true'} value="true"
              className="h-4 w-4 rounded border-[#e5e5e5] text-[#111] focus:ring-[#111]" />
            <span className="text-sm text-[#444]">{label}</span>
          </label>
        ))}
      </div>

      <Grid>
        <Field id="home_cta_title" label="Título del CTA" defaultValue={config.home_cta_title} />
        <Field id="home_cta_subtitle" label="Subtítulo del CTA" defaultValue={config.home_cta_subtitle} />
        <Span>
          <div className="space-y-1">
            <label htmlFor="home_cta_link" className="block text-sm font-medium text-[#333]">Destino del CTA</label>
            <select id="home_cta_link" name="home_cta_link" defaultValue={config.home_cta_link ?? '/productos'}
              className="w-full rounded-lg border border-[#e5e5e5] bg-white px-3.5 py-2.5 text-sm text-[#111] focus:border-[#111] focus:outline-none focus:ring-1 focus:ring-[#111] transition-colors">
              <option value="/productos">Tienda — /productos</option>
              <option value="/quienes-somos">Quiénes somos — /quienes-somos</option>
              <option value="/contacto">Contacto — /contacto</option>
            </select>
          </div>
        </Span>
      </Grid>
    </div>
  )
}

function SecTienda({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Tienda</SectionTitle>
      <Grid>
        <Field id="currency_symbol" label="Símbolo de moneda" defaultValue={config.currency_symbol} placeholder="$" />
        <Field id="currency_locale" label="Locale de moneda" defaultValue={config.currency_locale} placeholder="es-AR" />
        <Field id="free_shipping_threshold" label="Envío gratis desde" type="number" defaultValue={config.free_shipping_threshold}
          hint="Dejar vacío para desactivar" />
        <Field id="low_stock_threshold" label="Umbral de stock bajo" type="number" defaultValue={config.low_stock_threshold}
          hint="Alerta en dashboard cuando stock ≤ este valor" />
      </Grid>
    </div>
  )
}

function SecContacto({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Contacto</SectionTitle>
      <Grid>
        <Field id="contact_email" label="Email de contacto" type="email" defaultValue={config.contact_email} />
        <Field id="whatsapp_number" label="WhatsApp" defaultValue={config.whatsapp_number} placeholder="+5491112345678" />
        <Span><Field id="whatsapp_message" label="Mensaje predeterminado de WhatsApp" type="textarea" defaultValue={config.whatsapp_message} /></Span>
        <Span><Field id="contact_schedule" label="Horario de atención" defaultValue={config.contact_schedule} /></Span>
      </Grid>
    </div>
  )
}

function SecNosotros({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Quiénes Somos</SectionTitle>
      <Grid>
        <Span><Field id="about_title" label="Título de la página" defaultValue={config.about_title} /></Span>
        <Span><Field id="about_subtitle" label="Subtítulo / bajada" defaultValue={config.about_subtitle} placeholder="Una frase que describa tu marca" /></Span>
        <Span><Field id="about_description" label="Texto principal" type="textarea" defaultValue={config.about_description} placeholder="Contá la historia de tu marca, tus valores, por qué hacés lo que hacés…" /></Span>
        <Span>
          <SiteImageUploader id="about_image_url" label="Imagen" defaultValue={config.about_image_url} previewClass="h-48 w-full" />
        </Span>
      </Grid>

      <div className="space-y-4 pt-2">
        <p className="text-sm font-medium text-[#333]">Pilares / valores (opcional)</p>
        {([1, 2, 3] as const).map(n => (
          <div key={n} className="rounded-xl border border-[#f0f0f0] p-4 space-y-3">
            <p className="text-xs font-semibold text-[#aaa] uppercase tracking-wide">Pilar {n}</p>
            <Grid>
              <Field id={`about_value${n}_icon`} label="Ícono (emoji)" defaultValue={config[`about_value${n}_icon` as keyof SiteConfig]} placeholder="⭐" />
              <Field id={`about_value${n}_title`} label="Título" defaultValue={config[`about_value${n}_title` as keyof SiteConfig]} placeholder="Ej: Calidad garantizada" />
              <Span><Field id={`about_value${n}_text`} label="Descripción" defaultValue={config[`about_value${n}_text` as keyof SiteConfig]} placeholder="Breve descripción del valor…" /></Span>
            </Grid>
          </div>
        ))}
      </div>
    </div>
  )
}

function SecAnuncios({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Barra de anuncios</SectionTitle>
      <p className="text-sm text-[#666]">
        Mensajes que rotan en la barra superior del sitio. Los vacíos se ignoran.
        Si no configurás ninguno, se muestran mensajes automáticos según tu configuración de envíos y WhatsApp.
      </p>
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#333]">Barra de anuncios</p>
        <Grid>
          <div className="space-y-1">
            <label className="block text-xs text-[#666]">Color de fondo</label>
            <ColorField id="announcement_bg_color" defaultValue={config.announcement_bg_color || '#111111'} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[#666]">Color de texto</label>
            <ColorField id="announcement_text_color" defaultValue={config.announcement_text_color || '#ffffff'} />
          </div>
        </Grid>
      </div>
      <div className="space-y-3">
        <p className="text-sm font-medium text-[#333]">Header / navegación</p>
        <Grid>
          <div className="space-y-1">
            <label className="block text-xs text-[#666]">Color de fondo</label>
            <ColorField id="header_bg_color" defaultValue={config.header_bg_color || '#0a0a0a'} />
          </div>
          <div className="space-y-1">
            <label className="block text-xs text-[#666]">Color de texto</label>
            <ColorField id="header_text_color" defaultValue={config.header_text_color || '#ffffff'} />
          </div>
        </Grid>
      </div>
      <div className="space-y-3">
        {([1,2,3,4,5,6,7,8,9,10] as const).map(n => (
          <Field
            key={n}
            id={`announcement_${n}`}
            label={`Mensaje ${n}`}
            defaultValue={config[`announcement_${n}` as keyof SiteConfig]}
            placeholder={n === 1 ? 'Ej: Envíos a todo el país' : n === 2 ? 'Ej: Comprá con total seguridad' : ''}
          />
        ))}
      </div>
    </div>
  )
}

function SecLegal({ config }: { config: SiteConfig }) {
  return (
    <div className="space-y-5">
      <SectionTitle>Legal</SectionTitle>
      <Grid>
        <Field id="terms_url" label="URL de Términos y Condiciones" defaultValue={config.terms_url} />
        <Field id="privacy_url" label="URL de Política de Privacidad" defaultValue={config.privacy_url} />
      </Grid>
    </div>
  )
}

// ── Nav items ───────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'identidad', label: 'Identidad',     Icon: Store },
  { id: 'colores',   label: 'Colores',       Icon: Palette },
  { id: 'home',      label: 'Home',          Icon: Home },
  { id: 'nosotros',  label: 'Quiénes Somos', Icon: Users },
  { id: 'anuncios',  label: 'Anuncios',      Icon: Megaphone },
  { id: 'tienda',    label: 'Tienda',        Icon: ShoppingBag },
  { id: 'contacto',  label: 'Contacto',      Icon: Phone },
  { id: 'legal',     label: 'Legal',         Icon: Shield },
]

// ── Main form ───────────────────────────────────────────────────────────────

export default function ConfigForm({ config }: { config: SiteConfig }) {
  const [state, action, pending] = useActionState(updateSiteConfigAction, { error: '', success: '' })
  const [active, setActive] = useState('identidad')

  return (
    <form action={action}>
      {/* Feedback */}
      {state.success && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          {state.success}
        </div>
      )}
      {state.error && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar nav */}
        <nav className="hidden md:flex flex-col w-44 shrink-0 gap-1">
          {SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-left transition-colors ${
                active === id
                  ? 'bg-[#111] text-white'
                  : 'text-[#555] hover:bg-[#f5f5f5] hover:text-[#111]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        {/* Mobile: horizontal scroll tabs */}
        <div className="md:hidden w-full mb-4 flex gap-1 overflow-x-auto pb-1">
          {SECTIONS.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={`flex items-center gap-1.5 shrink-0 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active === id
                  ? 'bg-[#111] text-white'
                  : 'border border-[#e5e5e5] text-[#555] hover:bg-[#f5f5f5]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="flex-1 min-w-0">
          {active === 'identidad' && <SecIdentidad config={config} />}
          {active === 'colores'   && <SecColores   config={config} />}
          {active === 'home'      && <SecHome      config={config} />}
          {active === 'nosotros'  && <SecNosotros  config={config} />}
          {active === 'anuncios'  && <SecAnuncios  config={config} />}
          {active === 'tienda'    && <SecTienda    config={config} />}
          {active === 'contacto'  && <SecContacto  config={config} />}
          {active === 'legal'     && <SecLegal     config={config} />}

          <div className="mt-8 flex items-center justify-between border-t border-[#f0f0f0] pt-6">
            <p className="text-xs text-[#aaa]">Los cambios se aplican al sitio inmediatamente.</p>
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[#111] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#333] disabled:opacity-50 transition-colors"
            >
              {pending ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
