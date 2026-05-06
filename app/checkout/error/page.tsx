import { Metadata } from 'next'
import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Error en el pago' }

export default function CheckoutErrorPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Hubo un problema con el pago</h1>
      <p className="text-muted-foreground mb-6">
        Tu pago no fue procesado. Podés intentarlo de nuevo o consultarnos por WhatsApp.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/checkout" className={cn(buttonVariants())}>Reintentar</Link>
        <Link href="/contacto" className={cn(buttonVariants({ variant: 'outline' }))}>Contactarnos</Link>
      </div>
    </div>
  )
}
