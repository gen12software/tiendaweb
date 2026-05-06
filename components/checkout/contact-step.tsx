'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ContactData } from './checkout-flow'

const schema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(6, 'Teléfono requerido'),
})

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
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <h2 className="text-lg font-semibold">Datos de contacto</h2>

      {user && (
        <div className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground">
          Comprando como <span className="font-medium text-foreground">{user.email}</span>
        </div>
      )}

      <div className="space-y-1">
        <Label htmlFor="full_name">Nombre completo</Label>
        <Input id="full_name" {...register('full_name')} placeholder="Juan Pérez" />
        {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register('email')} placeholder="juan@ejemplo.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="space-y-1">
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" {...register('phone')} placeholder="+54 9 11 1234-5678" />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <Button type="submit" className="w-full">Continuar</Button>
    </form>
  )
}
