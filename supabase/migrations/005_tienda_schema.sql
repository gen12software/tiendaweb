-- ============================================================
-- CATEGORÍAS
-- ============================================================

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  image_url   text,
  sort_order  int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ============================================================
-- PRODUCTOS
-- ============================================================

create table public.products (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  description      text,
  price            numeric(10, 2) not null,
  compare_at_price numeric(10, 2),
  category_id      uuid references public.categories(id) on delete set null,
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  sort_order       int not null default 0,
  created_at       timestamptz not null default now()
);

create table public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  url        text not null,
  sort_order int not null default 0
);

create table public.product_variants (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products(id) on delete cascade,
  name           text not null,
  options        jsonb not null default '{}',
  price_modifier numeric(10, 2) not null default 0,
  stock          int not null default 0,
  sku            text,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- MÉTODOS DE ENVÍO
-- ============================================================

create table public.shipping_methods (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  price          numeric(10, 2) not null default 0,
  estimated_days int,
  is_active      boolean not null default true,
  created_at     timestamptz not null default now()
);

-- ============================================================
-- ÓRDENES
-- ============================================================

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  number             text not null unique,
  status             text not null default 'pending' check (
    status in (
      'pending', 'payment_pending', 'paid',
      'processing', 'shipped', 'delivered',
      'cancelled', 'payment_approved_stock_error'
    )
  ),
  email              text not null,
  user_id            uuid references public.profiles(id) on delete set null,
  subtotal           numeric(10, 2) not null,
  shipping_total     numeric(10, 2) not null default 0,
  total              numeric(10, 2) not null,
  shipping_address   jsonb,
  shipping_method_id uuid references public.shipping_methods(id) on delete set null,
  notes              text,
  tracking_number    text,
  admin_notes        text,
  public_token       text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  product_id  uuid references public.products(id) on delete set null,
  variant_id  uuid references public.product_variants(id) on delete set null,
  quantity    int not null,
  unit_price  numeric(10, 2) not null,
  total_price numeric(10, 2) not null,
  snapshot    jsonb not null default '{}'
);

-- ============================================================
-- CARRITO, DIRECCIONES, WISHLIST
-- ============================================================

create table public.carts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references public.profiles(id) on delete cascade,
  session_token text,
  items         jsonb not null default '[]',
  updated_at    timestamptz not null default now()
);

create table public.addresses (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  label      text not null default 'Principal',
  address    jsonb not null default '{}',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.wishlist (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);

-- ============================================================
-- FK opcional order_id en payments
-- ============================================================

alter table public.payments
  add column if not exists order_id uuid references public.orders(id) on delete set null;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.categories       enable row level security;
alter table public.products         enable row level security;
alter table public.product_images   enable row level security;
alter table public.product_variants enable row level security;
alter table public.shipping_methods enable row level security;
alter table public.orders           enable row level security;
alter table public.order_items      enable row level security;
alter table public.carts            enable row level security;
alter table public.addresses        enable row level security;
alter table public.wishlist         enable row level security;

-- ---- categories ----
create policy "categories: lectura pública activas"
  on public.categories for select
  using (is_active = true or public.is_admin());

create policy "categories: admin escritura"
  on public.categories for all
  using (public.is_admin());

-- ---- products ----
create policy "products: lectura pública activos"
  on public.products for select
  using (is_active = true or public.is_admin());

create policy "products: admin escritura"
  on public.products for all
  using (public.is_admin());

-- ---- product_images ----
create policy "product_images: lectura pública"
  on public.product_images for select
  using (true);

create policy "product_images: admin escritura"
  on public.product_images for all
  using (public.is_admin());

-- ---- product_variants ----
create policy "product_variants: lectura pública"
  on public.product_variants for select
  using (true);

create policy "product_variants: admin escritura"
  on public.product_variants for all
  using (public.is_admin());

-- ---- shipping_methods ----
create policy "shipping_methods: lectura pública activos"
  on public.shipping_methods for select
  using (is_active = true or public.is_admin());

create policy "shipping_methods: admin escritura"
  on public.shipping_methods for all
  using (public.is_admin());

-- ---- orders ----
create policy "orders: admin gestiona todos"
  on public.orders for all
  using (public.is_admin());

create policy "orders: owner por user_id"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "orders: consulta pública por token"
  on public.orders for select
  using (true);

-- ---- order_items ----
create policy "order_items: admin gestiona todos"
  on public.order_items for all
  using (public.is_admin());

create policy "order_items: lectura a dueño de orden"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- ---- carts ----
create policy "carts: usuario gestiona su carrito"
  on public.carts for all
  using (auth.uid() = user_id or user_id is null);

-- ---- addresses ----
create policy "addresses: usuario gestiona sus direcciones"
  on public.addresses for all
  using (auth.uid() = user_id or public.is_admin());

-- ---- wishlist ----
create policy "wishlist: usuario gestiona su wishlist"
  on public.wishlist for all
  using (auth.uid() = user_id);

-- ============================================================
-- FUNCIÓN: número de orden secuencial legible
-- ============================================================

create sequence if not exists public.order_number_seq start 1000;

create or replace function public.generate_order_number()
returns trigger language plpgsql as $$
begin
  new.number := 'ORD-' || lpad(nextval('public.order_number_seq')::text, 6, '0');
  return new;
end;
$$;

create trigger set_order_number
  before insert on public.orders
  for each row
  when (new.number is null or new.number = '')
  execute function public.generate_order_number();

-- trigger updated_at en orders
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();
