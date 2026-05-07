'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Copy, Check, AlertCircle, Banknote } from 'lucide-react'
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
  payment_method: string | null
  shipping_address: ShippingAddress | null
  order_items: OrderItem[]
}

interface TransferData {
  cbu: string
  alias: string
  message: string
}

const STATUS_LABELS: Record<string, string> = {
  pago_pendiente: 'Pendiente de pago',
  nueva: 'Confirmada',
  en_preparacion: 'En preparación',
  enviado: 'Enviado',
  listo_para_retirar: 'Listo para retirar',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const preferenceId = searchParams.get('preference_id')
  const paymentId = searchParams.get('payment_id')
  const mpStatus = searchParams.get('status')
  const ordenToken = searchParams.get('orden')
  const metodo = searchParams.get('metodo') as 'transferencia' | 'efectivo' | null

  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [transferData, setTransferData] = useState<TransferData | null>(null)
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)

  const isManualPayment = !!ordenToken

  useEffect(() => {
    // Flujo manual (transferencia / efectivo)
    if (ordenToken) {
      fetch(`/api/orders/by-token/${encodeURIComponent(ordenToken)}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.order) {
            setOrder(data.order)
            if (data.order.payment_method === 'transferencia' && data.transferData) {
              setTransferData(data.transferData)
            }
          } else {
            setFailed(true)
          }
        })
        .catch(() => setFailed(true))
      return
    }

    // Flujo MP (preference_id polling)
    const prefId = preferenceId || sessionStorage.getItem('mp_preference_id')
    if (!prefId) return

    const email = sessionStorage.getItem('checkout_email')
    const params = new URLSearchParams()
    if (email) params.set('email', email)
    if (paymentId) params.set('payment_id', paymentId)
    const qs = params.toString() ? `?${params.toString()}` : ''

    let attempts = 0
    const poll = async () => {
      const res = await fetch(`/api/orders/by-preference/${encodeURIComponent(prefId)}${qs}`)
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
  }, [preferenceId, paymentId, ordenToken])

  const copyNumber = () => {
    if (!order) return
    navigator.clipboard.writeText(order.number)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const approved = mpStatus === 'approved'
  const isPending = isManualPayment || (!approved && !mpStatus)

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="text-center mb-8">
        {isManualPayment ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : approved ? (
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        ) : (
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-bold mb-2">
          {isManualPayment
            ? '¡Pedido recibido!'
            : approved
            ? '¡Pago confirmado!'
            : 'Pago en proceso'}
        </h1>
        <p className="text-muted-foreground">
          {isManualPayment
            ? metodo === 'transferencia'
              ? 'Realizá la transferencia con los datos que aparecen abajo y tu pedido quedará confirmado.'
              : 'Tu pedido está registrado. Abonás al retirar o al recibir el pedido.'
            : approved
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
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs text-muted-foreground">Estado</span>
              <span className="text-xs font-medium">
                {STATUS_LABELS[order.status] ?? order.status}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Guardá este número para consultar el estado de tu pedido en cualquier momento.
            </p>
          </div>

          {/* Datos de transferencia */}
          {metodo === 'transferencia' && (transferData?.cbu || transferData?.alias || transferData?.message) && (
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-blue-700">
                <Banknote className="w-5 h-5" />
                <span className="font-semibold text-sm">Datos para la transferencia</span>
              </div>
              <div className="space-y-2 text-sm">
                {transferData.cbu && (
                  <div className="flex justify-between gap-4">
                    <span className="text-blue-600 font-medium shrink-0">CBU</span>
                    <span className="font-mono text-blue-800 text-right break-all">{transferData.cbu}</span>
                  </div>
                )}
                {transferData.alias && (
                  <div className="flex justify-between gap-4">
                    <span className="text-blue-600 font-medium shrink-0">Alias</span>
                    <span className="font-mono text-blue-800 text-right">{transferData.alias}</span>
                  </div>
                )}
                <div className="flex justify-between gap-4 pt-1 border-t border-blue-200">
                  <span className="text-blue-600 font-medium shrink-0">Total</span>
                  <span className="font-bold text-blue-800">${order.total.toLocaleString('es-AR')}</span>
                </div>
              </div>
              {transferData.message && (
                <p className="text-xs text-blue-700 bg-blue-100 rounded-lg p-3">{transferData.message}</p>
              )}
            </div>
          )}

          {/* Efectivo */}
          {metodo === 'efectivo' && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-5 space-y-2">
              <p className="text-sm font-semibold text-amber-700">Pago en efectivo</p>
              <p className="text-xs text-amber-600">Abonás al retirar o al recibir tu pedido. El total es <strong>${order.total.toLocaleString('es-AR')}</strong>.</p>
            </div>
          )}

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
