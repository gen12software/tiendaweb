## ADDED Requirements

### Requirement: Mostrar métodos de pago disponibles
El sistema SHALL mostrar únicamente los métodos de pago que el admin haya habilitado en la configuración. Si solo hay uno habilitado, se muestra pre-seleccionado. Si hay varios, el usuario debe elegir uno.

#### Scenario: Un solo método habilitado
- **WHEN** el admin tiene activado solo un método de pago
- **THEN** ese método aparece pre-seleccionado y el usuario puede continuar sin elegir

#### Scenario: Múltiples métodos habilitados
- **WHEN** el admin tiene activados 2 o 3 métodos
- **THEN** el usuario ve las opciones disponibles y debe seleccionar una antes de poder continuar

#### Scenario: Ningún método habilitado (estado inválido)
- **WHEN** la configuración no tiene ningún método habilitado
- **THEN** el checkout no permite avanzar al paso de pago y muestra un mensaje de error

### Requirement: Selección obligatoria antes de confirmar
El sistema SHALL impedir que el usuario confirme el pedido sin haber seleccionado un método de pago.

#### Scenario: Intento de confirmar sin selección
- **WHEN** el usuario llega al paso de pago sin seleccionar ningún método
- **THEN** el botón "Confirmar" está deshabilitado o muestra validación al intentar avanzar

#### Scenario: Selección válida
- **WHEN** el usuario selecciona un método de pago
- **THEN** el botón "Confirmar" se habilita y muestra la acción correspondiente al método elegido

### Requirement: Descripción de cada método en la UI
El sistema SHALL mostrar una descripción breve de cada método para orientar al usuario.

#### Scenario: Descripción visible
- **WHEN** el usuario está en el paso de selección de pago
- **THEN** cada método muestra su nombre y una descripción corta (ej. "Pagá en cuotas con tu tarjeta" para MP, "Pagá con dinero en cuenta" para transferencia, "Abonás al retirar o al recibir" para efectivo)
