import Link from 'next/link'
import { SiteConfig } from '@/lib/site-config'

interface Props {
  config: SiteConfig
}

export default function Footer({ config }: Props) {
  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="font-bold text-base">{config.site_name}</p>
            {config.slogan && <p className="text-sm text-muted-foreground mt-1">{config.slogan}</p>}
            {config.contact_email && (
              <p className="text-sm text-muted-foreground mt-2">{config.contact_email}</p>
            )}
          </div>

          <div>
            <p className="font-semibold text-sm mb-3">Tienda</p>
            <nav className="flex flex-col gap-2">
              <Link href="/productos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Productos</Link>
              <Link href="/mi-orden" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Consultar orden</Link>
              <Link href="/contacto" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contacto</Link>
            </nav>
          </div>

          <div>
            <p className="font-semibold text-sm mb-3">Legal</p>
            <nav className="flex flex-col gap-2">
              <Link href={config.privacy_url} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacidad</Link>
              <Link href={config.terms_url} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Términos</Link>
            </nav>

            {(config.social_instagram || config.social_facebook || config.social_tiktok) && (
              <div className="flex gap-3 mt-4">
                {config.social_instagram && (
                  <a href={config.social_instagram} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Instagram
                  </a>
                )}
                {config.social_facebook && (
                  <a href={config.social_facebook} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    Facebook
                  </a>
                )}
                {config.social_tiktok && (
                  <a href={config.social_tiktok} target="_blank" rel="noopener noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors font-medium">
                    TikTok
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {config.site_name}. Todos los derechos reservados.
          </p>
          {config.currency_symbol && (
            <p className="text-xs text-muted-foreground">Precios en {config.currency_symbol}</p>
          )}
        </div>
      </div>
    </footer>
  )
}
