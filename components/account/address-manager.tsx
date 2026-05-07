'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Plus, Trash2, Star } from 'lucide-react'
import { addAddressAction, setDefaultAddressAction, removeAddressAction } from '@/app/cuenta/direcciones/actions'

const schema = z.object({
  label: z.string().min(1, 'Requerido'),
  street: z.string().min(3, 'Requerido'),
  city: z.string().min(2, 'Requerido'),
  state: z.string().min(2, 'Requerido'),
  postal_code: z.string().min(3, 'Requerido'),
  country: z.string().min(2, 'Requerido'),
})

type FormData = z.infer<typeof schema>

interface Address {
  id: string
  label: string
  address: Record<string, string>
  is_default: boolean
}

interface Props {
  addresses: Address[]
}

export default function AddressManager({ addresses: initial }: Props) {
  const [addresses, setAddresses] = useState(initial)
  const [showForm, setShowForm] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { country: 'Argentina', label: 'Casa' },
  })

  async function onSubmit(data: FormData) {
    const { label, ...addressData } = data
    const result = await addAddressAction({
      label,
      ...addressData,
      is_default: addresses.length === 0,
    })

    if (result.error) { toast.error(result.error); return }
    toast.success('Dirección guardada')
    reset()
    setShowForm(false)
    // Optimistic: la página se revalida via server action
    setAddresses((prev) => [...prev, {
      id: crypto.randomUUID(),
      label,
      address: addressData,
      is_default: prev.length === 0,
    }])
  }

  async function setDefault(id: string) {
    const result = await setDefaultAddressAction(id)
    if (result.error) { toast.error(result.error); return }
    setAddresses((prev) => prev.map((a) => ({ ...a, is_default: a.id === id })))
    toast.success('Dirección predeterminada actualizada')
  }

  async function remove(id: string) {
    const result = await removeAddressAction(id)
    if (result.error) { toast.error(result.error); return }
    setAddresses((prev) => prev.filter((a) => a.id !== id))
    toast.success('Dirección eliminada')
  }

  return (
    <div className="space-y-4">
      {addresses.length === 0 && !showForm && (
        <p className="text-sm text-muted-foreground">No tenés direcciones guardadas.</p>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="border rounded-xl p-4 flex justify-between items-start gap-3 bg-card">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-semibold">{addr.label}</p>
              {addr.is_default && <span className="text-xs text-muted-foreground">(Predeterminada)</span>}
            </div>
            <p className="text-sm text-muted-foreground">
              {addr.address.street}, {addr.address.city}, {addr.address.state} {addr.address.postal_code}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            {!addr.is_default && (
              <button onClick={() => setDefault(addr.id)} className="p-1.5 rounded hover:bg-muted" title="Predeterminar">
                <Star className="w-4 h-4" />
              </button>
            )}
            <button onClick={() => remove(addr.id)} className="p-1.5 rounded hover:bg-muted text-destructive">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}

      {showForm ? (
        <form onSubmit={handleSubmit(onSubmit)} className="border rounded-xl p-4 space-y-3 bg-card">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1">
              <Label>Nombre de la dirección</Label>
              <Input {...register('label')} placeholder="Casa, Trabajo..." />
              {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
            </div>
            <div className="col-span-2 space-y-1">
              <Label>Calle y número</Label>
              <Input {...register('street')} />
              {errors.street && <p className="text-xs text-destructive">{errors.street.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Ciudad</Label>
              <Input {...register('city')} />
            </div>
            <div className="space-y-1">
              <Label>Provincia</Label>
              <Input {...register('state')} />
            </div>
            <div className="space-y-1">
              <Label>Código postal</Label>
              <Input {...register('postal_code')} />
            </div>
            <div className="space-y-1">
              <Label>País</Label>
              <Input {...register('country')} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" disabled={isSubmitting} size="sm">Guardar</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
          </div>
        </form>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Agregar dirección
        </Button>
      )}
    </div>
  )
}
