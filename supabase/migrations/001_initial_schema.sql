-- ============================================================
-- TABLAS
-- ============================================================

create table public.plans (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  description      text,
  price            numeric(10, 2) not null,
  duration_days    int not null,
  features         text[],
  is_active        boolean not null default true,
  is_featured      boolean not null default false,
  created_at       timestamptz not null default now()
);

create table public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  full_name        text,
  role             text not null default 'user' check (role in ('user', 'admin')),
  plan_id          uuid references public.plans(id) on delete set null,
  plan_expires_at  timestamptz,
  created_at       timestamptz not null default now()
);

create table public.payments (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references public.profiles(id) on delete cascade,
  plan_id          uuid not null references public.plans(id) on delete restrict,
  amount           numeric(10, 2) not null,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'manual')),
  mp_payment_id    text,
  mp_preference_id text,
  created_at       timestamptz not null default now()
);

create table public.content (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  description      text,
  video_url        text,
  category         text,
  duration_minutes int,
  sort_order       int not null default 0,
  is_active        boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- TRIGGER: crea profile automáticamente al registrar usuario
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.plans    enable row level security;
alter table public.payments enable row level security;
alter table public.content  enable row level security;

-- Helper: devuelve true si el usuario autenticado es admin
create or replace function public.is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Helper: devuelve true si el usuario tiene plan activo y no vencido
create or replace function public.has_active_plan()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and plan_id is not null
      and (plan_expires_at is null or plan_expires_at > now())
  );
$$;

-- ---- profiles ----

create policy "profiles: usuario lee su propio perfil"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles: usuario edita su propio perfil"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "profiles: admin gestiona todos"
  on public.profiles for all
  using (public.is_admin());

-- ---- plans ----

create policy "plans: cualquiera lee planes activos"
  on public.plans for select
  using (is_active = true or public.is_admin());

create policy "plans: solo admin crea"
  on public.plans for insert
  with check (public.is_admin());

create policy "plans: solo admin edita"
  on public.plans for update
  using (public.is_admin());

create policy "plans: solo admin elimina"
  on public.plans for delete
  using (public.is_admin());

-- ---- payments ----

create policy "payments: usuario ve sus propios pagos"
  on public.payments for select
  using (auth.uid() = user_id or public.is_admin());

create policy "payments: usuario crea sus propios pagos"
  on public.payments for insert
  with check (auth.uid() = user_id);

create policy "payments: admin gestiona todos"
  on public.payments for all
  using (public.is_admin());

-- ---- content ----

create policy "content: usuario con plan activo lee contenido activo"
  on public.content for select
  using (
    (is_active = true and public.has_active_plan())
    or public.is_admin()
  );

create policy "content: solo admin inserta"
  on public.content for insert
  with check (public.is_admin());

create policy "content: solo admin edita"
  on public.content for update
  using (public.is_admin());

create policy "content: solo admin elimina"
  on public.content for delete
  using (public.is_admin());
