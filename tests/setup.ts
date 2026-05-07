import { vi } from 'vitest'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('@/lib/email/send-order-confirmation', () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/lib/email/send-payment-confirmation', () => ({
  sendPaymentConfirmationEmail: vi.fn().mockResolvedValue(undefined),
}))
