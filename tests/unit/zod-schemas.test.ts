import { describe, it, expect } from 'vitest'
import { contactSchema, shippingSchema } from '@/lib/schemas/checkout'

describe('contactSchema', () => {
  const valid = { full_name: 'Juan Pérez', email: 'juan@test.com', phone: '1122334455' }

  it('accepts valid data', () => {
    expect(() => contactSchema.parse(valid)).not.toThrow()
  })

  it('rejects invalid email', () => {
    const result = contactSchema.safeParse({ ...valid, email: 'not-an-email' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const fields = result.error.issues.map((i) => i.path[0])
      expect(fields).toContain('email')
    }
  })

  it('rejects full_name shorter than 2 chars', () => {
    const result = contactSchema.safeParse({ ...valid, full_name: 'A' })
    expect(result.success).toBe(false)
  })

  it('rejects phone shorter than 6 chars', () => {
    const result = contactSchema.safeParse({ ...valid, phone: '123' })
    expect(result.success).toBe(false)
  })

  it('rejects missing required fields', () => {
    const result = contactSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('shippingSchema', () => {
  const valid = {
    street: 'Av. Corrientes 1234',
    city: 'Buenos Aires',
    state: 'CABA',
    postal_code: '1043',
    country: 'Argentina',
  }

  it('accepts valid data', () => {
    expect(() => shippingSchema.parse(valid)).not.toThrow()
  })

  it('accepts data with optional shipping_method_id', () => {
    expect(() => shippingSchema.parse({ ...valid, shipping_method_id: 'method-1' })).not.toThrow()
  })

  it('accepts data without shipping_method_id', () => {
    expect(() => shippingSchema.parse(valid)).not.toThrow()
  })

  it('rejects street shorter than 3 chars', () => {
    const result = shippingSchema.safeParse({ ...valid, street: 'AB' })
    expect(result.success).toBe(false)
  })

  it('rejects missing city', () => {
    const { city: _, ...rest } = valid
    const result = shippingSchema.safeParse(rest)
    expect(result.success).toBe(false)
  })

  it('rejects postal_code shorter than 3 chars', () => {
    const result = shippingSchema.safeParse({ ...valid, postal_code: '10' })
    expect(result.success).toBe(false)
  })
})
