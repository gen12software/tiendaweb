alter table public.products
  add column if not exists stock int not null default 0;
