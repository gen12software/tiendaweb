-- ============================================================
-- TABLA email_logs: evita duplicados en envíos automáticos
-- ============================================================

create table public.email_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  email_type text not null,   -- 'expiration_7d' | 'expiration_1d' | etc.
  sent_at    timestamptz not null default now(),
  sent_date  date not null default current_date,
  -- Un usuario solo recibe cada tipo de aviso una vez por día
  unique (user_id, email_type, sent_date)
);

alter table public.email_logs enable row level security;

-- Solo el service role (cron / backend) puede leer y escribir
create policy "email_logs: solo service role"
  on public.email_logs for all
  using (false);

-- Índice para búsquedas rápidas por tipo y fecha
create index email_logs_type_date_idx
  on public.email_logs (email_type, sent_date);
