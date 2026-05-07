## 1. Base de datos

- [x] 1.1 Crear migración aditiva `supabase/migrations/0XX_add_billing_invoice.sql` con columnas `billing_data JSONB` e `invoice_url TEXT` en la tabla `orders`
- [x] 1.2 Crear bucket privado `invoices` en Supabase Storage (via migración o script)
- [x] 1.3 Actualizar tipo TypeScript `Order` en `lib/types/store.ts` para incluir `billing_data` e `invoice_url`
- [x] 1.4 Crear tipo `BillingAddress` en `lib/types/store.ts`

## 2. Schemas y validación

- [x] 2.1 Agregar schema de validación `billingSchema` en `lib/schemas/checkout.ts` con campos requeridos/opcionales según spec
- [x] 2.2 Extender el schema del paso de envío para incluir `billing_data` (toggle + campos condicionales)

## 3. Frontend — Rediseño del formulario de checkout

- [x] 3.1 Refactorizar `components/checkout/shipping-step.tsx` para usar grid de 2 columnas en desktop y aumentar espaciado
- [x] 3.2 Refactorizar `components/checkout/contact-step.tsx` con el mismo estilo ampliado
- [x] 3.3 Asegurar que `components/checkout/payment-step.tsx` sea visualmente coherente con el rediseño

## 4. Frontend — Sección de facturación

- [x] 4.1 Crear componente `components/checkout/billing-section.tsx` con toggle "Usar datos del envío / Ingresar otros datos" y formulario colapsable
- [x] 4.2 Integrar `BillingSection` al final de `shipping-step.tsx`, pasando y recibiendo `billing_data` en el estado del checkout
- [x] 4.3 Actualizar `checkout-flow.tsx` para incluir `billing_data` en el payload que se envía al crear la Preference de MP
- [x] 4.4 Validar con Zod los campos de facturación antes de avanzar al paso de pago

## 5. Backend — Creación de orden

- [x] 5.1 Actualizar `app/api/create-payment/route.ts` para incluir `billing_data` en el campo `metadata` de la Preference de MP
- [x] 5.2 Actualizar `app/api/webhook/route.ts` para extraer `billing_data` de `metadata` y persistirlo en la columna `billing_data` de la nueva orden

## 6. Backend — API de factura

- [x] 6.1 Crear endpoint `app/api/orders/[id]/invoice/route.ts` con método `POST` que reciba un PDF, lo suba a Storage (`{order_id}/factura.pdf`) y actualice `invoice_url` en la orden
- [x] 6.2 Crear endpoint `app/api/orders/[id]/invoice/send/route.ts` con método `POST` que genere una signed URL del PDF y envíe el email al cliente

## 7. Email

- [x] 7.1 Crear template de email para envío de factura (HTML simple con el número de orden, link de descarga firmado y mensaje de texto)
- [x] 7.2 Integrar el envío del email en el endpoint `send` usando el mismo proveedor de email existente (Resend u otro)

## 8. Panel de administración

- [x] 8.1 Actualizar la vista de detalle de orden en el admin para mostrar `billing_data` (sección "Datos de facturación")
- [x] 8.2 Agregar componente de subida de PDF de factura en el detalle de orden del admin (input file + botón "Cargar factura")
- [x] 8.3 Agregar botón "Enviar factura al cliente" en el detalle de orden del admin, deshabilitado si `invoice_url` es null

## 9. Pruebas y validación

- [ ] 9.1 Verificar el flujo completo en staging: checkout con "mismos datos" → orden creada con `same_as_shipping: true`
- [ ] 9.2 Verificar el flujo completo con datos distintos → orden creada con `billing_data` correcto
- [ ] 9.3 Verificar validaciones de campos requeridos y opcionales en el formulario de facturación
- [ ] 9.4 Verificar subida de PDF y envío de email desde el panel admin
- [ ] 9.5 Verificar que el rediseño visual sea correcto en mobile y desktop

