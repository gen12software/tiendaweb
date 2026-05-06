insert into public.site_config (key, value) values
  ('header_bg_color',         '#0a0a0a'),
  ('header_text_color',       '#ffffff'),
  ('announcement_bg_color',   '#111111'),
  ('announcement_text_color', '#ffffff')
on conflict (key) do nothing;
