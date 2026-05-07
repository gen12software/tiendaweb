## Context

El proyecto no tiene ninguna dependencia de testing. El stack es Next.js 16 + React 19 + TypeScript + Supabase + MercadoPago. Las piezas a testear son:

1. **Funciones puras** (`lib/utils.ts`): sin dependencias externas, testeable directamente
2. **Schemas Zod**: sin dependencias externas, testeable directamente
3. **Route handler del webhook** (`app/api/webhook/route.ts`): usa `NextRequest`, llama a Supabase (admin client) y al SDK de MercadoPago — ambos deben mockearse
4. **Server action `updateOrderAction`** (`app/admin/ordenes/[id]/actions.ts`): usa `createClient` de Supabase y `next/cache` — ambos deben mockearse

El mayor desafío técnico es mockear el cliente de Supabase, que se inicializa con `createClient()` importado desde distintas rutas (`@supabase/supabase-js` para el admin client, `@/lib/supabase/server` para el client autenticado). Vitest resuelve esto con `vi.mock()`.

---

## Decisions

### D1 — Vitest como framework principal

**Decisión**: Usar Vitest (no Jest).

**Rationale**: Vitest comparte la configuración de Vite/esbuild que Next.js usa internamente. Soporta ESM nativo, TypeScript sin transpilación extra, y alias de paths (`@/`) sin configuración adicional. Jest con Next.js requiere babel transforms y configuración de módulos ESM que es frágil. Vitest es la opción estándar para proyectos Next.js modernos (App Router, React 19).

---

### D2 — Entorno `node` para tests de server-side, `jsdom` solo si se agregan tests de componentes UI

**Decisión**: `environment: 'node'` en `vitest.config.ts` como default. No se instala jsdom en esta iteración.

**Rationale**: Los tests a escribir son de lógica de servidor (route handlers, server actions, funciones puras). jsdom agrega ~300ms de setup innecesario por archivo y no aporta nada a este scope.

---

### D3 — Mock de Supabase con `vi.mock()` a nivel de módulo

**Decisión**: Mockear `@supabase/supabase-js` y `@/lib/supabase/server` con `vi.mock()`. Cada test configura el comportamiento del mock vía `vi.mocked()`.

**Rationale**: El cliente de Supabase se instancia dentro de las funciones (no se inyecta como parámetro), por lo que no se puede reemplazar en el call site. `vi.mock()` intercepta el módulo completo antes de que se resuelva el import, que es el patrón correcto para este caso.

**Estructura del mock**:
```ts
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => mockSupabaseAdmin),
}))
```
`mockSupabaseAdmin` es un objeto con métodos `from`, `rpc`, `auth` que devuelven builders encadenables (`.select().in()`, `.insert().select().single()`, etc.).

**Alternativa descartada**: Supabase tiene una librería oficial `@supabase/test-helpers` pero es experimental y no cubre el admin client (service role). El mock manual es más explícito y estable.

---

### D4 — Mock del SDK de MercadoPago

**Decisión**: Mockear el módulo `mercadopago` completo con `vi.mock()`. El mock de `Payment.get()` devuelve un objeto configurable por test.

**Rationale**: El webhook llama a `new Payment(mp).get({ id })` para obtener los datos del pago desde MP. Esta llamada HTTP externa debe interceptarse — no podemos depender de la API real en tests.

```ts
vi.mock('mercadopago', () => ({
  MercadoPagoConfig: vi.fn(),
  Payment: vi.fn(() => ({
    get: vi.fn().mockResolvedValue(mockMpPayment),
  })),
}))
```

---

### D5 — Mock de funciones de email

**Decisión**: Mockear `@/lib/email/send-order-confirmation` y `@/lib/email/send-payment-confirmation` con `vi.fn()`.

**Rationale**: El envío de email es un efecto secundario que no queremos ejecutar en tests. Mockearlo también permite verificar que fue llamado (o no) con los parámetros correctos.

---

### D6 — Mock de `next/cache` para server actions

**Decisión**: Mockear `next/cache` globalmente en el setup file.

```ts
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))
```

**Rationale**: `revalidatePath` es una función del framework que no existe fuera del runtime de Next.js. Sin el mock, la importación falla en el entorno de test.

---

### D7 — Helper para construir `NextRequest` con firma válida de MP

**Decisión**: Crear una función utilitaria `buildSignedRequest(body, secret)` en `tests/helpers/mp.ts` que construye un `NextRequest` con los headers `x-signature` y `x-request-id` correctamente calculados.

**Rationale**: El webhook verifica la firma HMAC-SHA256. Para testear el camino feliz necesitamos un request con firma válida. Para testear el rechazo, pasamos firma incorrecta. Esta función centraliza la lógica de construcción del request y hace los tests legibles.

---

### D8 — Variables de entorno de test via `vitest.config.ts`

**Decisión**: Definir las variables de entorno necesarias directamente en `vitest.config.ts` bajo `test.env`.

```ts
env: {
  WEBHOOK_SECRET: 'test-secret',
  NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
  SUPABASE_SERVICE_ROLE_KEY: 'test-service-key',
  MP_ACCESS_TOKEN: 'test-mp-token',
}
```

**Rationale**: Los tests no deben depender de un archivo `.env.test` que puede no existir o tener valores reales. Los valores hardcodeados en config son suficientes dado que todo lo externo se mockea.

---

## Estructura de archivos

```
tests/
  setup.ts                          # mocks globales (next/cache, email)
  helpers/
    mp.ts                           # buildSignedRequest(), mockMpPayment factory
    supabase.ts                     # mockSupabaseAdmin builder, mockSupabaseClient builder
  unit/
    utils.test.ts                   # isFreeShipping(), cn()
    zod-schemas.test.ts             # schemas de checkout y producto
  integration/
    webhook.test.ts                 # POST /api/webhook — flujo tienda
    admin-actions.test.ts           # updateOrderAction — auth y restauración de stock
vitest.config.ts
```

---

## Risks / Trade-offs

**[Mock del Supabase builder encadenable]** → Supabase usa un patrón fluent (`from().select().in()`) que es tedioso de mockear. Cada método debe devolver `this` o el siguiente mock. El helper `createSupabaseMock()` en `tests/helpers/supabase.ts` encapsula esto una vez y todos los tests lo reusan. Si Supabase cambia su API interna, hay un solo lugar para actualizar.

**['use server' directive en el entorno de test]** → Las server actions tienen la directiva `'use server'` al inicio del archivo. Vitest las trata como módulos normales porque no ejecuta el runtime de Next.js — la directiva es ignorada. Las funciones se importan y ejecutan directamente, lo cual es el comportamiento correcto para tests unitarios de lógica.

**[Cobertura de `assertAdmin()`]** → `assertAdmin()` llama a `createClient()` de `@/lib/supabase/server`, que internamente usa cookies del request. En el entorno de test no hay request HTTP real. El mock de `@/lib/supabase/server` devuelve un cliente simulado que puede configurarse para retornar usuario admin o no-admin según el test.
