## 1. Validación de API key en cliente Resend (D1)

- [ ] 1.1 En `lib/email/client.ts`, agregar detección de key ausente con `console.error` al inicializar el módulo
- [ ] 1.2 Agregar detección de test key (`re_test_`) con `console.warn` indicando limitación de envío a dirección verificada

## 2. Fix `await` en welcome email (D2)

- [ ] 2.1 En `app/auth/callback/route.ts`, envolver `sendWelcomeEmail` en `try { await ... } catch` con log de error
- [ ] 2.2 Verificar que el redirect al dashboard ocurre después del bloque, no antes

## 3. Fix from address en formulario de contacto

- [ ] 3.1 En `app/contacto/actions.ts`, reemplazar `noreply@resend.dev` hardcodeado por `FROM_EMAIL` importado de `lib/email/client.ts`

## 4. Mejor logging en email de suscripción fallido

- [ ] 4.1 En `app/api/webhook/route.ts`, en el catch del email de confirmación de suscripción, agregar `orderId` y `email` al log de error

## 5. Migración de base de datos — extender `email_logs` (D3)

- [ ] 5.1 Crear `supabase/migrations/XXX_email_logs_extend.sql` con:
  - columna `reference_id TEXT` (para order_id de invitados y variant_id de stock)
  - comentario con los nuevos valores válidos de `email_type`
- [ ] 5.2 Actualizar el índice existente si es necesario para cubrir `reference_id`

## 6. Deduplicación de email de confirmación de orden (D3)

- [ ] 6.1 En `lib/email/send-order-confirmation.ts`, antes de enviar, verificar en `email_logs` si ya existe `(reference_id = orderId, email_type = 'order_confirmation', sent_date = today)`
- [ ] 6.2 Si existe, retornar sin enviar
- [ ] 6.3 Si no existe, enviar y luego insertar fila en `email_logs` con `reference_id = orderId`

## 7. Deduplicación de email de confirmación de pago (D3)

- [ ] 7.1 En `lib/email/send-payment-confirmation.ts`, misma lógica que tarea 6 con `email_type = 'payment_confirmation'` y `reference_id = paymentId`

## 8. Templates de nuevos emails

- [ ] 8.1 Crear `lib/email/templates/order-status.tsx` — template para cambios de estado (`en_preparacion`, `enviado`, `entregado`); el template recibe `status`, `orderNumber`, `trackingNumber?` y renderiza el mensaje correspondiente
- [ ] 8.2 Crear `lib/email/templates/order-cancelled.tsx` — template para cancelación con resumen de ítems y texto de reembolso condicional según método de pago
- [ ] 8.3 Crear `lib/email/templates/low-stock-alert.tsx` — template para aviso de stock bajo al admin; lista de variantes con nombre, SKU y stock actual
- [ ] 8.4 Crear `lib/email/templates/weekly-summary.tsx` — template para resumen semanal; total de órdenes, monto, top 5 productos, órdenes pendientes viejas

## 9. Funciones de envío de nuevos emails

- [ ] 9.1 Crear `lib/email/send-order-status.ts` — función que recibe `{ orderId, orderNumber, buyerEmail, status, trackingNumber? }`, verifica deduplicación en `email_logs` y envía
- [ ] 9.2 Crear `lib/email/send-order-cancelled.ts` — función que recibe `{ orderId, orderNumber, buyerEmail, items, paymentMethod }`, verifica deduplicación y envía
- [ ] 9.3 Crear `lib/email/send-low-stock-alert.ts` — función que recibe array de `{ variantId, productName, variantName, sku, stock }`, deduplica por variante por día y envía
- [ ] 9.4 Crear `lib/email/send-weekly-summary.ts` — función que consulta la DB para el período y envía al admin email

## 10. Trigger de email en cambio de estado de orden (D4)

- [ ] 10.1 En `app/admin/ordenes/[id]/actions.ts`, después del UPDATE de estado, llamar a la función correspondiente según el nuevo estado:
  - `en_preparacion` → `sendOrderStatusEmail(..., 'en_preparacion')`
  - `enviado` → `sendOrderStatusEmail(..., 'enviado', trackingNumber)`
  - `entregado` → `sendOrderStatusEmail(..., 'entregado')`
  - `cancelado` → `sendOrderCancelledEmail(...)`
- [ ] 10.2 Leer el email del comprador desde la tabla `orders` (ya está en el campo `contact_email` o similar)
- [ ] 10.3 Leer el método de pago desde `payments` para el email de cancelación (D5)

## 11. Trigger de aviso de stock bajo en webhook (D6)

- [ ] 11.1 En `app/api/webhook/route.ts`, después de decrementar el stock, consultar el stock resultante de cada variante modificada
- [ ] 11.2 Leer el umbral de `config` (columna o valor hardcodeado como fallback en 5)
- [ ] 11.3 Llamar a `sendLowStockAlert` con las variantes que quedaron por debajo del umbral
- [ ] 11.4 La función verifica deduplicación en `email_logs` por `(reference_id = variantId, email_type = 'low_stock_alert', sent_date = today)`

## 12. Endpoint cron para resumen semanal (D7)

- [ ] 12.1 Crear `app/api/cron/weekly-summary/route.ts` con:
  - Verificación de `Authorization: Bearer ${CRON_SECRET}`
  - Query de órdenes de los últimos 7 días
  - Query de top 5 productos por cantidad vendida
  - Query de órdenes en `nueva` o `en_preparacion` con más de 48hs sin actualización
  - Llamada a `sendWeeklySummaryEmail`
- [ ] 12.2 Documentar en `.env.example` que este cron debe configurarse en Vercel o servicio externo para ejecutarse los lunes 9:00 AM
