## Why

Antes de avanzar con nuevas features de la columna tienda-marca-blanca, se realizó un audit completo del código existente. El resultado muestra 6 issues críticos de seguridad, 6 altos, 8 medios y 8 bajos. Varios de estos permiten a un atacante externo crear órdenes gratis, acceder a datos de compradores, o manipular precios — todos sin autenticación. Hay que resolver esto antes de que la tienda esté en producción con un cliente real.

## What Changes

### CRÍTICOS — Atacante externo puede crear órdenes o acceder a datos sin auth

**CRIT-01 — Webhook sin verificación de firma de MercadoPago**
`app/api/webhook/route.ts`
El webhook no verifica el header `x-signature` que MP envía con cada notificación. Cualquiera puede hacer un POST válido y forzar la creación de una orden como si el pago hubiera sido aprobado. Se debe implementar verificación HMAC-SHA256 usando `WEBHOOK_SECRET` del panel de MP.

**CRIT-02 — `POST /api/orders` completamente abierto**
`app/api/orders/route.ts`
Crea órdenes en la base de datos con `SUPABASE_SERVICE_ROLE_KEY` sin verificar sesión, token ni secreto. Cualquier persona en internet puede crear órdenes con `user_id`, totales y ítems arbitrarios. Se debe proteger con un secreto interno (`ORDERS_API_SECRET`) o eliminar el endpoint si el flujo es exclusivamente webhook-driven.

**CRIT-03 — `GET /api/orders/by-id/:id` expone datos de orden sin auth**
`app/api/orders/by-id/[id]/route.ts`
Devuelve email, total, estado y `public_token` de cualquier orden a quien conozca su UUID. Los otros endpoints (`by-number`, `by-token`) requieren el email del comprador como verificación — este no. Se debe requerir email del comprador como parámetro o eliminar el endpoint.

**CRIT-04 — `GET /api/orders/by-preference/:preferenceId` expone datos de orden sin auth**
`app/api/orders/by-preference/[preferenceId]/route.ts`
Igual que CRIT-03, pero usando el `preference_id` de MP — que es visible en las URLs de retorno (`back_urls`) que el usuario ve en el navegador. Se debe requerir email del comprador o eliminar el endpoint.

**CRIT-05 — Server actions de admin sin verificación de rol en categorías y productos**
`app/admin/categorias/actions.ts`, `app/admin/productos/actions.ts`
`toggleCategoryAction`, `saveCategoryAction` y `toggleProductAction` verifican que haya un usuario autenticado pero no verifican `rol = admin`. Cualquier usuario registrado (comprador) puede invocar estas acciones directamente. Se debe agregar `assertAdmin()` al inicio de cada action.

**CRIT-06 — `updateOrderAction` sin autenticación ni verificación de rol**
`app/admin/ordenes/[id]/actions.ts`
Usa `SUPABASE_SERVICE_ROLE_KEY` directamente sin ningún `assertAdmin()`. Cualquier caller puede cambiar el estado de cualquier orden y el tracking number. Se debe agregar verificación de rol admin.

---

### ALTOS — Bugs de datos y vulnerabilidades de lógica de negocio

**ALTA-01 — Middleware no cubre rutas `/cuenta/*`**
`lib/supabase/middleware.ts`
El matcher solo protege `/admin/:path*`. Las rutas de cuenta dependen únicamente del redirect en el layout, que puede no ejecutarse en todos los contextos de RSC. Se debe extender el matcher para cubrir `/cuenta/:path*`.

**ALTA-02 — Doble creación de órdenes (bug de datos)**
`app/api/orders/route.ts` + `app/api/webhook/route.ts`
El flujo actual crea una orden en `POST /api/orders` con estado `pago_pendiente` y luego el webhook crea otra orden distinta con estado `nueva` al aprobar el pago. La orden original queda huérfana. Se debe definir un único camino de creación de órdenes (recomendado: solo webhook, el `POST /api/orders` se elimina o cambia a solo guardar intención).

**ALTA-03 — Decremento de stock no atómico (race condition)**
`app/api/webhook/route.ts` + `app/admin/ordenes/[id]/actions.ts`
No hay lock ni chequeo de stock disponible antes de procesar el pago. Dos usuarios comprando el último ítem simultáneamente pueden dejar el stock en negativo. La restauración de stock al cancelar tampoco es atómica. Se debe usar una función SQL con `FOR UPDATE` o un check en la RPC `decrement_variant_stock`.

**ALTA-04 — XSS en email de contacto**
`app/contacto/actions.ts`
Los campos del formulario se insertan en HTML del email sin escapar. Un atacante puede inyectar HTML arbitrario. Se debe escapar el contenido antes de interpolarlo en el template HTML.

**ALTA-05 — Email de confirmación no awaiteado en webhook (fire-and-forget)**
`app/api/webhook/route.ts`
`sendPaymentConfirmationEmail()` no tiene `await` en el flujo de suscripciones. En funciones serverless de corta duración, el email puede no enviarse nunca. Se debe agregar `await` y manejo de error con logging.

**ALTA-06 — Open Redirect en `loginAction`**
`app/(auth)/login/actions.ts`
El valor `redirectTo` viene del `formData` sin validación. Un atacante puede redirigir al usuario a un sitio externo tras el login. Se debe validar que `redirectTo` sea una ruta relativa interna (comience con `/` y no con `//` ni `http`).

---

### MEDIOS — Seguridad, bugs menores y malas prácticas

**MEDIA-01 — Cron retorna HTTP 200 ante errores internos**
`app/api/cron/expiration-reminders/route.ts`
El bloque catch devuelve 200 para no fallar en Vercel Cron, pero esto enmascara errores. Se debe retornar 500 y manejar reintentos o alertas por separado.

**MEDIA-02 — Precios del carrito no validados server-side**
`app/api/create-payment/route.ts` + `app/api/webhook/route.ts`
Los precios de los ítems vienen del cliente y nunca se validan contra la base de datos. Un usuario puede manipular el payload para pagar $1 por cualquier producto. Se deben recalcular los precios server-side desde la DB usando `productId` y `variantId`.

**MEDIA-03 — Operaciones de dirección sin server action (depende de RLS)**
`components/account/address-manager.tsx`
Las operaciones de dirección se hacen con el cliente browser (anon key) y dependen enteramente de las RLS policies. Se recomienda migrar a server actions para tener validación explícita de ownership.

**MEDIA-04 — `saveCategoryAction` verifica usuario pero no rol admin**
`app/admin/categorias/actions.ts`
Cubierto por CRIT-05 pero detallado por separado: la verificación de usuario autenticado no es suficiente para operaciones de admin.

**MEDIA-05 — Race condition en `setDefault` de direcciones**
`components/account/address-manager.tsx`
Dos queries secuenciales sin transacción: si la segunda falla, el usuario queda sin dirección predeterminada sin feedback ni rollback. Se debe usar una función SQL única o manejar el error explícitamente.

**MEDIA-06 — `loginAction` hace doble query de usuario**
`app/(auth)/login/actions.ts`
Llama a `getUser()` después de `signInWithPassword` cuando `data.user` ya está disponible en la respuesta. Se debe usar `data.user` directamente.

**MEDIA-07 — Stock no se restaura al cancelar una orden `nueva`**
`app/admin/ordenes/[id]/actions.ts`
La restauración de stock al cancelar solo aplica a órdenes en estado `en_preparacion`, `enviado` o `entregado`. El estado `nueva` (asignado por el webhook tras pago aprobado) no está incluido — cancelar una orden `nueva` no restaura el stock.

**MEDIA-08 — `assertAdmin()` hace dos queries por request**
`app/admin/contenido/actions.ts`, `app/admin/planes/actions.ts`, `app/admin/usuarios/actions.ts`
Cada llamada a `assertAdmin()` crea un cliente Supabase y hace una query a `profiles`. Se podría consolidar en una función que retorne `{ supabase, supabaseAdmin }` para evitar clientes duplicados.

---

### BAJOS — Malas prácticas y código muerto

**BAJA-01 — `as any` extensivo en el webhook**
`app/api/webhook/route.ts`
`mpRaw as any`, `contact as any`, `items as any[]` desactivan type-checking. El SDK de MP tiene tipos propios. Cualquier cambio en la estructura del payload pasaría desapercibido en compilación.

**BAJA-02 — `cart-provider.tsx` es un thin wrapper redundante**
`components/cart/cart-provider.tsx`
`CartProviderWithDrawer` solo envuelve `CartProvider` con `CartDrawer` sin agregar lógica. La separación entre `cart-context.tsx` (que ya exporta el provider) y `cart-provider.tsx` es confusa.

**BAJA-03 — `check-payment-status` tiene nombre engañoso**
`app/api/check-payment-status/route.ts`
El endpoint verifica suscripciones de plan, no el estado de pagos de órdenes. Genera confusión con el flujo de tienda.

**BAJA-04 — Lógica de `freeShippingThreshold` duplicada**
`components/checkout/checkout-flow.tsx` + `components/checkout/shipping-step.tsx`
La condición `freeShippingThreshold && subtotal >= freeShippingThreshold` se repite en dos componentes. Si cambia la lógica hay que actualizarla en dos lugares.

**BAJA-05 — `revalidatePath('/dashboard/contenido')` referencia una ruta inexistente**
`app/admin/contenido/actions.ts`
Remanente del diseño SaaS original. La ruta no existe en la app actual. La llamada no hace nada pero genera confusión.

**BAJA-06 — Metadata de MP puede superar el límite de tamaño**
`app/api/create-payment/route.ts`
El campo `metadata` incluye el array completo de ítems con URLs de imágenes. Con muchos ítems y URLs largas puede superar el límite de MP y fallar silenciosamente.

**BAJA-07 — Sin validación de longitud máxima en formulario de contacto**
`app/contacto/actions.ts`
Solo se valida que los campos no estén vacíos. Un mensaje de 1 MB puede abusar del rate limit de Resend.

## Non-Goals

- No se cambia el schema de base de datos (salvo si la corrección atómica de stock lo requiere a nivel RPC)
- No se agregan tests automatizados en este ciclo
- No se modifica el flujo de suscripciones/contenido

## Impact

**Archivos modificados:**
- `app/api/webhook/route.ts` — firma MP, tipos TypeScript, await en email
- `app/api/orders/route.ts` — agregar secreto interno o eliminar
- `app/api/orders/by-id/[id]/route.ts` — requerir email o eliminar
- `app/api/orders/by-preference/[preferenceId]/route.ts` — requerir email o eliminar
- `app/api/create-payment/route.ts` — validación de precios server-side, límite metadata
- `app/admin/categorias/actions.ts` — agregar `assertAdmin()`
- `app/admin/productos/actions.ts` — agregar `assertAdmin()`
- `app/admin/ordenes/[id]/actions.ts` — agregar `assertAdmin()`, restaurar stock en estado `nueva`
- `app/(auth)/login/actions.ts` — sanitizar `redirectTo`, eliminar doble query
- `app/contacto/actions.ts` — escapar HTML, validar longitud
- `app/admin/contenido/actions.ts` — corregir `revalidatePath`
- `lib/supabase/middleware.ts` — extender matcher a `/cuenta/:path*`
- `components/account/address-manager.tsx` — migrar a server actions, fix race condition en `setDefault`
- `components/checkout/checkout-flow.tsx` — deduplicar lógica de envío gratis
- `components/checkout/shipping-step.tsx` — idem
- `app/api/cron/expiration-reminders/route.ts` — retornar 500 en errores

**Sin cambios:** schema, módulo de suscripciones/contenido, theming, UX
