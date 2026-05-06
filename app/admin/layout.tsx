'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/productos', label: 'Productos' },
  { href: '/admin/categorias', label: 'Categorías' },
  { href: '/admin/hero', label: 'Hero / Carrusel' },
  { href: '/admin/ordenes', label: 'Órdenes' },
  { href: '/admin/usuarios', label: 'Usuarios' },
  { href: '/admin/configuracion', label: 'Configuración' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
    <div className="flex min-h-screen bg-[#f5f5f4]">
      <aside className="w-56 shrink-0 bg-[#0f0f0f] flex flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="px-5 py-6 border-b border-white/10">
          <p className="font-heading font-bold text-white text-base tracking-tight">Admin</p>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive(item.href)
                  ? 'bg-white/10 text-white font-medium'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              }`}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-5 py-4 border-t border-white/10">
          <Link href="/" className="text-xs text-white/30 hover:text-white/60 transition-colors">
            ← Ver tienda
          </Link>
        </div>
      </aside>

      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
