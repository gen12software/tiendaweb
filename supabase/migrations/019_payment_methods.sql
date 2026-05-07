-- 1. Agregar payment_method a orders
alter table public.orders add column if not exists payment_method text;

-- 2. Actualizar CHECK constraint de status para incluir pago_pendiente
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('pago_pendiente', 'nueva', 'en_preparacion', 'enviado', 'listo_para_retirar', 'entregado', 'cancelado'));

-- 3. Agregar configuración de métodos de pago a site_config
insert into public.site_config (key, value) values
  ('payment_methods_enabled', 'mercadopago'),
  ('transfer_cbu',            ''),
  ('transfer_alias',          ''),
  ('transfer_message',        '')
on conflict (key) do nothing;
