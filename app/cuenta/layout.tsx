import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/cuenta/ordenes')

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row gap-8">
        <aside className="w-full sm:w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            <Link href="/cuenta/ordenes" className="px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">Mis órdenes</Link>
            <Link href="/cuenta/direcciones" className="px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">Direcciones</Link>
            <Link href="/cuenta/wishlist" className="px-3 py-2 rounded-md text-sm hover:bg-muted transition-colors">Wishlist</Link>
          </nav>
        </aside>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
