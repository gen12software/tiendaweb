alter table public.orders
  add column if not exists mp_preference_id text,
  add column if not exists mp_payment_id    text;

create index if not exists orders_mp_preference_id_idx on public.orders (mp_preference_id);
