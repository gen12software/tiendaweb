insert into public.site_config (key, value) values ('low_stock_threshold', '5')
  on conflict (key) do nothing;
