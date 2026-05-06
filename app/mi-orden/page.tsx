import { Metadata } from 'next'
import OrderLookup from '@/components/orders/order-lookup'

export const metadata: Metadata = { title: 'Consultar mi orden' }

export default function MiOrdenPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-12">
      <h1 className="text-2xl font-bold mb-2">Consultar orden</h1>
      <p className="text-muted-foreground mb-8">Ingresá el número de orden y el email con el que compraste.</p>
      <OrderLookup />
    </div>
  )
}
