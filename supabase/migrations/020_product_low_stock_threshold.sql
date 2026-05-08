alter table public.products
  add column if not exists low_stock_threshold int null;
