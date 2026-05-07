'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContactData } from './checkout-flow'
import { contactSchema as schema } from '@/lib/schemas/checkout'

interface Props {
  user: { id: string; email: string } | null
  onNext: (data: ContactData) => void
}

export default function ContactStep({ user, onNext }: Props) {
  const { register, handleSubmit, formState: { errors } } = useForm<ContactData>({
    resolver: zodResolver(schema),
    defaultValues: { email: user?.email ?? '' },
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-6">
      <h2 className="text-xl font-semibold">Datos de contacto</h2>

      {user && (
        <div className="bg-muted/50 rounded-xl p-4 text-sm text-muted-foreground">
          Comprando como <span className="font-medium text-foreground">{user.email}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="full_name">Nombre completo</Label>
          <Input id="full_name" {...register('full_name')} placeholder="Juan Pérez" className="h-11" />
          {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} placeholder="juan@ejemplo.com" className="h-11" />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono</Label>
          <Input id="phone" {...register('phone')} placeholder="+54 9 11 1234-5678" className="h-11" />
          {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full h-11">Continuar</Button>
    </form>
  )
}
