import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getSiteConfig } from '@/lib/site-config'
import ConfigForm from './ConfigForm'

export default async function AdminConfigPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/dashboard')

  const config = await getSiteConfig()

  return (
    <main className="flex-1 px-8 py-10 overflow-auto">
      <div className="mx-auto max-w-4xl space-y-8">
        <h1 className="font-heading text-2xl font-bold text-[#111]">Configuración del sitio</h1>
        <div className="rounded-2xl border border-[#f0f0f0] bg-white p-8">
          <ConfigForm config={config} />
        </div>
      </div>
    </main>
  )
}
