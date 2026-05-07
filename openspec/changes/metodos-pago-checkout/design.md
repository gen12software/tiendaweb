## Context

El checkout actual tiene 3 pasos: Contacto → Envío → Pago. El paso "Pago" actual solo muestra un resumen y redirige a Mercado Pago. La orden se crea únicamente cuando el webhook de MP confirma el pago (`status: 'approved'`).

Para Transferencia y Efectivo, la orden debe crearse de inmediato al finalizar el checkout (sin esperar webhook externo), con estado `pendiente_pago`. El admin luego la mueve manualmente.

La configuración de métodos habilitados y datos de transferencia se almacena en `site_config` (tabla existente con campo `settings` JSONB) o en una tabla nueva dedicada.

## Goals / Non-Goals

**Goals:**
- Agregar un paso de selección de método de pago entre Envío y el resumen final.
- Soportar 3 métodos fijos: Mercado Pago (sin cambios), Transferencia, Efectivo.
- Admin puede activar/desactivar cada método y configurar datos bancarios para Transferencia.
- Órdenes de Transferencia y Efectivo se crean con estado `pendiente_pago`.
- Las órdenes registran el método de pago elegido.

**Non-Goals:**
- Agregar métodos de pago personalizados por el admin.
- Procesamiento automático de transferencias (validación de CBU, confirmación bancaria).
- Integración con pasarelas de pago alternativas.
- Cambios al flujo de Mercado Pago.

## Decisions

### 1. Dónde guardar la configuración de métodos de pago

**Decisión:** Extender `site_config` con nuevas columnas tipadas para métodos de pago, o usar el campo JSONB existente `settings`.

**Elegido:** Nuevas columnas en `site_config` (migración aditiva). Mantiene type-safety en el código TypeScript y es consistente con el patrón ya usado (columnas explícitas por feature).

Columnas a agregar:
- `payment_methods_enabled` (`text[]`) — array de IDs habilitados: `['mercadopago', 'transferencia', 'efectivo']`
- `transfer_cbu` (`text`)
- `transfer_alias` (`text`)
- `transfer_message` (`text`) — mensaje para el usuario (ej. "Enviá el comprobante a pagos@tienda.com")

### 2. Cuándo crear la orden para Transferencia/Efectivo

**Decisión:** Crear la orden en el momento en que el usuario hace click en "Confirmar pedido" (antes de redirigir a la página de confirmación), usando una nueva Server Action o API route.

**Elegido:** Nueva Server Action `createManualOrderAction` en `app/(checkout)/actions.ts`. Recibe los mismos datos que `create-payment` pero crea la orden directamente en Supabase con `status: 'pendiente_pago'`, sin interacción con MP.

### 3. Estado `pendiente_pago` en la tabla `orders`

**Decisión:** Agregar el nuevo estado a la constraint CHECK existente en la columna `status`.

**Elegido:** Migración aditiva que modifica el CHECK constraint para incluir `'pendiente_pago'`. Este estado precede a `'nueva'` en el ciclo de vida del pedido. El admin puede transicionarlo a `'nueva'` (o directamente a `'en_preparacion'`) cuando confirme el pago.

### 4. Campo `metodo_pago` en órdenes

**Decisión:** Columna nueva `payment_method` (`text`) en `orders`.

**Elegido:** Columna explícita (no en JSONB) para facilitar filtros y reportes en el admin. Valores: `'mercadopago'`, `'transferencia'`, `'efectivo'`. Nullable para backwards compatibility con órdenes existentes.

### 5. Flujo del stepper en checkout

**Decisión:** El paso actual "Pago" (step 3) pasa a ser "Selección de pago" y el checkout queda en 4 pasos: Contacto → Envío → Método de pago → Confirmación/Redirección.

**Elegido:** Renombrar el paso 3 existente a "Método de pago" y su componente `payment-step.tsx` pasa a renderizar la selección. La lógica de "pagar con MP" que estaba en ese step se convierte en la acción de finalización cuando MP está seleccionado. Para Transferencia/Efectivo, el botón "Confirmar" crea la orden y redirige a `/checkout/confirmacion?orden=<id>`.

### 6. Página de confirmación para Transferencia/Efectivo

**Decisión:** Reutilizar `/checkout/confirmacion` con el mismo diseño.

**Elegido:** La página de confirmación ya recibe un `preference_id` o `payment_id` de MP para buscar la orden. Se extiende para también aceptar `orden=<public_token>` como query param, mostrando el resumen con el estado `pendiente_pago` y los datos de pago correspondientes (para transferencia, mostrar CBU/Alias/mensaje).

## Risks / Trade-offs

- **Órdenes huérfanas:** Si el usuario llega al paso de pago con Transferencia/Efectivo pero abandona antes de confirmar, no se crean órdenes fantasma (la orden se crea solo al hacer click en "Confirmar"). Bajo riesgo.
- **Migración de estado:** Modificar el CHECK constraint de `status` en producción requiere `ALTER TABLE`. En Supabase es safe mientras no haya constraint violations. Bajo riesgo.
- **Backwards compatibility:** Órdenes existentes tendrán `payment_method = NULL`. El admin debe manejar este caso. Se puede asumir que las órdenes antiguas son de MP.
- **Stock:** Para Transferencia/Efectivo, el stock se descuenta al crear la orden (igual que MP). Si el cliente no paga y el admin cancela, el stock se restaura (lógica ya existente en `updateOrderAction`).

## Migration Plan

1. Migración SQL: agregar `payment_method` a `orders`, agregar `payment_methods_enabled`, `transfer_cbu`, `transfer_alias`, `transfer_message` a `site_config`, modificar CHECK constraint de `status` en `orders`.
2. Actualizar tipos TypeScript generados de Supabase.
3. Implementar backend: `createManualOrderAction`, actualizar `updateOrderAction` para enviar emails con estado `pendiente_pago`.
4. Implementar frontend: nuevo `payment-method-step.tsx`, actualizar stepper, actualizar página de confirmación.
5. Implementar admin: sección de métodos de pago en `/admin/configuracion`.
