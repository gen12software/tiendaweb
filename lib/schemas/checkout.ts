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

export const billingSchema = z.discriminatedUnion('same_as_shipping', [
  z.object({ same_as_shipping: z.literal(true) }),
  z.object({
    same_as_shipping: z.literal(false),
    country: z.string().min(2, 'País requerido'),
    first_name: z.string().min(1, 'Nombre requerido'),
    last_name: z.string().min(1, 'Apellido requerido'),
    dni: z.string().min(7, 'DNI requerido'),
    street: z.string().min(3, 'Dirección requerida'),
    apartment: z.string().optional(),
    postal_code: z.string().min(3, 'Código postal requerido'),
    city: z.string().min(2, 'Ciudad requerida'),
    state: z.string().min(2, 'Provincia requerida'),
    phone: z.string().optional(),
  }),
])

export type ContactFormData = z.infer<typeof contactSchema>
export type ShippingFormData = z.infer<typeof shippingSchema>
export type BillingFormData = z.infer<typeof billingSchema>
