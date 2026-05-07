## 1. Base de datos

- [x] 1.1 Crear migración SQL: agregar columna `payment_method text` a tabla `orders` (nullable, default NULL)
- [x] 1.2 Crear migración SQL: modificar CHECK constraint de `status` en `orders` para incluir `'pendiente_pago'`
- [x] 1.3 Crear migración SQL: agregar columnas `payment_methods_enabled text[]`, `transfer_cbu text`, `transfer_alias text`, `transfer_message text` a tabla `site_config`
- [x] 1.4 Actualizar tipos TypeScript de Supabase (regenerar o editar manualmente `types/supabase.ts`)

## 2. Backend — Creación de órdenes manuales

- [x] 2.1 Crear server action `createManualOrderAction` en `app/(checkout)/actions.ts` (o archivo nuevo) que recibe datos de contacto, envío, items, totales y método de pago (`'transferencia'` | `'efectivo'`)
- [x] 2.2 En `createManualOrderAction`: verificar precios del lado del servidor (igual que `create-payment`)
- [x] 2.3 En `createManualOrderAction`: crear la orden en Supabase con `status: 'pendiente_pago'`, `payment_method`, descontar stock con RPC `decrement_variant_stock`
- [x] 2.4 En `createManualOrderAction`: enviar email de confirmación al cliente con datos según método (transferencia incluye CBU/Alias/mensaje; efectivo indica que abonará en persona)
- [x] 2.5 Actualizar `app/api/webhook/route.ts`: al crear la orden por MP, setear `payment_method: 'mercadopago'`

## 3. Backend — Configuración admin

- [x] 3.1 Actualizar `updateSiteConfigAction` en `app/admin/configuracion/actions.ts` para incluir los nuevos campos de métodos de pago
- [x] 3.2 Agregar validación: si `payment_methods_enabled` queda vacío, retornar error
- [x] 3.3 Crear helper/util para leer la configuración de métodos de pago desde `site_config` (para usar en el checkout)

## 4. Frontend — Checkout: nuevo paso de selección de pago

- [x] 4.1 Crear componente `components/checkout/payment-method-step.tsx` que muestra los métodos habilitados como opciones seleccionables (radio buttons o cards)
- [x] 4.2 En `payment-method-step.tsx`: hacer fetch de los métodos habilitados desde `site_config` (Server Component o pasado como prop desde `checkout-flow.tsx`)
- [x] 4.3 Actualizar `components/checkout/checkout-flow.tsx`: agregar el nuevo paso "Pago" como paso 3 del stepper (Contacto=1, Envío=2, Pago=3)
- [x] 4.4 En `checkout-flow.tsx`: mover la lógica de "pagar con MP" (llamada a `/api/create-payment`) al handler del nuevo paso de pago, condicionado a que el método elegido sea `'mercadopago'`
- [x] 4.5 En `checkout-flow.tsx`: agregar handler para cuando el método elegido es `'transferencia'` o `'efectivo'` — llama a `createManualOrderAction` y redirige a confirmación con `?orden=<public_token>`
- [x] 4.6 Actualizar indicadores del stepper para reflejar 4 pasos (o ajustar según el diseño actual)

## 5. Frontend — Página de confirmación

- [x] 5.1 Actualizar `app/(checkout)/confirmacion/page.tsx` para aceptar query param `orden=<public_token>` además del flujo de MP
- [x] 5.2 Cuando llega por `?orden=<public_token>`: buscar la orden por `public_token` y mostrar el resumen
- [x] 5.3 En la confirmación de transferencia: mostrar sección con CBU, Alias y mensaje del admin (solo los campos que estén cargados)
- [x] 5.4 En la confirmación de efectivo: mostrar mensaje indicando que el pago es en persona y la orden está pendiente de confirmación
- [x] 5.5 Asegurarse que el estado `pendiente_pago` se muestre con un badge/texto amigable (ej. "Pendiente de pago") en lugar del valor raw

## 6. Admin — Panel de configuración de métodos de pago

- [x] 6.1 Agregar sección "Métodos de pago" en `app/admin/configuracion/ConfigForm.tsx` con 3 toggles (MP, Transferencia, Efectivo)
- [x] 6.2 Agregar campos de texto para CBU, Alias y Mensaje (visibles solo cuando Transferencia está activado)
- [x] 6.3 Agregar validación en el form: al menos 1 método debe estar activo al guardar
- [x] 6.4 Conectar los campos nuevos al `updateSiteConfigAction` actualizado

## 7. Admin — Panel de órdenes

- [x] 7.1 Actualizar la lista de órdenes en `app/admin/ordenes/` para mostrar el método de pago como columna o badge
- [x] 7.2 Actualizar el detalle de orden en `app/admin/ordenes/[id]/` para mostrar el método de pago en el resumen
- [x] 7.3 Verificar que el flujo de cambio de estado desde `pendiente_pago` funciona correctamente en `updateOrderAction` (restaurar stock si se cancela, enviar emails según estado destino)
