'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BillingFormData } from '@/lib/schemas/checkout'

const customBillingSchema = z.object({
  country: z.string().min(2, 'País requerido'),
  first_name: z.string().min(1, 'Nombre requerido'),
  last_name: z.string().min(1, 'Apellido requerido'),
  dni: z.string().min(7, 'DNI requerido'),
  street: z.string().min(3, 'Dirección requerida'),
  apartment: z.string().optional(),
  postal_code: z.string().min(3, 'Código postal requerido'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Provincia requerida'),
  phone: z.string().optional(),
})

type CustomBillingFields = z.infer<typeof customBillingSchema>

interface Props {
  onChange: (data: BillingFormData) => void
  onError: (err: string | null) => void
}

export default function BillingSection({ onChange, onError }: Props) {
  const [mode, setMode] = useState<'same' | 'custom'>('same')

  const { register, watch, formState: { errors, isValid } } = useForm<CustomBillingFields>({
    resolver: zodResolver(customBillingSchema),
    mode: 'onChange',
    defaultValues: { country: 'Argentina' },
  })

  const values = watch()

  useEffect(() => {
    if (mode === 'same') {
      onChange({ same_as_shipping: true })
      onError(null)
      return
    }
    if (isValid) {
      onChange({ same_as_shipping: false, ...values })
      onError(null)
    } else {
      onError('Completá los datos de facturación')
    }
  }, [mode, isValid, JSON.stringify(values)])

  return (
    <div className="border rounded-xl overflow-hidden">
      <div className="p-4 bg-muted/30">
        <p className="text-sm font-semibold mb-3">Datos de facturación</p>
        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="billing_mode"
              checked={mode === 'same'}
              onChange={() => setMode('same')}
              className="accent-primary"
            />
            <span className="text-sm">Usar datos del envío</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="billing_mode"
              checked={mode === 'custom'}
              onChange={() => setMode('custom')}
              className="accent-primary"
            />
            <span className="text-sm">Ingresar otros datos</span>
          </label>
        </div>
      </div>

      {mode === 'custom' && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Nombre</Label>
              <Input {...register('first_name')} placeholder="Juan" className="h-11" />
              {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Apellido</Label>
              <Input {...register('last_name')} placeholder="Pérez" className="h-11" />
              {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>DNI</Label>
              <Input {...register('dni')} placeholder="12345678" className="h-11" />
              {errors.dni && <p className="text-xs text-destructive">{errors.dni.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Teléfono <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input {...register('phone')} placeholder="+54 9 11 1234-5678" className="h-11" />
            </div>
            <div className="sm:col-span-2 space-y-1.5">
              <Label>Dirección y altura</Label>
              <Input {...register('street')} placeholder="Av. Corrientes 1234" className="h-11" />
              {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Casa / Dpto. <span className="text-muted-foreground text-xs">(opcional)</span></Label>
              <Input {...register('apartment')} placeholder="Piso 3, Dpto B" className="h-11" />
            </div>
            <div className="space-y-1.5">
              <Label>Código postal</Label>
              <Input {...register('postal_code')} placeholder="1043" className="h-11" />
              {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code.message}</p>}
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
              <Label>País / Región</Label>
              <Input {...register('country')} className="h-11" />
              {errors.country && <p className="text-xs text-destructive">{errors.country.message}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
