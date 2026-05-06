import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import { logoutAction } from '@/app/(auth)/logout/actions'
import { SiteConfig } from '@/lib/site-config'
import CartButton from '@/components/cart/cart-button'
import MobileMenu from '@/components/layout/mobile-menu'
import HeaderWrapper from '@/components/layout/header-wrapper'
import AnnouncementBar from '@/components/layout/announcement-bar'
import NavLink from '@/components/layout/nav-link'
import { User } from 'lucide-react'

interface Props {
  config: SiteConfig
}

export default async function Header({ config }: Props) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <HeaderWrapper primaryColor={config.primary_color} textColor={config.header_text_color}>
      <AnnouncementBar config={config} />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-6">

          {/* Logo — izquierda */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            {config.logo_url && (
              <Image
                src={config.logo_url}
                alt={config.site_name}
                width={0}
                height={0}
                sizes="100vw"
                className="h-9 w-auto object-contain"
              />
            )}
            <div className="flex flex-col leading-none">
              <span className="font-heading text-base font-bold tracking-tight text-white">
                {config.site_name}
              </span>
              {config.slogan && (
                <span className="text-[9px] tracking-[0.18em] uppercase text-white/40 hidden md:block mt-0.5">
                  {config.slogan}
                </span>
              )}
            </div>
          </Link>

          {/* Nav — centro */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            <NavLink href="/"              label="Inicio" />
            <NavLink href="/productos"     label="Productos" />
            <NavLink href="/quienes-somos" label="Quiénes Somos" />
            <NavLink href="/contacto"      label="Contacto" />
          </nav>

          {/* Acciones — derecha */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden md:flex items-center gap-2 text-sm">
              {user ? (
                <>
                  <Link
                    href="/cuenta/ordenes"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <User className="w-4 h-4" />
                    <span>Mi cuenta</span>
                  </Link>
                  <form action={logoutAction}>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-all"
                    >
                      Salir
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    Ingresar
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-1.5 rounded-full font-semibold text-white transition-all hover:opacity-90"
                    style={{ backgroundColor: config.primary_color }}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
            <CartButton />
            <MobileMenu user={user} categories={[]} />
          </div>
        </div>
      </div>
    </HeaderWrapper>
  )
}
