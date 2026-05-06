import { Badge } from '@/components/ui/badge'
import { OrderStatus } from '@/lib/types/store'

const STATUS_LABELS: Record<OrderStatus, string> = {
  pago_pendiente:     'Pago pendiente',
  nueva:              'Nueva',
  en_preparacion:     'En preparación',
  enviado:            'Enviado',
  listo_para_retirar: 'Listo para retirar',
  entregado:          'Entregado',
  cancelado:          'Cancelado',
}

const STATUS_COLORS: Record<OrderStatus, string> = {
  pago_pendiente:     'bg-gray-100 text-gray-500 border-gray-200',
  nueva:              'bg-blue-100 text-blue-700 border-blue-200',
  en_preparacion:     'bg-yellow-100 text-yellow-700 border-yellow-200',
  enviado:            'bg-purple-100 text-purple-700 border-purple-200',
  listo_para_retirar: 'bg-orange-100 text-orange-700 border-orange-200',
  entregado:          'bg-green-100 text-green-700 border-green-200',
  cancelado:          'bg-red-100 text-red-600 border-red-200',
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label = STATUS_LABELS[status] ?? status
  const color = STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600 border-gray-200'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${color}`}>
      {label}
    </span>
  )
}
