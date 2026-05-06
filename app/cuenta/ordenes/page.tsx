import { createClient } from '@/lib/supabase/server'
import { Metadata } from 'next'
import Link from 'next/link'
import { getSiteConfig } from '@/lib/site-config'
import OrderStatusBadge from '@/components/orders/order-status-badge'
import { ShoppingBag, ChevronRight, Package } from 'lucide-react'

export const metadata: Metadata = { title: 'Mis órdenes' }

export default async function MisOrdenesPage() {
  const supabase = await createClient()
  const config = await getSiteConfig()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: orders } = await supabase
    .from('orders')
    .select(`
      id, number, status, total, created_at,
      order_items(snapshot)
    `)
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  if (!orders?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <ShoppingBag className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="font-semibold text-lg mb-1">Todavía no tenés órdenes</h2>
        <p className="text-muted-foreground text-sm mb-6">Cuando realices una compra, aparecerá acá.</p>
        <Link
          href="/productos"
          className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Mis órdenes</h1>
      <div className="space-y-3">
        {orders.map((order) => {
          const images = (order.order_items ?? [])
            .map((i: any) => i.snapshot?.image)
            .filter(Boolean)
            .slice(0, 3)

          return (
            <Link
              key={order.id}
              href={`/cuenta/ordenes/${order.id}`}
              className="flex items-center gap-4 border rounded-2xl p-4 hover:border-primary/40 hover:bg-muted/30 transition-all bg-card group"
            >
              {/* Miniaturas de productos */}
              <div className="flex -space-x-2 shrink-0">
                {images.length > 0 ? images.map((img: string, i: number) => (
                  <div key={i} className="w-12 h-12 rounded-xl border-2 border-background overflow-hidden bg-muted">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                )) : (
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                    <Package className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm">#{order.number}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {' · '}
                  {(order.order_items ?? []).length} {(order.order_items ?? []).length === 1 ? 'producto' : 'productos'}
                </p>
              </div>

              {/* Total + flecha */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-semibold text-sm">
                  {config.currency_symbol}{Number(order.total).toLocaleString('es-AR')}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
