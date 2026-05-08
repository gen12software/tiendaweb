'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { Order } from '@/lib/types/store'

interface Props {
  order: Pick<Order, 'id' | 'status' | 'created_at'>
  publicToken?: string
}

const WINDOW_DAYS = 10

function isWithinWindow(createdAt: string): boolean {
  const diffDays = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= WINDOW_DAYS
}

export default function CancellationButton({ order, publicToken }: Props) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (order.status === 'arrepentimiento_solicitado') {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        Tu solicitud de cancelación fue recibida y está siendo revisada.
      </div>
    )
  }

  if (order.status === 'cancelado') {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        Esta orden fue cancelada.
      </div>
    )
  }

  if (!isWithinWindow(order.created_at)) return null

  if (done) {
    return (
      <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
        Tu solicitud de cancelación fue enviada. Recibirás un email de confirmación.
      </div>
    )
  }

  async function handleConfirm() {
    if (reason.trim().length < 10) return
    setLoading(true)
    setError(null)
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (publicToken) headers['x-order-token'] = publicToken
      const res = await fetch(`/api/orders/by-id/${order.id}/cancel`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ reason: reason.trim() }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Error al procesar la cancelación')
      } else {
        setOpen(false)
        setDone(true)
      }
    } catch {
      setError('Error de conexión. Intentá nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
        onClick={() => setOpen(true)}
      >
        Me arrepiento de la compra
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <h2 className="text-lg font-semibold">Solicitar cancelación</h2>
            <p className="text-sm text-muted-foreground">
              De acuerdo con la Ley 24.240, podés solicitar el arrepentimiento de tu compra dentro de los
              10 días corridos desde la fecha de la orden. Por favor ingresá el motivo.
            </p>
            <div className="space-y-1">
              <label className="text-sm font-medium">Motivo <span className="text-muted-foreground">(mínimo 10 caracteres)</span></label>
              <textarea
                className="w-full rounded-lg border px-3 py-2 text-sm min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Contanos por qué querés cancelar tu compra..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground text-right">{reason.trim().length}/10 mín.</p>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => { setOpen(false); setError(null) }} disabled={loading}>
                Cancelar
              </Button>
              <Button
                variant="destructive"
                disabled={reason.trim().length < 10 || loading}
                onClick={handleConfirm}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Confirmar solicitud
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
