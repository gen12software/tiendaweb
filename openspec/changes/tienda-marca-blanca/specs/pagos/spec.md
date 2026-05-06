## MODIFIED Requirements

### Requirement: Preferencia de pago con ítems de orden
El sistema SHALL crear la preferencia de MercadoPago incluyendo el detalle de cada ítem del carrito (nombre, cantidad, precio unitario) y el `order_id` en el campo `metadata`.

#### Scenario: Preferencia creada con ítems del carrito
- **WHEN** el usuario confirma el pago en el paso 3 del checkout
- **THEN** el sistema llama a `POST /api/create-payment` con los ítems del carrito y crea la preferencia MP con el array `items` completo

#### Scenario: Metadata con order_id
- **WHEN** se crea la preferencia de pago
- **THEN** el campo `metadata` de la preferencia incluye `{ "order_id": "<uuid>" }` para correlacionar el webhook con la orden

---

### Requirement: Webhook actualiza estado de orden
El sistema SHALL actualizar el estado de la `Order` al recibir notificación de pago aprobado, en lugar de actualizar el perfil de usuario.

#### Scenario: Webhook de pago aprobado
- **WHEN** MercadoPago envía un webhook con `status: "approved"`
- **THEN** el sistema extrae el `order_id` de `metadata`, actualiza `orders.status = 'paid'`, descuenta stock y dispara el email de confirmación

#### Scenario: Webhook de pago rechazado
- **WHEN** MercadoPago envía un webhook con `status: "rejected"`
- **THEN** el sistema actualiza `orders.status = 'payment_failed'` y no modifica el stock

#### Scenario: Webhook con order_id inexistente
- **WHEN** el webhook contiene un `order_id` que no existe en la base de datos
- **THEN** el sistema responde con HTTP 200 (para que MP no reintente) y registra el error en logs
