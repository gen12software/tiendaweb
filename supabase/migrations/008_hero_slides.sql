-- Tabla de slides del carrusel hero
CREATE TABLE IF NOT EXISTS hero_slides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url text NOT NULL,
  title text DEFAULT '',
  subtitle text DEFAULT '',
  cta_text text DEFAULT 'Ver productos',
  cta_url text DEFAULT '/productos',
  sort_order int DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

-- Lectura pública solo slides activas
CREATE POLICY "hero_slides_public_read" ON hero_slides
  FOR SELECT USING (is_active = true);

-- Admin puede hacer todo
CREATE POLICY "hero_slides_admin_all" ON hero_slides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
