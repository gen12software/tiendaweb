'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShippingMethod } from '@/lib/types/store'
import { ShippingData } from './checkout-flow'
import { isFreeShipping } from '@/lib/utils'
import { shippingSchema as schema, BillingFormData } from '@/lib/schemas/checkout'
import BillingSection from './billing-section'

interface Props {
  savedAddress: Record<string, string> | null
  shippingMethods: ShippingMethod[]
  subtotal: number
  freeShippingThreshold: number | null
  currencySymbol: string
  onBack: () => void
  onNext: (data: ShippingData & { billing_data: BillingFormData }) => void
}

export default function ShippingStep({ savedAddress, shippingMethods, subtotal, freeShippingThreshold, currencySymbol, onBack, onNext }: Props) {
  const freeShipping = isFreeShipping(freeShippingThreshold, subtotal)
  const billingRef = useRef<BillingFormData>({ same_as_shipping: true })
  const billingErrorRef = useRef<string | null>(null)
  const [billingSubmitError, setBillingSubmitError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ShippingData>({
    resolver: zodResolver(schema),
    defaultValues: {
      street: savedAddress?.street ?? '',
      city: savedAddress?.city ?? '',
      state: savedAddress?.state ?? '',
      postal_code: savedAddress?.postal_code ?? '',
      country: savedAddress?.country ?? 'Argentina',
      shipping_method_id: shippingMethods[0]?.id ?? '',
    },
  })

  const selectedMethodId = watch('shipping_method_id')
  const selectedMethod = shippingMethods.find((m) => m.id === selectedMethodId)

  function onSubmit(data: ShippingData) {
    if (billingErrorRef.current) {
      setBillingSubmitError(billingErrorRef.current)
      return
    }
    setBillingSubmitError(null)
    onNext({ ...data, billing_data: billingRef.current })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <h2 className="text-xl font-semibold">Dirección de envío</h2>

      {freeShipping && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-700 font-medium">
          ¡Envío gratis por tu compra!
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label>Calle y número</Label>
          <Input {...register('street')} placeholder="Av. Corrientes 1234" className="h-11" />
          {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Ciudad</Label>
          <Input {...register('city')} placeholder="Buenos Aires" className="h-11" />
          {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Provincia</Label>
          <Input {...register('state')} placeholder="CABA" className="h-11" />
          {errors.state && <p className="text-xs text-destructive">{errors.state.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>Código postal</Label>
          <Input {...register('postal_code')} placeholder="1043" className="h-11" />
          {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>País</Label>
          <Input {...register('country')} className="h-11" />
          {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
        </div>
      </div>

      {shippingMethods.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
          El envío se coordinará con el vendedor tras confirmar la compra.
        </div>
      )}

      {shippingMethods.length > 0 && (
        <div className="space-y-2">
          <Label>Método de envío</Label>
          <div className="space-y-2">
            {shippingMethods.map((method) => (
              <label key={method.id} className="flex items-center gap-3 border rounded-xl p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <input type="radio" value={method.id} {...register('shipping_method_id')} className="accent-primary" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{method.name}</p>
                  {method.estimated_days && (
                    <p className="text-xs text-muted-foreground">{method.estimated_days} días hábiles</p>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {freeShipping ? 'Gratis' : method.price === 0 ? 'Gratis' : `${currencySymbol}${method.price.toLocaleString('es-AR')}`}
                </span>
              </label>
            ))}
          </div>
          {errors.shipping_method_id && <p className="text-xs text-destructive">{errors.shipping_method_id.message}</p>}
        </div>
      )}

      <BillingSection
        onChange={(data) => { billingRef.current = data }}
        onError={(err) => { billingErrorRef.current = err }}
      />
      {billingSubmitError && <p className="text-xs text-destructive">{billingSubmitError}</p>}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onBack} className="flex-1 h-11">Atrás</Button>
        <Button type="submit" className="flex-1 h-11">Continuar</Button>
      </div>
    </form>
  )
}
