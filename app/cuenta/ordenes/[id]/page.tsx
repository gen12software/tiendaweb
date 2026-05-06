import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import OrderDetail from '@/components/orders/order-detail'
import { getSiteConfig } from '@/lib/site-config'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Detalle de orden' }

interface Props { params: Promise<{ id: string }> }

export default async function OrdenDetallePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const config = await getSiteConfig()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: order } = await supabase
    .from('orders')
    .select(`
      id, number, status, email, subtotal, shipping_total, total,
      shipping_address, tracking_number, created_at, updated_at,
      shipping_methods(id, name, price, estimated_days),
      order_items(id, quantity, unit_price, total_price, snapshot)
    `)
    .eq('id', id)
    .eq('user_id', user!.id)
    .single()

  if (!order) notFound()

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Orden #{order.number}</h1>
      <OrderDetail order={order as any} currencySymbol={config.currency_symbol} />
    </div>
  )
}
