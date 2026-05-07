'use client'

import { Button } from '@/components/ui/button'
import { ShippingMethod } from '@/lib/types/store'
import { ContactData, ShippingData } from './checkout-flow'
import { BillingFormData } from '@/lib/schemas/checkout'
import { Loader2 } from 'lucide-react'

interface Props {
  contact: ContactData
  shipping: ShippingData
  billing: BillingFormData
  selectedMethod: ShippingMethod | null
  subtotal: number
  shippingTotal: number
  total: number
  currencySymbol: string
  loading: boolean
  onBack: () => void
  onPay: () => void
}

export default function PaymentStep({ contact, shipping, billing, selectedMethod, subtotal, shippingTotal, total, currencySymbol, loading, onBack, onPay }: Props) {
  const billingLabel = billing.same_as_shipping
    ? 'Mismos datos que el envío'
    : `${billing.first_name} ${billing.last_name} · DNI ${billing.dni} · ${billing.street}, ${billing.city}, ${billing.state}`

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Resumen y pago</h2>

      <div className="space-y-3">
        <div className="border rounded-xl p-5 space-y-1 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Contacto</p>
          <p className="text-sm">{contact.full_name}</p>
          <p className="text-sm text-muted-foreground">{contact.email}</p>
          <p className="text-sm text-muted-foreground">{contact.phone}</p>
        </div>

        <div className="border rounded-xl p-5 space-y-1 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Envío</p>
          <p className="text-sm">{shipping.street}, {shipping.city}, {shipping.state} {shipping.postal_code}</p>
          {selectedMethod && <p className="text-sm text-muted-foreground">{selectedMethod.name}</p>}
        </div>

        <div className="border rounded-xl p-5 space-y-1 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Facturación</p>
          <p className="text-sm text-muted-foreground">{billingLabel}</p>
        </div>

        <div className="border rounded-xl p-5 space-y-2 bg-muted/30">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Total</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{currencySymbol}{subtotal.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span>{shippingTotal === 0 ? 'Gratis' : `${currencySymbol}${shippingTotal.toLocaleString('es-AR')}`}</span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t pt-2">
            <span>Total</span>
            <span>{currencySymbol}{total.toLocaleString('es-AR')}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-11" disabled={loading}>
          Atrás
        </Button>
        <Button className="flex-1 h-11" onClick={onPay} disabled={loading}>
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
          ) : (
            'Pagar con MercadoPago'
          )}
        </Button>
      </div>
    </div>
  )
}
