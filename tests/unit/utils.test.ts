import { describe, it, expect } from 'vitest'
import { isFreeShipping } from '@/lib/utils'

describe('isFreeShipping', () => {
  it('returns false when threshold is null', () => {
    expect(isFreeShipping(null, 10000)).toBe(false)
  })

  it('returns false when subtotal is below threshold', () => {
    expect(isFreeShipping(5000, 4999)).toBe(false)
  })

  it('returns true when subtotal equals threshold', () => {
    expect(isFreeShipping(5000, 5000)).toBe(true)
  })

  it('returns true when subtotal exceeds threshold', () => {
    expect(isFreeShipping(5000, 10000)).toBe(true)
  })

  it('returns false when subtotal is zero and threshold is set', () => {
    expect(isFreeShipping(1000, 0)).toBe(false)
  })
})
