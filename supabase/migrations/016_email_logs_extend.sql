-- ============================================================
-- Extender email_logs para deduplicación de emails de órdenes
-- ============================================================
-- user_id pasa a ser nullable para soportar órdenes de invitados
-- reference_id identifica el recurso (order_id, variant_id, etc.)
-- ============================================================

-- Hacer user_id nullable (órdenes de invitado no tienen user_id)
alter table public.email_logs alter column user_id drop not null;

-- Agregar reference_id para identificar el recurso asociado al email
alter table public.email_logs add column if not exists reference_id text;

-- Índice único para deduplicación por referencia (órdenes, variantes)
-- Partial index: solo aplica cuando reference_id está presente
create unique index if not exists email_logs_ref_type_date_idx
  on public.email_logs (reference_id, email_type, sent_date)
  where reference_id is not null;

-- Valores válidos de email_type (comentario de referencia):
-- 'expiration_7d'       — aviso de vencimiento de plan 7 días antes
-- 'expiration_1d'       — aviso de vencimiento de plan 1 día antes
-- 'welcome'             — bienvenida al registrarse
-- 'order_confirmation'  — confirmación de orden (ref: order_id)
-- 'payment_confirmation'— confirmación de pago suscripción (ref: payment_id)
-- 'order_status_en_preparacion' — cambio de estado (ref: order_id)
-- 'order_status_enviado'        — cambio de estado (ref: order_id)
-- 'order_status_entregado'      — cambio de estado (ref: order_id)
-- 'order_status_listo_para_retirar' — cambio de estado (ref: order_id)
-- 'order_cancelled'     — cancelación de orden (ref: order_id)
-- 'low_stock_alert'     — stock bajo (ref: variant_id)
