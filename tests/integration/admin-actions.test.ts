import { describe, it, expect, vi, beforeEach } from 'vitest'

// --- Supabase client mock (for assertAdmin) ---
const mockGetUser = vi.fn()
const mockProfileSelect = vi.fn()

const mockSupabaseClient = {
  auth: { getUser: mockGetUser },
  from: vi.fn((table: string) => {
    if (table === 'profiles') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockProfileSelect,
          }),
        }),
      }
    }
    return {
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
  }),
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

// --- Supabase admin mock (for DB operations) ---
const mockOrderUpdate = vi.fn()
const mockOrderSelect = vi.fn()
const mockOrderItemsSelect = vi.fn()
const mockVariantSelect = vi.fn()
const mockVariantUpdate = vi.fn()

const mockSupabaseAdmin = {
  from: vi.fn((table: string) => {
    if (table === 'orders') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockOrderSelect,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockOrderUpdate,
        }),
      }
    }
    if (table === 'order_items') {
      return {
        select: vi.fn().mockReturnValue({
          eq: mockOrderItemsSelect,
        }),
      }
    }
    if (table === 'product_variants') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: mockVariantSelect,
          }),
        }),
        update: vi.fn().mockReturnValue({
          eq: mockVariantUpdate,
        }),
      }
    }
    return {
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: null, error: null }),
    }
  }),
}

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseAdmin),
}))

const { updateOrderAction } = await import('@/app/admin/ordenes/[id]/actions')

function setAdminUser() {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null })
  mockProfileSelect.mockResolvedValue({ data: { role: 'admin' }, error: null })
}

function setNonAdminUser() {
  mockGetUser.mockResolvedValue({ data: { user: { id: 'user-2' } }, error: null })
  mockProfileSelect.mockResolvedValue({ data: { role: 'customer' }, error: null })
}

function setNoUser() {
  mockGetUser.mockResolvedValue({ data: { user: null }, error: null })
  mockProfileSelect.mockResolvedValue({ data: null, error: null })
}

describe('updateOrderAction', () => {
  const payload = { status: 'enviado' as const, tracking_number: 'TRK123', admin_notes: '' }

  beforeEach(() => {
    vi.clearAllMocks()
    mockOrderUpdate.mockResolvedValue({ data: null, error: null })
    mockOrderSelect.mockResolvedValue({ data: { status: 'nueva' }, error: null })
    mockOrderItemsSelect.mockResolvedValue({ data: [], error: null })
    mockVariantUpdate.mockResolvedValue({ data: null, error: null })
  })

  it('returns error when no user session', async () => {
    setNoUser()
    const result = await updateOrderAction('order-1', payload)
    expect(result).toEqual({ error: 'No autorizado' })
    expect(mockOrderUpdate).not.toHaveBeenCalled()
  })

  it('returns error when user is not admin', async () => {
    setNonAdminUser()
    const result = await updateOrderAction('order-1', payload)
    expect(result).toEqual({ error: 'No autorizado' })
    expect(mockOrderUpdate).not.toHaveBeenCalled()
  })

  it('updates the order when user is admin', async () => {
    setAdminUser()
    const result = await updateOrderAction('order-1', payload)
    expect(result).toEqual({ error: '' })
    expect(mockOrderUpdate).toHaveBeenCalledWith('id', 'order-1')
  })

  it('restores stock when cancelling an order in "nueva" status', async () => {
    setAdminUser()
    mockOrderSelect.mockResolvedValue({ data: { status: 'nueva' }, error: null })
    mockOrderItemsSelect.mockResolvedValue({
      data: [{ variant_id: 'var-1', quantity: 3 }],
      error: null,
    })
    mockVariantSelect.mockResolvedValue({ data: { stock: 10 }, error: null })

    await updateOrderAction('order-1', { ...payload, status: 'cancelado' })

    expect(mockVariantUpdate).toHaveBeenCalledWith('id', 'var-1')
  })

  it('does not restore stock when cancelling an already-cancelled order', async () => {
    setAdminUser()
    mockOrderSelect.mockResolvedValue({ data: { status: 'cancelado' }, error: null })

    await updateOrderAction('order-1', { ...payload, status: 'cancelado' })

    expect(mockVariantUpdate).not.toHaveBeenCalled()
  })

  it('does not restore stock for items without variant_id', async () => {
    setAdminUser()
    mockOrderSelect.mockResolvedValue({ data: { status: 'nueva' }, error: null })
    mockOrderItemsSelect.mockResolvedValue({
      data: [{ variant_id: null, quantity: 1 }],
      error: null,
    })

    await updateOrderAction('order-1', { ...payload, status: 'cancelado' })

    expect(mockVariantUpdate).not.toHaveBeenCalled()
  })
})
