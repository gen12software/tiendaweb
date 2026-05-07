## MODIFIED Requirements

### Requirement: Stepper de 4 pasos
El checkout SHALL presentar 4 pasos en el stepper: Contacto → Envío → Pago → Confirmación. El paso "Pago" reemplaza al anterior paso que solo mostraba un botón de pago con MP.

#### Scenario: Progresión normal
- **WHEN** el usuario completa Contacto y Envío
- **THEN** accede al paso "Pago" donde elige el método antes de confirmar

#### Scenario: Navegación hacia atrás
- **WHEN** el usuario está en el paso "Pago" y quiere volver
- **THEN** puede retroceder al paso "Envío" sin perder los datos ya ingresados

#### Scenario: Indicadores visuales del stepper
- **WHEN** el usuario está en cualquier paso del checkout
- **THEN** el stepper muestra: paso 1 completado (check verde), paso actual resaltado, pasos futuros en gris

### Requirement: Flujo condicional según método de pago seleccionado
Al confirmar en el paso "Pago", el sistema SHALL ejecutar el flujo correspondiente al método elegido.

#### Scenario: Mercado Pago seleccionado
- **WHEN** el usuario selecciona Mercado Pago y confirma
- **THEN** se crea la preferencia MP y se redirige al init_point de Mercado Pago (flujo sin cambios)

#### Scenario: Transferencia seleccionada
- **WHEN** el usuario selecciona Transferencia y confirma
- **THEN** se crea la orden con `pendiente_pago` y se redirige a `/checkout/confirmacion` con los datos bancarios

#### Scenario: Efectivo seleccionado
- **WHEN** el usuario selecciona Efectivo y confirma
- **THEN** se crea la orden con `pendiente_pago` y se redirige a `/checkout/confirmacion`
