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
      <button onClick={() => setOpen(true)} className="p-2 rounded-md hover:bg-muted" aria-label="Menú">
        <Menu className="w-5 h-5" />
      </button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72">
          <SheetHeader>
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>
          <nav className="mt-6 flex flex-col gap-1">
            <Link href="/productos" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted text-sm font-medium">
              Todos los productos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md hover:bg-muted text-sm text-muted-foreground"
              >
                {cat.name}
              </Link>
            ))}
            <div className="my-3 border-t" />
            {user ? (
              <>
                <Link href="/cuenta/ordenes" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted text-sm">
                  Mis órdenes
                </Link>
                <Link href="/cuenta/wishlist" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted text-sm">
                  Wishlist
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted text-sm">
                  Iniciar sesión
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted text-sm">
                  Registrarse
                </Link>
              </>
            )}
            <Link href="/mi-orden" onClick={() => setOpen(false)} className="px-3 py-2 rounded-md hover:bg-muted text-sm text-muted-foreground">
              Consultar mi orden
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  )
}
