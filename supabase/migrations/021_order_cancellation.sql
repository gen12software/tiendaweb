ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_requested_at TIMESTAMPTZ;

-- Actualizar check constraint para incluir el nuevo estado
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('pago_pendiente', 'nueva', 'en_preparacion', 'enviado', 'listo_para_retirar', 'entregado', 'arrepentimiento_solicitado', 'cancelado'));
