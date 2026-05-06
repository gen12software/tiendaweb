insert into public.site_config (key, value) values
  ('announcement_1',  ''),
  ('announcement_2',  ''),
  ('announcement_3',  ''),
  ('announcement_4',  ''),
  ('announcement_5',  ''),
  ('announcement_6',  ''),
  ('announcement_7',  ''),
  ('announcement_8',  ''),
  ('announcement_9',  ''),
  ('announcement_10', '')
on conflict (key) do nothing;
