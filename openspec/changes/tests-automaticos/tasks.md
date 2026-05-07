## 1. Instalación y configuración

- [ ] 1.1 Instalar dependencias: `vitest`, `@vitest/coverage-v8` como devDependencies
- [ ] 1.2 Crear `vitest.config.ts` en la raíz con: `environment: 'node'`, alias `@/` apuntando a la raíz, `setupFiles: ['./tests/setup.ts']`, variables de entorno de test (`WEBHOOK_SECRET`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `MP_ACCESS_TOKEN`)
- [ ] 1.3 Agregar scripts en `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`, `"test:coverage": "vitest run --coverage"`

## 2. Setup global y helpers

- [ ] 2.1 Crear `tests/setup.ts`: mock global de `next/cache` (`revalidatePath: vi.fn()`), mock global de `@/lib/email/send-order-confirmation` y `@/lib/email/send-payment-confirmation`
- [ ] 2.2 Crear `tests/helpers/supabase.ts`: función `createSupabaseMock()` que retorna un objeto con métodos fluent mockeados (`from`, `select`, `insert`, `update`, `eq`, `in`, `single`, `rpc`, `auth`). Debe soportar configurar el valor de retorno de cada operación vía `mockResolvedValueOnce`.
- [ ] 2.3 Crear `tests/helpers/mp.ts`: función `buildSignedRequest(body, secret, requestId?)` que construye un `NextRequest` con headers `x-signature` y `x-request-id` con HMAC-SHA256 válido; función `makeMpPayment(overrides?)` que retorna un objeto de pago de MP con valores por defecto configurables

## 3. Tests unitarios — utils

- [ ] 3.1 Crear `tests/unit/utils.test.ts`
- [ ] 3.2 `isFreeShipping`: threshold null → false; subtotal < threshold → false; subtotal === threshold → true; subtotal > threshold → true

## 4. Tests unitarios — schemas Zod

- [ ] 4.1 Crear `tests/unit/zod-schemas.test.ts`
- [ ] 4.2 Identificar los schemas Zod existentes en el proyecto (formularios de checkout, producto) e importarlos
- [ ] 4.3 Por cada schema: test con datos válidos → parse exitoso; test con email inválido → error en campo `email`; test con campo requerido vacío → error; test con precio negativo (si aplica) → error

## 5. Tests de integración — webhook

- [ ] 5.1 Crear `tests/integration/webhook.test.ts`
- [ ] 5.2 Mock de `@supabase/supabase-js` con `createSupabaseMock()` para el admin client
- [ ] 5.3 Mock de `mercadopago` (`MercadoPagoConfig`, `Payment.get`)
- [ ] **Test: firma inválida → 401** — request sin headers `x-signature`/`x-request-id` debe retornar `{ status: 401 }`
- [ ] **Test: tipo distinto a `payment` → 200 sin efectos** — body con `type: 'refund'` debe retornar 200 y no llamar a Supabase insert
- [ ] **Test: flujo tienda, pago aprobado → orden creada** — payment con `metadata.flow: 'store'`, `status: 'approved'`, metadata completa (contact, shipping, items). Verificar que `supabaseAdmin.from('orders').insert()` fue llamado con `status: 'nueva'` y el total recalculado desde DB (no el de metadata)
- [ ] **Test: flujo tienda, pago aprobado → stock decrementado** — igual que anterior. Verificar que `supabaseAdmin.rpc('decrement_variant_stock')` fue llamado por cada ítem con `variantId`
- [ ] **Test: flujo tienda, pago aprobado → email enviado** — verificar que `sendOrderConfirmationEmail` fue llamado con el email del contacto y el número de orden
- [ ] **Test: flujo tienda, pago no aprobado → sin orden** — `status: 'pending'`. Verificar que `from('orders').insert()` NO fue llamado
- [ ] **Test: flujo tienda, metadata incompleta → sin orden** — metadata sin `contact`. Verificar que insert no se llama y retorna 200
- [ ] **Test: recálculo de precios ignora metadata** — metadata con `price: 9999` por ítem. Configurar el mock de Supabase para retornar `price: 100` desde `products`. Verificar que el total en el insert usa 100, no 9999

## 6. Tests de integración — admin actions

- [ ] 6.1 Crear `tests/integration/admin-actions.test.ts`
- [ ] 6.2 Mock de `@/lib/supabase/server` con `createSupabaseMock()` para el client autenticado
- [ ] 6.3 Mock de `@supabase/supabase-js` con `createSupabaseMock()` para el admin client
- [ ] **Test: sin sesión → error no autorizado** — mock retorna `user: null`. `updateOrderAction` debe retornar `{ error: 'No autorizado' }`
- [ ] **Test: usuario no admin → error no autorizado** — mock retorna usuario con `role: 'customer'`. Debe retornar `{ error: 'No autorizado' }`
- [ ] **Test: usuario admin → actualización exitosa** — mock retorna usuario con `role: 'admin'`. Verificar que `from('orders').update()` fue llamado con los datos correctos
- [ ] **Test: cancelar orden `nueva` → stock restaurado** — orden en estado `nueva`, se cancela. Verificar que `from('product_variants').update({ stock: ... })` fue llamado por cada ítem con `variant_id`
- [ ] **Test: cancelar orden ya cancelada → sin cambio de stock** — orden ya en estado `cancelado`. Verificar que el update de stock NO fue llamado
