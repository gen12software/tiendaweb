## MODIFIED Requirements

### Requirement: Estado pendiente_pago en órdenes
Las órdenes SHALL soportar el estado `pendiente_pago`, que indica que el pedido fue recibido pero el pago aún no fue confirmado por el admin.

#### Scenario: Orden creada por transferencia o efectivo
- **WHEN** se crea una orden con método de pago Transferencia o Efectivo
- **THEN** la orden tiene `status: 'pendiente_pago'`

#### Scenario: Transición desde pendiente_pago
- **WHEN** el admin recibe el pago y actualiza el estado de la orden
- **THEN** puede transicionarla a `'nueva'`, `'en_preparacion'` u otro estado válido

#### Scenario: Cancelación de orden pendiente_pago
- **WHEN** el admin cancela una orden en estado `pendiente_pago`
- **THEN** el stock de los productos se restaura (igual que para cancelar órdenes pagas)

### Requirement: Campo payment_method en órdenes
Las órdenes SHALL registrar el método de pago elegido por el cliente en el campo `payment_method`.

#### Scenario: Orden creada con MP
- **WHEN** se crea una orden mediante el flujo de Mercado Pago (webhook)
- **THEN** la orden tiene `payment_method: 'mercadopago'`

#### Scenario: Orden creada con Transferencia
- **WHEN** se crea una orden por transferencia
- **THEN** la orden tiene `payment_method: 'transferencia'`

#### Scenario: Orden creada con Efectivo
- **WHEN** se crea una orden por efectivo
- **THEN** la orden tiene `payment_method: 'efectivo'`

#### Scenario: Órdenes existentes sin payment_method
- **WHEN** se visualiza una orden creada antes de este cambio
- **THEN** el campo `payment_method` es NULL y la UI del admin lo muestra como "Mercado Pago" (asunción por defecto)

### Requirement: Visualización del método de pago en el panel admin
El panel de órdenes del admin SHALL mostrar el método de pago de cada orden.

#### Scenario: Lista de órdenes
- **WHEN** el admin ve la lista de órdenes
- **THEN** cada orden muestra el método de pago (MP, Transferencia, Efectivo) como columna o badge

#### Scenario: Detalle de orden
- **WHEN** el admin abre el detalle de una orden
- **THEN** el método de pago se muestra claramente en la sección de resumen
