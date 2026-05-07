'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { PaymentMethodConfig, PaymentMethodId } from '@/lib/payment-methods'

interface Props {
  methods: PaymentMethodConfig[]
  loading: boolean
  onBack: () => void
  onConfirm: (method: PaymentMethodId) => void
}

export default function PaymentMethodStep({ methods, loading, onBack, onConfirm }: Props) {
  const [selected, setSelected] = useState<PaymentMethodId | null>(
    methods.length === 1 ? methods[0].id : null
  )

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Método de pago</h2>

      <div className="space-y-3">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => setSelected(method.id)}
            className={`w-full text-left rounded-xl border-2 p-4 transition-colors ${
              selected === method.id
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-muted-foreground/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors ${
                selected === method.id ? 'border-primary bg-primary' : 'border-muted-foreground/40'
              }`}>
                {selected === method.id && (
                  <div className="w-full h-full rounded-full scale-50 bg-white" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{method.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-11" disabled={loading}>
          Atrás
        </Button>
        <Button
          className="flex-1 h-11"
          onClick={() => selected && onConfirm(selected)}
          disabled={!selected || loading}
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Procesando...</>
          ) : selected === 'mercadopago' ? (
            'Pagar con Mercado Pago'
          ) : (
            'Confirmar pedido'
          )}
        </Button>
      </div>
    </div>
  )
}
