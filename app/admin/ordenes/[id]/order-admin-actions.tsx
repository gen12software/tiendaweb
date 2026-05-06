'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateOrderAction } from './actions'
import { OrderStatus } from '@/lib/types/store'
import { toast } from 'sonner'

const STATUSES: OrderStatus[] = ['payment_pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled']

interface Props {
  order: { id: string; status: OrderStatus; tracking_number: string | null; admin_notes: string | null }
}

export default function OrderAdminActions({ order }: Props) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [tracking, setTracking] = useState(order.tracking_number ?? '')
  const [adminNotes, setAdminNotes] = useState(order.admin_notes ?? '')
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await updateOrderAction(order.id, { status, tracking_number: tracking, admin_notes: adminNotes })
      if (result.error) toast.error(result.error)
      else toast.success('Orden actualizada')
    })
  }

  return (
    <div className="border rounded-xl p-5 space-y-4 bg-white">
      <p className="font-semibold text-gray-900">Gestión de orden</p>

      <div className="space-y-1">
        <Label>Estado</Label>
        <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full border rounded-lg px-3 py-2 text-sm">
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-1">
        <Label>Número de seguimiento</Label>
        <Input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Ej: LP123456789AR" />
      </div>

      <div className="space-y-1">
        <Label>Notas internas</Label>
        <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3}
          className="w-full border rounded-lg px-3 py-2 text-sm resize-none"
          placeholder="Notas visibles solo para admin..." />
      </div>

      <Button onClick={save} disabled={pending} className="w-full">
        {pending ? 'Guardando...' : 'Guardar cambios'}
      </Button>
    </div>
  )
}
