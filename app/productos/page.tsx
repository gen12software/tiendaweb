import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/product-card'
import { getSiteConfig } from '@/lib/site-config'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Productos' }

const PAGE_SIZE = 24

interface Props {
  searchParams: Promise<{ categoria?: string; q?: string; orden?: string; page?: string }>
}

export default async function ProductosPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()
  const config = await getSiteConfig()

  const page = parseInt(params.page ?? '1', 10)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('products')
    .select('*, product_images(id, url, sort_order), product_variants(id, name, options, price_modifier, stock, sku), categories(id, name, slug)', { count: 'exact' })
    .eq('is_active', true)

  if (params.categoria) {
    const { data: cat } = await supabase.from('categories').select('id').eq('slug', params.categoria).single()
    if (cat) query = query.eq('category_id', cat.id)
  }

  if (params.q) {
    query = query.ilike('name', `%${params.q}%`)
  }

  switch (params.orden) {
    case 'precio_asc': query = query.order('price', { ascending: true }); break
    case 'precio_desc': query = query.order('price', { ascending: false }); break
    default: query = query.order('sort_order').order('created_at', { ascending: false })
  }

  query = query.range(from, to)

  const { data: products, count } = await query
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <form className="flex gap-2 flex-wrap">
          {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar productos..."
            className="border rounded-lg px-3 py-1.5 text-sm bg-background w-48"
          />
          <select
            name="orden"
            defaultValue={params.orden}
            className="border rounded-lg px-3 py-1.5 text-sm bg-background"
          >
            <option value="">Relevancia</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </select>
          <button type="submit" className="px-3 py-1.5 rounded-lg text-sm text-white" style={{ backgroundColor: 'var(--color-primary)' }}>
            Buscar
          </button>
        </form>
      </div>

      <div className="flex gap-6">
        {/* Sidebar categorías */}
        <aside className="hidden md:block w-48 shrink-0">
          <p className="font-semibold text-sm mb-3">Categorías</p>
          <nav className="flex flex-col gap-1">
            <a
              href="/productos"
              className={`text-sm px-2 py-1.5 rounded-md transition-colors ${!params.categoria ? 'font-medium bg-muted' : 'text-muted-foreground hover:bg-muted'}`}
            >
              Todos
            </a>
            {categories?.map((cat) => (
              <a
                key={cat.id}
                href={`/productos?categoria=${cat.slug}`}
                className={`text-sm px-2 py-1.5 rounded-md transition-colors ${params.categoria === cat.slug ? 'font-medium bg-muted' : 'text-muted-foreground hover:bg-muted'}`}
              >
                {cat.name}
              </a>
            ))}
          </nav>
        </aside>

        {/* Grid */}
        <div className="flex-1">
          {!products?.length ? (
            <div className="text-center py-16 text-muted-foreground">
              No se encontraron productos.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p as any} currencySymbol={config.currency_symbol} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a
                      key={p}
                      href={`/productos?${new URLSearchParams({ ...params, page: String(p) })}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-md text-sm border transition-colors ${
                        p === page ? 'text-white border-transparent' : 'hover:bg-muted'
                      }`}
                      style={p === page ? { backgroundColor: 'var(--color-primary)' } : {}}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
