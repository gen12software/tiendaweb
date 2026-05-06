-- Descuento de stock atómico para prevenir race conditions
create or replace function public.decrement_variant_stock(
  p_variant_id uuid,
  p_quantity int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  current_stock int;
begin
  select stock into current_stock
  from public.product_variants
  where id = p_variant_id
  for update;

  if current_stock < p_quantity then
    raise exception 'stock_insuficiente' using errcode = 'P0001';
  end if;

  update public.product_variants
  set stock = stock - p_quantity
  where id = p_variant_id;
end;
$$;
