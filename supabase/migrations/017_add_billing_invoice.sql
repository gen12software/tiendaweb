-- Add billing_data and invoice_url columns to orders
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS billing_data  JSONB    NULL,
  ADD COLUMN IF NOT EXISTS invoice_url   TEXT     NULL;

-- Storage bucket for invoices (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('invoices', 'invoices', false)
ON CONFLICT (id) DO NOTHING;

-- Only service-role (admin) can manage invoice files
CREATE POLICY "admin invoices upload"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'invoices'
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) = 'admin'
  );

CREATE POLICY "admin invoices read"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) = 'admin'
  );

CREATE POLICY "admin invoices update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'invoices'
    AND (
      SELECT role FROM public.profiles WHERE id = auth.uid()
    ) = 'admin'
  );
