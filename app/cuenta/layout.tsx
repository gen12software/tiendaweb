import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import CuentaSidebar from '@/components/cuenta/cuenta-sidebar'
import { User } from 'lucide-react'

export default async function CuentaLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirectTo=/cuenta/ordenes')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const name = profile?.full_name || user.email?.split('@')[0] || 'Usuario'

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <User className="w-6 h-6 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-lg leading-tight">{name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-8">
        <CuentaSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
