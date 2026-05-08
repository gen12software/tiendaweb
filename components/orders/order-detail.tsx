import { Order } from '@/lib/types/store'
import OrderStatusBadge from './order-status-badge'
import CancellationButton from './cancellation-button'

interface Props {
  order: Order
  currencySymbol?: string
  publicToken?: string
  showCancellation?: boolean
}

export default function OrderDetail({ order, currencySymbol = '$', publicToken, showCancellation = false }: Props) {
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

      {/* Datos del cliente */}
      <div className="border-t pt-3 space-y-1">
        <p className="text-sm font-semibold mb-1">Cliente</p>
        {address?.full_name && <p className="text-sm">{address.full_name}</p>}
        <p className="text-sm text-muted-foreground">{order.email}</p>
        {address?.phone && <p className="text-sm text-muted-foreground">{address.phone}</p>}
      </div>

      {/* Método de pago */}
      {order.payment_method && (
        <div className="border-t pt-3">
          <p className="text-sm font-semibold mb-1">Método de pago</p>
          <p className="text-sm text-muted-foreground">
            {order.payment_method === 'mercadopago' ? 'Mercado Pago'
              : order.payment_method === 'transferencia' ? 'Transferencia bancaria'
              : order.payment_method === 'efectivo' ? 'Efectivo en local'
              : order.payment_method}
          </p>
        </div>
      )}

      {/* Envío */}
      <div className="border-t pt-3 space-y-1">
        <p className="text-sm font-semibold mb-1">Envío</p>
        {(order as any).shipping_methods?.name ? (
          <p className="text-sm text-muted-foreground">
            {(order as any).shipping_methods.name}
            {(order as any).shipping_methods.estimated_days ? ` · ${(order as any).shipping_methods.estimated_days} días hábiles` : ''}
          </p>
        ) : order.shipping_total === 0 ? (
          <p className="text-sm text-muted-foreground">Gratis</p>
        ) : null}
        {address && (
          <p className="text-sm text-muted-foreground">
            {[address.street, address.city, address.state, address.postal_code, address.country].filter(Boolean).join(', ')}
          </p>
        )}
      </div>

      {/* Facturación */}
      {order.billing_data && (
        <div className="border-t pt-3">
          <p className="text-sm font-semibold mb-1">Datos de facturación</p>
          {order.billing_data.same_as_shipping ? (
            <p className="text-sm text-muted-foreground">Mismos datos que el envío</p>
          ) : (
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p>{order.billing_data.first_name} {order.billing_data.last_name} · DNI {order.billing_data.dni}</p>
              <p>{order.billing_data.street}{order.billing_data.apartment ? `, ${order.billing_data.apartment}` : ''}</p>
              <p>{order.billing_data.city}, {order.billing_data.state} {order.billing_data.postal_code}, {order.billing_data.country}</p>
              {order.billing_data.phone && <p>{order.billing_data.phone}</p>}
            </div>
          )}
        </div>
      )}

      {showCancellation && (
        <div className="border-t pt-4">
          <CancellationButton order={order} publicToken={publicToken} />
        </div>
      )}
    </div>
  )
}
