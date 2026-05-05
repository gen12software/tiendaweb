-- ============================================================
-- TABLA site_config
-- ============================================================

create table public.site_config (
  key        text primary key,
  value      text
);

-- Filas iniciales
insert into public.site_config (key, value) values
  ('site_name',         'Mi Tienda'),
  ('logo_url',          ''),
  ('primary_color',     '#4f46e5'),
  ('hero_title',        'Bienvenido a nuestra plataforma'),
  ('hero_description',  'Accedé a todo el contenido con un plan.');

-- RLS
alter table public.site_config enable row level security;

-- Cualquiera puede leer
create policy "site_config: lectura pública"
  on public.site_config for select
  using (true);

-- Solo admin puede editar
create policy "site_config: solo admin escribe"
  on public.site_config for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );
