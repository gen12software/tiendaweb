-- ============================================================
-- SEED: datos de prueba completos
-- Ejecutar en Supabase SQL Editor o con: supabase db reset --seed
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- SITE CONFIG (upsert para no duplicar)
-- ────────────────────────────────────────────────────────────
insert into public.site_config (key, value) values
  ('site_name',              'TiendaDemo'),
  ('logo_url',               ''),
  ('primary_color',          '#4f46e5'),
  ('color_secondary',        '#6366f1'),
  ('color_accent',           '#f59e0b'),
  ('color_background',       '#ffffff'),
  ('color_surface',          '#f9fafb'),
  ('font_heading',           ''),
  ('font_body',              ''),
  ('favicon_url',            ''),
  ('social_instagram',       'https://instagram.com/tiendademo'),
  ('social_facebook',        'https://facebook.com/tiendademo'),
  ('social_tiktok',          ''),
  ('currency_symbol',        '$'),
  ('currency_locale',        'es-AR'),
  ('free_shipping_threshold','5000'),
  ('hero_title',             'Todo lo que necesitás, en un solo lugar'),
  ('hero_description',       'Productos de calidad con envío a todo el país.'),
  ('hero_image_url',         ''),
  ('hero_cta_text',          'Ver productos'),
  ('hero_cta_url',           '/productos'),
  ('home_show_featured',     'true'),
  ('home_show_categories',   'true'),
  ('home_show_cta',          'true'),
  ('home_cta_title',         '¿Querés recibir ofertas?'),
  ('home_cta_subtitle',      'Suscribite y recibí descuentos exclusivos cada semana.'),
  ('home_cta_link',          '/productos'),
  ('slogan',                 'Calidad que se nota'),
  ('terms_url',              '/terminos'),
  ('privacy_url',            '/privacidad'),
  ('whatsapp_number',        '5491112345678'),
  ('contact_email',          'contacto@tiendademo.com')
on conflict (key) do update set value = excluded.value;

-- ────────────────────────────────────────────────────────────
-- PLANES (módulo suscripciones)
-- ────────────────────────────────────────────────────────────
insert into public.plans (id, name, description, price, duration_days, features, is_active, is_featured) values
  ('11111111-0000-0000-0000-000000000001', 'Básico',    'Acceso a contenido esencial',       2990, 30,  array['Acceso a 10 cursos', 'Soporte por email'],                           true, false),
  ('11111111-0000-0000-0000-000000000002', 'Pro',       'Todo lo que necesitás para crecer', 5990, 30,  array['Acceso ilimitado', 'Soporte prioritario', 'Certificados'],           true, true),
  ('11111111-0000-0000-0000-000000000003', 'Anual Pro', 'El mejor valor del año',           49990, 365, array['Todo Pro', 'Precio especial anual', 'Acceso anticipado a novedades'], true, false)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- CATEGORÍAS
-- ────────────────────────────────────────────────────────────
insert into public.categories (id, name, slug, sort_order, is_active) values
  ('22222222-0000-0000-0000-000000000001', 'Electrónica',    'electronica',    1, true),
  ('22222222-0000-0000-0000-000000000002', 'Hogar',          'hogar',          2, true),
  ('22222222-0000-0000-0000-000000000003', 'Indumentaria',   'indumentaria',   3, true),
  ('22222222-0000-0000-0000-000000000004', 'Deportes',       'deportes',       4, true),
  ('22222222-0000-0000-0000-000000000005', 'Alimentos',      'alimentos',      5, true)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- PRODUCTOS
-- ────────────────────────────────────────────────────────────
insert into public.products (id, name, slug, description, price, compare_at_price, category_id, is_active, is_featured, sort_order) values
  ('33333333-0000-0000-0000-000000000001', 'Auriculares Bluetooth Pro',  'auriculares-bluetooth-pro',
   'Auriculares inalámbricos con cancelación de ruido activa, 30hs de batería y micrófono integrado.',
   12999, 18999, '22222222-0000-0000-0000-000000000001', true, true,  1),

  ('33333333-0000-0000-0000-000000000002', 'Smartwatch Serie 5',         'smartwatch-serie-5',
   'Reloj inteligente con monitor cardíaco, GPS, notificaciones y resistencia al agua.',
   24990, null,  '22222222-0000-0000-0000-000000000001', true, true,  2),

  ('33333333-0000-0000-0000-000000000003', 'Cargador USB-C 65W',         'cargador-usbc-65w',
   'Cargador rápido compatible con notebooks, tablets y celulares. Cable incluido.',
   3490,  null,  '22222222-0000-0000-0000-000000000001', true, false, 3),

  ('33333333-0000-0000-0000-000000000004', 'Juego de Sábanas 200 Hilos', 'sabanas-200-hilos',
   'Set de sábanas doble 200 hilos, 100% algodón. Incluye bajera, encimera y dos fundas.',
   5990,  7500,  '22222222-0000-0000-0000-000000000002', true, true,  1),

  ('33333333-0000-0000-0000-000000000005', 'Sartén Antiadherente 28cm',  'sarten-antiadherente-28cm',
   'Sartén de aluminio con recubrimiento antiadherente reforzado, apta para todo tipo de fuego.',
   4290,  null,  '22222222-0000-0000-0000-000000000002', true, false, 2),

  ('33333333-0000-0000-0000-000000000006', 'Remera Oversize Algodón',    'remera-oversize-algodon',
   'Remera de algodón peinado 240gr, corte oversize. Disponible en varios colores y talles.',
   2990,  null,  '22222222-0000-0000-0000-000000000003', true, false, 1),

  ('33333333-0000-0000-0000-000000000007', 'Zapatillas Running Air',     'zapatillas-running-air',
   'Zapatillas de running con suela de goma EVA, plantilla ergonómica y upper de mesh transpirable.',
   18500, 22000, '22222222-0000-0000-0000-000000000004', true, true,  1),

  ('33333333-0000-0000-0000-000000000008', 'Proteína Whey 1kg',          'proteina-whey-1kg',
   'Proteína de suero de leche concentrada, 24g de proteína por porción. Sabor chocolate.',
   8990,  null,  '22222222-0000-0000-0000-000000000005', true, false, 1)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- VARIANTES DE PRODUCTOS
-- ────────────────────────────────────────────────────────────

-- Auriculares: colores
insert into public.product_variants (id, product_id, name, options, price_modifier, stock, sku) values
  ('44444444-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', 'Negro',  '{"color":"Negro"}',  0,    15, 'AUR-BLU-NEG'),
  ('44444444-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000001', 'Blanco', '{"color":"Blanco"}', 0,    8,  'AUR-BLU-BLA'),
  ('44444444-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000001', 'Azul',   '{"color":"Azul"}',   500,  5,  'AUR-BLU-AZU')
on conflict (id) do nothing;

-- Remera: talles
insert into public.product_variants (id, product_id, name, options, price_modifier, stock, sku) values
  ('44444444-0000-0000-0000-000000000010', '33333333-0000-0000-0000-000000000006', 'S',  '{"talle":"S"}',  0, 20, 'REM-OVR-S'),
  ('44444444-0000-0000-0000-000000000011', '33333333-0000-0000-0000-000000000006', 'M',  '{"talle":"M"}',  0, 25, 'REM-OVR-M'),
  ('44444444-0000-0000-0000-000000000012', '33333333-0000-0000-0000-000000000006', 'L',  '{"talle":"L"}',  0, 18, 'REM-OVR-L'),
  ('44444444-0000-0000-0000-000000000013', '33333333-0000-0000-0000-000000000006', 'XL', '{"talle":"XL"}', 0, 10, 'REM-OVR-XL')
on conflict (id) do nothing;

-- Zapatillas: talles
insert into public.product_variants (id, product_id, name, options, price_modifier, stock, sku) values
  ('44444444-0000-0000-0000-000000000020', '33333333-0000-0000-0000-000000000007', '39', '{"talle":"39"}', 0, 5,  'ZAP-RUN-39'),
  ('44444444-0000-0000-0000-000000000021', '33333333-0000-0000-0000-000000000007', '40', '{"talle":"40"}', 0, 8,  'ZAP-RUN-40'),
  ('44444444-0000-0000-0000-000000000022', '33333333-0000-0000-0000-000000000007', '41', '{"talle":"41"}', 0, 10, 'ZAP-RUN-41'),
  ('44444444-0000-0000-0000-000000000023', '33333333-0000-0000-0000-000000000007', '42', '{"talle":"42"}', 0, 6,  'ZAP-RUN-42'),
  ('44444444-0000-0000-0000-000000000024', '33333333-0000-0000-0000-000000000007', '43', '{"talle":"43"}', 0, 3,  'ZAP-RUN-43')
on conflict (id) do nothing;

-- Smartwatch, sartén, proteína, cargador, sábanas: sin variantes → stock directo con una variante "Único"
insert into public.product_variants (id, product_id, name, options, price_modifier, stock, sku) values
  ('44444444-0000-0000-0000-000000000030', '33333333-0000-0000-0000-000000000002', 'Único', '{}', 0, 12, 'WATCH-S5'),
  ('44444444-0000-0000-0000-000000000031', '33333333-0000-0000-0000-000000000003', 'Único', '{}', 0, 30, 'CARG-65W'),
  ('44444444-0000-0000-0000-000000000032', '33333333-0000-0000-0000-000000000004', 'Único', '{}', 0, 20, 'SAB-200H'),
  ('44444444-0000-0000-0000-000000000033', '33333333-0000-0000-0000-000000000005', 'Único', '{}', 0, 15, 'SART-28'),
  ('44444444-0000-0000-0000-000000000034', '33333333-0000-0000-0000-000000000008', 'Único', '{}', 0, 40, 'PROT-1KG')
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- MÉTODOS DE ENVÍO
-- ────────────────────────────────────────────────────────────
insert into public.shipping_methods (id, name, price, estimated_days, is_active) values
  ('55555555-0000-0000-0000-000000000001', 'Envío estándar',     1500, 5,  true),
  ('55555555-0000-0000-0000-000000000002', 'Envío express',      2990, 2,  true),
  ('55555555-0000-0000-0000-000000000003', 'Retiro en sucursal', 0,    null, true)
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- ÓRDENES DE PRUEBA
-- ────────────────────────────────────────────────────────────
insert into public.orders (id, number, status, email, subtotal, shipping_total, total, shipping_address, shipping_method_id, public_token) values
  ('66666666-0000-0000-0000-000000000001',
   'ORD-000001', 'paid',
   'cliente1@ejemplo.com',
   12999, 1500, 14499,
   '{"full_name":"Ana García","email":"cliente1@ejemplo.com","phone":"1123456789","street":"Av. Corrientes 1234","city":"CABA","state":"Buenos Aires","postal_code":"1043","country":"Argentina"}',
   '55555555-0000-0000-0000-000000000001',
   'token-demo-001'),

  ('66666666-0000-0000-0000-000000000002',
   'ORD-000002', 'processing',
   'cliente2@ejemplo.com',
   27980, 0, 27980,
   '{"full_name":"Carlos Martínez","email":"cliente2@ejemplo.com","phone":"1134567890","street":"Belgrano 567","city":"Rosario","state":"Santa Fe","postal_code":"2000","country":"Argentina"}',
   '55555555-0000-0000-0000-000000000003',
   'token-demo-002'),

  ('66666666-0000-0000-0000-000000000003',
   'ORD-000003', 'payment_pending',
   'cliente3@ejemplo.com',
   8990, 1500, 10490,
   '{"full_name":"Laura López","email":"cliente3@ejemplo.com","phone":"1145678901","street":"San Martín 890","city":"Córdoba","state":"Córdoba","postal_code":"5000","country":"Argentina"}',
   '55555555-0000-0000-0000-000000000001',
   'token-demo-003'),

  ('66666666-0000-0000-0000-000000000004',
   'ORD-000004', 'shipped',
   'cliente4@ejemplo.com',
   18500, 2990, 21490,
   '{"full_name":"Martín Rodríguez","email":"cliente4@ejemplo.com","phone":"1156789012","street":"Rivadavia 321","city":"Mendoza","state":"Mendoza","postal_code":"5500","country":"Argentina"}',
   '55555555-0000-0000-0000-000000000002',
   'token-demo-004'),

  ('66666666-0000-0000-0000-000000000005',
   'ORD-000005', 'cancelled',
   'cliente5@ejemplo.com',
   5990, 1500, 7490,
   '{"full_name":"Sofía Díaz","email":"cliente5@ejemplo.com","phone":"1167890123","street":"Mitre 456","city":"Mar del Plata","state":"Buenos Aires","postal_code":"7600","country":"Argentina"}',
   '55555555-0000-0000-0000-000000000001',
   'token-demo-005')
on conflict (id) do nothing;

-- ────────────────────────────────────────────────────────────
-- ORDER ITEMS
-- ────────────────────────────────────────────────────────────
insert into public.order_items (order_id, product_id, variant_id, quantity, unit_price, total_price, snapshot) values
  ('66666666-0000-0000-0000-000000000001', '33333333-0000-0000-0000-000000000001', '44444444-0000-0000-0000-000000000001',
   1, 12999, 12999, '{"name":"Auriculares Bluetooth Pro","variant_name":"Negro"}'),

  ('66666666-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000032',
   1, 5990, 5990, '{"name":"Juego de Sábanas 200 Hilos","variant_name":"Único"}'),
  ('66666666-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000006', '44444444-0000-0000-0000-000000000011',
   2, 2990, 5980, '{"name":"Remera Oversize Algodón","variant_name":"M"}'),
  ('66666666-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000005', '44444444-0000-0000-0000-000000000033',
   1, 4290, 4290, '{"name":"Sartén Antiadherente 28cm","variant_name":"Único"}'),
  ('66666666-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000003', '44444444-0000-0000-0000-000000000031',
   1, 3490, 3490, '{"name":"Cargador USB-C 65W","variant_name":"Único"}'),
  ('66666666-0000-0000-0000-000000000002', '33333333-0000-0000-0000-000000000002', '44444444-0000-0000-0000-000000000030',
   1, 4230, 4230, '{"name":"Smartwatch Serie 5","variant_name":"Único"}'),

  ('66666666-0000-0000-0000-000000000003', '33333333-0000-0000-0000-000000000008', '44444444-0000-0000-0000-000000000034',
   1, 8990, 8990, '{"name":"Proteína Whey 1kg","variant_name":"Único"}'),

  ('66666666-0000-0000-0000-000000000004', '33333333-0000-0000-0000-000000000007', '44444444-0000-0000-0000-000000000022',
   1, 18500, 18500, '{"name":"Zapatillas Running Air","variant_name":"41"}'),

  ('66666666-0000-0000-0000-000000000005', '33333333-0000-0000-0000-000000000004', '44444444-0000-0000-0000-000000000032',
   1, 5990, 5990, '{"name":"Juego de Sábanas 200 Hilos","variant_name":"Único"}');

-- ────────────────────────────────────────────────────────────
-- CONTENIDO (módulo suscripciones)
-- ────────────────────────────────────────────────────────────
insert into public.content (id, title, description, category, duration_minutes, sort_order, is_active) values
  ('77777777-0000-0000-0000-000000000001', 'Introducción al módulo',       'Primeros pasos y configuración inicial.',         'Básico',     10, 1, true),
  ('77777777-0000-0000-0000-000000000002', 'Conceptos avanzados',          'Approfundización en los temas del módulo.',       'Avanzado',   25, 2, true),
  ('77777777-0000-0000-0000-000000000003', 'Casos de uso reales',          'Ejemplos prácticos aplicados a proyectos.',       'Avanzado',   40, 3, true),
  ('77777777-0000-0000-0000-000000000004', 'Optimización y performance',   'Técnicas para mejorar el rendimiento.',           'Pro',        35, 4, true),
  ('77777777-0000-0000-0000-000000000005', 'Integración con APIs externas','Cómo conectar servicios de terceros.',            'Pro',        30, 5, true)
on conflict (id) do nothing;
