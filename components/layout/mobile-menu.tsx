'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User | null
  categories: { id: string; name: string; slug: string }[]
}

export default function MobileMenu({ user, categories }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Menú"
      >
        <Menu className="w-5 h-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-80 p-0">
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <SheetTitle className="font-heading text-left">Menú</SheetTitle>
          </SheetHeader>
          <nav className="px-3 py-4 flex flex-col gap-0.5">
            <Link href="/" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-muted text-sm font-semibold transition-colors">
              Inicio
            </Link>
            <Link href="/productos" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-muted text-sm font-semibold transition-colors">
              Productos
            </Link>
            <Link href="/quienes-somos" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-muted text-sm font-semibold transition-colors">
              Quiénes Somos
            </Link>
            <Link href="/contacto" onClick={() => setOpen(false)} className="px-3 py-3 rounded-xl hover:bg-muted text-sm font-semibold transition-colors">
              Contacto
            </Link>
            <div className="my-3 border-t mx-3" />
            {user ? (
              <>
                <Link href="/cuenta/ordenes" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-colors">
                  Mis órdenes
                </Link>
                <Link href="/cuenta/wishlist" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-colors">
                  Wishlist
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm transition-colors">
                  Iniciar sesión
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm font-semibold transition-colors">
                  Registrarse
                </Link>
              </>
            )}
            <Link href="/mi-orden" onClick={() => setOpen(false)} className="px-3 py-2.5 rounded-xl hover:bg-muted text-sm text-muted-foreground transition-colors">
              Consultar mi orden
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
