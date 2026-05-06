import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/logout/actions'
import { SiteConfig } from '@/lib/site-config'
import CartButton from '@/components/cart/cart-button'
import MobileMenu from '@/components/layout/mobile-menu'

interface Props {
  config: SiteConfig
}

async function getCategories() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order')
    .limit(6)
  return data ?? []
}

export default async function Header({ config }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const categories = await getCategories()

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mr-4 shrink-0">
            {config.logo_url ? (
              <Image src={config.logo_url} alt={config.site_name} width={120} height={40} className="h-8 w-auto object-contain" />
            ) : (
              <span className="text-lg font-bold" style={{ color: 'var(--color-primary)' }}>
                {config.site_name}
              </span>
            )}
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1 flex-1">
            <Link href="/productos" className="px-3 py-2 text-sm font-medium rounded-md hover:bg-muted transition-colors">
              Productos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className="px-3 py-2 text-sm text-muted-foreground rounded-md hover:bg-muted hover:text-foreground transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart */}
            <CartButton />

            {/* Account desktop */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/cuenta/ordenes"
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
                  >
                    Mi cuenta
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium hover:text-primary transition-colors px-2"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-white transition-colors"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu */}
            <MobileMenu user={user} categories={categories} />
          </div>
        </div>
      </div>
    </header>
  )
}
