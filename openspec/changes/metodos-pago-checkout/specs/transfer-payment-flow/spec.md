## ADDED Requirements

### Requirement: Crear orden con estado pendiente_pago al confirmar transferencia
Cuando el usuario elige Transferencia y confirma el pedido, el sistema SHALL crear la orden inmediatamente con estado `pendiente_pago` y `payment_method: 'transferencia'`.

#### Scenario: Confirmación exitosa por transferencia
- **WHEN** el usuario selecciona "Transferencia" y hace click en "Confirmar pedido"
- **THEN** se crea una orden con `status: 'pendiente_pago'`, `payment_method: 'transferencia'`, se descuenta el stock y se redirige a `/checkout/confirmacion`

#### Scenario: Error al crear la orden
- **WHEN** falla la creación de la orden (error de DB u otro)
- **THEN** se muestra un mensaje de error y el usuario puede reintentar

### Requirement: Mostrar datos bancarios en la confirmación
La página de confirmación SHALL mostrar los datos de transferencia configurados por el admin (CBU, Alias, mensaje) cuando la orden es de tipo transferencia.

#### Scenario: Datos de transferencia visibles
- **WHEN** el usuario llega a la confirmación de una orden de transferencia
- **THEN** ve el CBU, Alias y el mensaje del admin claramente destacados

#### Scenario: Campo no configurado
- **WHEN** el admin no completó algún campo (ej. no cargó Alias)
- **THEN** ese campo no se muestra en la pantalla (no se muestra vacío ni con placeholder)

### Requirement: Email de confirmación para transferencia
El sistema SHALL enviar un email al cliente con el resumen del pedido y los datos bancarios para realizar la transferencia.

#### Scenario: Email enviado al confirmar
- **WHEN** se crea exitosamente una orden de transferencia
- **THEN** el cliente recibe un email con el número de orden, total a transferir, CBU/Alias y mensaje del admin
