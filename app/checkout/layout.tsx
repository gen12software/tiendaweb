'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isConfirmacion = pathname === '/checkout/confirmacion'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border/40 px-4 py-3">
        {!isConfirmacion && (
          <Link
            href="/productos"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Seguir comprando
          </Link>
        )}
      </header>
      <main className="flex-1">
        {children}
      </main>
    </div>
  )
}
