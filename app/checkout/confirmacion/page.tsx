'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Copy, Check, AlertCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  snapshot: { name?: string; variant_label?: string }
}

interface ShippingAddress {
  street?: string
  city?: string
  province?: string
  zip?: string
  name?: string
}

interface OrderSummary {
  number: string
  status: string
  email: string
  subtotal: number
  shipping_total: number
  total: number
  public_token: string
  shipping_address: ShippingAddress | null
  order_items: OrderItem[]
}

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const preferenceId = searchParams.get('preference_id')
  const mpStatus = searchParams.get('status')

  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    const prefId = preferenceId || sessionStorage.getItem('mp_preference_id')
    if (!prefId) return

    const email = sessionStorage.getItem('checkout_email')
    const emailParam = email ? `?email=${encodeURIComponent(email)}` : ''

    let attempts = 0
    const poll = async () => {
      const res = await fetch(`/api/orders/by-preference/${encodeURIComponent(prefId)}${emailParam}`)
      const data = await res.json()
      if (data.order) {
        setOrder(data.order)
        sessionStorage.removeItem('mp_preference_id')
      } else if (attempts < 8) {
        attempts++
        setTimeout(poll, 2000)
      } else {
        setFailed(true)
      }
    }
    poll()
  }, [preferenceId])

  const copyNumber = () => {
    if (!order) return
    navigator.clipboard.writeText(order.number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const approved = mpStatus === 'approved'

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-8">
        {approved ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-bold mb-2">
          {approved ? '¡Pago confirmado!' : 'Pago en proceso'}
        </h1>
        <p className="text-muted-foreground">
          {approved
            ? 'Tu pedido fue registrado. Te enviamos un email con el resumen.'
            : 'Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.'}
        </p>
      </div>

      {!order && !failed && (
        <div className="text-center text-muted-foreground text-sm py-8">
          Cargando resumen de tu orden...
        </div>
      )}

      {failed && (
        <div className="bg-muted rounded-xl p-6 mb-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto" />
          <p className="text-sm text-muted-foreground">
            No pudimos cargar el detalle de tu orden. Revisá tu email para ver el resumen.
          </p>
          <Link href="/mi-orden" className={cn(buttonVariants({ variant: 'outline' }), 'mt-2')}>
            Consultar mi orden
          </Link>
        </div>
      )}

      {order && (
        <div className="space-y-4">
          {/* Número de orden */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium">Número de orden</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">{order.number}</span>
                <button
                  onClick={copyNumber}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Copiar número de orden"
                >
                  {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Guardá este número para consultar el estado de tu pedido en cualquier momento, incluso sin cuenta.
            </p>
          </div>

          {/* Ítems */}
          <div className="bg-muted rounded-xl p-5 space-y-3">
            <h2 className="text-sm font-semibold">Productos</h2>
            {order.order_items.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-2 text-sm">
                <div className="flex-1 min-w-0">
                  <span className="font-medium">{item.snapshot?.name ?? 'Producto'}</span>
                  {item.snapshot?.variant_label && (
                    <span className="text-muted-foreground ml-1">— {item.snapshot.variant_label}</span>
                  )}
                </div>
                <div className="text-right shrink-0 text-muted-foreground">
                  {item.quantity} × ${item.unit_price.toLocaleString('es-AR')}
                </div>
              </div>
            ))}
          </div>

          {/* Totales */}
          <div className="bg-muted rounded-xl p-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${order.subtotal.toLocaleString('es-AR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Envío</span>
              <span>{order.shipping_total === 0 ? 'Gratis' : `$${order.shipping_total.toLocaleString('es-AR')}`}</span>
            </div>
            <div className="flex justify-between font-semibold pt-2 border-t border-border">
              <span>Total</span>
              <span>${order.total.toLocaleString('es-AR')}</span>
            </div>
          </div>

          {/* Datos de contacto y envío */}
          <div className="bg-muted rounded-xl p-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email</span>
              <span>{order.email}</span>
            </div>
            {order.shipping_address && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground shrink-0">Dirección</span>
                <span className="text-right">
                  {[
                    order.shipping_address.name,
                    order.shipping_address.street,
                    order.shipping_address.city,
                    order.shipping_address.province,
                    order.shipping_address.zip,
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link href="/mi-orden" className={cn(buttonVariants(), 'flex-1 justify-center')}>
          Consultar mi orden
        </Link>
        <Link href="/productos" className={cn(buttonVariants({ variant: 'outline' }), 'flex-1 justify-center')}>
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
