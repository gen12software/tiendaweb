## ADDED Requirements

### Requirement: Estados de orden
El sistema SHALL manejar los siguientes estados de ciclo de vida de una orden: `pending` → `paid` → `processing` → `shipped` → `delivered`. Estados de excepción: `payment_failed`, `cancelled`.

#### Scenario: Transición automática pending → paid
- **WHEN** el webhook de MercadoPago confirma el pago
- **THEN** la orden pasa automáticamente de `pending` a `paid` sin intervención del admin

#### Scenario: Transición manual por admin
- **WHEN** el admin cambia el estado de una orden desde el panel
- **THEN** el sistema actualiza el estado y registra timestamp y usuario que realizó el cambio

#### Scenario: Cancelación de orden
- **WHEN** el admin cancela una orden con estado `paid` o `processing`
- **THEN** la orden pasa a `cancelled` y el sistema incrementa el stock de los ítems (reverso del descuento)

---

### Requirement: Consulta pública de estado de orden
El sistema SHALL permitir consultar el estado de una orden sin login, usando número de orden y email del comprador como verificación.

#### Scenario: Consulta exitosa
- **WHEN** el usuario ingresa en `/mi-orden` su número de orden y el email usado en la compra
- **THEN** el sistema muestra el estado actual, ítems comprados, dirección de envío y número de seguimiento (si aplica)

#### Scenario: Datos incorrectos
- **WHEN** el usuario ingresa un número de orden que no corresponde al email proporcionado
- **THEN** el sistema muestra "No encontramos una orden con esos datos" sin revelar si el número existe

---

### Requirement: Snapshot de ítems de orden
El sistema SHALL guardar una copia inmutable del producto al momento de la compra en cada línea de orden.

#### Scenario: Producto modificado después de la compra
- **WHEN** el admin modifica el nombre o precio de un producto que ya fue comprado
- **THEN** las órdenes existentes siguen mostrando el nombre y precio original (desde el campo `snapshot`)

#### Scenario: Producto eliminado después de la compra
- **WHEN** el admin desactiva un producto que ya fue comprado
- **THEN** las órdenes existentes siguen mostrando la información del producto desde el `snapshot`

---

### Requirement: Email de confirmación de orden
El sistema SHALL enviar un email de confirmación al comprador cuando la orden pasa a estado `paid`.

#### Scenario: Email enviado post-pago
- **WHEN** la orden pasa a estado `paid`
- **THEN** el sistema envía un email al email del comprador con: número de orden, detalle de ítems, total pagado, dirección de envío y link a `/mi-orden`
