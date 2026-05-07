## 1. Webhook — verificación de firma MercadoPago (CRIT-01)

- [ ] 1.1 Agregar `WEBHOOK_SECRET` a las variables de entorno (`.env.local` + Vercel)
- [ ] 1.2 Implementar función `verifyMpSignature(req: Request): boolean` que valide el header `x-signature` con HMAC-SHA256 usando `WEBHOOK_SECRET` y `x-request-id`
- [ ] 1.3 Llamar `verifyMpSignature` al inicio del handler; retornar 401 si falla
- [ ] 1.4 Tipar el payload de MP usando los tipos del SDK en lugar de `mpRaw as any`, `contact as any`, `items as any[]`

## 2. Endpoint `POST /api/orders` — proteger o eliminar (CRIT-02)

- [ ] 2.1 Determinar si `POST /api/orders` sigue siendo necesario en el flujo actual o si la creación de órdenes ocurre solo via webhook
- [ ] 2.2 Si se elimina: borrar `app/api/orders/route.ts` y remover llamadas desde `checkout-flow.tsx`
- [ ] 2.3 Si se mantiene: agregar header `Authorization: Bearer ${ORDERS_API_SECRET}` requerido; retornar 401 si no coincide

## 3. Endpoints de consulta de órdenes — requerir email (CRIT-03 / CRIT-04)

- [ ] 3.1 `app/api/orders/by-id/[id]/route.ts`: agregar query param `email` requerido; filtrar con `AND email = $email` en la query; retornar 404 si no coincide
- [ ] 3.2 `app/api/orders/by-preference/[preferenceId]/route.ts`: ídem, agregar `email` requerido
- [ ] 3.3 Actualizar los llamadores en el cliente (`checkout-flow.tsx`, `order-lookup.tsx`) para pasar el email en cada consulta

## 4. Server actions de admin — agregar `assertAdmin()` (CRIT-05 / CRIT-06)

- [ ] 4.1 `app/admin/categorias/actions.ts`: agregar `await assertAdmin()` al inicio de `toggleCategoryAction` y `saveCategoryAction`
- [ ] 4.2 `app/admin/productos/actions.ts`: agregar `await assertAdmin()` al inicio de `toggleProductAction` y toda action que no lo tenga
- [ ] 4.3 `app/admin/ordenes/[id]/actions.ts`: agregar `await assertAdmin()` al inicio de `updateOrderAction`

## 5. Middleware — extender matcher a `/cuenta/*` (ALTA-01)

- [ ] 5.1 En `lib/supabase/middleware.ts`, agregar `/cuenta/:path*` al `matcher` del middleware para proteger las rutas de cuenta a nivel Edge

## 6. Flujo de creación de órdenes — unificar en un solo camino (ALTA-02)

- [ ] 6.1 Auditar el flujo completo: qué crea `POST /api/orders`, qué crea el webhook, en qué estado queda cada orden
- [ ] 6.2 Decidir el flujo canónico (recomendado: solo webhook crea la orden definitiva; el POST se elimina o solo guarda `preference_id` sin crear la orden)
- [ ] 6.3 Implementar el flujo elegido; verificar que no queden órdenes huérfanas en `pago_pendiente`

## 7. Stock — hacer el decremento atómico (ALTA-03)

- [ ] 7.1 En la función SQL `decrement_variant_stock`, agregar un check que evite decrementar si `stock - quantity < 0`; retornar error si no hay stock suficiente
- [ ] 7.2 En `updateOrderAction` (restauración de stock al cancelar), hacer el increment en la misma RPC en lugar de read+write separados
- [ ] 7.3 Agregar el estado `nueva` a la lista de estados que restauran stock al cancelar

## 8. Email de contacto — escapar HTML y validar longitud (ALTA-04 / BAJA-07)

- [ ] 8.1 Agregar función `escapeHtml(str: string): string` que escape `<`, `>`, `&`, `"` antes de interpolarlo en el template del email
- [ ] 8.2 Aplicar `escapeHtml` a `name`, `email` y `message` en `app/contacto/actions.ts`
- [ ] 8.3 Agregar validación de longitud máxima: `name` ≤ 100 chars, `email` ≤ 254 chars, `message` ≤ 5000 chars; retornar error de validación si se supera

## 9. Webhook — await en email de confirmación (ALTA-05)

- [ ] 9.1 Agregar `await` a la llamada de `sendPaymentConfirmationEmail()` en el flujo de suscripciones del webhook
- [ ] 9.2 Envolver en try/catch y loguear el error sin interrumpir el flujo principal

## 10. Login — sanitizar redirectTo y eliminar doble query (ALTA-06 / MEDIA-06)

- [ ] 10.1 Validar que `redirectTo` empiece con `/` y no con `//` ni `http`; si no cumple, usar `/` como fallback
- [ ] 10.2 Reemplazar `supabase.auth.getUser()` post-login por `data.user` del resultado de `signInWithPassword`

## 11. Precios — validación server-side (MEDIA-02)

- [ ] 11.1 En `app/api/create-payment/route.ts`, ignorar los precios enviados por el cliente
- [ ] 11.2 Para cada ítem del carrito, consultar la DB usando `productId` y `variantId` para obtener el precio real
- [ ] 11.3 Calcular `subtotal`, `total` y `unit_price` de MP usando los precios de la DB
- [ ] 11.4 En el webhook, ídem: recalcular precios desde DB en lugar de leer desde `metadata.items`

## 12. Direcciones — migrar a server actions y fix race condition (MEDIA-03 / MEDIA-05)

- [ ] 12.1 Crear server actions para insert, update, delete y setDefault de direcciones en un nuevo `app/cuenta/direcciones/actions.ts`
- [ ] 12.2 Cada action verifica la sesión del usuario antes de operar (no confiar en `userId` del cliente)
- [ ] 12.3 `setDefaultAction`: ejecutar ambos updates en una función SQL única para evitar race condition

## 13. Cron — retornar 500 en errores (MEDIA-01)

- [ ] 13.1 En `app/api/cron/expiration-reminders/route.ts`, cambiar el bloque catch para retornar `status: 500` y loguear el error con `console.error`

## 14. Metadata de MP — limitar tamaño (BAJA-06)

- [ ] 14.1 En `app/api/create-payment/route.ts`, reducir la metadata enviada a MP: incluir solo `orderId`, `email` y los IDs de ítems (sin URLs de imágenes ni datos de shipping completos)
- [ ] 14.2 El webhook reconstruye los datos necesarios consultando la DB usando esos IDs

## 15. Limpieza de código (BAJA-02 / BAJA-03 / BAJA-04 / BAJA-05)

- [ ] 15.1 `components/cart/cart-provider.tsx`: evaluar si `CartProviderWithDrawer` es necesario o si se puede eliminar y usar `CartProvider` + `CartDrawer` directamente en el layout
- [ ] 15.2 `app/admin/contenido/actions.ts`: corregir `revalidatePath('/dashboard/contenido')` por la ruta correcta (`/admin/contenido`)
- [ ] 15.3 `checkout-flow.tsx` + `shipping-step.tsx`: extraer la lógica de `freeShippingThreshold` a una función utilitaria compartida en `lib/utils.ts`
- [ ] 15.4 Renombrar `app/api/check-payment-status/route.ts` a algo que refleje que verifica suscripciones, no pagos de órdenes (ej: `check-subscription-status`)
