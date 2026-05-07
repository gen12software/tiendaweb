## ADDED Requirements

### Requirement: Activar y desactivar métodos de pago
El admin SHALL poder activar o desactivar cada uno de los 3 métodos de pago disponibles. Siempre debe quedar al menos 1 activo.

#### Scenario: Deshabilitar un método
- **WHEN** el admin desactiva un método (ej. Transferencia)
- **THEN** ese método deja de aparecer en el checkout para los clientes

#### Scenario: Intento de deshabilitar el último método activo
- **WHEN** el admin intenta desactivar el único método habilitado
- **THEN** el sistema muestra un error y no permite guardar la configuración

#### Scenario: Habilitar un método
- **WHEN** el admin activa un método previamente desactivado
- **THEN** ese método aparece disponible en el checkout para los clientes

### Requirement: Configurar datos de transferencia bancaria
El admin SHALL poder cargar y editar los datos bancarios (CBU, Alias, mensaje) que se muestran a los clientes cuando pagan por transferencia.

#### Scenario: Guardar datos de transferencia
- **WHEN** el admin ingresa CBU, Alias y un mensaje y guarda
- **THEN** esos datos se almacenan y se muestran en el checkout y en los emails de confirmación de transferencia

#### Scenario: Campos opcionales
- **WHEN** el admin deja en blanco algún campo (ej. Alias)
- **THEN** el campo vacío no se muestra en la UI del cliente

#### Scenario: Transferencia habilitada sin datos configurados
- **WHEN** el admin habilita Transferencia pero no carga ningún dato bancario
- **THEN** el sistema permite guardar (los campos son opcionales individualmente) pero idealmente muestra una advertencia

### Requirement: Sección de métodos de pago en configuración del admin
Los controles de métodos de pago SHALL estar ubicados dentro de la página de configuración de la tienda (`/admin/configuracion`), en una sección dedicada "Métodos de pago".

#### Scenario: Acceso a la sección
- **WHEN** el admin navega a `/admin/configuracion`
- **THEN** ve una sección "Métodos de pago" con los 3 métodos y sus controles de activación/desactivación

#### Scenario: Guardado de cambios
- **WHEN** el admin modifica la configuración y guarda
- **THEN** los cambios se aplican inmediatamente al checkout sin necesidad de reiniciar
