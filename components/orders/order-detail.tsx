import { Order } from '@/lib/types/store'
import OrderStatusBadge from './order-status-badge'

interface Props {
  order: Order
  currencySymbol?: string
}

export default function OrderDetail({ order, currencySymbol = '$' }: Props) {
  const address = order.shipping_address

  return (
    <div className="border rounded-xl p-6 space-y-5 bg-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted-foreground">Orden</p>
          <p className="text-xl font-bold">#{order.number}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(order.created_at).toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {order.tracking_number && (
        <div className="bg-muted/50 rounded-lg p-3 text-sm">
          <span className="font-medium">Seguimiento: </span>
          <span>{order.tracking_number}</span>
        </div>
      )}

      {/* Ítems */}
      {order.order_items && order.order_items.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Productos</p>
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between text-sm">
              <span>
                {item.snapshot.name}
                {item.snapshot.variant_name && ` · ${item.snapshot.variant_name}`}
                <span className="text-muted-foreground ml-1">×{item.quantity}</span>
              </span>
              <span>{currencySymbol}{item.total_price.toLocaleString('es-AR')}</span>
            </div>
          ))}
        </div>
      )}

      {/* Totales */}
      <div className="border-t pt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{currencySymbol}{order.subtotal.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Envío</span>
          <span>{order.shipping_total === 0 ? 'Gratis' : `${currencySymbol}${order.shipping_total.toLocaleString('es-AR')}`}</span>
        </div>
        <div className="flex justify-between font-bold text-base pt-1 border-t">
          <span>Total</span>
          <span>{currencySymbol}{order.total.toLocaleString('es-AR')}</span>
        </div>
      </div>

      {/* Dirección */}
      {address && (
        <div className="border-t pt-3">
          <p className="text-sm font-semibold mb-1">Dirección de envío</p>
          <p className="text-sm text-muted-foreground">
            {address.street}, {address.city}, {address.state} {address.postal_code}, {address.country}
          </p>
        </div>
      )}
    </div>
  )
}
