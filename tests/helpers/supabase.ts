import { vi } from 'vitest'

export function createSupabaseMock() {
  const mock: Record<string, unknown> = {}

  const builder = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    upsert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    mockResolvedValue: (val: unknown) => {
      builder.single = vi.fn().mockResolvedValue(val)
      return builder
    },
  }

  // Make the builder itself thenable (awaitable) with a default resolved value
  const makeThenable = (defaultValue: unknown = { data: null, error: null }) => {
    const b = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(defaultValue),
      then: (resolve: (v: unknown) => unknown) => Promise.resolve(defaultValue).then(resolve),
    }
    return b
  }

  mock.from = vi.fn().mockReturnValue(makeThenable())
  mock.rpc = vi.fn().mockResolvedValue({ data: null, error: null })
  mock.auth = {
    getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    admin: {
      getUserById: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  }

  return mock
}

/**
 * Creates a Supabase mock where specific table calls return configured values.
 * Usage: createTableMock({ orders: { insert: { data: { id: '1', number: 100 }, error: null } } })
 */
export function createTableMock(config: Record<string, Record<string, unknown>>) {
  const client = createSupabaseMock()

  ;(client.from as ReturnType<typeof vi.fn>).mockImplementation((table: string) => {
    const tableConfig = config[table] ?? {}

    const b = {
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      neq: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue(tableConfig.single ?? { data: null, error: null }),
      then: (resolve: (v: unknown) => unknown) =>
        Promise.resolve(tableConfig.default ?? { data: null, error: null }).then(resolve),
    }

    if (tableConfig.insert) {
      b.insert = vi.fn().mockReturnValue({
        ...b,
        select: vi.fn().mockReturnValue({
          ...b,
          single: vi.fn().mockResolvedValue(tableConfig.insert),
        }),
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve(tableConfig.insert).then(resolve),
      })
    }

    if (tableConfig.update) {
      b.update = vi.fn().mockReturnValue({
        ...b,
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve(tableConfig.update).then(resolve),
      })
    }

    if (tableConfig.select) {
      b.select = vi.fn().mockReturnValue({
        ...b,
        single: vi.fn().mockResolvedValue(tableConfig.single ?? { data: null, error: null }),
        in: vi.fn().mockResolvedValue(tableConfig.select),
        then: (resolve: (v: unknown) => unknown) =>
          Promise.resolve(tableConfig.select).then(resolve),
      })
    }

    return b
  })

  return client
}
