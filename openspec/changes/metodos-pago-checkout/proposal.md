## Why

El checkout actual solo soporta Mercado Pago como método de pago, lo que limita a los clientes que prefieren pagar en efectivo o por transferencia bancaria. Se necesita ofrecer múltiples métodos de pago para aumentar la conversión y dar flexibilidad operativa a cada tienda.

## What Changes

- Se agrega un nuevo paso "Pago" en el stepper del checkout (entre Envío y la confirmación final), donde el usuario elige el método de pago antes de finalizar la compra.
- Se introducen tres métodos de pago fijos: **Mercado Pago**, **Transferencia bancaria** y **Efectivo en local**.
- El admin puede activar/desactivar cada método (mínimo 1 activo, máximo 3). No puede agregar métodos personalizados.
- Para **Transferencia**: el admin configura los datos bancarios (CBU, Alias, mensaje personalizado) que se muestran al usuario al finalizar.
- Para **Efectivo** y **Transferencia**: la orden se crea con estado `pendiente_pago` en lugar de `nueva`. El admin cambia el estado manualmente cuando recibe el pago.
- Las órdenes registran el método de pago elegido por el usuario.
- No hay cambios en el flujo de Mercado Pago.

## Capabilities

### New Capabilities

- `payment-method-selection`: Paso de selección de método de pago en el checkout con las opciones habilitadas por el admin.
- `transfer-payment-flow`: Flujo de pago por transferencia — muestra datos bancarios y crea la orden en `pendiente_pago`.
- `cash-payment-flow`: Flujo de pago en efectivo — crea la orden en `pendiente_pago` sin datos adicionales.
- `payment-methods-admin`: Configuración desde el admin para activar/desactivar métodos y cargar datos de transferencia.

### Modified Capabilities

- `checkout`: Se agrega el paso de selección de pago al stepper existente.
- `orders`: Las órdenes ahora registran el campo `metodo_pago` y soportan el estado `pendiente_pago`.

## Impact

- **Frontend**: `app/(checkout)/` — nuevo paso en el stepper, nuevas vistas para transferencia y efectivo.
- **Backend/API**: Configuración de métodos de pago por tienda; campo `metodo_pago` y estado `pendiente_pago` en órdenes.
- **Admin**: Nueva sección en ajustes para gestionar métodos de pago habilitados y datos de transferencia.
- **Base de datos**: Nuevos campos en `ordenes` y nueva tabla/modelo para configuración de métodos de pago.
- **Sin cambios**: Flujo de Mercado Pago (`/api/mercadopago/`, webhook, preference).
