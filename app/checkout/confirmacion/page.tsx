'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Clock, Copy, Check } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface OrderSummary {
  number: string
  status: string
  email: string
  total: number
  public_token: string
}

export default function ConfirmacionPage() {
  const searchParams = useSearchParams()
  const preferenceId = searchParams.get('preference_id')
  const mpStatus = searchParams.get('status')

  const [order, setOrder] = useState<OrderSummary | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!preferenceId) return
    // Polling: el webhook puede tardar unos segundos en crear la orden
    let attempts = 0
    const poll = async () => {
      const res = await fetch(`/api/orders/by-preference/${encodeURIComponent(preferenceId)}`)
      const data = await res.json()
      if (data.order) {
        setOrder(data.order)
      } else if (attempts < 6) {
        attempts++
        setTimeout(poll, 2000)
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
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      {approved ? (
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      ) : (
        <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
      )}

      <h1 className="text-2xl font-bold mb-2">
        {approved ? '¡Pago confirmado!' : 'Pago en proceso'}
      </h1>

      <p className="text-muted-foreground mb-6">
        {approved
          ? 'Tu pedido fue registrado. Te enviamos un email con el resumen.'
          : 'Tu pago está siendo procesado. Te avisaremos por email cuando se confirme.'}
      </p>

      {order && (
        <div className="bg-muted rounded-xl p-6 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Número de orden</span>
            <div className="flex items-center gap-2">
              <span className="font-mono font-semibold text-lg">{order.number}</span>
              <button onClick={copyNumber} className="text-muted-foreground hover:text-foreground transition-colors">
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Email</span>
            <span className="text-sm">{order.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-semibold">${order.total.toLocaleString('es-AR')}</span>
          </div>
          <p className="text-xs text-muted-foreground pt-2 border-t">
            Guardá este número para consultar el estado de tu pedido.
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/mi-orden" className={cn(buttonVariants())}>
          Consultar mi orden
        </Link>
        <Link href="/productos" className={cn(buttonVariants({ variant: 'outline' }))}>
          Seguir comprando
        </Link>
      </div>
    </div>
  )
}
