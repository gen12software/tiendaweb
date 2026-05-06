import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/lib/types/store'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  payment_pending: 'Esperando pago',
  paid: 'Pago confirmado',
  processing: 'En preparación',
  shipped: 'Enviado',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  payment_approved_stock_error: 'Error de stock',
}

const STATUS_VARIANT: Record<OrderStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  payment_pending: 'secondary',
  paid: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'default',
  cancelled: 'destructive',
  payment_approved_stock_error: 'destructive',
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'outline'}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  )
}
