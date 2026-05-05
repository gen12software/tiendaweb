-- Claves de contacto en site_config
insert into public.site_config (key, value) values
  ('contact_email',     'contacto@mitienda.com'),
  ('whatsapp_number',   '5491100000000'),
  ('whatsapp_message',  'Hola, me comunico desde el sitio web y quisiera hacer una consulta.'),
  ('contact_schedule',  'Lunes a viernes de 9 a 18 hs.')
on conflict (key) do nothing;
