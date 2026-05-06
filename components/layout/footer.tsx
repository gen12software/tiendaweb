import Link from 'next/link'
import { SiteConfig } from '@/lib/site-config'

interface Props {
  config: SiteConfig
}

export default function Footer({ config }: Props) {
  return (
    <footer
      className="text-white/70 mt-auto"
      style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%)' }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <p className="font-heading font-bold text-white text-xl tracking-tight mb-3">
              {config.site_name}
            </p>
            {config.slogan && (
              <p className="text-sm text-white/50 leading-relaxed max-w-xs">{config.slogan}</p>
            )}
            {config.contact_email && (
              <p className="text-sm text-white/40 mt-3">{config.contact_email}</p>
            )}
            {(config.social_instagram || config.social_facebook || config.social_tiktok) && (
              <div className="flex gap-4 mt-5">
                {config.social_instagram && (
                  <a href={config.social_instagram} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                    Instagram
                  </a>
                )}
                {config.social_facebook && (
                  <a href={config.social_facebook} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                    Facebook
                  </a>
                )}
                {config.social_tiktok && (
                  <a href={config.social_tiktok} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold text-white/50 hover:text-white transition-colors uppercase tracking-wider">
                    TikTok
                  </a>
                )}
              </div>
            )}
          </div>

          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Tienda</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/productos" className="text-sm text-white/60 hover:text-white transition-colors">Productos</Link>
              <Link href="/mi-orden" className="text-sm text-white/60 hover:text-white transition-colors">Consultar orden</Link>
              <Link href="/contacto" className="text-sm text-white/60 hover:text-white transition-colors">Contacto</Link>
            </nav>
          </div>

          <div>
            <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">Legal</p>
            <nav className="flex flex-col gap-2.5">
              <Link href={config.privacy_url} className="text-sm text-white/60 hover:text-white transition-colors">Privacidad</Link>
              <Link href={config.terms_url} className="text-sm text-white/60 hover:text-white transition-colors">Términos</Link>
            </nav>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} {config.site_name}. Todos los derechos reservados.
          </p>
          {config.currency_symbol && (
            <p className="text-xs text-white/30">Precios en {config.currency_symbol}</p>
          )}
        </div>
      </div>
    </footer>
  )
}
