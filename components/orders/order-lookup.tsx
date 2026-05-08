'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import OrderDetail from './order-detail'
import { Order } from '@/lib/types/store'

const schema = z.object({
  number: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

export default function OrderLookup() {
  const [order, setOrder] = useState<Order | null>(null)
  const [notFound, setNotFound] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit({ number, email }: FormData) {
    setNotFound(false)
    setOrder(null)
    const res = await fetch(`/api/orders/by-number/${encodeURIComponent(number)}?email=${encodeURIComponent(email)}`)
    if (!res.ok) { setNotFound(true); return }
    const data = await res.json()
    setOrder(data.order)
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 border rounded-xl p-6 bg-card">
        <div className="space-y-1">
          <Label>Número de orden</Label>
          <Input {...register('number')} placeholder="ORD-001001" />
          {errors.number && <p className="text-xs text-destructive">{errors.number.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Email de compra</Label>
          <Input type="email" {...register('email')} placeholder="juan@ejemplo.com" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Consultar
        </Button>
      </form>

      {notFound && (
        <p className="text-sm text-destructive text-center">No encontramos una orden con esos datos.</p>
      )}

      {order && <OrderDetail order={order} showCancellation publicToken={order.public_token} />}
    </div>
  )
}
