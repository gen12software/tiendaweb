import { createClient } from '@/lib/supabase/server'
import ProductCard from '@/components/products/product-card'
import { getSiteConfig } from '@/lib/site-config'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Productos' }

const PAGE_SIZE = 24

interface Props {
  searchParams: Promise<{ categoria?: string; q?: string; orden?: string; page?: string; oferta?: string }>
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

  if (params.oferta === '1') {
    query = query.not('compare_at_price', 'is', null).gt('compare_at_price', 0)
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-10 pb-16">
      {/* Header de sección */}
      <div className="mb-8">
        <h1 className="font-heading text-4xl font-bold mb-6">
          {params.categoria
            ? (categories?.find(c => c.slug === params.categoria)?.name ?? 'Productos')
            : 'Productos'}
        </h1>

        {/* Chips de categoría + ofertas */}
        <div className="flex flex-wrap gap-2 mb-5">
          <a
            href="/productos"
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              !params.categoria && !params.oferta
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
          >
            Todos
          </a>
          {categories?.map((cat) => (
            <a
              key={cat.id}
              href={`/productos?categoria=${cat.slug}${params.q ? `&q=${params.q}` : ''}${params.orden ? `&orden=${params.orden}` : ''}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                params.categoria === cat.slug
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {cat.name}
            </a>
          ))}
          <a
            href={`/productos?oferta=1${params.q ? `&q=${params.q}` : ''}${params.orden ? `&orden=${params.orden}` : ''}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              params.oferta === '1'
                ? 'text-white'
                : 'bg-muted text-muted-foreground hover:bg-muted/70'
            }`}
            style={params.oferta === '1' ? { backgroundColor: 'var(--color-accent, #f59e0b)' } : {}}
          >
            🏷️ Ofertas
          </a>
        </div>

        {/* Búsqueda y orden */}
        <form className="flex gap-2 flex-wrap">
          {params.categoria && <input type="hidden" name="categoria" value={params.categoria} />}
          {params.oferta && <input type="hidden" name="oferta" value={params.oferta} />}
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Buscar productos..."
            className="border border-border rounded-full px-4 py-2 text-sm bg-background w-52 focus:outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <select
            name="orden"
            defaultValue={params.orden}
            className="border border-border rounded-full px-4 py-2 text-sm bg-background focus:outline-none"
          >
            <option value="">Relevancia</option>
            <option value="precio_asc">Menor precio</option>
            <option value="precio_desc">Mayor precio</option>
          </select>
          <button
            type="submit"
            className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-85"
            style={{ backgroundColor: 'var(--color-primary)' }}
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Grid */}
      {!products?.length ? (
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-lg font-medium">No se encontraron productos</p>
          <a href="/productos" className="text-sm mt-2 inline-block hover:underline">Limpiar filtros</a>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-8">
            {products.map((p) => (
              <ProductCard key={p.id} product={p as any} currencySymbol={config.currency_symbol} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-12">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <a
                  key={p}
                  href={`/productos?${new URLSearchParams({ ...params, page: String(p) })}`}
                  className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                    p === page
                      ? 'text-white'
                      : 'hover:bg-muted text-muted-foreground'
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
  )
}
