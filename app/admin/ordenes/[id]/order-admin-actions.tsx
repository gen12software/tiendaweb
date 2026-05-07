'use client'

import { useState, useTransition, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateOrderAction } from './actions'
import { OrderStatus } from '@/lib/types/store'
import { toast } from 'sonner'
import { Upload, Send } from 'lucide-react'

const STATUSES: { value: OrderStatus; label: string }[] = [
  { value: 'pago_pendiente',     label: 'Pago pendiente' },
  { value: 'nueva',              label: 'Nueva' },
  { value: 'en_preparacion',     label: 'En preparación' },
  { value: 'enviado',            label: 'Enviado' },
  { value: 'listo_para_retirar', label: 'Listo para retirar' },
  { value: 'entregado',          label: 'Entregado' },
  { value: 'cancelado',          label: 'Cancelado' },
]

interface Props {
  order: {
    id: string
    status: OrderStatus
    tracking_number: string | null
    admin_notes: string | null
    invoice_url: string | null
  }
}

export default function OrderAdminActions({ order }: Props) {
  const [status, setStatus] = useState<OrderStatus>(order.status)
  const [tracking, setTracking] = useState(order.tracking_number ?? '')
  const [adminNotes, setAdminNotes] = useState(order.admin_notes ?? '')
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(order.invoice_url)
  const [uploading, setUploading] = useState(false)
  const [sending, setSending] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pending, startTransition] = useTransition()

  function save() {
    startTransition(async () => {
      const result = await updateOrderAction(order.id, { status, tracking_number: tracking, admin_notes: adminNotes })
      if (result.error) toast.error(result.error)
      else toast.success('Orden actualizada')
    })
  }

  async function uploadInvoice(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      toast.error('Solo se aceptan archivos PDF')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch(`/api/orders/by-id/${order.id}/invoice`, { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al subir la factura')
      setInvoiceUrl(data.invoice_url)
      toast.success('Factura cargada correctamente')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function sendInvoice() {
    if (!invoiceUrl) return
    setSending(true)
    try {
      const res = await fetch(`/api/orders/by-id/${order.id}/invoice/send`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al enviar el email')
      toast.success('Factura enviada al cliente')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border rounded-xl p-5 space-y-4 bg-white">
        <p className="font-semibold text-gray-900">Gestión de orden</p>

        <div className="space-y-1">
          <Label>Estado</Label>
          <select value={status} onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full border rounded-lg px-3 py-2 text-sm">
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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

      <div className="border rounded-xl p-5 space-y-4 bg-white">
        <p className="font-semibold text-gray-900">Factura</p>

        {invoiceUrl && (
          <a
            href={invoiceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline block"
          >
            Ver factura actual →
          </a>
        )}

        <div className="space-y-1">
          <Label>Cargar PDF de factura</Label>
          <div className="flex gap-2 items-center">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={uploadInvoice}
              className="hidden"
              id="invoice-upload"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex-1"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'Subiendo...' : invoiceUrl ? 'Reemplazar factura' : 'Cargar factura'}
            </Button>
          </div>
        </div>

        <Button
          type="button"
          onClick={sendInvoice}
          disabled={!invoiceUrl || sending}
          className="w-full"
          variant="outline"
        >
          <Send className="w-4 h-4 mr-2" />
          {sending ? 'Enviando...' : 'Enviar factura al cliente'}
        </Button>

        {!invoiceUrl && (
          <p className="text-xs text-muted-foreground">Cargá la factura primero para poder enviarla.</p>
        )}
      </div>
    </div>
  )
}
