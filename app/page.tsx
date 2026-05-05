import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import { createClient } from '@/lib/supabase/server'
import Hero from '@/components/home/hero'
import Features from '@/components/home/features'
import Cta from '@/components/home/cta'

const FAQ_ITEMS = [
  {
    question: '¿Cómo accedo al contenido después de comprar?',
    answer:
      'Una vez que tu pago sea aprobado, tu cuenta quedará activada automáticamente. Podés acceder desde el menú "Mi cuenta" → "Contenido".',
  },
  {
    question: '¿Cuáles son los métodos de pago disponibles?',
    answer:
      'Procesamos pagos a través de MercadoPago. Podés pagar con tarjeta de crédito, débito, transferencia bancaria o efectivo en puntos de pago.',
  },
  {
    question: '¿Puedo cancelar mi plan?',
    answer:
      'Los planes son de acceso por tiempo determinado (sin renovación automática). Simplemente no renovás cuando vence y listo.',
  },
  {
    question: '¿Qué pasa cuando mi plan vence?',
    answer:
      'Al vencer tu plan, el acceso al contenido se suspende. Podés renovar o cambiar de plan en cualquier momento desde la sección "Planes".',
  },
  {
    question: '¿El contenido se actualiza con el tiempo?',
    answer:
      'Sí, agregamos material nuevo regularmente. Si tenés un plan activo, accedés a todo el contenido nuevo sin costo adicional.',
  },
  {
    question: '¿Puedo acceder desde distintos dispositivos?',
    answer:
      'Sí. Tu cuenta funciona en cualquier dispositivo con conexión a internet: computadora, tablet o celular.',
  },
]

const SOCIAL_LINKS = [
  {
    label: 'Instagram',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: '#',
    icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
          clipRule="evenodd"
        />
      </svg>
    ),
  },
]

export default async function HomePage() {
  const [config, supabase] = await Promise.all([
    getSiteConfig(),
    createClient(),
  ])

  const { data: featuredPlans } = await supabase
    .from('plans')
    .select('id, name, price, duration_days, features')
    .eq('is_active', true)
    .eq('is_featured', true)
    .order('price', { ascending: true })

  return (
    <main className="flex-1">
      <Hero title={config.hero_title} description={config.hero_description} />
      <Features />
      <Cta plans={featuredPlans ?? []} />

      {/* FAQ */}
      <section className="bg-gray-50 py-20 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <dl className="mt-12 space-y-6">
            {FAQ_ITEMS.map((item) => (
              <div key={item.question} className="rounded-2xl bg-white p-6 shadow-sm">
                <dt className="text-base font-semibold text-gray-900">{item.question}</dt>
                <dd className="mt-2 text-sm leading-6 text-gray-600">{item.answer}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
              <Link href="/planes" className="hover:text-indigo-600 transition-colors">
                Planes
              </Link>
              <Link href="/contacto" className="hover:text-indigo-600 transition-colors">
                Contacto
              </Link>
              <Link href="/terminos" className="hover:text-indigo-600 transition-colors">
                Términos y condiciones
              </Link>
              <Link href="/privacidad" className="hover:text-indigo-600 transition-colors">
                Política de privacidad
              </Link>
            </nav>

            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  aria-label={link.label}
                  className="text-gray-400 hover:text-indigo-600 transition-colors"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          <p className="mt-8 text-center text-xs text-gray-400">
            © {new Date().getFullYear()} {config.site_name}. Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </main>
  )
}
