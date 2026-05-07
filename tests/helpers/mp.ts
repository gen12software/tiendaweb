import { NextRequest } from 'next/server'
import crypto from 'crypto'

export function buildSignedRequest(
  body: object,
  secret = 'test-secret',
  requestId = 'test-request-id'
): NextRequest {
  const rawBody = JSON.stringify(body)
  const ts = Math.floor(Date.now() / 1000).toString()
  const manifest = `id:${requestId};request-id:${requestId};ts:${ts};`
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex')
  const xSignature = `ts=${ts},v1=${hash}`

  return new NextRequest('https://test.com/api/webhook', {
    method: 'POST',
    body: rawBody,
    headers: {
      'content-type': 'application/json',
      'x-signature': xSignature,
      'x-request-id': requestId,
    },
  })
}

export function buildUnsignedRequest(body: object): NextRequest {
  return new NextRequest('https://test.com/api/webhook', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'content-type': 'application/json' },
  })
}

export function makeMpPayment(overrides: Record<string, unknown> = {}) {
  return {
    id: 'payment-123',
    status: 'approved',
    preference_id: 'pref-abc',
    metadata: {
      flow: 'store',
      contact: {
        full_name: 'Juan Pérez',
        email: 'juan@test.com',
        phone: '1234567890',
      },
      shipping: {
        street: 'Av. Corrientes 1234',
        city: 'Buenos Aires',
        state: 'CABA',
        postal_code: '1043',
        country: 'Argentina',
        shipping_method_id: 'method-1',
      },
      items: [
        {
          productId: 'prod-1',
          variantId: 'var-1',
          quantity: 2,
          price: 9999,
          name: 'Remera',
          variantName: 'Talle M',
        },
      ],
      shipping_total: 500,
    },
    ...overrides,
  }
}
