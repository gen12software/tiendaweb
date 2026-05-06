import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import AddressManager from '@/components/account/address-manager'

export const metadata: Metadata = { title: 'Mis direcciones' }

export default async function DireccionesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: addresses } = await supabase
    .from('addresses')
    .select('*')
    .eq('user_id', user!.id)
    .order('is_default', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mis direcciones</h1>
      <AddressManager addresses={addresses ?? []} userId={user!.id} />
    </div>
  )
}
