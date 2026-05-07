## Why

Hoy no hay ningún test automatizado en el proyecto. Cada cambio se verifica manualmente abriendo el navegador, lo que hace que errores de regresión lleguen a producción sin que nadie los detecte. Los issues encontrados en el audit de seguridad (precios no validados server-side, doble creación de órdenes, stock no atómico) son exactamente el tipo de bugs que un test hubiera detectado antes de mergear. A medida que la tienda se entrega a clientes reales, el costo de un bug en producción — un pago que se procesa mal, una orden que no se crea — supera con creces el costo de escribir los tests.

El objetivo no es cobertura total. Es cubrir los caminos críticos de negocio: los que si se rompen generan pérdida de dinero o datos incorrectos para el comprador.

## What Changes

- Se instala **Vitest** como framework de testing (unitarios e integración)
- Se instala **@testing-library/react** para tests de componentes si se necesitan
- Se configura un entorno de test con mocks de Supabase y MercadoPago para no necesitar conexión real
- Se escriben tests para las tres áreas de mayor riesgo del proyecto: lógica de precios/carrito, webhook de pagos, y server actions de admin
- Se agrega el script `npm run test` al proyecto
- No se instala Playwright ni tests E2E en este ciclo — eso es fase 2

## Cómo se ejecutan

```bash
npm run test          # corre todos los tests una vez
npm run test:watch    # modo watch durante desarrollo (re-corre al guardar)
npm run test:coverage # genera reporte de cobertura
```

En CI (GitHub Actions), `npm run test` corre automáticamente en cada push o PR. Si algún test falla, el pipeline se detiene y el merge queda bloqueado.

No se necesita base de datos ni variables de entorno reales para correr los tests — todo lo externo se mockea.

## Capabilities Afectadas

### Nueva Capability

- `tests`: Suite de tests automatizados con Vitest. Cubre lógica de negocio crítica mediante tests unitarios (funciones puras) y tests de integración (server actions y route handlers con dependencias externas mockeadas). No requiere entorno real para ejecutarse.

### Áreas cubiertas en esta primera iteración

**Lógica de carrito y precios**
- Cálculo de subtotal, descuentos y total con distintas combinaciones de ítems
- Cálculo de envío gratis según threshold configurable
- Fusión de carrito anónimo con carrito de usuario autenticado

**Webhook de MercadoPago** (`app/api/webhook/route.ts`)
- Pago aprobado → orden creada con estado correcto, stock decrementado, email enviado
- Pago rechazado → no se crea orden
- Firma inválida → respuesta 401 sin efectos secundarios
- Payload malformado → respuesta 400 sin efectos secundarios

**Server actions de admin**
- `updateOrderAction` rechaza llamadas sin rol admin
- `saveCategoryAction` rechaza llamadas sin rol admin
- `toggleProductAction` rechaza llamadas sin rol admin

**Validaciones Zod**
- Schemas de checkout: campos requeridos, formatos de email, longitud de campos
- Schema de producto: precio positivo, stock no negativo

## Non-Goals

- No se escriben tests E2E con Playwright (flujo completo en navegador real) — es fase 2
- No se busca cobertura del 100% — solo los caminos críticos de negocio
- No se testean componentes de UI (formularios, layouts) en esta iteración
- No se configura un entorno de staging con base de datos real para tests

## Impact

**Archivos nuevos:**
- `vitest.config.ts` — configuración de Vitest con alias de paths y entorno jsdom
- `tests/setup.ts` — setup global: mocks de Supabase, MercadoPago y Resend
- `tests/unit/cart.test.ts` — tests de lógica de carrito y precios
- `tests/unit/zod-schemas.test.ts` — tests de validaciones
- `tests/integration/webhook.test.ts` — tests del webhook de MP
- `tests/integration/admin-actions.test.ts` — tests de server actions de admin

**Archivos modificados:**
- `package.json` — se agregan `vitest`, `@vitest/coverage-v8`, `@testing-library/react` como devDependencies; se agregan scripts `test`, `test:watch`, `test:coverage`

**Sin cambios:** schema, lógica de negocio existente, componentes de UI, APIs, módulo de suscripciones
