'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props { href: string; label: string }

export default function NavLink({ href, label }: Props) {
  const pathname = usePathname()
  const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <Link
      href={href}
      className={`relative px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
        isActive
          ? 'text-white bg-white/15'
          : 'text-white/60 hover:text-white hover:bg-white/10'
      }`}
    >
      {label}
    </Link>
  )
}
