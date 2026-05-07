## Why

Los emails son la única comunicación asincrónica entre la tienda y el comprador — son el recibo, la confirmación, el tracking, la confianza. Hoy el sistema tiene bugs críticos que impiden que los mails lleguen: el cliente Resend se inicializa como `null` si la API key no está configurada y falla silenciosamente, el welcome email nunca se envía porque no tiene `await`, y cuando el webhook reintenta un pago el comprador recibe mails duplicados. Además del sistema roto, hay eventos importantes del ciclo de vida de una orden que hoy no tienen comunicación — el comprador no sabe cuándo su pedido fue preparado, despachado ni entregado.

Este change tiene dos partes: **arreglar lo que está roto** y **agregar los emails que faltan** para cubrir el ciclo completo de una orden.

## What Changes

### Parte 1 — Fixes al sistema existente

- **API key inválida o sandbox**: agregar validación al arrancar que detecte si `RESEND_API_KEY` está ausente o es una test key, y loguee un error claro (no un `console.warn` silencioso)
- **Welcome email sin `await`**: en `app/auth/callback/route.ts`, agregar `await` y manejo de error explícito para que el envío no sea fire-and-forget
- **Deduplicación de emails de orden**: extender la tabla `email_logs` para registrar confirmaciones de orden y pagos — si el webhook se reintenta, el mail no se reenvía
- **From address hardcodeado en contacto**: `app/contacto/actions.ts` usa `noreply@resend.dev` directo; reemplazar por `FROM_EMAIL` del cliente Resend
- **Error de email en suscripción sin contexto**: el try/catch del webhook no loguea qué usuario/orden falló; agregar el `orderId` y `email` al log de error

### Parte 2 — Nuevos emails

- **Cambio de estado de orden** (nuevos estados: `en_preparacion`, `enviado`, `entregado`): email automático al comprador con el nuevo estado y, para `enviado`, el número de tracking si está cargado
- **Orden cancelada**: email al comprador cuando admin cancela una orden, con información de reembolso si aplica
- **Aviso de stock bajo al admin**: email interno cuando una variante de producto baja de un umbral configurable (default: 5 unidades); evita quedar sin stock sin darse cuenta
- **Resumen semanal de ventas al admin**: email los lunes con órdenes de la semana, monto total, y productos más vendidos

## Capabilities Afectadas

- `webhook` (`app/api/webhook/route.ts`): deduplicación de emails de orden
- `auth-callback` (`app/auth/callback/route.ts`): fix await en welcome email
- `contacto` (`app/contacto/actions.ts`): fix from address
- `email-client` (`lib/email/client.ts`): validación de API key al arrancar
- `ordenes-admin` (`app/admin/ordenes/[id]/actions.ts`): trigger de email en cambio de estado y cancelación
- `email` (nuevos archivos en `lib/email/`): funciones y templates para los 4 nuevos tipos de email
- `cron` (`app/api/cron/`): nuevo endpoint `weekly-summary` para el resumen semanal
- `stock` (`app/api/webhook/route.ts` o nueva action): trigger de aviso de stock bajo post-decremento
- `database`: extensión de `email_logs` para cubrir tipos de email nuevos

## Non-Goals

- No se cambia el proveedor de email (se mantiene Resend)
- No se implementa tracking de rebotes ni eventos de delivery de Resend (eso es un change separado de observabilidad)
- No se agrega un editor visual de templates desde el admin
- No se implementa recupero de carrito abandonado (requiere infraestructura de sesiones anónimas persistentes)
- No se modifica el schema de órdenes ni los estados existentes

## Impact

**Archivos modificados:**
- `app/auth/callback/route.ts` — await en welcome email
- `app/api/webhook/route.ts` — deduplicación de email de orden
- `app/admin/ordenes/[id]/actions.ts` — trigger email en cambio de estado y cancelación
- `app/contacto/actions.ts` — fix from address
- `lib/email/client.ts` — validación de API key
- `lib/email/send-order-confirmation.ts` — integrar deduplicación vía email_logs

**Archivos nuevos:**
- `lib/email/send-order-status.ts` — función para email de cambio de estado
- `lib/email/send-order-cancelled.ts` — función para email de cancelación
- `lib/email/send-low-stock-alert.ts` — función para aviso de stock bajo
- `lib/email/send-weekly-summary.ts` — función para resumen semanal
- `lib/email/templates/order-status.tsx` — template React para estado de orden
- `lib/email/templates/order-cancelled.tsx` — template React para cancelación
- `lib/email/templates/low-stock-alert.tsx` — template React para stock bajo
- `lib/email/templates/weekly-summary.tsx` — template React para resumen semanal
- `app/api/cron/weekly-summary/route.ts` — endpoint cron para el resumen semanal
- `supabase/migrations/XXX_email_logs_extend.sql` — extensión de email_logs con nuevos tipos

**Sin cambios:** schema de órdenes, estados, theming, flujo de checkout, sistema de suscripciones
