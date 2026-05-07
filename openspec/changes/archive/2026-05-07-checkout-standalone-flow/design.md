## Context

El proyecto usa un `RootLayout` que renderiza `ConditionalShell`, un componente cliente que oculta header/footer para rutas `/admin` y auth. El checkout vive en `app/checkout/` y actualmente hereda el shell completo (header con `pt-[96px]`, footer, WhatsApp button). Ya existe `app/checkout/confirmacion/page.tsx` con funcionalidad básica de resumen de orden.

La solución más limpia en Next.js App Router es agregar un `layout.tsx` dentro de `app/checkout/` que no renderice header ni footer, aprovechando el sistema de layouts anidados.

## Goals / Non-Goals

**Goals:**
- Checkout renderiza en layout propio: fondo limpio, sin header/nav/footer
- Botón "← Volver al carrito" visible en todas las etapas del checkout
- Página de confirmación mejorada: muestra ítems comprados, totales, datos de envío y número de orden copiable, accesible sin login
- El `ConditionalShell` queda sin modificar (no escalar la lista de exclusiones)

**Non-Goals:**
- Rediseño visual del formulario de checkout (steps, inputs, botones)
- Multi-idioma o i18n
- Animaciones de transición entre steps

## Decisions

### 1. Layout anidado vs ConditionalShell

**Decisión**: Crear `app/checkout/layout.tsx` propio.

**Por qué**: Next.js App Router permite layouts anidados que reemplazan parcialmente el árbol. Un layout en `app/checkout/` puede omitir header/footer y proveer su propio wrapper sin tocar el `RootLayout`. Alternativa descartada: extender `ConditionalShell` con más rutas — acumula lógica y es frágil al renombrar rutas.

El `RootLayout` sigue envolviendo el `<html>` y `<body>` con los providers (`CartProvider`, `Toaster`), fuentes y variables CSS de tema. El checkout layout anidado solo define el contenido interno.

### 2. Confirmación: datos de orden

**Decisión**: La página de confirmación hace fetch a la API existente por `preference_id` (MP) o directamente por `order_id`/`public_token` según el flujo. Mostrar: número de orden, ítems (nombre, cantidad, precio), subtotal, envío, total, email, dirección de envío.

**Por qué**: Los datos ya existen en la base de datos. No se necesita nueva API; se puede extender el endpoint existente para devolver más campos. Acceso sin auth via `public_token` ya implementado en la orden.

### 3. Botón volver al carrito

**Decisión**: Incluirlo en el checkout layout como elemento fijo (top-left), no dentro de cada step.

**Por qué**: El layout es el lugar correcto para chrome persistente. Evita duplicación en cada step y garantiza consistencia incluyendo la página de confirmación (donde el botón podría ocultarse o cambiar a "Seguir comprando").

## Risks / Trade-offs

- **[Risk] CartProvider en checkout layout**: El checkout usa datos del carrito. El `CartProvider` está en `RootLayout`, por lo que el checkout layout hijo lo hereda correctamente sin redefinirlo.
- **[Risk] WhatsAppButton en checkout**: Actualmente se renderiza en `RootLayout` fuera del `ConditionalShell`, por lo que aparece en el checkout. Debe moverse dentro del shell o excluirse condicionalmente.
- **[Risk] Confirmación sin orden**: Si el polling falla o el usuario llega directo sin parámetros, mostrar estado de carga/error claro con opción de ir a "Consultar mi orden".

## Migration Plan

1. Crear `app/checkout/layout.tsx` (no rompe nada — Next.js lo adopta automáticamente)
2. Mover/ajustar `WhatsAppButton` para que no aparezca en checkout
3. Mejorar `app/checkout/confirmacion/page.tsx` con más datos de orden
4. Extender API de orden si hace falta exponer ítems y dirección
5. Sin rollback especial: revertir es eliminar el layout anidado

## Open Questions

- ¿El logo de la tienda debe mostrarse en el header del checkout (práctica común) o solo el botón de volver? → Asumir: solo botón de volver, sin logo, máxima simplicidad.
- ¿La página de confirmación es `app/checkout/confirmacion/` (dentro del checkout layout) o una ruta separada? → Mantener en `app/checkout/confirmacion/` para heredar el checkout layout.
