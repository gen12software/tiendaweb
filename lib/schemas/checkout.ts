import { z } from 'zod'

export const contactSchema = z.object({
  full_name: z.string().min(2, 'Nombre requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(6, 'Teléfono requerido'),
})

export const shippingSchema = z.object({
  street: z.string().min(3, 'Calle requerida'),
  city: z.string().min(2, 'Ciudad requerida'),
  state: z.string().min(2, 'Provincia requerida'),
  postal_code: z.string().min(3, 'Código postal requerido'),
  country: z.string().min(2, 'País requerido'),
  shipping_method_id: z.string().optional(),
})

export type ContactFormData = z.infer<typeof contactSchema>
export type ShippingFormData = z.infer<typeof shippingSchema>
