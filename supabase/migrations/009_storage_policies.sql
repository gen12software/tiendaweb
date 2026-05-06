-- Bucket product-images: público para lectura, autenticados para escritura
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Lectura pública
create policy "product-images: lectura pública"
on storage.objects for select
using ( bucket_id = 'product-images' );

-- Upload para usuarios autenticados
create policy "product-images: upload autenticado"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'product-images' );

-- Update para usuarios autenticados
create policy "product-images: update autenticado"
on storage.objects for update
to authenticated
using ( bucket_id = 'product-images' );

-- Delete para usuarios autenticados
create policy "product-images: delete autenticado"
on storage.objects for delete
to authenticated
using ( bucket_id = 'product-images' );
