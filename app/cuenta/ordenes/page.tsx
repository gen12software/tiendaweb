import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import Link from 'next/link'
import OrderStatusBadge from '@/components/orders/order-status-badge'
import { getSiteConfig } from '@/lib/site-config'

export const metadata: Metadata = { title: 'Mis órdenes' }

export default async function MisOrdenesPage() {
  const supabase = await createClient()
  const config = await getSiteConfig()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select('id, number, status, total, created_at, public_token')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mis órdenes</h1>
      {!orders?.length ? (
        <p className="text-muted-foreground text-sm">Todavía no tenés órdenes.</p>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/cuenta/ordenes/${order.id}`}
              className="flex items-center justify-between border rounded-xl p-4 hover:bg-muted/50 transition-colors bg-card"
            >
              <div>
                <p className="font-semibold text-sm">#{order.number}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {new Date(order.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">{config.currency_symbol}{Number(order.total).toLocaleString('es-AR')}</span>
                <OrderStatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
