-- 1. Elimina el constraint viejo
alter table public.orders drop constraint if exists orders_status_check;

-- 2. Migra los datos al nuevo esquema
update public.orders set status = 'nueva'     where status in ('pending', 'payment_pending', 'paid', 'processing');
update public.orders set status = 'enviado'   where status = 'shipped';
update public.orders set status = 'entregado' where status = 'delivered';
update public.orders set status = 'cancelado' where status in ('cancelled', 'payment_approved_stock_error');

-- 3. Agrega el nuevo constraint (ahora todos los datos son válidos)
alter table public.orders add constraint orders_status_check
  check (status in ('nueva', 'en_preparacion', 'enviado', 'listo_para_retirar', 'entregado', 'cancelado'));
