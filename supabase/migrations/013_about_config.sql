insert into public.site_config (key, value) values
  ('about_title',        'Quiénes Somos'),
  ('about_subtitle',     ''),
  ('about_description',  ''),
  ('about_image_url',    ''),
  ('about_value1_icon',  '⭐'),
  ('about_value1_title', ''),
  ('about_value1_text',  ''),
  ('about_value2_icon',  '🤝'),
  ('about_value2_title', ''),
  ('about_value2_text',  ''),
  ('about_value3_icon',  '🚀'),
  ('about_value3_title', ''),
  ('about_value3_text',  '')
on conflict (key) do nothing;
