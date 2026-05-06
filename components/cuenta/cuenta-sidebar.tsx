'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ShoppingBag, MapPin, Heart } from 'lucide-react'

const NAV = [
  { href: '/cuenta/ordenes',     label: 'Mis órdenes',  icon: ShoppingBag },
  { href: '/cuenta/direcciones', label: 'Direcciones',  icon: MapPin },
  { href: '/cuenta/wishlist',    label: 'Wishlist',     icon: Heart },
]

export default function CuentaSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-full sm:w-52 shrink-0">
      <nav className="flex sm:flex-col flex-row gap-1 overflow-x-auto">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${
                active
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
