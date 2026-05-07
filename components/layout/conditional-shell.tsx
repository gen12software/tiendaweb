'use client'

import { usePathname } from 'next/navigation'

interface Props {
  header: React.ReactNode
  footer: React.ReactNode
  whatsapp: React.ReactNode
  children: React.ReactNode
}

export default function ConditionalShell({ header, footer, whatsapp, children }: Props) {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith('/admin')
  const isAuth = ['/login', '/register', '/forgot-password', '/reset-password'].some(p =>
    pathname.startsWith(p)
  )
  const isCheckout = pathname.startsWith('/checkout')
  const hideShell = isAdmin || isAuth || isCheckout

  return (
    <>
      {!hideShell && header}
      <main className={`flex-1 ${!hideShell ? 'pt-[96px]' : ''}`}>{children}</main>
      {!hideShell && footer}
      {!hideShell && whatsapp}
    </>
  )
}
