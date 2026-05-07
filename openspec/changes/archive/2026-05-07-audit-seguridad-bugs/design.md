## Context

El audit reveló que la app tiene múltiples puntos de entrada sin autenticación ni validación que permiten a un atacante externo crear órdenes gratis, acceder a datos de compradores y manipular precios. Ninguno de estos problemas es visible desde la UI — todos requieren llamadas directas a los endpoints o server actions. El código funciona correctamente en el happy path de un usuario legítimo, pero no tiene defensas ante un llamador malicioso.

Los problemas se agrupan en tres capas:

1. **Capa de transporte** — endpoints HTTP públicos que no verifican identidad ni autorización
2. **Capa de negocio** — lógica de precios, stock y órdenes que confía en datos del cliente
3. **Capa de aplicación** — server actions de admin sin verificación de rol, bugs de estado

---

## Decisions

### D1 — Verificación de firma en el webhook de MP (CRIT-01)

**Decisión**: Implementar verificación HMAC-SHA256 del header `x-signature` usando `WEBHOOK_SECRET` (variable de entorno configurada en el panel de MercadoPago). El handler retorna 401 inmediatamente si la firma no coincide, sin ejecutar ninguna lógica de negocio.

**Rationale**: Es el mecanismo oficial de MercadoPago para garantizar que la notificación proviene de sus servidores. Sin esto, cualquier POST al endpoint con un `paymentId` válido puede disparar la creación de una orden como si el pago hubiera sido aprobado.

**Alternativa descartada**: IP allowlist de servidores de MP. Inviable en serverless — las IPs cambian y no hay garantía de que Next.js/Vercel pueda leer el IP real del caller sin headers adicionales.

---

### D2 — Eliminar `POST /api/orders` como endpoint público (CRIT-02)

**Decisión**: El endpoint `POST /api/orders` se elimina. La creación de órdenes ocurre exclusivamente en el webhook de MercadoPago, que ya tiene verificación de firma (D1). El flujo de checkout pasa a ser: cliente crea preferencia MP → redirige a MP → webhook crea la orden al aprobar el pago.

**Rationale**: Tener dos caminos de creación de órdenes (endpoint + webhook) genera el bug de duplicación de órdenes (ALTA-02) y requiere proteger dos superficies en lugar de una. Consolidar en el webhook resuelve ambos problemas.

**Impacto en checkout-flow.tsx**: El componente deja de hacer `POST /api/orders` antes de redirigir. Solo llama a `POST /api/create-payment` para obtener el `init_point` y redirige al usuario.

**Alternativa descartada**: Proteger el endpoint con `ORDERS_API_SECRET`. Viable pero mantiene la duplicación de lógica y el bug de ALTA-02.

---

### D3 — Endpoints de consulta de órdenes requieren email (CRIT-03 / CRIT-04)

**Decisión**: `GET /api/orders/by-id/[id]` y `GET /api/orders/by-preference/[preferenceId]` requieren el parámetro `email` en la query string. La query agrega `AND email = $email`. Si no coincide, retorna 404 (no 401, para no confirmar existencia de la orden).

**Rationale**: El email del comprador es el único secreto que el usuario legítimo conoce y un atacante no puede inferir solo con el ID o el preference_id. Este es el mismo mecanismo que ya usan `by-number` y `by-token`.

**Impacto**: Los llamadores internos (checkout-flow al volver de MP) ya tienen el email en el estado del checkout — pasarlo como parámetro es un cambio mínimo.

---

### D4 — `assertAdmin()` como primera línea en todas las actions de admin (CRIT-05 / CRIT-06)

**Decisión**: Cada server action en `/app/admin/*` debe comenzar con `await assertAdmin()`. La función verifica sesión + rol; lanza un error que aborta la action si el caller no es admin. No se cambia la implementación de `assertAdmin()`, solo se agrega donde falta.

**Rationale**: Las server actions son endpoints HTTP — pueden ser invocadas directamente sin pasar por la UI. El middleware protege las rutas de navegación pero no las actions. Cada action debe ser auto-contenida en cuanto a autorización.

---

### D5 — Precios se calculan exclusivamente en el servidor (MEDIA-02)

**Decisión**: En `POST /api/create-payment`, los precios de los ítems del carrito se recalculan desde la base de datos usando `productId` y `variantId`. El precio enviado por el cliente se ignora. El total de la preferencia de MP se calcula server-side.

En el webhook, los precios para crear `order_items` también se consultan desde la DB, no desde `metadata.items`.

**Rationale**: El precio es una propiedad de negocio — no debe depender de lo que el cliente declara. Cualquier validación client-side es bypasseable.

**Impacto en metadata de MP**: La metadata se reduce a `{ orderId?, email, items: [{ productId, variantId, quantity }] }` — sin precios ni URLs de imágenes. Resuelve también BAJA-06 (límite de tamaño de metadata).

---

### D6 — Stock atómico via RPC con chequeo de disponibilidad (ALTA-03)

**Decisión**: La función SQL `decrement_variant_stock` se modifica para incluir un `RETURNING` con un check: si `stock - quantity < 0`, la función levanta una excepción. El webhook captura el error y rechaza la orden si no hay stock suficiente (retorna 200 a MP pero marca la orden con estado `sin_stock`).

La restauración de stock al cancelar también se mueve a una RPC que hace el increment en una sola operación, sin read previo.

**Rationale**: `SELECT stock` seguido de `UPDATE stock - quantity` tiene una window de race condition. Una función SQL ejecuta ambas operaciones dentro de una transacción con lock implícito.

---

### D7 — Open Redirect: validar `redirectTo` como ruta relativa (ALTA-06)

**Decisión**: En `loginAction`, `redirectTo` se valida con una función `isSafeRedirect(url: string): boolean` que verifica que el valor empiece con `/` y no con `//` ni `http`. Si no pasa la validación, se usa `/` como fallback.

**Rationale**: Un atacante puede embeber un link de login con `redirectTo=https://phishing.com` y redirigir al usuario post-login. La validación es trivial de implementar y elimina el riesgo completamente.

---

### D8 — Middleware cubre `/cuenta/*` (ALTA-01)

**Decisión**: Se agrega `/cuenta/:path*` al `matcher` del middleware de Supabase. Las rutas de cuenta quedan protegidas a nivel Edge, no solo por el redirect del layout.

**Rationale**: El layout server-side es una segunda línea de defensa, no la primera. El middleware es el lugar correcto para proteger rutas que requieren sesión.

---

### D9 — Direcciones via server actions con ownership explícito (MEDIA-03 / MEDIA-05)

**Decisión**: Las operaciones de direcciones se mueven a server actions. Cada action obtiene el `userId` de la sesión del servidor — no del cliente. `setDefaultAction` ejecuta ambos updates dentro de una función SQL única para eliminar la race condition.

**Rationale**: Depender exclusivamente de RLS para ownership es correcto en teoría, pero una server action con verificación explícita es más fácil de auditar y no depende de que las RLS estén perfectamente configuradas.

---

## Risks / Trade-offs

**[D2 — eliminar POST /api/orders cambia el flujo de checkout]** → El usuario ahora solo ve la confirmación después de que el webhook procese el pago. Si el webhook tarda o falla, el usuario puede quedar en la página de retorno de MP sin confirmación inmediata. Mitigación: la página de retorno consulta `by-preference` + email con polling breve (ya existe `check-payment-status`).

**[D5 — precios desde DB agrega una query al flujo de create-payment]** → Latencia marginal (~50ms). Aceptable — es una query simple por índice sobre `product_variants`.

**[D6 — stock atómico rechaza la orden si no hay stock]** → Caso edge: dos usuarios pagan simultáneamente y solo hay stock para uno. El segundo ve su pago aprobado por MP pero la orden queda en `sin_stock`. Hay que notificar al comprador y gestionar el reembolso. Esta lógica de reembolso está fuera del scope de este audit — se documenta como deuda técnica.
