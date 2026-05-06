import { getSiteConfig } from '@/lib/site-config'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Quiénes Somos' }

export default async function QuienesSomosPage() {
  const config = await getSiteConfig()

  const valores = [
    { icon: config.about_value1_icon, title: config.about_value1_title, text: config.about_value1_text },
    { icon: config.about_value2_icon, title: config.about_value2_title, text: config.about_value2_text },
    { icon: config.about_value3_icon, title: config.about_value3_title, text: config.about_value3_text },
  ].filter(v => v.title)

  const hasImage = !!config.about_image_url

  return (
    <div className="min-h-screen">

      {/* Hero section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden bg-(--theme-surface,#f9fafb)">
        <div className="mx-auto max-w-4xl text-center space-y-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-(--color-primary,#4f46e5)">
            {config.site_name}
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111] leading-tight">
            {config.about_title || 'Quiénes Somos'}
          </h1>
          {config.about_subtitle && (
            <p className="text-lg sm:text-xl text-[#555] max-w-2xl mx-auto leading-relaxed">
              {config.about_subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Main content */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-5xl">
          {hasImage ? (
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              <div className="space-y-5">
                {config.about_description
                  ? config.about_description.split('\n').filter(Boolean).map((p, i) => (
                      <p key={i} className="text-[#444] leading-relaxed text-base sm:text-lg">{p}</p>
                    ))
                  : null
                }
              </div>
              <div className="relative">
                <div className="aspect-4/3 overflow-hidden rounded-2xl shadow-xl">
                  <img
                    src={config.about_image_url}
                    alt={config.about_title || 'Quiénes Somos'}
                    className="h-full w-full object-cover"
                  />
                </div>
                {/* decorative element */}
                <div className="absolute -bottom-4 -right-4 h-24 w-24 rounded-2xl bg-(--color-primary,#4f46e5) opacity-10 -z-10" />
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-5 text-center">
              {config.about_description
                ? config.about_description.split('\n').filter(Boolean).map((p, i) => (
                    <p key={i} className="text-[#444] leading-relaxed text-base sm:text-lg">{p}</p>
                  ))
                : null
              }
            </div>
          )}
        </div>
      </section>

      {/* Valores / pilares */}
      {valores.length > 0 && (
        <section className="py-16 px-4 bg-(--theme-surface,#f9fafb)">
          <div className="mx-auto max-w-5xl">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-center text-[#111] mb-12">
              Nuestros valores
            </h2>
            <div className={`grid gap-6 ${valores.length === 1 ? 'max-w-sm mx-auto' : valores.length === 2 ? 'sm:grid-cols-2 max-w-2xl mx-auto' : 'sm:grid-cols-3'}`}>
              {valores.map((v, i) => (
                <div key={i} className="bg-white rounded-2xl p-8 shadow-sm border border-[#f0f0f0] text-center space-y-4 hover:shadow-md transition-shadow">
                  {v.icon && <div className="text-4xl">{v.icon}</div>}
                  <h3 className="font-heading text-lg font-semibold text-[#111]">{v.title}</h3>
                  {v.text && <p className="text-sm text-[#666] leading-relaxed">{v.text}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="py-16 px-4 text-center">
        <div className="mx-auto max-w-xl space-y-6">
          <p className="text-[#555] text-lg">¿Querés conocer nuestros productos?</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/productos"
              className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: 'var(--color-primary, #4f46e5)' }}
            >
              Ver productos
            </Link>
            <Link
              href="/contacto"
              className="inline-flex items-center justify-center rounded-xl border border-[#e5e5e5] px-6 py-3 text-sm font-semibold text-[#333] hover:border-[#aaa] transition-colors"
            >
              Contactanos
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

