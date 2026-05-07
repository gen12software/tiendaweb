## ADDED Requirements

### Requirement: Crear orden con estado pendiente_pago al confirmar efectivo
Cuando el usuario elige Efectivo y confirma el pedido, el sistema SHALL crear la orden inmediatamente con estado `pendiente_pago` y `payment_method: 'efectivo'`.

#### Scenario: Confirmación exitosa por efectivo
- **WHEN** el usuario selecciona "Efectivo en local" y hace click en "Confirmar pedido"
- **THEN** se crea una orden con `status: 'pendiente_pago'`, `payment_method: 'efectivo'`, se descuenta el stock y se redirige a `/checkout/confirmacion`

#### Scenario: Error al crear la orden
- **WHEN** falla la creación de la orden
- **THEN** se muestra un mensaje de error y el usuario puede reintentar

### Requirement: Confirmación de pedido efectivo
La página de confirmación SHALL mostrar el resumen del pedido indicando que el pago se abona en persona, con estado pendiente.

#### Scenario: Página de confirmación de efectivo
- **WHEN** el usuario llega a la confirmación de una orden de efectivo
- **THEN** ve el resumen del pedido con el estado "Pendiente de pago" y un mensaje indicando que abonará en el local/al recibir

### Requirement: Email de confirmación para efectivo
El sistema SHALL enviar un email al cliente con el resumen del pedido indicando que el pago es en efectivo y está pendiente.

#### Scenario: Email enviado al confirmar
- **WHEN** se crea exitosamente una orden de efectivo
- **THEN** el cliente recibe un email con el número de orden, total a pagar y la indicación de que abonará en efectivo
