import { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const metadata: Metadata = { title: 'Compra confirmada' }

export default function ConfirmacionPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">¡Compra realizada!</h1>
      <p className="text-muted-foreground mb-6">
        Recibiste un email con los detalles de tu pedido. Podés consultar el estado de tu orden en cualquier momento.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/mi-orden" className={cn(buttonVariants())}>
          Consultar mi orden
        </Link>
        <Link href="/productos" className={cn(buttonVariants({ variant: 'outline' }))}>
          Seguir comprando
        </Link>
        <Link href="/register" className={cn(buttonVariants({ variant: 'outline' }))}>
          Crear cuenta
        </Link>
      </div>
    </div>
  )
}
