import { describe, it, expect, vi, beforeEach } from 'vitest'
import { buildSignedRequest, buildUnsignedRequest, makeMpPayment } from '../helpers/mp'
import { sendOrderConfirmationEmail } from '@/lib/email/send-order-confirmation'

// --- Payment mock (must be a class to support `new Payment(mp)`) ---
const mockPaymentGet = vi.fn()

vi.mock('mercadopago', () => {
  return {
    MercadoPagoConfig: class {},
    Payment: class {
      get(params: unknown) { return mockPaymentGet(params) }
    },
  }
})

// --- Supabase admin mock ---
const mockInsertOrder = vi.fn()
const mockInsertOrderItems = vi.fn()
const mockInsertPayment = vi.fn()
const mockSelectVariants = vi.fn()
const mockSelectProducts = vi.fn()
const mockRpc = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table === 'orders') {
        return { insert: mockInsertOrder }
      }
      if (table === 'order_items') {
        return { insert: mockInsertOrderItems }
      }
      if (table === 'payments') {
        return { insert: mockInsertPayment }
      }
      if (table === 'product_variants') {
        return { select: vi.fn().mockReturnValue({ in: mockSelectVariants }) }
      }
      if (table === 'products') {
        return { select: vi.fn().mockReturnValue({ in: mockSelectProducts }) }
      }
      return {
        select: vi.fn().mockReturnThis(),
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }
    }),
    rpc: mockRpc,
    auth: { admin: { getUserById: vi.fn().mockResolvedValue({ data: { user: null } }) } },
  })),
}))

const { POST } = await import('@/app/api/webhook/route')

describe('POST /api/webhook', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mockPaymentGet.mockResolvedValue(makeMpPayment())
    mockRpc.mockResolvedValue({ data: null, error: null })
    mockInsertOrderItems.mockResolvedValue({ data: null, error: null })
    mockInsertPayment.mockResolvedValue({ data: null, error: null })

    mockSelectProducts.mockResolvedValue({
      data: [{ id: 'prod-1', price: 100 }],
      error: null,
    })
    mockSelectVariants.mockResolvedValue({
      data: [{ id: 'var-1', price_modifier: 50 }],
      error: null,
    })

    // order insert → returns order row
    mockInsertOrder.mockReturnValue({
      select: vi.fn().mockReturnValue({
        single: vi.fn().mockResolvedValue({
          data: { id: 'order-uuid-1', number: 1001, public_token: 'tok-abc' },
          error: null,
        }),
      }),
    })
  })

  it('returns 401 when x-signature header is missing', async () => {
    const req = buildUnsignedRequest({ type: 'payment', data: { id: '123' } })
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 401 when signature is invalid', async () => {
    const req = buildSignedRequest({ type: 'payment', data: { id: '123' } }, 'wrong-secret')
    const res = await POST(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 without creating order for non-payment event type', async () => {
    const req = buildSignedRequest({ type: 'refund', data: { id: '123' } })
    const res = await POST(req)
    expect(res.status).toBe(200)
    expect(mockInsertOrder).not.toHaveBeenCalled()
  })

  it('creates order with status "nueva" when payment is approved (store flow)', async () => {
    const req = buildSignedRequest({ type: 'payment', data: { id: 'payment-123' } })
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(mockInsertOrder).toHaveBeenCalledOnce()
    const insertArg = mockInsertOrder.mock.calls[0][0]
    expect(insertArg.status).toBe('nueva')
    expect(insertArg.email).toBe('juan@test.com')
  })

  it('recalculates prices from DB, ignores metadata prices', async () => {
    // metadata price is 9999, DB returns price: 100 + modifier: 50 = 150/unit
    const req = buildSignedRequest({ type: 'payment', data: { id: 'payment-123' } })
    await POST(req)

    const insertArg = mockInsertOrder.mock.calls[0][0]
    // 2 units × 150 = 300 subtotal + 500 shipping = 800 total
    expect(insertArg.subtotal).toBe(300)
    expect(insertArg.total).toBe(800)
  })

  it('decrements stock for each item with variantId', async () => {
    const req = buildSignedRequest({ type: 'payment', data: { id: 'payment-123' } })
    await POST(req)

    expect(mockRpc).toHaveBeenCalledWith('decrement_variant_stock', {
      p_variant_id: 'var-1',
      p_quantity: 2,
    })
  })

  it('sends order confirmation email after order creation', async () => {
    const req = buildSignedRequest({ type: 'payment', data: { id: 'payment-123' } })
    await POST(req)

    expect(sendOrderConfirmationEmail).toHaveBeenCalledOnce()
    const emailArg = (sendOrderConfirmationEmail as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(emailArg.email).toBe('juan@test.com')
    expect(emailArg.orderNumber).toBe(1001)
  })

  it('does not create order when payment status is not approved', async () => {
    mockPaymentGet.mockResolvedValue(makeMpPayment({ status: 'pending' }))

    const req = buildSignedRequest({ type: 'payment', data: { id: 'payment-123' } })
    await POST(req)

    expect(mockInsertOrder).not.toHaveBeenCalled()
  })

  it('returns 200 without creating order when store metadata is incomplete', async () => {
    mockPaymentGet.mockResolvedValue(
      makeMpPayment({ metadata: { flow: 'store' } }) // no contact, no items
    )

    const req = buildSignedRequest({ type: 'payment', data: { id: 'payment-123' } })
    const res = await POST(req)

    expect(res.status).toBe(200)
    expect(mockInsertOrder).not.toHaveBeenCalled()
  })
})
